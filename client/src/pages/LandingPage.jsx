import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

const FEATURES = [
  { icon: "📝", title: "Smart Aptitude Tests", desc: "Practice with categorized tests across quantitative, logical, and technical domains with real-time scoring." },
  { icon: "🔮", title: "AI Placement Predictor", desc: "Get your placement probability predicted by an ensemble of 4 ML classifiers trained on real data." },
  { icon: "💼", title: "Job Recommendations", desc: "Receive personalized job matches based on your skills profile and academic performance." },
  { icon: "📄", title: "Resume Analysis", desc: "Upload your resume for skill extraction, scoring, and ATS-readiness feedback." },
  { icon: "📊", title: "Analytics Dashboard", desc: "Track your performance trends, identify weak areas, and monitor placement readiness." },
  { icon: "🏆", title: "Leaderboard & Certificates", desc: "Compete with peers, climb the rankings, and earn achievement certificates." },
];

const STATS = [
  { value: 500, suffix: "+", label: "Questions" },
  { value: 20, suffix: "+", label: "Job Roles" },
  { value: 4, suffix: "", label: "ML Models" },
  { value: 95, suffix: "%", label: "Accuracy" },
];

const CountUp = ({ end, suffix = "" }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = end / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [end]);
  return <>{count}{suffix}</>;
};

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Animated Background */}
      <div className="landing-bg">
        <div className="bg-orb orb-1"></div>
        <div className="bg-orb orb-2"></div>
        <div className="bg-orb orb-3"></div>
        <div className="bg-grid"></div>
      </div>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-badge">
          <span className="badge-dot"></span>
          AI-Powered Placement Preparation
        </div>
        <h1 className="hero-title">
          Ace Your <span className="gradient-text">Placement</span> Journey
        </h1>
        <p className="hero-description">
          The all-in-one platform for aptitude practice, ML-powered placement prediction, 
          resume analysis, and personalized job recommendations. Built by students, for students.
        </p>
        <div className="hero-cta">
          <Link to="/register" className="btn-hero-primary">
            Get Started Free
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
          <Link to="/login" className="btn-hero-secondary">Sign In</Link>
        </div>
      </section>

      {/* Stats Counter */}
      <section className="landing-stats">
        {STATS.map((stat, i) => (
          <div key={i} className="landing-stat-item">
            <span className="landing-stat-value">
              <CountUp end={stat.value} suffix={stat.suffix} />
            </span>
            <span className="landing-stat-label">{stat.label}</span>
          </div>
        ))}
      </section>

      {/* Features Grid */}
      <section className="landing-features">
        <h2 className="section-title">
          Everything You Need to <span className="gradient-text">Get Placed</span>
        </h2>
        <p className="section-subtitle">
          A comprehensive suite of tools designed to maximize your placement preparation
        </p>
        <div className="features-grid">
          {FEATURES.map((feature, i) => (
            <div key={i} className="feature-card" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="feature-card-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="landing-steps">
        <h2 className="section-title">How It <span className="gradient-text">Works</span></h2>
        <div className="steps-grid">
          {[
            { step: "01", title: "Create Account", desc: "Sign up with your college details and academic info", icon: "👤" },
            { step: "02", title: "Take Tests", desc: "Practice aptitude tests across multiple categories and difficulty levels", icon: "📝" },
            { step: "03", title: "Upload Resume", desc: "Get your resume analyzed and scored for ATS compatibility", icon: "📄" },
            { step: "04", title: "Get Predictions", desc: "See your placement probability and personalized job recommendations", icon: "🎯" },
          ].map((item, i) => (
            <div key={i} className="step-card">
              <div className="step-number">{item.step}</div>
              <div className="step-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="landing-cta">
        <div className="cta-card">
          <h2>Ready to Start Your Placement Prep?</h2>
          <p>Join thousands of students preparing smarter, not harder.</p>
          <Link to="/register" className="btn-hero-primary">
            Start Preparing Now
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <span className="gradient-text" style={{ fontSize: "1.3rem", fontWeight: 800 }}>PlacePrep</span>
            <p>Smart Placement Preparation Platform</p>
          </div>
          <p className="footer-copy">© {new Date().getFullYear()} PlacePrep. Built with ❤️ for students.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
