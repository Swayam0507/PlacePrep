import { createContext, useContext, useState, useEffect } from "react";
import { getMe, loginUser, registerUser, logoutUser } from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setLoading(false);
        return;
      }
      const { data } = await getMe();
      if (data.success) {
        setUser(data.user);
      }
    } catch (err) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    try {
      setError(null);
      const { data } = await registerUser(formData);
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Registration failed. Please try again.";
      setError(message);
      return { success: false, message };
    }
  };

  const login = async (formData) => {
    try {
      setError(null);
      const { data } = await loginUser(formData);
      if (data.success) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      }
    } catch (err) {
      const message =
        err.response?.data?.message || "Login failed. Please try again.";
      setError(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
    } catch (err) {
      // Logout locally even if server request fails
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        clearError,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
