import { useState, useEffect } from "react";
import { getBookmarks, toggleBookmark } from "../services/api";

const Bookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revealedAnswers, setRevealedAnswers] = useState({});

  useEffect(() => { fetchBookmarks(); }, []);

  const fetchBookmarks = async () => {
    try {
      const { data } = await getBookmarks();
      setBookmarks(data.bookmarks || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleRemove = async (questionId) => {
    try {
      await toggleBookmark(questionId);
      setBookmarks(bookmarks.filter((b) => b.questionId?._id !== questionId));
    } catch (err) { console.error(err); }
  };

  const toggleReveal = (id) => {
    setRevealedAnswers({ ...revealedAnswers, [id]: !revealedAnswers[id] });
  };

  const difficultyColor = { easy: "#10b981", medium: "#f59e0b", hard: "#ef4444" };

  if (loading) {
    return <div className="page-container"><div className="loading-screen"><div className="loading-spinner"><div className="spinner"></div><p>Loading bookmarks...</p></div></div></div>;
  }

  return (
    <div className="bookmarks-page">
      <div className="bookmarks-container">
        <div className="bookmarks-header">
          <h1>🔖 Bookmarked Questions</h1>
          <p>Your saved questions for quick revision · {bookmarks.length} bookmarks</p>
        </div>

        {bookmarks.length === 0 ? (
          <div className="empty-state">
            <p>No bookmarks yet. Save tricky questions during tests for later revision!</p>
          </div>
        ) : (
          <div className="bookmarks-list">
            {bookmarks.map((bm) => {
              const q = bm.questionId;
              if (!q) return null;
              const revealed = revealedAnswers[q._id];
              return (
                <div key={bm._id} className="bookmark-card">
                  <div className="bookmark-card-header">
                    <div className="bookmark-meta">
                      <span className="bookmark-category" style={{ textTransform: "capitalize" }}>{q.category}</span>
                      <span className="bookmark-difficulty" style={{ color: difficultyColor[q.difficulty] }}>{q.difficulty}</span>
                    </div>
                    <button className="remove-bookmark-btn" onClick={() => handleRemove(q._id)} title="Remove bookmark">✕</button>
                  </div>
                  <h3 className="bookmark-question">{q.question}</h3>
                  <div className="bookmark-options">
                    {q.options?.map((opt, i) => (
                      <div key={i} className={`bookmark-option ${revealed && i === q.correctAnswer ? "correct" : ""} ${revealed && i !== q.correctAnswer ? "faded" : ""}`}>
                        <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                        <span>{opt}</span>
                        {revealed && i === q.correctAnswer && <span className="correct-icon">✅</span>}
                      </div>
                    ))}
                  </div>
                  <div className="bookmark-actions">
                    <button className="reveal-btn" onClick={() => toggleReveal(q._id)}>
                      {revealed ? "Hide Answer" : "👁️ Reveal Answer"}
                    </button>
                  </div>
                  {revealed && q.explanation && (
                    <div className="bookmark-explanation">
                      <strong>💡 Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Bookmarks;
