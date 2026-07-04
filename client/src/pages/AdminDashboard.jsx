import { useState, useEffect } from "react";
import { getAdminAnalytics, exportReport } from "../services/api";

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exporting, setExporting] = useState("");

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await getAdminAnalytics();
      setAnalytics(response.data.analytics);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch analytics.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    setExporting(type);
    try {
      const response = await exportReport(type);
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${type}_report.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert("Export failed.");
    } finally {
      setExporting("");
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <div className="loading-screen">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading admin analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-page">
        <div className="admin-error">{error}</div>
      </div>
    );
  }

  const overview = analytics?.overview || {};

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1>📊 Admin Dashboard</h1>
            <p>Platform-wide analytics and management</p>
          </div>
          <div className="admin-actions">
            <button
              className="export-btn"
              onClick={() => handleExport("users")}
              disabled={!!exporting}
            >
              {exporting === "users" ? "Exporting..." : "📥 Export Students"}
            </button>
            <button
              className="export-btn"
              onClick={() => handleExport("tests")}
              disabled={!!exporting}
            >
              {exporting === "tests" ? "Exporting..." : "📥 Export Tests"}
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>👥</div>
            <div className="stat-details">
              <span className="stat-number">{overview.totalStudents || 0}</span>
              <span className="stat-label">Total Students</span>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #059669, #10b981)" }}>🎓</div>
            <div className="stat-details">
              <span className="stat-number">{overview.totalStudents || 0}</span>
              <span className="stat-label">Students</span>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #ea580c, #f97316)" }}>📝</div>
            <div className="stat-details">
              <span className="stat-number">{overview.totalQuestions || 0}</span>
              <span className="stat-label">Questions</span>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #0891b2, #06b6d4)" }}>📋</div>
            <div className="stat-details">
              <span className="stat-number">{overview.totalTests || 0}</span>
              <span className="stat-label">Test Attempts</span>
            </div>
          </div>
          <div className="admin-stat-card">
            <div className="stat-icon" style={{ background: "linear-gradient(135deg, #dc2626, #ef4444)" }}>📈</div>
            <div className="stat-details">
              <span className="stat-number">{overview.avgScore || 0}%</span>
              <span className="stat-label">Avg Score</span>
            </div>
          </div>

        </div>

        {/* Category Performance */}
        {analytics?.categoryPerformance?.length > 0 && (
          <div className="admin-section">
            <h2>📊 Category Performance</h2>
            <div className="category-perf-grid">
              {analytics.categoryPerformance.map((cat, i) => (
                <div key={i} className="category-perf-card">
                  <h3 style={{ textTransform: "capitalize" }}>{cat.category}</h3>
                  <div className="perf-bar-container">
                    <div
                      className="perf-bar"
                      style={{
                        width: `${cat.avgScore}%`,
                        background:
                          cat.avgScore >= 70
                            ? "linear-gradient(90deg, #059669, #10b981)"
                            : cat.avgScore >= 40
                            ? "linear-gradient(90deg, #d97706, #f59e0b)"
                            : "linear-gradient(90deg, #dc2626, #ef4444)",
                      }}
                    ></div>
                  </div>
                  <div className="perf-stats">
                    <span>Avg: {cat.avgScore}%</span>
                    <span>Best: {cat.bestScore}%</span>
                    <span>{cat.totalAttempts} attempts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Score Distribution */}
        {analytics?.scoreDistribution?.length > 0 && (
          <div className="admin-section">
            <h2>📉 Score Distribution</h2>
            <div className="distribution-bars">
              {analytics.scoreDistribution.map((bucket, i) => {
                const maxCount = Math.max(...analytics.scoreDistribution.map((b) => b.count));
                const height = maxCount > 0 ? (bucket.count / maxCount) * 100 : 0;
                return (
                  <div key={i} className="distribution-bar-group">
                    <div className="dist-bar-wrapper">
                      <div
                        className="dist-bar"
                        style={{
                          height: `${height}%`,
                          background: `hsl(${120 * (i / (analytics.scoreDistribution.length - 1 || 1))}, 70%, 50%)`,
                        }}
                      ></div>
                    </div>
                    <span className="dist-label">{bucket.range}</span>
                    <span className="dist-count">{bucket.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top Performers */}
        {analytics?.topPerformers?.length > 0 && (
          <div className="admin-section">
            <h2>🏆 Top Performers</h2>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Avg Score</th>
                    <th>Tests</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.topPerformers.map((perf, i) => (
                    <tr key={i}>
                      <td>
                        <span className="rank-badge">
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                        </span>
                      </td>
                      <td>{perf.name}</td>
                      <td>{perf.email}</td>
                      <td>
                        <span
                          className="score-chip"
                          style={{
                            color: perf.avgScore >= 70 ? "#10b981" : perf.avgScore >= 40 ? "#f59e0b" : "#ef4444",
                          }}
                        >
                          {perf.avgScore}%
                        </span>
                      </td>
                      <td>{perf.totalTests}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Question Distribution */}
        <div className="admin-section-row">
          {analytics?.categoryDistribution?.length > 0 && (
            <div className="admin-section half">
              <h2>📚 Questions by Category</h2>
              {analytics.categoryDistribution.map((cat, i) => (
                <div key={i} className="dist-row">
                  <span className="dist-row-label" style={{ textTransform: "capitalize" }}>
                    {cat.category}
                  </span>
                  <div className="dist-row-bar-bg">
                    <div
                      className="dist-row-bar"
                      style={{
                        width: `${(cat.count / Math.max(...analytics.categoryDistribution.map((c) => c.count))) * 100}%`,
                      }}
                    ></div>
                  </div>
                  <span className="dist-row-count">{cat.count}</span>
                </div>
              ))}
            </div>
          )}

          {analytics?.difficultyStats?.length > 0 && (
            <div className="admin-section half">
              <h2>⚡ Questions by Difficulty</h2>
              {analytics.difficultyStats.map((diff, i) => (
                <div key={i} className="dist-row">
                  <span className="dist-row-label" style={{ textTransform: "capitalize" }}>
                    {diff.difficulty}
                  </span>
                  <div className="dist-row-bar-bg">
                    <div
                      className="dist-row-bar"
                      style={{
                        width: `${(diff.count / Math.max(...analytics.difficultyStats.map((d) => d.count))) * 100}%`,
                        background:
                          diff.difficulty === "easy"
                            ? "#10b981"
                            : diff.difficulty === "medium"
                            ? "#f59e0b"
                            : "#ef4444",
                      }}
                    ></div>
                  </div>
                  <span className="dist-row-count">{diff.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
