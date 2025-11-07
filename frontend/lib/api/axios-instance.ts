import axios from "axios";
import { toast } from "sonner";
import { siteConfig } from "../siteConfig";
import { getCookie, deleteCookie } from "cookies-next";

const apiClient = axios.create({
  baseURL: siteConfig.api.baseUrl,
  timeout: siteConfig.api.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = getCookie("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const userDataStr = getCookie("user_data");
    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr as string);
        config.headers["x-clinic-id"] = userData.clinicId;
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      deleteCookie("auth_token");
      deleteCookie("user_data");
      toast.error("Session expired. Please login again.");

      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
    } else if (error.response?.status === 403) {
      toast.error("Access denied");
      if (typeof window !== "undefined") {
        window.location.href = "/404";
      }
    } else {
      const message =
        error.response?.data?.message ||
        error.message ||
        "Something went wrong";
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
