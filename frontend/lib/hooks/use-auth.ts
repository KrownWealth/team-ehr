"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import {
  LoginCredentials,
  User,
  LoginResponse,
  RegisterAdminData,
  VerifyOtpData,
  ChangePasswordData,
  OnboardingStatus,
} from "@/types";
import { toast } from "sonner";
import { getDefaultRouteForRole } from "../constants/routes";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface ApiResponse<T> {
  status: "success" | "error";
  message?: string;
  data?: T;
  errors?: Array<{ field: string; message: string }>;
}

// Updated to use imported LoginResponse and ensure the User object is complete
interface LoginResponseData extends Omit<LoginResponse, "user"> {
  user: User;
}

interface RegisterResponseData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    logout,
    updateUser,
    initializeAuth,
    updateToken,
  } = useAuthStore();

  const router = useRouter();

  useEffect(() => {
    initializeAuth();

    if (typeof window !== "undefined") {
      (window as any).updateAuthToken = updateToken;
    }
  }, [initializeAuth, updateToken]);

  return {
    user,
    token,
    isAuthenticated,
    logout,
    updateUser,
  };
}

export function useLogin() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (
      credentials: LoginCredentials
    ): Promise<LoginResponseData> => {
      const response = await apiClient.post<ApiResponse<LoginResponseData>>(
        "/v1/auth/login",
        credentials
      );

      if (!response.data.data) {
        throw new Error("Invalid response from server");
      }

      return response.data.data;
    },
    onSuccess: (data: LoginResponseData) => {
      setAuth(data.token, data.refreshToken, data.user);
      toast.success("Login successful!");

      if (data.user.mustChangePassword) {
        router.replace("/auth/change-password");
        return;
      }

      if (data.user.onboardingStatus === OnboardingStatus.PENDING) {
        router.replace("/onboarding");
        return;
      }

      if (data.user.clinicId) {
        const redirectUrl = getDefaultRouteForRole(
          data.user.role,
          data.user.clinicId
        );
        router.replace(redirectUrl);
      } else {
        console.warn("User has completed onboarding but no clinicId found");
        router.replace("/onboarding");
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Login failed";
      toast.error(message); // This was commented out - now it shows errors
    },
  });
}

export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (formData: RegisterAdminData) => {
      const response = await apiClient.post<ApiResponse<RegisterResponseData>>(
        "/v1/auth/register-admin",
        formData
      );

      if (!response.data.data) {
        throw new Error("Invalid response from server");
      }

      return { ...response.data.data, email: formData.email };
    },
    onSuccess: (data) => {
      toast.success("Registration successful! Please verify your email.");

      router.push(`/auth/verify-otp?email=${encodeURIComponent(data.email)}`);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Registration failed";
    },
  });
}

export function useVerifyOtp() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: VerifyOtpData) => {
      const response = await apiClient.post<ApiResponse<void>>(
        "/v1/auth/verify-otp",
        data
      );

      return response.data;
    },
    onSuccess: (response) => {
      const message = response.message || "Verification successful!";
      toast.success(message);
      router.replace("/auth/login");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Verification failed";
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await apiClient.post<ApiResponse<void>>(
        "/v1/auth/forgot-password",
        { email }
      );
      return response.data;
    },
    onSuccess: (response) => {
      const message =
        response.message || "Password reset link sent to your email";
      toast.success(message);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to send reset link";
    },
  });
}

export function useResetPassword() {
  const router = useRouter();

  return useMutation({
    mutationFn: async (data: { token: string; newPassword: string }) => {
      const response = await apiClient.post<ApiResponse<void>>(
        "/v1/auth/reset-password",
        data
      );
      return response.data;
    },
    onSuccess: (response) => {
      const message = response.message || "Password reset successfully";
      toast.success(message);
      router.push("/auth/login");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to reset password";
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const response = await apiClient.post<
        ApiResponse<{
          message: string;
        }>
      >("/v1/auth/change-password", data);
      return response.data.data || { message: "Password changed successfully" };
    },
    onSuccess: (response: { message: string }) => {
      const message = response.message || "Password changed successfully";
      toast.success(message);
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to change password";
    },
  });
}

export function useResendOtp() {
  return useMutation({
    mutationFn: async (email: string) => {
      const response = await apiClient.post<ApiResponse<void>>(
        "/v1/auth/resend-otp",
        { email }
      );
      return response.data;
    },
    onSuccess: (response) => {
      const message = response.message || "OTP has been resent to your email";
      toast.success(message);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to resend OTP";
      toast.error(message);
    },
  });
}
