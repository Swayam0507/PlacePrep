import { useState, useEffect } from "react";
import { recommendJobs, scrapeJobs } from "../services/api";
import { useAuth } from "../context/AuthContext";

const JobRecommendations = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("recommend");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Recommend state
  const [skills, setSkills] = useState("");
  const [scores, setScores] = useState({
    cgpa: user?.cgpa || 7,
    aptitude_score: 60,
    coding_score: 60,
    communication_score: 60,
  });
  const [recommendations, setRecommendations] = useState([]);

  // Scrape state
  const [searchQuery, setSearchQuery] = useState("software engineer internship");
  const [scrapedJobs, setScrapedJobs] = useState([]);

  const handleRecommend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const response = await recommendJobs({
        skills: skillsArray,
        scores,
      });

      setRecommendations(response.data.recommendations || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to get recommendations.");
    } finally {
      setLoading(false);
    }
  };

  const handleScrape = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await scrapeJobs({ query: searchQuery, limit: 15 });
      setScrapedJobs(response.data.jobs || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to scrape jobs.");
    } finally {
      setLoading(false);
    }
  };

  const getMatchColor = (score) => {
    if (score >= 70) return "#10b981";
    if (score >= 45) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div className="jobs-page">
      <div className="jobs-container">
        <div className="jobs-header">
          <h1>💼 Job Recommendations</h1>
          <p>Get personalized job recommendations based on your skills and scores, or browse latest internship listings.</p>
        </div>

        {/* Tab Switcher */}
        <div className="jobs-tabs">
          <button
            className={`jobs-tab ${activeTab === "recommend" ? "active" : ""}`}
            onClick={() => setActiveTab("recommend")}
          >
            🎯 Smart Recommendations
          </button>
          <button
            className={`jobs-tab ${activeTab === "scrape" ? "active" : ""}`}
            onClick={() => setActiveTab("scrape")}
          >
            🌐 Browse Listings
          </button>
        </div>

        {error && <div className="jobs-error">{error}</div>}

        {/* Recommendations Tab */}
        {activeTab === "recommend" && (
          <div className="recommend-section">
            <form onSubmit={handleRecommend} className="recommend-form">
              <div className="recommend-form-grid">
                <div className="form-group-full">
                  <label htmlFor="skills-input">🛠️ Your Skills (comma-separated)</label>
                  <input
                    id="skills-input"
                    type="text"
                    placeholder="e.g., python, java, react, sql, machine learning"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="skills-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="score-cgpa">CGPA</label>
                  <input
                    id="score-cgpa"
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={scores.cgpa}
                    onChange={(e) => setScores({ ...scores, cgpa: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="score-aptitude">Aptitude Score</label>
                  <input
                    id="score-aptitude"
                    type="number"
                    min="0"
                    max="100"
                    value={scores.aptitude_score}
                    onChange={(e) => setScores({ ...scores, aptitude_score: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="score-coding">Coding Score</label>
                  <input
                    id="score-coding"
                    type="number"
                    min="0"
                    max="100"
                    value={scores.coding_score}
                    onChange={(e) => setScores({ ...scores, coding_score: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="score-comm">Communication</label>
                  <input
                    id="score-comm"
                    type="number"
                    min="0"
                    max="100"
                    value={scores.communication_score}
                    onChange={(e) => setScores({ ...scores, communication_score: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <button type="submit" className="recommend-btn" disabled={loading}>
                {loading ? "Analyzing..." : "🔍 Get Recommendations"}
              </button>
            </form>

            {/* Recommendation Results */}
            {recommendations.length > 0 && (
              <div className="jobs-grid">
                {recommendations.map((job, index) => (
                  <div key={index} className="job-card">
                    <div className="job-card-header">
                      <div>
                        <h3 className="job-title">{job.title}</h3>
                        <span className="job-category-tag">{job.category}</span>
                      </div>
                      <div
                        className="match-badge"
                        style={{ background: getMatchColor(job.match_score) }}
                      >
                        {job.match_score}%
                      </div>
                    </div>

                    <p className="job-description">{job.description}</p>

                    <div className="job-meta">
                      <div className="job-meta-item">
                        <span className="meta-icon">🏢</span>
                        <span>{job.company_type}</span>
                      </div>
                      <div className="job-meta-item">
                        <span className="meta-icon">💰</span>
                        <span>{job.salary_range}</span>
                      </div>
                    </div>

                    <div className="job-companies">
                      {job.companies.slice(0, 4).map((company, i) => (
                        <span key={i} className="company-chip">{company}</span>
                      ))}
                      {job.companies.length > 4 && (
                        <span className="company-chip more">+{job.companies.length - 4}</span>
                      )}
                    </div>

                    {job.matched_skills.length > 0 && (
                      <div className="job-skills">
                        <span className="skills-label">✅ Matched:</span>
                        {job.matched_skills.map((skill, i) => (
                          <span key={i} className="skill-chip matched">{skill}</span>
                        ))}
                      </div>
                    )}

                    {job.missing_skills.length > 0 && (
                      <div className="job-skills">
                        <span className="skills-label">📚 Learn:</span>
                        {job.missing_skills.map((skill, i) => (
                          <span key={i} className="skill-chip missing">{skill}</span>
                        ))}
                      </div>
                    )}

                    <div className="job-footer">
                      {job.meets_requirements ? (
                        <span className="requirement-badge met">✅ Meets Requirements</span>
                      ) : (
                        <span className="requirement-badge unmet">⚡ Score Gap</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && recommendations.length === 0 && skills && (
              <div className="no-results">
                <p>No recommendations found. Try adding more skills or adjusting scores.</p>
              </div>
            )}
          </div>
        )}

        {/* Browse/Scrape Tab */}
        {activeTab === "scrape" && (
          <div className="scrape-section">
            <form onSubmit={handleScrape} className="scrape-form">
              <div className="scrape-input-group">
                <input
                  type="text"
                  placeholder="Search for jobs or internships..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="scrape-input"
                  id="scrape-search-input"
                />
                <button type="submit" className="scrape-btn" disabled={loading}>
                  {loading ? "Searching..." : "🔍 Search"}
                </button>
              </div>
            </form>

            {scrapedJobs.length > 0 && (
              <div className="scraped-jobs-list">
                {scrapedJobs.map((job, index) => (
                  <div key={index} className="scraped-job-card">
                    <div className="scraped-job-header">
                      <div>
                        <h3>{job.title}</h3>
                        <p className="scraped-company">{job.company}</p>
                      </div>
                      <span className="job-type-badge">{job.type || "On-site"}</span>
                    </div>

                    <div className="scraped-job-meta">
                      <span>📍 {job.location}</span>
                      {job.salary && <span>💰 {job.salary}</span>}
                      <span>📅 {job.date || "Recent"}</span>
                      <span className="source-badge">via {job.source}</span>
                    </div>

                    {job.tags && job.tags.length > 0 && (
                      <div className="scraped-tags">
                        {job.tags.map((tag, i) => (
                          <span key={i} className="scraped-tag">{tag}</span>
                        ))}
                      </div>
                    )}

                    {job.link && (
                      <a
                        href={job.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="apply-link"
                      >
                        Apply →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobRecommendations;
