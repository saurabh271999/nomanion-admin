import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.nomanion.com";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper function to get token with expiration check
const getValidToken = () => {
  if (typeof window === "undefined") return null;
  
  const token = localStorage.getItem("token");
  const expiryStr = localStorage.getItem("token_expiry");
  
  if (!token || !expiryStr) {
    return null;
  }
  
  const expiryDate = new Date(expiryStr);
  const now = new Date();
  
  if (now > expiryDate) {
    console.warn("⚠️ Token has expired");
    localStorage.removeItem("token");
    localStorage.removeItem("token_expiry");
    localStorage.removeItem("user_data");
    return null;
  }
  
  return token;
};

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage with expiration check
    if (typeof window !== "undefined") {
      const token = getValidToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Log token usage for debugging (remove in production)
        console.log("🔑 Using token for API request:", token.substring(0, 20) + "...");
      } else {
        console.warn("⚠️ No valid token found in localStorage for API request");
      }
    }
    // Log the request being made
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`, config.params || config.data || "");
    return config;
  },
  (error) => {
    console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    return response.data;
  },
  (error) => {
    console.error("❌ API Error:", {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
    });
    const message =
      error.response?.data?.message ||
      error.message ||
      "An error occurred";
    return Promise.reject(new Error(message));
  }
);

// ============================================
// AUTH APIs
// ============================================

export const authAPI = {
  // Request OTP
  requestOtp: async (email) => {
    return apiClient.post("/api/v1/auth/request-otp", { email });
  },

  // Verify OTP
  verifyOtp: async (email, otp) => {
    return apiClient.post("/api/v1/auth/verify-otp", { email, otp });
  },

  // Password-based login
  loginWithPassword: async (email, password) => {
    return apiClient.post("/api/v1/auth/login", { email, password });
  },

  // Google SSO
  googleAuth: async (idToken) => {
    return apiClient.post("/api/v1/auth/google", { idToken });
  },
};

// ============================================
// USER APIs
// ============================================

export const userAPI = {
  // Get current user
  getMe: async () => {
    return apiClient.get("/api/v1/user/me");
  },

  // Update user profile
  updateUser: async (data) => {
    return apiClient.patch("/api/v1/user/update-user", data);
  },

  // Update basic profile
  updateProfile: async (data) => {
    return apiClient.patch("/api/v1/user/update-profile", data);
  },

  // Toggle follow user
  toggleFollow: async (userId) => {
    return apiClient.patch(`/api/v1/user/${userId}/follow`);
  },

  // Get all nomads (admin only)
  getAllNomads: async (params = {}) => {
    return apiClient.get("/api/v1/user/nomads", { params });
  },

  // Get all explorers (admin only)
  getAllExplorers: async (params = {}) => {
    return apiClient.get("/api/v1/user/explorers", { params });
  },

  // Explorer actions by ID (admin only)
  // POST /api/v1/user/explorers/:userId
  postExplorerAction: async (userId, data = {}) => {
    return apiClient.post(`/api/v1/user/explorers/${userId}`, data);
  },

  // PATCH /api/v1/user/explorers/:userId
  updateExplorer: async (userId, data = {}) => {
    return apiClient.patch(`/api/v1/user/explorers/${userId}`, data);
  },

  // DELETE /api/v1/user/explorers/:userId
  deleteExplorer: async (userId) => {
    return apiClient.delete(`/api/v1/user/explorers/${userId}`);
  },

  // Delete nomad (admin only)
  deleteNomad: async (userId) => {
    return apiClient.delete(`/api/v1/user/nomads/${userId}`);
  },

  // Update nomad by admin (admin only)
  updateNomad: async (userId, data) => {
    return apiClient.patch(`/api/v1/user/nomads/${userId}`, data);
  },
};

// ============================================
// ITINERARY APIs
// ============================================

export const itineraryAPI = {
  // Get all published itineraries
  getPublished: async (params = {}) => {
    return apiClient.get("/api/v1/itinerary", { params });
  },

  // Get draft itineraries (admin only)
  getDrafts: async (params = {}) => {
    return apiClient.get("/api/v1/itinerary/admin/drafts", { params });
  },

  // Get single itinerary by ID
  getById: async (id) => {
    return apiClient.get(`/api/v1/itinerary/${id}`);
  },

  // Get my itineraries (authenticated user)
  getMyItineraries: async (params = {}) => {
    return apiClient.get("/api/v1/itinerary/my/itineraries", { params });
  },

  // Create itinerary
  create: async (data) => {
    return apiClient.post("/api/v1/itinerary", data);
  },

  // Update itinerary
  update: async (id, data) => {
    return apiClient.put(`/api/v1/itinerary/${id}`, data);
  },

  // Delete itinerary
  delete: async (id) => {
    return apiClient.delete(`/api/v1/itinerary/${id}`);
  },

  // Publish itinerary
  publish: async (id) => {
    return apiClient.patch(`/api/v1/itinerary/${id}/publish`);
  },

  // Disable itinerary
  disable: async (id, reason) => {
    return apiClient.patch(`/api/v1/itinerary/${id}/disable`, { reason });
  },

  // Like/Unlike itinerary
  like: async (id) => {
    return apiClient.patch(`/api/v1/itinerary/${id}/like`);
  },

  // Summarize itinerary description
  summarize: async (description, minWords = 200, maxWords = 300) => {
    return apiClient.post("/api/v1/itinerary/summarize", {
      description,
      minWords,
      maxWords,
    });
  },
};

// ============================================
// UPLOAD APIs
// ============================================

export const uploadAPI = {
  // Upload single file
  uploadSingle: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.post("/api/v1/upload/single", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  // Upload multiple files
  uploadMultiple: async (files) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("media", file);
    });
    return apiClient.post("/api/v1/upload/multiple", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
};

// ============================================
// SUBSCRIPTION APIs
// ============================================

export const subscriptionAPI = {
  // Get subscription status
  getStatus: async () => {
    return apiClient.get("/api/v1/subscription/status");
  },

  // Get all subscriptions (admin only)
  getAll: async () => {
    return apiClient.get("/api/v1/subscription");
  },
};

// ============================================
// REVIEW APIs
// ============================================

export const reviewAPI = {
  // Get itinerary reviews
  getItineraryReviews: async (itineraryId) => {
    return apiClient.get(`/api/v1/itinerary/${itineraryId}/reviews`);
  },

  // Create review
  create: async (itineraryId, data) => {
    return apiClient.post(`/api/v1/itinerary/${itineraryId}/review`, data);
  },

  // Approve review (admin only)
  approve: async (itineraryId, reviewId) => {
    return apiClient.patch(
      `/api/v1/itinerary/${itineraryId}/review/${reviewId}/approve`
    );
  },

  // Reject review (admin only)
  reject: async (itineraryId, reviewId, reason) => {
    return apiClient.patch(
      `/api/v1/itinerary/${itineraryId}/review/${reviewId}/reject`,
      { reason }
    );
  },

  // Get pending reviews (admin only)
  getPending: async () => {
    return apiClient.get("/api/v1/itinerary/reviews/pending");
  },
};

// ============================================
// STATS APIs
// ============================================

export const statsAPI = {
  // Get dashboard statistics
  getStats: async () => {
    return apiClient.get("/api/v1/stats");
  },
};

// Export default apiClient for custom requests
export default apiClient;

