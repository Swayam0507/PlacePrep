import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getInitials } from "../utils/helpers";
import { useState, useRef, useEffect } from "react";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const dropdownRef = useRef(null);
  const moreRef = useRef(null);

  const isAdmin = user?.role === "admin";
  const isLanding = location.pathname === "/";

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  // Hide navbar on landing page for unauthenticated users
  if (isLanding && !isAuthenticated) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to={isAuthenticated ? (isAdmin ? "/admin" : "/dashboard") : "/"} className="navbar-logo">
          <div className="logo-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c3 3 9 3 12 0v-5" />
            </svg>
          </div>
          <span className="logo-text">PlacePrep {isAdmin ? "Admin" : ""}</span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              {isAdmin ? (
                /* ===== ADMIN NAVIGATION ===== */
                <>
                  <Link to="/admin" className={`nav-link admin-link ${isActive("/admin") ? "active" : ""}`}>📊 Analytics</Link>
                  <Link to="/admin/questions" className={`nav-link admin-link ${isActive("/admin/questions") ? "active" : ""}`}>📝 Questions</Link>
                  <Link to="/admin/users" className={`nav-link admin-link ${isActive("/admin/users") ? "active" : ""}`}>👥 Students</Link>
                </>
              ) : (
                /* ===== STUDENT NAVIGATION ===== */
                <>
                  <Link to="/dashboard" className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}>Dashboard</Link>
                  <Link to="/aptitude-test" className={`nav-link ${isActive("/aptitude-test") ? "active" : ""}`}>Tests</Link>
                  <Link to="/leaderboard" className={`nav-link ${isActive("/leaderboard") ? "active" : ""}`}>🏆 Rank</Link>
                  <Link to="/forum" className={`nav-link ${isActive("/forum") ? "active" : ""}`}>💬 Forum</Link>

                  {/* More Dropdown */}
                  <div className="more-dropdown" ref={moreRef}>
                    <button className="nav-link more-trigger" onClick={() => setMoreOpen(!moreOpen)}>
                      More
                      <svg className={`chevron-sm ${moreOpen ? "rotate" : ""}`} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    {moreOpen && (
                      <div className="more-menu">
                        <Link to="/resume" className="more-item" onClick={() => setMoreOpen(false)}>📄 Resume</Link>
                        <Link to="/placement-predictor" className="more-item" onClick={() => setMoreOpen(false)}>🔮 Predict</Link>
                        <Link to="/job-recommendations" className="more-item" onClick={() => setMoreOpen(false)}>💼 Jobs</Link>
                        <Link to="/interview-prep" className="more-item" onClick={() => setMoreOpen(false)}>🎤 Interview</Link>
                        <Link to="/companies" className="more-item" onClick={() => setMoreOpen(false)}>🏢 Companies</Link>
                        <Link to="/bookmarks" className="more-item" onClick={() => setMoreOpen(false)}>🔖 Bookmarks</Link>
                        <Link to="/certificates" className="more-item" onClick={() => setMoreOpen(false)}>🏅 Certificates</Link>
                        <Link to="/test-history" className="more-item" onClick={() => setMoreOpen(false)}>📊 History</Link>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Profile Dropdown */}
              <div className="profile-dropdown" ref={dropdownRef}>
                <button className="profile-trigger" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <div className="avatar">{getInitials(user?.name)}</div>
                  <span className="profile-name">{user?.name?.split(" ")[0]}</span>
                  <svg className={`chevron ${dropdownOpen ? "rotate" : ""}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <p className="dropdown-name">{user?.name}</p>
                      <p className="dropdown-email">{user?.email}</p>
                      <span className={`role-badge ${isAdmin ? "admin" : "student"}`}>
                        {isAdmin ? "🛡️ Admin" : "🎓 Student"}
                      </span>
                    </div>
                    <div className="dropdown-divider"></div>
                    {!isAdmin && (
                      <>
                        <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                          Profile
                        </Link>
                        <Link to="/bookmarks" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                          Bookmarks
                        </Link>
                        <Link to="/certificates" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
                          Certificates
                        </Link>
                        <div className="dropdown-divider"></div>
                      </>
                    )}
                    <button onClick={handleLogout} className="dropdown-item logout">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-btn-primary">Get Started</Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span className={`hamburger ${mobileMenuOpen ? "open" : ""}`}></span>
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu">
          {isAuthenticated ? (
            <>
              <div className="mobile-user-info">
                <div className="avatar">{getInitials(user?.name)}</div>
                <div>
                  <p className="mobile-user-name">{user?.name}</p>
                  <p className="mobile-user-email">{user?.email}</p>
                </div>
              </div>

              {isAdmin ? (
                /* ===== ADMIN MOBILE MENU ===== */
                <>
                  <Link to="/admin" className="mobile-nav-link admin" onClick={() => setMobileMenuOpen(false)}>📊 Analytics Dashboard</Link>
                  <Link to="/admin/questions" className="mobile-nav-link admin" onClick={() => setMobileMenuOpen(false)}>📝 Manage Questions</Link>
                  <Link to="/admin/users" className="mobile-nav-link admin" onClick={() => setMobileMenuOpen(false)}>👥 Manage Students</Link>
                </>
              ) : (
                /* ===== STUDENT MOBILE MENU ===== */
                <>
                  <Link to="/dashboard" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>📊 Dashboard</Link>
                  <Link to="/profile" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>👤 Profile</Link>
                  <Link to="/aptitude-test" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>📝 Aptitude Tests</Link>
                  <Link to="/leaderboard" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>🏆 Leaderboard</Link>
                  <Link to="/forum" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>💬 Forum</Link>
                  <Link to="/resume" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>📄 Resume</Link>
                  <Link to="/placement-predictor" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>🔮 Predictor</Link>
                  <Link to="/job-recommendations" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>💼 Jobs</Link>
                  <Link to="/interview-prep" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>🎤 Interview Prep</Link>
                  <Link to="/companies" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>🏢 Companies</Link>
                  <Link to="/bookmarks" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>🔖 Bookmarks</Link>
                  <Link to="/certificates" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>🏅 Certificates</Link>
                  <Link to="/test-history" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>📊 Test History</Link>
                </>
              )}

              <button onClick={handleLogout} className="mobile-nav-link logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="mobile-nav-link" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="mobile-nav-link primary" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
