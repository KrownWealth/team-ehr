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

interface LoginResponseData extends Omit<LoginResponse, "user"> {
  user: User;
}

interface PatientLoginResponseData {
  token: string;
  refreshToken: string;
  user: User;
}

interface RegisterResponseData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface PatientRequestOtpData {
  email?: string;
  phone?: string;
}

interface PatientRequestOtpResponse {
  email: string;
  expiresIn: string;
}

interface PatientVerifyOtpData {
  email?: string;
  phone?: string;
  code: string;
}

export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    isInitialized,
    logout,
    updateUser,
    initializeAuth,
    updateToken,
  } = useAuthStore();

  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) {
      initializeAuth();
    }

    if (typeof window !== "undefined") {
      (window as any).updateAuthToken = updateToken;
    }
  }, [initializeAuth, updateToken, isInitialized]);

  return {
    user,
    token,
    isAuthenticated,
    isLoading: !isInitialized,
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
    onSuccess: async (data: LoginResponseData) => {
      setAuth(data.token, data.refreshToken, data.user);

      toast.success("Staff Login successful!");

      await new Promise((resolve) => setTimeout(resolve, 150));

      if (data.user.mustChangePassword) {
        window.location.href = "/auth/change-password";
        return;
      }

      if (data.user.onboardingStatus === OnboardingStatus.PENDING) {
        window.location.href = "/onboarding";
        return;
      }

      if (data.user.clinicId) {
        const redirectUrl = getDefaultRouteForRole(
          data.user.role,
          data.user.clinicId
        );

        window.location.href = redirectUrl;
      } else {
        console.warn("User has completed onboarding but no clinicId found");
        window.location.href = "/onboarding";
      }
    },
    onError: (error: any, variables: LoginCredentials) => {
      const message = error.response?.data?.message || "Login failed";

      if (
        message &&
        (message.toLowerCase().includes("verify otp") ||
          message.toLowerCase().includes("email not verified") ||
          message.toLowerCase().includes("verify your email"))
      ) {
        router.replace(
          `/auth/verify-otp?email=${encodeURIComponent(variables.email)}`
        );
        return;
      }

      toast.error(message);
    },
  });
}

export function usePatientRequestOtp() {
  return useMutation({
    mutationFn: async (
      data: PatientRequestOtpData
    ): Promise<PatientRequestOtpResponse> => {
      const response = await apiClient.post<
        ApiResponse<PatientRequestOtpResponse>
      >("/v1/auth/patient/request-otp", data);

      if (response.data.status === "error") {
        throw new Error(response.data.message || "Request failed");
      }

      if (!response.data.data) {
        return { email: "", expiresIn: "" };
      }

      return response.data.data;
    },
    onSuccess: (data) => {
      if (data.email) {
        toast.success(
          `OTP sent to your email: ${data.email}. It expires in ${data.expiresIn}.`
        );
      } else {
        toast.success(
          "If a patient account exists, an OTP has been sent to your email address."
        );
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to send OTP";
      toast.error(message);
      throw new Error(message);
    },
  });
}

export function usePatientVerifyOtp() {
  const { setAuth } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (
      data: PatientVerifyOtpData
    ): Promise<PatientLoginResponseData> => {
      const response = await apiClient.post<
        ApiResponse<PatientLoginResponseData>
      >("/v1/auth/patient/verify-otp", data);

      if (!response.data.data) {
        throw new Error("Invalid response from server");
      }

      return response.data.data;
    },
    onSuccess: async (data: PatientLoginResponseData) => {
      setAuth(data.token, data.refreshToken, data.user);
      toast.success("Patient Login successful!");

      await new Promise((resolve) => setTimeout(resolve, 150));

      if (data.user.clinicId) {
        const redirectUrl = getDefaultRouteForRole(
          data.user.role,
          data.user.clinicId
        );
        window.location.href = redirectUrl;
      } else {
        window.location.href = "/patient-dashboard";
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Invalid or expired OTP";
      toast.error(message);
    },
  });
}

export function usePatientResendOtp() {
  return useMutation({
    mutationFn: async (data: PatientRequestOtpData) => {
      const response = await apiClient.post<ApiResponse<void>>(
        "/v1/auth/patient/resend-otp",
        data
      );
      return response.data;
    },
    onSuccess: (response) => {
      const message = response.message || "New OTP has been sent to your email";
      toast.success(message);
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Failed to resend OTP";
      toast.error(message);
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
      toast.error(message);
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
      toast.error(message);
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
      toast.error(message);
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
      toast.error(message);
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

      toast.error(message);
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
