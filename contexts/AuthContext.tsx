"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { authAPI, userAPI } from "../api";

interface User {
  _id: string;
  fullName: string;
  email: string;
  role: string;
  profilePic?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (email: string, otp: string) => Promise<void>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  requestOtp: (email: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        console.log("ℹ️ No token found in localStorage");
        setIsLoading(false);
        return;
      }

      console.log("🔍 Token found in localStorage, verifying...");
      setToken(storedToken);
      
      // Verify token by fetching user data
      const response = await userAPI.getMe();
      
      if (response && response.data) {
        setUser(response.data);
        
        // Check if user is admin
        if (response.data.role !== "admin" && response.data.role !== "super_admin") {
          // Not an admin, clear auth
          console.warn("⚠️ User is not an admin, logging out");
          logout();
          throw new Error("Access denied. Admin access required.");
        }
        console.log("✅ Authentication verified, user is admin");
      }
    } catch (error) {
      console.error("❌ Auth check failed:", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const requestOtp = async (email: string) => {
    try {
      await authAPI.requestOtp(email);
    } catch (error: any) {
      throw new Error(error.message || "Failed to send OTP");
    }
  };

  const login = async (email: string, otp: string) => {
    try {
      const response = await authAPI.verifyOtp(email, otp);
      
      if (!response || !response.token) {
        throw new Error("Login failed: No token received");
      }

      // Check if user is admin
      if (response.user && response.user.role !== "admin" && response.user.role !== "super_admin") {
        throw new Error("Access denied. Admin access required.");
      }

      // Store token in localStorage
      try {
        localStorage.setItem("token", response.token);
        // Verify token was saved
        const savedToken = localStorage.getItem("token");
        if (!savedToken || savedToken !== response.token) {
          throw new Error("Failed to save token to localStorage");
        }
        console.log("✅ Token saved successfully to localStorage");
      } catch (storageError) {
        console.error("❌ Error saving token:", storageError);
        throw new Error("Failed to save authentication token");
      }

      setToken(response.token);
      setUser(response.user);
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    }
  };

  const loginWithPassword = async (email: string, password: string) => {
    try {
      const response = await authAPI.loginWithPassword(email, password);
      
      if (!response || !response.token) {
        throw new Error("Login failed: No token received");
      }

      // Check if user is admin
      if (response.user && response.user.role !== "admin" && response.user.role !== "super_admin") {
        throw new Error("Access denied. Admin access required.");
      }

      // Store token in localStorage
      try {
        localStorage.setItem("token", response.token);
        // Verify token was saved
        const savedToken = localStorage.getItem("token");
        if (!savedToken || savedToken !== response.token) {
          throw new Error("Failed to save token to localStorage");
        }
        console.log("✅ Token saved successfully to localStorage");
      } catch (storageError) {
        console.error("❌ Error saving token:", storageError);
        throw new Error("Failed to save authentication token");
      }

      setToken(response.token);
      setUser(response.user);
    } catch (error: any) {
      throw new Error(error.message || "Login failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        loginWithPassword,
        requestOtp,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

