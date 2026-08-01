import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("[API] REQUEST ERROR:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    // Only handle genuine auth failures on protected endpoints.
    // Login/Register return 400, so this won't interfere with the auth flow.
    if (status === 401 && !error.config?.url?.includes("/auth/")) {
      const message = error.response?.data?.message || "";
      const tokenInvalid = /token/i.test(message) && /(expired|invalid|not provided)/i.test(message);

      if (tokenInvalid) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        if (!window.location.pathname.startsWith("/login")) {
          window.location.assign("/login");
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
