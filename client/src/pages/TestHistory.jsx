import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTestHistory } from "../services/api";
import { formatDate } from "../utils/helpers";

const CATEGORY_ICONS = {
  quantitative: "🧮",
  logical: "🧩",
  technical: "💻",
  mixed: "🎯",
};

const TestHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchHistory();
  }, [filter]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const params = { limit: 50 };
      if (filter !== "all") params.category = filter;
      const { data } = await getTestHistory(params);
      if (data.success) setHistory(data.history);
    } catch (err) {
      console.error("Failed to fetch history");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds) return "—";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const getScoreColor = (pct) => {
    if (pct >= 80) return "score-excellent";
    if (pct >= 60) return "score-good";
    if (pct >= 40) return "score-average";
    return "score-poor";
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Test History</h1>
          <p className="page-subtitle">Review your past test attempts and track progress</p>
        </div>
        <Link to="/aptitude-test" className="btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New Test
        </Link>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        {["all", "quantitative", "logical", "technical", "mixed"].map((cat) => (
          <button
            key={cat}
            className={`filter-btn ${filter === cat ? "active" : ""}`}
            onClick={() => setFilter(cat)}
          >
            {cat === "all" ? "All" : CATEGORY_ICONS[cat]} {cat === "all" ? "" : cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state">
          <div className="spinner"></div>
          <p>Loading history...</p>
        </div>
      ) : history.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
          </svg>
          <p>No test attempts found</p>
          <span>Take your first test to start building history</span>
          <Link to="/aptitude-test" className="btn-primary" style={{ marginTop: "16px", display: "inline-flex" }}>
            Start a Test
          </Link>
        </div>
      ) : (
        <div className="history-list">
          {history.map((attempt) => (
            <div key={attempt._id} className="history-item">
              <div className="history-left">
                <div className="history-icon">
                  {CATEGORY_ICONS[attempt.category] || "📝"}
                </div>
                <div className="history-info">
                  <h4>
                    {attempt.category.charAt(0).toUpperCase() + attempt.category.slice(1)} Test
                  </h4>
                  <div className="history-meta">
                    <span>{formatDate(attempt.createdAt)}</span>
                    <span>•</span>
                    <span>{formatTime(attempt.timeTaken)}</span>
                    <span>•</span>
                    <span>{attempt.difficulty}</span>
                  </div>
                </div>
              </div>
              <div className="history-right">
                <div className={`history-score ${getScoreColor(attempt.percentage)}`}>
                  <span className="score-pct">{attempt.percentage}%</span>
                  <span className="score-detail">{attempt.score}/{attempt.totalQuestions}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestHistory;
