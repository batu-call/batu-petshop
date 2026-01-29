import axios from "axios";

// Axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Token'ı her istekte gönder
api.interceptors.request.use(
  (config) => {
    // localStorage'dan token al (mobile fallback)
    const token = localStorage.getItem("userToken");
    
    // Token varsa ve Authorization header yoksa ekle
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("📤 [API] Adding token from localStorage");
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Response'da token varsa localStorage'a kaydet (MOBILE İÇİN ÖNEMLİ!)
    if (response.data?.token) {
      localStorage.setItem("userToken", response.data.token);
      console.log("✅ [API] Token saved to localStorage");
    }
    
    return response;
  },
  (error) => {
    // 401 hatası
    if (error.response?.status === 401) {
      console.warn("⚠️ [API] 401 Unauthorized - Clearing token");
      localStorage.removeItem("userToken");
    }
    
    return Promise.reject(error);
  }
);

export default api;

// ===== API FUNCTIONS =====

export const login = async (email: string, password: string) => {
  const response = await api.post("/api/v1/user/login", { email, password });
  return response.data;
};

export const saveGoogleUser = async (profile: any) => {
  try {
    const { data } = await api.post("/api/v1/user/google-login", {
      email: profile.email,
      name: profile.name,
      image: profile.image,
    });
    return data;
  } catch (error: any) {
    console.error("❌ [Google Login] Failed:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.message || "Google login failed",
    };
  }
};

export const getUserProfile = async () => {
  const response = await api.get("/api/v1/user/users/me");
  return response.data;
};

export const updateUser = async (userData: FormData) => {
  const response = await api.put("/api/v1/user/update", userData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const logout = async () => {
  const response = await api.post("/api/v1/user/logout");
  localStorage.removeItem("userToken");
  return response.data;
};

export const getFavorites = async () => {
  const response = await api.get("/api/v1/favorite/get");
  return response.data;
};

export const addToFavorites = async (productId: string) => {
  const response = await api.post("/api/v1/favorite/add", { productId });
  return response.data;
};

export const removeFromFavorites = async (productId: string) => {
  const response = await api.delete(`/api/v1/favorite/remove/${productId}`);
  return response.data;
};

export const getCart = async () => {
  const response = await api.get("/api/v1/cart/get");
  return response.data;
};

export const addToCart = async (productId: string, quantity: number = 1) => {
  const response = await api.post("/api/v1/cart/add", { productId, quantity });
  return response.data;
};