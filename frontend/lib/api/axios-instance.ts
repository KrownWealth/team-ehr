import axios from "axios";
import { toast } from "sonner";
import { siteConfig } from "../siteConfig";
import { getCookie, setCookie, deleteCookie } from "cookies-next";

const apiClient = axios.create({
  baseURL: siteConfig.api.baseUrl,
  timeout: siteConfig.api.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config) => {
    const token = getCookie("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthPage =
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/auth");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthPage
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getCookie("refresh_token");

      if (!refreshToken) {
        deleteCookie("auth_token");
        deleteCookie("refresh_token");
        deleteCookie("user_data");
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(
          `${siteConfig.api.baseUrl}/v1/auth/refresh-token`,
          {
            refreshToken,
          }
        );

        const newToken = response.data.data.token;

        setCookie("auth_token", newToken, {
          maxAge: 60 * 60 * 24 * 7,
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        });

        if (typeof window !== "undefined" && (window as any).updateAuthToken) {
          (window as any).updateAuthToken(newToken);
        }

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        deleteCookie("auth_token");
        deleteCookie("refresh_token");
        deleteCookie("user_data");
        if (typeof window !== "undefined") {
          window.location.href = "/auth/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 403) {
      if (typeof window !== "undefined" && !isAuthPage) {
        window.location.href = "/404";
      }
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default apiClient;
