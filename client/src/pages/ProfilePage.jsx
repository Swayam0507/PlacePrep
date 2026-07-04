import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getProfile, updateProfile } from "../services/api";
import { BRANCHES, SEMESTERS } from "../utils/helpers";

const ProfilePage = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "", branch: "", semester: 1, cgpa: 0,
    bio: "", phone: "", linkedin: "", github: "", skills: "",
  });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await getProfile();
      setProfile(data.profile);
      setFormData({
        name: data.profile.name || "",
        branch: data.profile.branch || "",
        semester: data.profile.semester || 1,
        cgpa: data.profile.cgpa || 0,
        bio: data.profile.bio || "",
        phone: data.profile.phone || "",
        linkedin: data.profile.linkedin || "",
        github: data.profile.github || "",
        skills: (data.profile.skills || []).join(", "),
      });
    } catch (err) {
      console.error("Fetch profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
        cgpa: parseFloat(formData.cgpa) || 0,
        semester: parseInt(formData.semester) || 1,
      };
      await updateProfile(payload);
      setMessage("Profile updated successfully!");
      setEditing(false);
      fetchProfile();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading-screen"><div className="loading-spinner"><div className="spinner"></div><p>Loading profile...</p></div></div>
      </div>
    );
  }

  const initials = profile?.name ? profile.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) : "?";

  return (
    <div className="profile-page">
      <div className="profile-container">
        {message && <div className="profile-message">{message}</div>}

        {/* Profile Header Card */}
        <div className="profile-hero-card">
          <div className="profile-hero-bg"></div>
          <div className="profile-hero-content">
            <div className="profile-avatar-large">{initials}</div>
            <div className="profile-hero-info">
              <h1>{profile?.name}</h1>
              <p className="profile-email">{profile?.email}</p>
              <div className="profile-badges-row">
                <span className={`role-badge student`}>
                  {"🎓 Student"}
                </span>
                {profile?.branch && <span className="info-chip">📚 {profile?.branch}</span>}
                {profile?.semester && <span className="info-chip">📅 Sem {profile?.semester}</span>}
                {profile?.cgpa > 0 && <span className="info-chip">⭐ {profile?.cgpa} CGPA</span>}
              </div>
            </div>
            <button className="edit-profile-btn" onClick={() => setEditing(!editing)}>
              {editing ? "Cancel" : "✏️ Edit Profile"}
            </button>
          </div>
        </div>

        <div className="profile-grid">
          {/* Stats Cards */}
          <div className="profile-stats-row">
            <div className="profile-stat-card">
              <span className="profile-stat-icon">📝</span>
              <span className="profile-stat-value">{profile?.stats?.totalTests || 0}</span>
              <span className="profile-stat-label">Tests Taken</span>
            </div>
            <div className="profile-stat-card">
              <span className="profile-stat-icon">📊</span>
              <span className="profile-stat-value">{profile?.stats?.avgScore || 0}%</span>
              <span className="profile-stat-label">Avg Score</span>
            </div>
            <div className="profile-stat-card">
              <span className="profile-stat-icon">📄</span>
              <span className="profile-stat-value">{profile?.stats?.resumeCount || 0}</span>
              <span className="profile-stat-label">Resumes</span>
            </div>
            <div className="profile-stat-card">
              <span className="profile-stat-icon">🔥</span>
              <span className="profile-stat-value">{profile?.streak?.current || 0}</span>
              <span className="profile-stat-label">Day Streak</span>
            </div>
          </div>

          {/* Edit Form or Profile Details */}
          {editing ? (
            <div className="profile-edit-card">
              <h2>✏️ Edit Profile</h2>
              <form onSubmit={handleSave} className="profile-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Name</label>
                    <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  <div className="form-group">
                    <label>Phone</label>
                    <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+91 xxxxx xxxxx" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Branch</label>
                    <select value={formData.branch} onChange={(e) => setFormData({...formData, branch: e.target.value})}>
                      <option value="">Select Branch</option>
                      {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Semester</label>
                    <select value={formData.semester} onChange={(e) => setFormData({...formData, semester: e.target.value})}>
                      {SEMESTERS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>CGPA</label>
                    <input type="number" min="0" max="10" step="0.1" value={formData.cgpa} onChange={(e) => setFormData({...formData, cgpa: e.target.value})} />
                  </div>
                </div>
                <div className="form-group">
                  <label>Bio</label>
                  <textarea value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} placeholder="Tell us about yourself..." maxLength="300" rows={3} />
                </div>
                <div className="form-group">
                  <label>Skills (comma-separated)</label>
                  <input type="text" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})} placeholder="React, Python, SQL, Machine Learning" />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>LinkedIn</label>
                    <input type="url" value={formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} placeholder="https://linkedin.com/in/..." />
                  </div>
                  <div className="form-group">
                    <label>GitHub</label>
                    <input type="url" value={formData.github} onChange={(e) => setFormData({...formData, github: e.target.value})} placeholder="https://github.com/..." />
                  </div>
                </div>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "💾 Save Changes"}
                </button>
              </form>
            </div>
          ) : (
            <div className="profile-details-card">
              <h2>📋 Profile Details</h2>
              {profile?.bio && <p className="profile-bio">{profile.bio}</p>}
              <div className="profile-details-grid">
                {profile?.phone && <div className="detail-item"><span className="detail-label">📱 Phone</span><span>{profile.phone}</span></div>}
                {profile?.linkedin && <div className="detail-item"><span className="detail-label">💼 LinkedIn</span><a href={profile.linkedin} target="_blank" rel="noopener noreferrer">{profile.linkedin.replace("https://", "")}</a></div>}
                {profile?.github && <div className="detail-item"><span className="detail-label">🐙 GitHub</span><a href={profile.github} target="_blank" rel="noopener noreferrer">{profile.github.replace("https://", "")}</a></div>}
                <div className="detail-item"><span className="detail-label">📅 Joined</span><span>{new Date(profile?.createdAt).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}</span></div>
              </div>
              {/* Skills */}
              {profile?.skills?.length > 0 && (
                <div className="profile-skills-section">
                  <h3>🛠️ Skills</h3>
                  <div className="skill-tags">
                    {profile.skills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)}
                  </div>
                </div>
              )}
              {/* Badges */}
              {profile?.badges?.length > 0 && (
                <div className="profile-badges-section">
                  <h3>🏅 Badges</h3>
                  <div className="badges-grid">
                    {profile.badges.map((b, i) => (
                      <div key={i} className="badge-item">
                        <span className="badge-icon">{b.icon || "🏅"}</span>
                        <span className="badge-name">{b.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
