import axios from "axios";
import { authClient } from "./auth-client";

const api = axios.create({
  baseURL: "http://localhost:4000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

let isRefreshing = false;

api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isRefreshing &&
      !error.config.url?.includes("/auth/sign-out")
    ) {
      originalRequest._retry = true;
      isRefreshing = true;

      console.error("Unauthorized - redirecting to login");

      try {
        await authClient.signOut();
      } catch (signOutError) {
        console.error("Sign out error:", signOutError);
      } finally {
        isRefreshing = false;

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default api;
