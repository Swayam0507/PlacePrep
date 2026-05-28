import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/api";
import { useAuth } from "../context/AuthContext";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  
  const { token } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth(); // If we want to auto-login, or we can just redirect

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }
    
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { data } = await resetPassword(token, { password });
      setMessage("Password reset successfully! Redirecting to login...");
      
      // Auto-redirect to login after 2 seconds
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password. The link might be expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: "400px", margin: "80px auto", padding: "40px 30px", background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", textAlign: "center" }}>
        <h2 style={{ marginBottom: "10px", fontSize: "1.8rem" }}>Reset Password</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px", fontSize: "0.9rem" }}>
          Enter your new password below.
        </p>

        {message && <div className="alert-success" style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--success)", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>{message}</div>}
        {error && <div className="alert-error" style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
          <div className="form-group">
            <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: "100%", padding: "12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }}
            />
          </div>
          <div className="form-group">
            <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              style={{ width: "100%", padding: "12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "12px", width: "100%", marginTop: "8px" }}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
