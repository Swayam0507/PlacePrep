import { useState } from "react";
import { predictPlacement } from "../services/api";

const PlacementPredictor = () => {
  const [formData, setFormData] = useState({
    cgpa: 7.5,
    aptitude_score: 65,
    coding_score: 60,
    communication_score: 60,
    attendance: 80,
    projects_count: 3,
    internships_count: 1,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: parseFloat(value) || 0 }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await predictPlacement(formData);
      setResult(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Prediction failed. Make sure the ML service is running.");
    } finally {
      setLoading(false);
    }
  };

  const getGaugeColor = (value) => {
    if (value >= 75) return "#10b981";
    if (value >= 50) return "#f59e0b";
    if (value >= 25) return "#f97316";
    return "#ef4444";
  };

  const getGaugeGradient = (value) => {
    const color = getGaugeColor(value);
    return `conic-gradient(${color} ${value * 3.6}deg, rgba(255,255,255,0.05) ${value * 3.6}deg)`;
  };

  const fields = [
    { key: "cgpa", label: "CGPA", min: 0, max: 10, step: 0.1, icon: "🎓" },
    { key: "aptitude_score", label: "Aptitude Score", min: 0, max: 100, step: 1, icon: "🧠" },
    { key: "coding_score", label: "Coding Score", min: 0, max: 100, step: 1, icon: "💻" },
    { key: "communication_score", label: "Communication Score", min: 0, max: 100, step: 1, icon: "🗣️" },
    { key: "attendance", label: "Attendance %", min: 0, max: 100, step: 1, icon: "📅" },
    { key: "projects_count", label: "Projects Count", min: 0, max: 20, step: 1, icon: "🔨" },
    { key: "internships_count", label: "Internships Count", min: 0, max: 10, step: 1, icon: "💼" },
  ];

  return (
    <div className="predictor-page">
      <div className="predictor-container">
        <div className="predictor-header">
          <h1>🔮 Placement Predictor</h1>
          <p>Enter your academic and skill metrics to predict your placement probability using our AI-powered ensemble of 4 ML classifiers.</p>
        </div>

        <div className="predictor-grid">
          {/* Input Form */}
          <div className="predictor-form-card">
            <h2>📊 Your Metrics</h2>
            <form onSubmit={handleSubmit}>
              {fields.map((field) => (
                <div key={field.key} className="metric-input-group">
                  <label htmlFor={`metric-${field.key}`}>
                    <span className="metric-icon">{field.icon}</span>
                    {field.label}
                    <span className="metric-value-badge">
                      {formData[field.key]}
                    </span>
                  </label>
                  <div className="slider-container">
                    <input
                      type="range"
                      id={`metric-${field.key}`}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      value={formData[field.key]}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="metric-slider"
                      style={{
                        background: `linear-gradient(to right, #6366f1 0%, #6366f1 ${((formData[field.key] - field.min) / (field.max - field.min)) * 100}%, rgba(255,255,255,0.1) ${((formData[field.key] - field.min) / (field.max - field.min)) * 100}%, rgba(255,255,255,0.1) 100%)`,
                      }}
                    />
                    <div className="slider-labels">
                      <span>{field.min}</span>
                      <span>{field.max}</span>
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="submit"
                className="predict-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    Analyzing...
                  </>
                ) : (
                  <>🚀 Predict Placement</>
                )}
              </button>

              {error && <div className="predictor-error">{error}</div>}
            </form>
          </div>

          {/* Results */}
          <div className="predictor-results-card">
            {!result && !loading && (
              <div className="results-placeholder">
                <div className="placeholder-icon">🎯</div>
                <h3>Ready to Predict</h3>
                <p>Adjust your metrics and click "Predict Placement" to see your AI-powered placement analysis.</p>
                <div className="model-badges">
                  <span className="model-badge">Random Forest</span>
                  <span className="model-badge">Decision Tree</span>
                  <span className="model-badge">SVM</span>
                  <span className="model-badge">KNN</span>
                </div>
              </div>
            )}

            {loading && (
              <div className="results-placeholder">
                <div className="loading-pulse">
                  <div className="pulse-ring"></div>
                  <div className="pulse-core">🤖</div>
                </div>
                <h3>Analyzing with 4 ML Models...</h3>
                <p>Running RandomForest, DecisionTree, SVM, and KNN classifiers</p>
              </div>
            )}

            {result && (
              <div className="results-content">
                {/* Main Gauge */}
                <div className="gauge-container">
                  <div
                    className="gauge"
                    style={{ background: getGaugeGradient(result.placement_probability) }}
                  >
                    <div className="gauge-inner">
                      <span className="gauge-value" style={{ color: getGaugeColor(result.placement_probability) }}>
                        {result.placement_probability}%
                      </span>
                      <span className="gauge-label">Placement Probability</span>
                    </div>
                  </div>
                  <div
                    className="prediction-badge"
                    style={{
                      background: result.prediction === "Placed"
                        ? "linear-gradient(135deg, #059669, #10b981)"
                        : "linear-gradient(135deg, #dc2626, #ef4444)",
                    }}
                  >
                    {result.prediction === "Placed" ? "✅" : "⚠️"} {result.prediction}
                  </div>
                </div>

                {/* Per-Model Results */}
                <div className="model-results">
                  <h3>🔬 Model Breakdown</h3>
                  {Object.entries(result.model_results).map(([key, model]) => (
                    <div key={key} className="model-result-row">
                      <div className="model-info">
                        <span className="model-name">{model.model_name}</span>
                        <span
                          className="model-prediction-tag"
                          style={{
                            color: model.prediction === "Placed" ? "#10b981" : "#ef4444",
                          }}
                        >
                          {model.prediction}
                        </span>
                      </div>
                      <div className="model-bar-container">
                        <div
                          className="model-bar"
                          style={{
                            width: `${model.probability}%`,
                            background: getGaugeColor(model.probability),
                          }}
                        ></div>
                      </div>
                      <span className="model-prob">{model.probability}%</span>
                    </div>
                  ))}
                </div>

                {/* Recommendation */}
                <div className="recommendation-card">
                  <h3>💡 Recommendation</h3>
                  <div className="recommendation-text">
                    {result.recommendation.split("\n").map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlacementPredictor;
