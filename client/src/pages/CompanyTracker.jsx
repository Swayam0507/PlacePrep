import { useState, useEffect } from "react";
import { getCompanies, checkEligibility, createCompany, deleteCompanyApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { formatDate } from "../utils/helpers";

const CompanyTracker = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [eligibility, setEligibility] = useState({});
  const [newCompany, setNewCompany] = useState({
    name: "", industry: "IT/Software", website: "",
    package: { min: 0, max: 0 }, eligibility: { minCGPA: 0, branches: [], maxBacklogs: 0 },
    visitDate: "", status: "upcoming", roles: "", description: "", selectionProcess: "",
  });

  useEffect(() => { fetchCompanies(); }, [statusFilter]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const { data } = await getCompanies({ status: statusFilter, limit: 50 });
      setCompanies(data.companies || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleCheckEligibility = async (id) => {
    try {
      const { data } = await checkEligibility(id);
      setEligibility({ ...eligibility, [id]: data });
    } catch (err) { console.error(err); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await createCompany({
        ...newCompany,
        roles: newCompany.roles.split(",").map((r) => r.trim()).filter(Boolean),
        selectionProcess: newCompany.selectionProcess.split(",").map((s) => s.trim()).filter(Boolean),
      });
      setShowAdd(false);
      fetchCompanies();
    } catch (err) { alert("Failed to add company."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this company?")) return;
    try { await deleteCompanyApi(id); fetchCompanies(); }
    catch (err) { alert("Failed to delete."); }
  };

  const statusColors = {
    upcoming: { bg: "rgba(99,102,241,0.15)", color: "#818cf8" },
    ongoing: { bg: "rgba(16,185,129,0.15)", color: "#10b981" },
    completed: { bg: "rgba(100,116,139,0.15)", color: "#94a3b8" },
    cancelled: { bg: "rgba(239,68,68,0.15)", color: "#ef4444" },
  };

  return (
    <div className="company-page">
      <div className="company-container">
        <div className="company-header">
          <div>
            <h1>🏢 Company Tracker</h1>
            <p>Track placement drives, check eligibility, and stay informed</p>
          </div>
          {isAdmin && (
            <button className="btn-primary" onClick={() => setShowAdd(!showAdd)}>
              {showAdd ? "Cancel" : "➕ Add Company"}
            </button>
          )}
        </div>

        {/* Admin Add Form */}
        {showAdd && isAdmin && (
          <div className="company-add-card">
            <h2>➕ Add Company Drive</h2>
            <form onSubmit={handleCreate}>
              <div className="form-row">
                <div className="form-group"><label>Company Name *</label><input type="text" value={newCompany.name} onChange={(e) => setNewCompany({...newCompany, name: e.target.value})} required /></div>
                <div className="form-group"><label>Industry</label><input type="text" value={newCompany.industry} onChange={(e) => setNewCompany({...newCompany, industry: e.target.value})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Min Package (LPA)</label><input type="number" value={newCompany.package.min} onChange={(e) => setNewCompany({...newCompany, package: {...newCompany.package, min: Number(e.target.value)}})} /></div>
                <div className="form-group"><label>Max Package (LPA)</label><input type="number" value={newCompany.package.max} onChange={(e) => setNewCompany({...newCompany, package: {...newCompany.package, max: Number(e.target.value)}})} /></div>
                <div className="form-group"><label>Min CGPA</label><input type="number" step="0.1" value={newCompany.eligibility.minCGPA} onChange={(e) => setNewCompany({...newCompany, eligibility: {...newCompany.eligibility, minCGPA: Number(e.target.value)}})} /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Visit Date</label><input type="date" value={newCompany.visitDate} onChange={(e) => setNewCompany({...newCompany, visitDate: e.target.value})} /></div>
                <div className="form-group"><label>Status</label>
                  <select value={newCompany.status} onChange={(e) => setNewCompany({...newCompany, status: e.target.value})}>
                    <option value="upcoming">Upcoming</option><option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="form-group"><label>Roles (comma-separated)</label><input type="text" value={newCompany.roles} onChange={(e) => setNewCompany({...newCompany, roles: e.target.value})} placeholder="SDE, Data Analyst, QA" /></div>
              <div className="form-group"><label>Selection Process (comma-separated)</label><input type="text" value={newCompany.selectionProcess} onChange={(e) => setNewCompany({...newCompany, selectionProcess: e.target.value})} placeholder="Online Test, Technical, HR" /></div>
              <div className="form-group"><label>Description</label><textarea value={newCompany.description} onChange={(e) => setNewCompany({...newCompany, description: e.target.value})} rows={2} /></div>
              <button type="submit" className="btn-primary">💾 Save Company</button>
            </form>
          </div>
        )}

        {/* Status Filter */}
        <div className="company-filters">
          {["", "upcoming", "ongoing", "completed", "cancelled"].map((s) => (
            <button key={s} className={`filter-tab ${statusFilter === s ? "active" : ""}`}
              onClick={() => setStatusFilter(s)}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
            </button>
          ))}
        </div>

        {/* Companies Grid */}
        {loading ? (
          <div className="loading-screen"><div className="loading-spinner"><div className="spinner"></div><p>Loading companies...</p></div></div>
        ) : companies.length === 0 ? (
          <div className="empty-state"><p>No companies found. {isAdmin ? "Add a company drive to get started!" : "Check back later for upcoming drives."}</p></div>
        ) : (
          <div className="company-grid">
            {companies.map((company) => (
              <div key={company._id} className="company-card">
                <div className="company-card-header">
                  <div>
                    <h3>{company.name}</h3>
                    <span className="company-industry">{company.industry}</span>
                  </div>
                  <span className="company-status-badge" style={{ background: statusColors[company.status]?.bg, color: statusColors[company.status]?.color }}>
                    {company.status}
                  </span>
                </div>

                {company.description && <p className="company-desc">{company.description}</p>}

                <div className="company-info-grid">
                  {company.package?.max > 0 && <div className="company-info"><span>💰</span><span>₹{company.package.min}-{company.package.max} LPA</span></div>}
                  {company.visitDate && <div className="company-info"><span>📅</span><span>{formatDate(company.visitDate)}</span></div>}
                  {company.eligibility?.minCGPA > 0 && <div className="company-info"><span>📊</span><span>Min CGPA: {company.eligibility.minCGPA}</span></div>}
                  {company.studentsPlaced > 0 && <div className="company-info"><span>🎓</span><span>{company.studentsPlaced} placed</span></div>}
                </div>

                {company.roles?.length > 0 && (
                  <div className="company-roles">
                    {company.roles.map((r, i) => <span key={i} className="role-chip">{r}</span>)}
                  </div>
                )}

                {company.selectionProcess?.length > 0 && (
                  <div className="selection-process">
                    <span className="process-label">Process:</span>
                    {company.selectionProcess.map((s, i) => (
                      <span key={i} className="process-step">
                        {s}{i < company.selectionProcess.length - 1 && " →"}
                      </span>
                    ))}
                  </div>
                )}

                <div className="company-card-actions">
                  <button className="check-eligibility-btn" onClick={() => handleCheckEligibility(company._id)}>
                    {eligibility[company._id] ? (eligibility[company._id].eligible ? "✅ Eligible" : "❌ Not Eligible") : "Check Eligibility"}
                  </button>
                  {isAdmin && <button className="delete-btn-sm" onClick={() => handleDelete(company._id)}>🗑️</button>}
                </div>
                {eligibility[company._id] && !eligibility[company._id].eligible && (
                  <div className="eligibility-issues">
                    {eligibility[company._id].issues?.map((issue, i) => <span key={i} className="issue-chip">⚠️ {issue}</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyTracker;
