import { useState, useEffect } from "react";
import { getAdminUsers, updateAdminUser, deleteAdminUser } from "../services/api";

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", role: "", page: 1 });
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ role: "", branch: "", semester: 1 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [filters.page, filters.role]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getAdminUsers({
        page: filters.page,
        limit: 15,
        search: filters.search,
        role: filters.role,
      });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error("Fetch users error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setEditForm({
      role: user.role,
      branch: user.branch || "",
      semester: user.semester || 1,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateAdminUser(editingUser._id, editForm);
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This will also delete all their test history and resumes.`)) return;
    try {
      await deleteAdminUser(id);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete user.");
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return "#10b981";
    if (score >= 40) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1>👥 Manage Users</h1>
            <p>View, edit, and manage platform users</p>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-filters">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="admin-search-input"
              id="admin-user-search"
            />
            <button type="submit" className="search-btn">🔍</button>
          </form>

          <select
            value={filters.role}
            onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}
            className="admin-select"
            id="admin-role-filter"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="loading-screen">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading users...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Branch</th>
                    <th>CGPA</th>
                    <th>Tests</th>
                    <th>Avg Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td className="user-name-cell">
                        <div className="user-avatar">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <span>{user.name}</span>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role === "admin" ? "🛡️ " : "🎓 "}
                          {user.role}
                        </span>
                      </td>
                      <td>{user.branch || "—"}</td>
                      <td>{user.cgpa || "—"}</td>
                      <td>{user.totalTests}</td>
                      <td>
                        <span style={{ color: getScoreColor(user.avgScore), fontWeight: 600 }}>
                          {user.avgScore}%
                        </span>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button className="edit-btn" onClick={() => openEditModal(user)} title="Edit">
                            ✏️
                          </button>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(user._id, user.name)}
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="8" style={{ textAlign: "center", padding: "40px" }}>
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.total > 1 && (
              <div className="admin-pagination">
                <button
                  disabled={filters.page <= 1}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  className="page-btn"
                >
                  ← Prev
                </button>
                <span className="page-info">
                  Page {pagination.current} of {pagination.total} ({pagination.count} total)
                </span>
                <button
                  disabled={filters.page >= pagination.total}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  className="page-btn"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* Edit User Modal */}
        {editingUser && (
          <div className="modal-overlay" onClick={() => setEditingUser(null)}>
            <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>✏️ Edit User: {editingUser.name}</h2>
                <button className="modal-close" onClick={() => setEditingUser(null)}>✕</button>
              </div>

              <form onSubmit={handleUpdate}>
                <div className="form-group">
                  <label htmlFor="edit-role">Role</label>
                  <select
                    id="edit-role"
                    value={editForm.role}
                    onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  >
                    <option value="student">Student</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="edit-branch">Branch</label>
                  <input
                    id="edit-branch"
                    type="text"
                    value={editForm.branch}
                    onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                    placeholder="e.g., Computer Science"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="edit-semester">Semester</label>
                  <input
                    id="edit-semester"
                    type="number"
                    min="1"
                    max="8"
                    value={editForm.semester}
                    onChange={(e) => setEditForm({ ...editForm, semester: parseInt(e.target.value) || 1 })}
                  />
                </div>

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setEditingUser(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn" disabled={saving}>
                    {saving ? "Saving..." : "Update User"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
