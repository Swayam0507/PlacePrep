import { useState, useEffect } from "react";
import {
  getAllQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion,
} from "../services/api";

const AdminQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: "", difficulty: "", search: "", page: 1 });
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    category: "quantitative",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    difficulty: "medium",
    explanation: "",
  });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, [filters.page, filters.category, filters.difficulty]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const response = await getAllQuestions({
        page: filters.page,
        limit: 15,
        category: filters.category,
        difficulty: filters.difficulty,
        search: filters.search,
      });
      setQuestions(response.data.questions);
      setPagination(response.data.pagination);
    } catch (err) {
      console.error("Fetch questions error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters((prev) => ({ ...prev, page: 1 }));
    fetchQuestions();
  };

  const openAddModal = () => {
    setEditingQuestion(null);
    setFormData({
      category: "quantitative",
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
      difficulty: "medium",
      explanation: "",
    });
    setFormError("");
    setShowModal(true);
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setFormData({
      category: q.category,
      question: q.question,
      options: [...q.options],
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
      explanation: q.explanation || "",
    });
    setFormError("");
    setShowModal(true);
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormError("");
    setSaving(true);

    // Validate
    if (!formData.question.trim()) {
      setFormError("Question text is required.");
      setSaving(false);
      return;
    }
    if (formData.options.some((o) => !o.trim())) {
      setFormError("All 4 options are required.");
      setSaving(false);
      return;
    }

    try {
      if (editingQuestion) {
        await updateQuestion(editingQuestion._id, formData);
      } else {
        await addQuestion(formData);
      }
      setShowModal(false);
      fetchQuestions();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save question.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await deleteQuestion(id);
      fetchQuestions();
    } catch (err) {
      alert("Failed to delete question.");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <div>
            <h1>📝 Manage Questions</h1>
            <p>Add, edit, and delete aptitude questions</p>
          </div>
          <button className="add-btn" onClick={openAddModal}>
            ➕ Add Question
          </button>
        </div>

        {/* Filters */}
        <div className="admin-filters">
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search questions..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="admin-search-input"
              id="admin-question-search"
            />
            <button type="submit" className="search-btn">🔍</button>
          </form>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
            className="admin-select"
            id="admin-category-filter"
          >
            <option value="">All Categories</option>
            <option value="quantitative">Quantitative</option>
            <option value="logical">Logical</option>
            <option value="technical">Technical</option>
          </select>

          <select
            value={filters.difficulty}
            onChange={(e) => setFilters({ ...filters, difficulty: e.target.value, page: 1 })}
            className="admin-select"
            id="admin-difficulty-filter"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Questions Table */}
        {loading ? (
          <div className="loading-screen">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading questions...</p>
            </div>
          </div>
        ) : (
          <>
            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: "40%" }}>Question</th>
                    <th>Category</th>
                    <th>Difficulty</th>
                    <th>Correct</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {questions.map((q) => (
                    <tr key={q._id}>
                      <td className="question-cell">
                        {q.question.length > 80 ? q.question.substring(0, 80) + "..." : q.question}
                      </td>
                      <td>
                        <span className={`category-badge ${q.category}`}>
                          {q.category}
                        </span>
                      </td>
                      <td>
                        <span className={`difficulty-badge ${q.difficulty}`}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td>{q.options[q.correctAnswer]?.substring(0, 20)}...</td>
                      <td>
                        <div className="action-btns">
                          <button className="edit-btn" onClick={() => openEditModal(q)} title="Edit">
                            ✏️
                          </button>
                          <button className="delete-btn" onClick={() => handleDelete(q._id)} title="Delete">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {questions.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: "center", padding: "40px" }}>
                        No questions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.total > 1 && (
              <div className="admin-pagination">
                <button
                  disabled={filters.page <= 1}
                  onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                  className="page-btn"
                >
                  ← Prev
                </button>
                <span className="page-info">
                  Page {pagination.current} of {pagination.total} ({pagination.count} total)
                </span>
                <button
                  disabled={filters.page >= pagination.total}
                  onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                  className="page-btn"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingQuestion ? "✏️ Edit Question" : "➕ Add Question"}</h2>
                <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
              </div>

              <form onSubmit={handleSave} className="question-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="q-category">Category</label>
                    <select
                      id="q-category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="quantitative">Quantitative</option>
                      <option value="logical">Logical</option>
                      <option value="technical">Technical</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="q-difficulty">Difficulty</label>
                    <select
                      id="q-difficulty"
                      value={formData.difficulty}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="q-text">Question Text</label>
                  <textarea
                    id="q-text"
                    rows="3"
                    value={formData.question}
                    onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                    placeholder="Enter the question..."
                  />
                </div>

                <div className="options-group">
                  <label>Options (select correct answer)</label>
                  {formData.options.map((opt, i) => (
                    <div key={i} className="option-row">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.correctAnswer === i}
                        onChange={() => setFormData({ ...formData, correctAnswer: i })}
                        id={`option-radio-${i}`}
                      />
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        className="option-input"
                        id={`option-text-${i}`}
                      />
                    </div>
                  ))}
                </div>

                <div className="form-group">
                  <label htmlFor="q-explanation">Explanation (optional)</label>
                  <textarea
                    id="q-explanation"
                    rows="2"
                    value={formData.explanation}
                    onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                    placeholder="Explain the correct answer..."
                  />
                </div>

                {formError && <div className="form-error">{formError}</div>}

                <div className="modal-actions">
                  <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="save-btn" disabled={saving}>
                    {saving ? "Saving..." : editingQuestion ? "Update Question" : "Add Question"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminQuestions;
