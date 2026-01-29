import axios from "axios";
import { getAuthToken, clearAuthToken, isMobile } from "@/app/utils/authHelper";

axios.interceptors.request.use(
  (config) => {
    if (isMobile()) {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);


axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken(); 
      
      if (!window.location.pathname.startsWith("/Login")) {
        window.location.href = "/Login";
      }
    }
    return Promise.reject(error);
  }
);

export default axios;