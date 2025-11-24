"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, CheckCircle, XCircle, Lock } from "lucide-react";
import { useResetPassword } from "@/lib/hooks/use-auth";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const passwordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [tokenError, setTokenError] = useState(false);

  const { mutate: resetPassword, isPending } = useResetPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const password = watch("password");

  useEffect(() => {
    if (!token) {
      setTokenError(true);
    }
  }, [token]);

  const onSubmit = (data: PasswordFormData) => {
    if (!token) {
      setTokenError(true);
      return;
    }

    resetPassword({
      token,
      newPassword: data.password,
    });
  };

  const passwordRequirements = [
    {
      label: "At least 8 characters",
      met: password?.length >= 8,
    },
    {
      label: "One uppercase letter",
      met: /[A-Z]/.test(password || ""),
    },
    {
      label: "One lowercase letter",
      met: /[a-z]/.test(password || ""),
    },
    {
      label: "One number",
      met: /[0-9]/.test(password || ""),
    },
  ];

  if (tokenError) {
    return (
      <div className="space-y-6 w-full max-w-xl">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-red-600" />
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Invalid or Expired Link
            </h2>
            <p className="text-gray-600 mt-2">
              The password reset link is invalid or has expired. Please request
              a new one.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-900">
              Password reset links expire after 1 hour for security reasons. If
              your link has expired, you'll need to request a new one.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => router.push("/auth/forgot-password")}
              className="w-full h-12"
            >
              Request New Reset Link
            </Button>
            <Button
              onClick={() => router.push("/auth/login")}
              variant="outline"
              className="w-full h-12"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-xl">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900">
          Reset Your Password
        </h2>
        <p className="text-gray-600 mt-2">
          Enter your new password below. Make sure it's strong and secure.
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className="h-12 pl-10 pr-10"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-600">{errors.password.message}</p>
          )}
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Password Requirements:
          </p>
          <ul className="space-y-1">
            {passwordRequirements.map((req, index) => (
              <li key={index} className="flex items-center text-sm gap-2">
                {req.met ? (
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                )}
                <span className={req.met ? "text-green-700" : "text-gray-600"}>
                  {req.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="••••••••"
              className="h-12 pl-10 pr-10"
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <Button
          onClick={handleSubmit(onSubmit)}
          className="w-full h-12"
          disabled={isPending}
        >
          {isPending ? "Resetting Password..." : "Reset Password"}
        </Button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Remember your password?{" "}
            <Link
              href="/auth/login"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
