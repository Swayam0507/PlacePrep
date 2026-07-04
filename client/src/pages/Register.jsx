import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { BRANCHES, SEMESTERS } from "../utils/helpers";

const Register = () => {
  const { register, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    branch: "",
    semester: 1,
    cgpa: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState("");
  const [step, setStep] = useState(1); // Multi-step form

  const handleChange = (e) => {
    clearError();
    setLocalError("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateStep1 = () => {
    if (!formData.name.trim()) return "Name is required";
    if (formData.name.trim().length < 2) return "Name must be at least 2 characters";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.password) return "Password is required";
    if (formData.password.length < 6) return "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) return "Passwords do not match";
    return null;
  };

  const handleNext = () => {
    const err = validateStep1();
    if (err) {
      setLocalError(err);
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLocalError("");

    const result = await register({
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      branch: formData.branch,
      semester: Number(formData.semester),
      cgpa: formData.cgpa ? Number(formData.cgpa) : 0,
    });

    setSubmitting(false);
    if (result?.success) {
      navigate("/dashboard");
    }
  };

  const displayError = localError || error;

  return (
    <div className="auth-page">
      {/* Animated background elements */}
      <div className="auth-bg-elements">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
      </div>

      <div className="auth-container">
        {/* Left panel - Branding */}
        <div className="auth-branding">
          <div className="branding-content">
            <div className="branding-icon">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                <path d="M6 12v5c3 3 9 3 12 0v-5" />
              </svg>
            </div>
            <h1>Join PlaceEdge</h1>
            <p>Start your journey towards your dream placement. Track progress, practice skills, and get AI-powered insights.</p>
            <div className="branding-features">
              <div className="feature-item">
                <div className="feature-icon">📊</div>
                <span>AI-Powered Analytics</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🎯</div>
                <span>Personalized Roadmap</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📚</div>
                <span>Curated Resources</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel - Form */}
        <div className="auth-form-panel">
          <div className="auth-form-container">
            <div className="auth-header">
              <h2>Create Account</h2>
              <p>Fill in your details to get started</p>
            </div>

            {/* Step indicator */}
            <div className="step-indicator">
              <div className={`step ${step >= 1 ? "active" : ""}`}>
                <div className="step-dot">1</div>
                <span>Account</span>
              </div>
              <div className="step-line"></div>
              <div className={`step ${step >= 2 ? "active" : ""}`}>
                <div className="step-dot">2</div>
                <span>Academic</span>
              </div>
            </div>

            {displayError && (
              <div className="error-alert">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                {displayError}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="form-step">
                  <div className="form-group">
                    <label htmlFor="name">Full Name</label>
                    <div className="input-wrapper">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address</label>
                    <div className="input-wrapper">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="20" height="16" x="2" y="4" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        placeholder="you@example.com"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <div className="input-wrapper">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Min. 6 characters"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password</label>
                    <div className="input-wrapper">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        placeholder="Re-enter your password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <button type="button" className="btn-primary" onClick={handleNext}>
                    Continue
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="form-step">
                  <div className="form-group">
                    <label htmlFor="branch">Branch / Department</label>
                    <div className="input-wrapper">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                      </svg>
                      <select
                        id="branch"
                        name="branch"
                        value={formData.branch}
                        onChange={handleChange}
                      >
                        <option value="">Select your branch</option>
                        {BRANCHES.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="semester">Semester</label>
                      <div className="input-wrapper">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <select
                          id="semester"
                          name="semester"
                          value={formData.semester}
                          onChange={handleChange}
                        >
                          {SEMESTERS.map((s) => (
                            <option key={s} value={s}>
                              Semester {s}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="cgpa">CGPA</label>
                      <div className="input-wrapper">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <input
                          type="number"
                          id="cgpa"
                          name="cgpa"
                          placeholder="0.0 - 10.0"
                          value={formData.cgpa}
                          onChange={handleChange}
                          step="0.01"
                          min="0"
                          max="10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setStep(1)}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                      </svg>
                      Back
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <span className="btn-spinner"></span>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            <div className="auth-footer">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="auth-link">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
