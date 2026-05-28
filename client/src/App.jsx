import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import ProfilePage from "./pages/ProfilePage";
import ResumeUpload from "./pages/ResumeUpload";
import AptitudeTest from "./pages/AptitudeTest";
import TestResult from "./pages/TestResult";
import TestHistory from "./pages/TestHistory";
import PlacementPredictor from "./pages/PlacementPredictor";
import JobRecommendations from "./pages/JobRecommendations";
import Leaderboard from "./pages/Leaderboard";
import InterviewPrep from "./pages/InterviewPrep";
import Forum from "./pages/Forum";
import CompanyTracker from "./pages/CompanyTracker";
import Bookmarks from "./pages/Bookmarks";
import Certificates from "./pages/Certificates";
import AdminDashboard from "./pages/AdminDashboard";
import AdminQuestions from "./pages/AdminQuestions";
import AdminUsers from "./pages/AdminUsers";

// Redirect authenticated users away from auth pages
const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Admin-only route guard
const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppContent = () => {
  const { isAuthenticated } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        {/* Public landing page */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LandingPage />
            )
          }
        />

        {/* Auth routes */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password/:token"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />

        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/resume" element={<ProtectedRoute><ResumeUpload /></ProtectedRoute>} />
        <Route path="/aptitude-test" element={<ProtectedRoute><AptitudeTest /></ProtectedRoute>} />
        <Route path="/test-result" element={<ProtectedRoute><TestResult /></ProtectedRoute>} />
        <Route path="/test-history" element={<ProtectedRoute><TestHistory /></ProtectedRoute>} />
        <Route path="/placement-predictor" element={<ProtectedRoute><PlacementPredictor /></ProtectedRoute>} />
        <Route path="/job-recommendations" element={<ProtectedRoute><JobRecommendations /></ProtectedRoute>} />
        <Route path="/leaderboard" element={<ProtectedRoute><Leaderboard /></ProtectedRoute>} />
        <Route path="/interview-prep" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
        <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
        <Route path="/companies" element={<ProtectedRoute><CompanyTracker /></ProtectedRoute>} />
        <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
        <Route path="/certificates" element={<ProtectedRoute><Certificates /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/questions" element={<AdminRoute><AdminQuestions /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
