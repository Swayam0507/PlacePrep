import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (window.location.hostname === "localhost" ? "http://localhost:5000/api" : "/api"),
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor — attach token from localStorage as fallback
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (
        !window.location.pathname.includes("/login") &&
        !window.location.pathname.includes("/register")
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ---------- Auth Endpoints
export const loginUser = (data) => API.post("/auth/login", data);
export const registerUser = (data) => API.post("/auth/register", data);
export const getMe = () => API.get("/auth/me");
export const logoutUser = () => API.post("/auth/logout");
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const resetPassword = (token, data) => API.put(`/auth/reset-password/${token}`, data);

// ---------- Profile API ----------
export const getProfile = () => API.get("/profile");
export const updateProfile = (data) => API.put("/profile", data);
export const toggleTheme = (theme) => API.put("/profile/theme", { theme });

// ---------- Resume API ----------
export const uploadResume = (formData) =>
  API.post("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getMyResumes = () => API.get("/resume/my-resumes");
export const deleteResume = (id) => API.delete(`/resume/${id}`);
export const parseResume = (id, data) => API.post(`/resume/${id}/parse`, data);

// ---------- Questions API ----------
export const getQuestions = (params) => API.get("/questions", { params });
export const getCategories = () => API.get("/questions/categories");
export const getAllQuestions = (params) => API.get("/questions/all", { params });
export const addQuestion = (data) => API.post("/questions", data);
export const updateQuestion = (id, data) => API.put(`/questions/${id}`, data);
export const deleteQuestion = (id) => API.delete(`/questions/${id}`);

// ---------- Test API ----------
export const submitTest = (data) => API.post("/test/submit", data);
export const getTestHistory = (params) => API.get("/test/history", { params });
export const getTestAttempt = (id) => API.get(`/test/attempt/${id}`);

// ---------- Analytics API ----------
export const getDashboardAnalytics = () => API.get("/analytics/dashboard");

// ---------- ML Prediction API ----------
export const predictPlacement = (data) => API.post("/ml/predict", data);

// ---------- Jobs API ----------
export const recommendJobs = (data) => API.post("/jobs/recommend", data);
export const scrapeJobs = (params) => API.get("/jobs/scrape", { params });

// ---------- Email API ----------
export const sendTestResultEmail = (data) => API.post("/email/test-result", data);
export const sendPlacementReadiness = () => API.post("/email/placement-readiness");

// ---------- Admin API ----------
export const getAdminUsers = (params) => API.get("/admin/users", { params });
export const updateAdminUser = (id, data) => API.put(`/admin/users/${id}`, data);
export const deleteAdminUser = (id) => API.delete(`/admin/users/${id}`);
export const getAdminAnalytics = () => API.get("/admin/analytics");
export const exportReport = (type) =>
  API.get(`/admin/export?type=${type}`, { responseType: "blob" });

// ---------- Bookmark API ----------
export const getBookmarks = () => API.get("/bookmarks");
export const toggleBookmark = (questionId, notes) =>
  API.post(`/bookmarks/${questionId}`, { notes });
export const checkBookmarks = (questionIds) =>
  API.post("/bookmarks/check", { questionIds });

// ---------- Forum API ----------
export const getForumPosts = (params) => API.get("/forum", { params });
export const getForumPost = (id) => API.get(`/forum/${id}`);
export const createForumPost = (data) => API.post("/forum", data);
export const deleteForumPost = (id) => API.delete(`/forum/${id}`);
export const upvoteForumPost = (id) => API.post(`/forum/${id}/upvote`);
export const addForumReply = (id, content) => API.post(`/forum/${id}/reply`, { content });
export const toggleForumPin = (id) => API.put(`/forum/${id}/pin`);

// ---------- Company API ----------
export const getCompanies = (params) => API.get("/companies", { params });
export const checkEligibility = (id) => API.get(`/companies/${id}/eligibility`);
export const createCompany = (data) => API.post("/companies", data);
export const updateCompany = (id, data) => API.put(`/companies/${id}`, data);
export const deleteCompanyApi = (id) => API.delete(`/companies/${id}`);

// ---------- Interview Prep API ----------
export const getInterviewQuestions = (params) => API.get("/interview", { params });
export const getInterviewCompanies = () => API.get("/interview/companies");
export const addInterviewQuestion = (data) => API.post("/interview", data);
export const bulkAddInterviewQuestions = (questions) =>
  API.post("/interview/bulk", { questions });
export const deleteInterviewQuestion = (id) => API.delete(`/interview/${id}`);

// ---------- Feature API ----------
export const getLeaderboard = (params) => API.get("/features/leaderboard", { params });
export const getPeerComparison = () => API.get("/features/leaderboard/compare");
export const getCertificates = () => API.get("/features/certificates");
export const checkCertificates = () => API.post("/features/certificates/check");
export const getResumeScore = (data) => API.post("/features/resume-score", data);
export const bulkImportQuestions = (questions) =>
  API.post("/features/questions/bulk", { questions });

export default API;
