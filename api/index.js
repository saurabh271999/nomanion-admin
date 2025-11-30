import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://nomanion-backend.onrender.com";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        // Log token usage for debugging (remove in production)
        console.log("🔑 Using token for API request:", token.substring(0, 20) + "...");
      } else {
        console.warn("⚠️ No token found in localStorage for API request");
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
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

// Export default apiClient for custom requests
export default apiClient;

