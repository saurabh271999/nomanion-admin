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

// Token storage keys
const TOKEN_KEY = "token";
const TOKEN_EXPIRY_KEY = "token_expiry";
const USER_DATA_KEY = "user_data";

// Helper functions for token storage
const saveToken = (token: string) => {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 30); // 30 days from now
  
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(TOKEN_EXPIRY_KEY, expiryDate.toISOString());
  console.log(`✅ Token saved. Expires on: ${expiryDate.toLocaleString()}`);
};

const getToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  const expiryStr = localStorage.getItem(TOKEN_EXPIRY_KEY);
  
  if (!token || !expiryStr) {
    return null;
  }
  
  const expiryDate = new Date(expiryStr);
  const now = new Date();
  
  if (now > expiryDate) {
    console.warn("⚠️ Token has expired, clearing...");
    clearAuth();
    return null;
  }
  
  return token;
};

const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRY_KEY);
  localStorage.removeItem(USER_DATA_KEY);
};

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
      // First, try to get token from storage
      const storedToken = getToken();
      if (!storedToken) {
        console.log("ℹ️ No valid token found in localStorage");
        setIsLoading(false);
        return;
      }

      // Try to load user data from localStorage first (faster)
      const storedUserData = localStorage.getItem(USER_DATA_KEY);
      if (storedUserData) {
        try {
          const userData = JSON.parse(storedUserData);
          setUser(userData);
          setToken(storedToken);
          console.log("✅ Loaded user data from cache");
        } catch (e) {
          console.warn("⚠️ Failed to parse stored user data");
        }
      }

      console.log("🔍 Token found, verifying with server...");
      setToken(storedToken);
      
      // Verify token by fetching user data from server
      try {
        const response = await userAPI.getMe() as any;
        
        if (response && response.data) {
          const userData = response.data;
          setUser(userData);
          
          // Store user data in localStorage for faster loading
          localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
          
          console.log("✅ Authentication verified");
        }
      } catch (apiError: any) {
        // If API call fails but we have cached user data, use it
        if (storedUserData) {
          console.warn("⚠️ API verification failed, using cached user data:", apiError.message);
          // Don't logout, use cached data
        } else {
          // No cached data and API failed, need to logout
          throw apiError;
        }
      }
    } catch (error: any) {
      console.error("❌ Auth check failed:", error);
      // Only logout if it's an authentication error, not a network error
      if (error.message?.includes("401") || error.message?.includes("Unauthorized") || error.message?.includes("Access denied")) {
        console.log("🔒 Authentication error, logging out");
        clearAuth();
        setToken(null);
        setUser(null);
      } else {
        // Network or other errors - keep token but show warning
        console.warn("⚠️ Network error during auth check, keeping existing session");
      }
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
      const response = await authAPI.verifyOtp(email, otp) as any;
      
      if (!response || !response.token) {
        throw new Error("Login failed: No token received");
      }

      // Store token with expiration (30 days)
      try {
        saveToken(response.token);
        // Store user data
        if (response.user) {
          localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
        }
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
      const response = await authAPI.loginWithPassword(email, password) as any;
      
      if (!response || !response.token) {
        throw new Error("Login failed: No token received");
      }

      // Store token with expiration (30 days)
      try {
        saveToken(response.token);
        // Store user data
        if (response.user) {
          localStorage.setItem(USER_DATA_KEY, JSON.stringify(response.user));
        }
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
    clearAuth();
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

