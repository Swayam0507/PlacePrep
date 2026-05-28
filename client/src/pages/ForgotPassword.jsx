import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../services/api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const { data } = await forgotPassword({ email });
      setMessage(data.message || "Email sent. Please check your inbox.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: "400px", margin: "80px auto", padding: "40px 30px", background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border)", textAlign: "center" }}>
        <h2 style={{ marginBottom: "10px", fontSize: "1.8rem" }}>Forgot Password</h2>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px", fontSize: "0.9rem" }}>
          Enter your email address and we'll send you a link to reset your password.
        </p>

        {message && <div className="alert-success" style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--success)", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>{message}</div>}
        {error && <div className="alert-error" style={{ background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "left" }}>
          <div className="form-group">
            <label style={{ display: "block", marginBottom: "6px", fontSize: "0.85rem", color: "var(--text-secondary)" }}>Email Address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: "8px", color: "var(--text-primary)" }}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ padding: "12px", width: "100%", marginTop: "8px" }}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <p style={{ marginTop: "24px", fontSize: "0.9rem", color: "var(--text-muted)" }}>
          Remember your password? <Link to="/login" style={{ color: "var(--primary-light)", textDecoration: "none" }}>Log in here</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
