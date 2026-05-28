import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboardAnalytics } from "../services/api";
import { formatDate, getInitials } from "../utils/helpers";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Doughnut, Bar, Radar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

const CATEGORY_COLORS = {
  quantitative: { bg: "rgba(99, 102, 241, 0.2)", border: "#6366f1" },
  logical: { bg: "rgba(168, 85, 247, 0.2)", border: "#a855f7" },
  technical: { bg: "rgba(6, 182, 212, 0.2)", border: "#06b6d4" },
  mixed: { bg: "rgba(245, 158, 11, 0.2)", border: "#f59e0b" },
};

const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: "#94a3b8", font: { family: "Inter" } } },
  },
  scales: {
    x: { ticks: { color: "#64748b" }, grid: { color: "rgba(99,102,241,0.08)" } },
    y: { ticks: { color: "#64748b" }, grid: { color: "rgba(99,102,241,0.08)" } },
  },
};

const Dashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await getDashboardAnalytics();
      if (data.success) setAnalytics(data.analytics);
    } catch (err) {
      // Analytics may fail if no data yet
    } finally {
      setLoading(false);
    }
  };

  const overview = analytics?.overview || {};
  const hasData = analytics && overview.totalTests > 0;

  // ---- Chart Data ----

  // Performance Trend (Line Chart)
  const trendData = {
    labels: (analytics?.performanceTrend || []).map((t, i) => `Test ${i + 1}`),
    datasets: [
      {
        label: "Score %",
        data: (analytics?.performanceTrend || []).map((t) => t.percentage),
        borderColor: "#6366f1",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        fill: true,
        tension: 0.4,
        pointBackgroundColor: "#6366f1",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
      },
    ],
  };

  // Category Performance (Bar Chart)
  const categoryData = {
    labels: (analytics?.categoryPerformance || []).map(
      (c) => c.category.charAt(0).toUpperCase() + c.category.slice(1)
    ),
    datasets: [
      {
        label: "Avg Score %",
        data: (analytics?.categoryPerformance || []).map((c) => c.avgPercentage),
        backgroundColor: (analytics?.categoryPerformance || []).map(
          (c) => CATEGORY_COLORS[c.category]?.bg || "rgba(99,102,241,0.2)"
        ),
        borderColor: (analytics?.categoryPerformance || []).map(
          (c) => CATEGORY_COLORS[c.category]?.border || "#6366f1"
        ),
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  };

  // Readiness Doughnut
  const readinessData = {
    labels: ["Ready", "Remaining"],
    datasets: [
      {
        data: [overview.readinessScore || 0, 100 - (overview.readinessScore || 0)],
        backgroundColor: ["#6366f1", "rgba(99, 102, 241, 0.1)"],
        borderWidth: 0,
        cutout: "80%",
      },
    ],
  };

  // Radar Chart — category strengths
  const radarData = {
    labels: (analytics?.categoryPerformance || []).map(
      (c) => c.category.charAt(0).toUpperCase() + c.category.slice(1)
    ),
    datasets: [
      {
        label: "Best Score",
        data: (analytics?.categoryPerformance || []).map((c) => c.bestScore),
        backgroundColor: "rgba(6, 182, 212, 0.2)",
        borderColor: "#06b6d4",
        pointBackgroundColor: "#06b6d4",
      },
      {
        label: "Average",
        data: (analytics?.categoryPerformance || []).map((c) => c.avgPercentage),
        backgroundColor: "rgba(99, 102, 241, 0.2)",
        borderColor: "#6366f1",
        pointBackgroundColor: "#6366f1",
      },
    ],
  };

  return (
    <div className="dashboard-page">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <div className="hero-greeting">
            <div className="hero-avatar">{getInitials(user?.name)}</div>
            <div>
              <h1>
                Welcome back, <span className="highlight">{user?.name?.split(" ")[0]}</span> 👋
              </h1>
              <p className="hero-subtitle">
                {hasData
                  ? `You've taken ${overview.totalTests} tests. Keep going!`
                  : "Start your placement preparation journey today."}
              </p>
            </div>
          </div>
          <div className="hero-badge">
            <span className={`role-tag ${user?.role}`}>
              {user?.role === "admin" ? "🛡️ Admin" : "🎓 Student"}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <Link to="/aptitude-test" className="action-card">
          <span className="action-icon">📝</span>
          <span>Take Test</span>
        </Link>
        <Link to="/resume" className="action-card">
          <span className="action-icon">📄</span>
          <span>Upload Resume</span>
        </Link>
        <Link to="/test-history" className="action-card">
          <span className="action-icon">📊</span>
          <span>Test History</span>
        </Link>
      </div>

      {/* Overview Stats */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
          </div>
          <div className="stat-info">
            <p className="stat-label">Tests Taken</p>
            <h3 className="stat-value">{overview.totalTests || 0}</h3>
          </div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
            </svg>
          </div>
          <div className="stat-info">
            <p className="stat-label">Avg Score</p>
            <h3 className="stat-value">{overview.avgScore || 0}%</h3>
          </div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div className="stat-info">
            <p className="stat-label">Resumes</p>
            <h3 className="stat-value">{overview.resumeCount || 0}</h3>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <div className="stat-info">
            <p className="stat-label">Readiness</p>
            <h3 className="stat-value">{overview.readinessScore || 0}%</h3>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {hasData ? (
        <div className="charts-section">
          {/* Row 1: Trend + Readiness */}
          <div className="charts-row">
            <div className="chart-card wide">
              <div className="card-header">
                <h3>Performance Trend</h3>
                <span className="chart-badge">Last {analytics.performanceTrend.length} tests</span>
              </div>
              <div className="chart-body" style={{ height: "280px" }}>
                <Line
                  data={trendData}
                  options={{
                    ...CHART_DEFAULTS,
                    plugins: {
                      ...CHART_DEFAULTS.plugins,
                      legend: { display: false },
                    },
                    scales: {
                      ...CHART_DEFAULTS.scales,
                      y: { ...CHART_DEFAULTS.scales.y, min: 0, max: 100 },
                    },
                  }}
                />
              </div>
            </div>

            <div className="chart-card narrow">
              <div className="card-header">
                <h3>Placement Readiness</h3>
              </div>
              <div className="chart-body readiness-chart" style={{ height: "280px" }}>
                <Doughnut
                  data={readinessData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                  }}
                />
                <div className="readiness-center">
                  <span className="readiness-score">{overview.readinessScore}%</span>
                  <span className="readiness-label">Ready</span>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Category + Radar */}
          <div className="charts-row">
            <div className="chart-card">
              <div className="card-header">
                <h3>Category-wise Scores</h3>
              </div>
              <div className="chart-body" style={{ height: "280px" }}>
                <Bar
                  data={categoryData}
                  options={{
                    ...CHART_DEFAULTS,
                    plugins: { ...CHART_DEFAULTS.plugins, legend: { display: false } },
                    scales: {
                      ...CHART_DEFAULTS.scales,
                      y: { ...CHART_DEFAULTS.scales.y, min: 0, max: 100 },
                    },
                  }}
                />
              </div>
            </div>

            <div className="chart-card">
              <div className="card-header">
                <h3>Skill Radar</h3>
              </div>
              <div className="chart-body" style={{ height: "280px" }}>
                <Radar
                  data={radarData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      r: {
                        angleLines: { color: "rgba(99,102,241,0.1)" },
                        grid: { color: "rgba(99,102,241,0.1)" },
                        pointLabels: { color: "#94a3b8", font: { size: 12 } },
                        ticks: { display: false },
                        min: 0,
                        max: 100,
                      },
                    },
                    plugins: {
                      legend: { labels: { color: "#94a3b8" } },
                    },
                  }}
                />
              </div>
            </div>
          </div>

          {/* Weak & Strong Areas */}
          <div className="charts-row">
            {analytics.weakAreas.length > 0 && (
              <div className="card insight-card weak">
                <div className="card-header">
                  <h3>⚠️ Weak Areas</h3>
                </div>
                <div className="insight-list">
                  {analytics.weakAreas.map((area, i) => (
                    <div key={i} className="insight-item">
                      <span className="insight-name">
                        {area.category.charAt(0).toUpperCase() + area.category.slice(1)}
                      </span>
                      <div className="insight-bar-wrap">
                        <div className="insight-bar">
                          <div
                            className="insight-bar-fill weak"
                            style={{ width: `${area.avgPercentage}%` }}
                          ></div>
                        </div>
                        <span className="insight-pct">{area.avgPercentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/aptitude-test" className="insight-action">
                  Practice Now →
                </Link>
              </div>
            )}

            {analytics.strongAreas.length > 0 && (
              <div className="card insight-card strong">
                <div className="card-header">
                  <h3>💪 Strong Areas</h3>
                </div>
                <div className="insight-list">
                  {analytics.strongAreas.map((area, i) => (
                    <div key={i} className="insight-item">
                      <span className="insight-name">
                        {area.category.charAt(0).toUpperCase() + area.category.slice(1)}
                      </span>
                      <div className="insight-bar-wrap">
                        <div className="insight-bar">
                          <div
                            className="insight-bar-fill strong"
                            style={{ width: `${area.avgPercentage}%` }}
                          ></div>
                        </div>
                        <span className="insight-pct">{area.avgPercentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resume Skills */}
          {overview.latestResume && (
            <div className="card">
              <div className="card-header">
                <h3>📄 Latest Resume</h3>
                <Link to="/resume" className="chart-badge">Manage</Link>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "12px" }}>
                {overview.latestResume.fileName} — uploaded {formatDate(overview.latestResume.uploadDate)}
              </p>
              {overview.latestResume.skills.length > 0 && (
                <div className="skill-tags">
                  {overview.latestResume.skills.map((s, i) => (
                    <span key={i} className="skill-tag">{s}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* No Data State */
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Get Started</h2>
          </div>
          <div className="prep-grid">
            {[
              {
                title: "Take Aptitude Test",
                desc: "Practice quantitative, logical reasoning, and technical questions with timed tests.",
                icon: "📝",
                link: "/aptitude-test",
              },
              {
                title: "Upload Resume",
                desc: "Upload your PDF resume and manage your skills profile for placement readiness.",
                icon: "📄",
                link: "/resume",
              },
              {
                title: "Track Progress",
                desc: "View your test history, performance trends, and identify areas to improve.",
                icon: "📊",
                link: "/test-history",
              },
            ].map((item, i) => (
              <Link key={i} to={item.link} className="prep-card" style={{ textDecoration: "none" }}>
                <div className="prep-card-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
