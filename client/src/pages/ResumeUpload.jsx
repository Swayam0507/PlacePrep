import { useState, useRef } from "react";
import { uploadResume, getMyResumes, deleteResume, parseResume } from "../services/api";
import { useEffect } from "react";
import { formatDate } from "../utils/helpers";

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const [skills, setSkills] = useState("");
  const [education, setEducation] = useState("");
  const [uploading, setUploading] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const { data } = await getMyResumes();
      if (data.success) setResumes(data.resumes);
    } catch (err) {
      console.error("Failed to fetch resumes");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    validateAndSetFile(selected);
  };

  const validateAndSetFile = (selected) => {
    if (selected) {
      if (selected.type !== "application/pdf") {
        setMessage({ type: "error", text: "Only PDF files are allowed." });
        return;
      }
      if (selected.size > 5 * 1024 * 1024) {
        setMessage({ type: "error", text: "File size must be under 5MB." });
        return;
      }
      setFile(selected);
      setMessage({ type: "", text: "" });
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage({ type: "error", text: "Please select a file to upload." });
      return;
    }

    setUploading(true);
    setMessage({ type: "", text: "" });

    const formData = new FormData();
    formData.append("resume", file);
    if (skills.trim()) formData.append("skills", skills.trim());
    if (education.trim()) formData.append("education", education.trim());

    try {
      const { data } = await uploadResume(formData);
      if (data.success) {
        setMessage({ type: "success", text: "Resume uploaded successfully!" });
        setFile(null);
        setSkills("");
        setEducation("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchResumes();
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Upload failed. Try again.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this resume?")) return;
    try {
      const { data } = await deleteResume(id);
      if (data.success) {
        setResumes(resumes.filter((r) => r._id !== id));
        setMessage({ type: "success", text: "Resume deleted." });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Failed to delete resume." });
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Resume Manager</h1>
          <p className="page-subtitle">
            Upload your resume and manage your skills profile
          </p>
        </div>
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.type === "success" ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          )}
          {message.text}
        </div>
      )}

      <div className="resume-layout">
        {/* Upload Section */}
        <div className="card upload-card">
          <div className="card-header">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="12" y1="18" x2="12" y2="12"/>
              <line x1="9" y1="15" x2="15" y2="15"/>
            </svg>
            <h2>Upload Resume</h2>
          </div>

          <form onSubmit={handleUpload}>
            {/* Drop Zone */}
            <div
              className={`drop-zone ${dragActive ? "drag-active" : ""} ${file ? "has-file" : ""}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
                hidden
              />
              {file ? (
                <div className="file-preview">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  <p className="file-name">{file.name}</p>
                  <p className="file-size">{formatSize(file.size)}</p>
                </div>
              ) : (
                <div className="drop-content">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <p>Drag & drop your PDF here</p>
                  <span>or click to browse (max 5MB)</span>
                </div>
              )}
            </div>

            {/* Skills Input */}
            <div className="form-group">
              <label htmlFor="skills">Skills (comma separated)</label>
              <input
                type="text"
                id="skills"
                className="form-input"
                placeholder="e.g. React, Node.js, Python, SQL"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
              />
            </div>

            {/* Education Input */}
            <div className="form-group">
              <label htmlFor="education">Education Summary</label>
              <input
                type="text"
                id="education"
                className="form-input"
                placeholder="e.g. B.Tech Computer Science, XYZ University"
                value={education}
                onChange={(e) => setEducation(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary" disabled={uploading || !file}>
              {uploading ? (
                <>
                  <span className="btn-spinner"></span>
                  Uploading...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  Upload Resume
                </>
              )}
            </button>
          </form>
        </div>

        {/* Resume List */}
        <div className="card resumes-list-card">
          <div className="card-header">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <h2>My Resumes</h2>
            <span className="badge">{resumes.length}</span>
          </div>

          {loading ? (
            <div className="empty-state">
              <div className="spinner"></div>
              <p>Loading resumes...</p>
            </div>
          ) : resumes.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              <p>No resumes uploaded yet</p>
              <span>Upload your first resume to get started</span>
            </div>
          ) : (
            <div className="resume-items">
              {resumes.map((resume) => (
                <div key={resume._id} className="resume-item">
                  <div className="resume-item-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14 2 14 8 20 8"/>
                    </svg>
                  </div>
                  <div className="resume-item-info">
                    <h4>{resume.originalName}</h4>
                    <div className="resume-meta">
                      <span>{formatSize(resume.fileSize)}</span>
                      <span>•</span>
                      <span>{formatDate(resume.createdAt)}</span>
                    </div>
                    {resume.skills.length > 0 && (
                      <div className="skill-tags">
                        {resume.skills.slice(0, 5).map((skill, i) => (
                          <span key={i} className="skill-tag">{skill}</span>
                        ))}
                        {resume.skills.length > 5 && (
                          <span className="skill-tag more">+{resume.skills.length - 5}</span>
                        )}
                      </div>
                    )}
                  </div>
                  <button
                    className="btn-icon danger"
                    onClick={() => handleDelete(resume._id)}
                    title="Delete resume"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload;
