"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { LoginCredentials, LoginResponse, ResponseSuccess } from "@/types";
import { toast } from "sonner";
import { getDefaultRouteForRole } from "../constants/routes";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

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

  const router = useRouter();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await apiClient.post<LoginResponse>(
        "/v1/auth/login",
        credentials
      );
      return response.data;
    },
    onSuccess: (data) => {
      console.log("data", data);
      setAuth(data.token);
      toast.success("Login successful!");

      const redirectUrl = getDefaultRouteForRole(
        data.user.role,
        data.user.clinicId
      );

      router.replace(redirectUrl);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Login failed");
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<ResponseSuccess<LoginResponse>>(
        "/v1/auth/register-admin",
        data
      );
      return response.data.data;
    },
    onSuccess: (data) => {
      toast.success("Registration successful! Please verify your email.");

      router.replace(`/auth/verify-otp?email=${data.user.email}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Registration failed");
    },
  });

  const verifyOtpMutation = useMutation({
    mutationFn: async (data: {
      email?: string;
      phone?: string;
      code: string;
      type?: string;
    }) => {
      const response = await apiClient.post<ResponseSuccess<LoginResponse>>(
        "/v1/auth/verify-otp",
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Verification successful!");

      // if (data.token) {
      //   setAuth(data.token);
      //   const redirectUrl = getDefaultRouteForRole(
      //     data.user.role,
      //     data.user.clinicId
      //   );

      //   router.replace(redirectUrl);
      // } else {
      //   router.replace("/auth/login");
      // }

      router.replace("/auth/login");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Verification failed");
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await apiClient.post("/v1/auth/forgot-password", {
        email,
      });
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
