import { useState, useEffect } from "react";
import { getInterviewQuestions, getInterviewCompanies } from "../services/api";

const InterviewPrep = () => {
  const [questions, setQuestions] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", company: "", difficulty: "" });
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => { fetchCompanies(); }, []);
  useEffect(() => { fetchQuestions(); }, [filters]);

  const fetchCompanies = async () => {
    try { const { data } = await getInterviewCompanies(); setCompanies(data.companies || []); }
    catch (err) { /* ignore */ }
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data } = await getInterviewQuestions(filters);
      setQuestions(data.questions || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const categoryInfo = {
    hr: { icon: "🗣️", color: "#f59e0b" },
    technical: { icon: "💻", color: "#6366f1" },
    behavioral: { icon: "🧠", color: "#10b981" },
    "company-specific": { icon: "🏢", color: "#06b6d4" },
  };

  const difficultyColor = { easy: "#10b981", medium: "#f59e0b", hard: "#ef4444" };

  return (
    <div className="interview-page">
      <div className="interview-container">
        <div className="interview-header">
          <h1>🎤 Interview Preparation</h1>
          <p>Practice common interview questions with expert tips and sample answers</p>
        </div>

        {/* Category Cards */}
        <div className="interview-category-cards">
          {[
            { key: "", label: "All", icon: "📋", count: questions.length },
            { key: "hr", label: "HR Questions", icon: "🗣️" },
            { key: "technical", label: "Technical", icon: "💻" },
            { key: "behavioral", label: "Behavioral", icon: "🧠" },
            { key: "company-specific", label: "Company Specific", icon: "🏢" },
          ].map((cat) => (
            <button key={cat.key}
              className={`interview-cat-card ${filters.category === cat.key ? "active" : ""}`}
              onClick={() => setFilters({ ...filters, category: cat.key })}>
              <span className="cat-icon">{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Filters Row */}
        <div className="interview-filters">
          <select value={filters.company} onChange={(e) => setFilters({ ...filters, company: e.target.value })} className="interview-select">
            <option value="">All Companies</option>
            {companies.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filters.difficulty} onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })} className="interview-select">
            <option value="">All Difficulty</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Questions List */}
        {loading ? (
          <div className="loading-screen"><div className="loading-spinner"><div className="spinner"></div><p>Loading questions...</p></div></div>
        ) : questions.length === 0 ? (
          <div className="empty-state"><p>No interview questions found. Check back later or adjust filters.</p></div>
        ) : (
          <div className="interview-questions-list">
            {questions.map((q) => (
              <div key={q._id} className={`interview-q-card ${expandedId === q._id ? "expanded" : ""}`}>
                <div className="interview-q-header" onClick={() => setExpandedId(expandedId === q._id ? null : q._id)}>
                  <div className="interview-q-meta">
                    <span className="interview-q-cat" style={{ background: `${categoryInfo[q.category]?.color}20`, color: categoryInfo[q.category]?.color }}>
                      {categoryInfo[q.category]?.icon} {q.category}
                    </span>
                    <span className="interview-q-diff" style={{ color: difficultyColor[q.difficulty] }}>
                      {q.difficulty}
                    </span>
                    {q.company && <span className="interview-q-company">🏢 {q.company}</span>}
                  </div>
                  <h3 className="interview-q-text">{q.question}</h3>
                  <svg className={`expand-chevron ${expandedId === q._id ? "open" : ""}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="6 9 12 15 18 9"/>
                  </svg>
                </div>
                {expandedId === q._id && (
                  <div className="interview-q-body">
                    {q.sampleAnswer && (
                      <div className="sample-answer">
                        <h4>💡 Sample Answer</h4>
                        <p>{q.sampleAnswer}</p>
                      </div>
                    )}
                    {q.tips && q.tips.length > 0 && (
                      <div className="answer-tips">
                        <h4>📌 Tips</h4>
                        <ul>{q.tips.map((tip, i) => <li key={i}>{tip}</li>)}</ul>
                      </div>
                    )}
                    {q.tags && q.tags.length > 0 && (
                      <div className="interview-tags">
                        {q.tags.map((t, i) => <span key={i} className="interview-tag">{t}</span>)}
                      </div>
                    )}
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

export default InterviewPrep;
