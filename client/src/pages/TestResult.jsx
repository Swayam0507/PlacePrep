import { useLocation, useNavigate, Link } from "react-router-dom";

const TestResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { result, timeTaken } = location.state || {};

  if (!result) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <h2>No Results Found</h2>
          <p>Take a test first to see your results</p>
          <Link to="/aptitude-test" className="btn-primary" style={{ display: "inline-flex", marginTop: "16px" }}>
            Take a Test
          </Link>
        </div>
      </div>
    );
  }

  const { score, totalQuestions, percentage, detailedResults, category } = result;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  };

  const getGrade = (pct) => {
    if (pct >= 90) return { label: "Excellent", color: "emerald", emoji: "🏆" };
    if (pct >= 70) return { label: "Good", color: "blue", emoji: "⭐" };
    if (pct >= 50) return { label: "Average", color: "amber", emoji: "📊" };
    return { label: "Needs Improvement", color: "red", emoji: "📚" };
  };

  const grade = getGrade(percentage);

  return (
    <div className="page-container">
      {/* Result Hero */}
      <div className="result-hero">
        <div className="result-emoji">{grade.emoji}</div>
        <h1>Test Complete!</h1>
        <p className="result-grade">{grade.label}</p>

        <div className="result-score-ring">
          <svg viewBox="0 0 120 120" className="score-ring">
            <circle cx="60" cy="60" r="54" className="ring-bg" />
            <circle
              cx="60"
              cy="60"
              r="54"
              className={`ring-fill ${grade.color}`}
              style={{
                strokeDasharray: `${(percentage / 100) * 339.292} 339.292`,
              }}
            />
          </svg>
          <div className="score-center">
            <span className="score-pct">{percentage}%</span>
            <span className="score-fraction">{score}/{totalQuestions}</span>
          </div>
        </div>

        <div className="result-stats-row">
          <div className="result-stat">
            <span className="result-stat-value">{score}</span>
            <span className="result-stat-label">Correct</span>
          </div>
          <div className="result-stat">
            <span className="result-stat-value">{totalQuestions - score}</span>
            <span className="result-stat-label">Wrong</span>
          </div>
          <div className="result-stat">
            <span className="result-stat-value">{formatTime(timeTaken || 0)}</span>
            <span className="result-stat-label">Time Taken</span>
          </div>
          <div className="result-stat">
            <span className="result-stat-value">{category}</span>
            <span className="result-stat-label">Category</span>
          </div>
        </div>

        <div className="result-actions">
          <button className="btn-primary" onClick={() => navigate("/aptitude-test")}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="1 4 1 10 7 10"/>
              <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
            </svg>
            Take Another Test
          </button>
          <Link to="/test-history" className="btn-secondary">
            View History
          </Link>
        </div>
      </div>

      {/* Detailed Review */}
      {detailedResults && detailedResults.length > 0 && (
        <div className="result-review">
          <h2>Detailed Review</h2>
          <div className="review-list">
            {detailedResults.map((item, i) => (
              <div
                key={i}
                className={`review-item ${item.isCorrect ? "correct" : "wrong"}`}
              >
                <div className="review-header">
                  <span className="review-number">Q{i + 1}</span>
                  <span className={`review-badge ${item.isCorrect ? "correct" : "wrong"}`}>
                    {item.isCorrect ? "✓ Correct" : "✗ Wrong"}
                  </span>
                </div>
                <p className="review-question">{item.question}</p>
                <div className="review-options">
                  {item.options?.map((opt, j) => (
                    <div
                      key={j}
                      className={`review-option 
                        ${j === item.correctAnswer ? "correct-answer" : ""} 
                        ${j === item.selectedAnswer && !item.isCorrect ? "wrong-answer" : ""}
                        ${j === item.selectedAnswer && item.isCorrect ? "correct-answer selected" : ""}
                      `}
                    >
                      <span className="review-option-letter">{String.fromCharCode(65 + j)}</span>
                      <span>{opt}</span>
                      {j === item.correctAnswer && (
                        <svg className="correct-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
                {item.explanation && (
                  <div className="review-explanation">
                    <strong>Explanation:</strong> {item.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResult;
