import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getQuestions, getCategories, submitTest } from "../services/api";

const CATEGORY_LABELS = {
  quantitative: "Quantitative Aptitude",
  logical: "Logical Reasoning",
  technical: "Technical",
  mixed: "Mixed (All Categories)",
};

const CATEGORY_ICONS = {
  quantitative: "🧮",
  logical: "🧩",
  technical: "💻",
  mixed: "🎯",
};

const AptitudeTest = () => {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("config"); // config | test | submitting
  const [categories, setCategories] = useState([]);

  // Config state
  const [selectedCategory, setSelectedCategory] = useState("mixed");
  const [selectedDifficulty, setSelectedDifficulty] = useState("mixed");
  const [questionCount, setQuestionCount] = useState(10);

  // Test state
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const timerRef = useRef(null);

  // Loading & errors
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await getCategories();
      if (data.success) setCategories(data.categories);
    } catch (err) {
      // Categories will work even without fetch
    }
  };

  // Timer
  useEffect(() => {
    if (phase !== "test" || timeLeft <= 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [phase]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const getTimerClass = () => {
    if (timeLeft <= 30) return "timer-danger";
    if (timeLeft <= 60) return "timer-warning";
    return "";
  };

  const startTest = async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await getQuestions({
        category: selectedCategory,
        difficulty: selectedDifficulty,
        limit: questionCount,
      });

      if (data.success && data.questions.length > 0) {
        setQuestions(data.questions);
        setCurrentIndex(0);
        setAnswers({});
        const time = data.questions.length * 60; // 1 minute per question
        setTimeLeft(time);
        setTotalTime(time);
        setPhase("test");
      } else {
        setError("No questions found for this category. Try a different selection.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load questions.");
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (questionId, optionIndex) => {
    setAnswers({ ...answers, [questionId]: optionIndex });
  };

  const handleSubmit = useCallback(async () => {
    if (phase === "submitting") return;
    setPhase("submitting");
    clearInterval(timerRef.current);

    const timeTaken = totalTime - timeLeft;
    const formattedAnswers = questions.map((q) => ({
      questionId: q._id,
      selectedAnswer: answers[q._id] !== undefined ? answers[q._id] : -1,
    }));

    try {
      const { data } = await submitTest({
        category: selectedCategory,
        answers: formattedAnswers,
        timeTaken,
        difficulty: selectedDifficulty,
      });

      if (data.success) {
        navigate("/test-result", {
          state: {
            result: data.result,
            timeTaken,
          },
        });
      }
    } catch (err) {
      setError("Failed to submit test. Please try again.");
      setPhase("test");
    }
  }, [phase, questions, answers, timeLeft, totalTime, selectedCategory, selectedDifficulty, navigate]);

  const answeredCount = Object.keys(answers).length;
  const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  // ===== CONFIG PHASE =====
  if (phase === "config") {
    return (
      <div className="page-container">
        <div className="page-header">
          <div>
            <h1>Aptitude Test</h1>
            <p className="page-subtitle">
              Configure your test and start practicing
            </p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            {error}
          </div>
        )}

        <div className="test-config">
          {/* Category Selection */}
          <div className="config-section">
            <h3>Select Category</h3>
            <div className="category-grid">
              {["mixed", "quantitative", "logical", "technical"].map((cat) => (
                <button
                  key={cat}
                  className={`category-card ${selectedCategory === cat ? "selected" : ""}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <span className="category-icon">{CATEGORY_ICONS[cat]}</span>
                  <span className="category-name">{CATEGORY_LABELS[cat]}</span>
                  {categories.find((c) => c.name === cat) && (
                    <span className="category-count">
                      {categories.find((c) => c.name === cat).count} questions
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="config-section">
            <h3>Difficulty Level</h3>
            <div className="difficulty-options">
              {["mixed", "easy", "medium", "hard"].map((d) => (
                <button
                  key={d}
                  className={`difficulty-btn ${selectedDifficulty === d ? "selected" : ""} ${d}`}
                  onClick={() => setSelectedDifficulty(d)}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Question Count */}
          <div className="config-section">
            <h3>Number of Questions</h3>
            <div className="count-options">
              {[5, 10, 15, 20].map((n) => (
                <button
                  key={n}
                  className={`count-btn ${questionCount === n ? "selected" : ""}`}
                  onClick={() => setQuestionCount(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Test Info */}
          <div className="test-info-bar">
            <div className="info-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>{questionCount} min time limit</span>
            </div>
            <div className="info-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              <span>{questionCount} questions</span>
            </div>
            <div className="info-item">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              <span>1 mark per correct</span>
            </div>
          </div>

          <button
            className="btn-primary btn-lg"
            onClick={startTest}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="btn-spinner"></span>
                Loading Questions...
              </>
            ) : (
              <>
                Start Test
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ===== TEST PHASE =====
  const currentQ = questions[currentIndex];

  return (
    <div className="test-page">
      {/* Top Bar */}
      <div className="test-topbar">
        <div className="test-topbar-left">
          <span className="test-badge">
            {CATEGORY_ICONS[selectedCategory]} {CATEGORY_LABELS[selectedCategory]}
          </span>
          <span className="question-counter">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>
        <div className={`test-timer ${getTimerClass()}`}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Progress */}
      <div className="test-progress-bar">
        <div className="test-progress-fill" style={{ width: `${progress}%` }}></div>
      </div>

      {/* Question */}
      <div className="test-content">
        <div className="question-card">
          <div className="question-number">Question {currentIndex + 1}</div>
          <h2 className="question-text">{currentQ?.question}</h2>

          <div className="options-list">
            {currentQ?.options.map((option, i) => (
              <button
                key={i}
                className={`option-btn ${answers[currentQ._id] === i ? "selected" : ""}`}
                onClick={() => selectAnswer(currentQ._id, i)}
              >
                <span className="option-letter">
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="option-text">{option}</span>
                {answers[currentQ._id] === i && (
                  <svg className="check-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="test-navigation">
          <button
            className="btn-secondary"
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Previous
          </button>

          <div className="question-dots">
            {questions.map((q, i) => (
              <button
                key={i}
                className={`dot ${i === currentIndex ? "current" : ""} ${answers[q._id] !== undefined ? "answered" : ""}`}
                onClick={() => setCurrentIndex(i)}
                title={`Question ${i + 1}`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {currentIndex < questions.length - 1 ? (
            <button
              className="btn-primary"
              onClick={() => setCurrentIndex(currentIndex + 1)}
            >
              Next
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12"/>
                <polyline points="12 5 19 12 12 19"/>
              </svg>
            </button>
          ) : (
            <button
              className="btn-submit"
              onClick={() => {
                if (answeredCount < questions.length) {
                  if (!window.confirm(`You've answered ${answeredCount}/${questions.length} questions. Submit anyway?`)) {
                    return;
                  }
                }
                handleSubmit();
              }}
              disabled={phase === "submitting"}
            >
              {phase === "submitting" ? (
                <>
                  <span className="btn-spinner"></span>
                  Submitting...
                </>
              ) : (
                <>
                  Submit Test
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </>
              )}
            </button>
          )}
        </div>

        {/* Answer Summary */}
        <div className="answer-summary">
          <span className="summary-answered">
            <span className="dot-indicator answered"></span>
            Answered: {answeredCount}
          </span>
          <span className="summary-unanswered">
            <span className="dot-indicator unanswered"></span>
            Unanswered: {questions.length - answeredCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AptitudeTest;
