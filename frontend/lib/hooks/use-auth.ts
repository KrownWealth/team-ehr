"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { LoginCredentials, LoginResponse, ResponseSuccess } from "@/types";
import { toast } from "sonner";
import { getDefaultRouteForRole } from "../constants/routes";
import { useEffect } from "react";

export function useAuth() {
  const {
    user,
    token,
    isAuthenticated,
    setAuth,
    logout,
    updateUser,
    initializeAuth,
  } = useAuthStore();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.post<ResponseSuccess<LoginResponse>>(
        "/auth/login",
        credentials
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      setAuth(data.token);
      toast.success("Login successful!");

      const redirectUrl = getDefaultRouteForRole(
        data.user.role,
        data.user.clinicId
      );

      if (typeof window !== "undefined") {
        window.location.href = redirectUrl;
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Login failed");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<ResponseSuccess<LoginResponse>>(
        "/auth/register",
        data
      );
      return response.data.data;
    },
    onSuccess: () => {
      toast.success("Registration successful! Please verify your email/phone.");
      if (typeof window !== "undefined") {
        window.location.href = "/auth/verify-otp";
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Registration failed");
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: { email: string; otp: string }) => {
      const response = await apiClient.post<ResponseSuccess<LoginResponse>>(
        "/auth/verify-otp",
        data
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      setAuth(data.token);
      toast.success("Verification successful!");

      const redirectUrl = getDefaultRouteForRole(
        data.user.role,
        data.user.clinicId
      );

      if (typeof window !== "undefined") {
        window.location.href = redirectUrl;
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Verification failed");
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiClient.post("/auth/forgot-password", { email });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Password reset link sent to your email");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to send reset link");
    },
  });

  return {
    user,
    token,
    isAuthenticated,
    isLoading:
      loginMutation.isPending ||
      registerMutation.isPending ||
      verifyOtpMutation.isPending ||
      forgotPasswordMutation.isPending,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    verifyOtp: verifyOtpMutation.mutate,
    forgotPassword: forgotPasswordMutation.mutate,
    logout,
    updateUser,
  };
}
