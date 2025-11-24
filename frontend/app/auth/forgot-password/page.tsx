"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, ArrowLeft, Mail, Lock, Check } from "lucide-react";
import { useAuth, useForgotPassword } from "@/lib/hooks/use-auth";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

const emailSchema = z.object({
  email: z.email("Invalid email address"),
});

const passwordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const emailForm = useForm({
    resolver: zodResolver(emailSchema),
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
  });

  const handleSendOtp = async (data: { email: string }) => {
    setEmail(data.email);
    forgotPassword(data.email);
    setStep(2);
  };

  const handleVerifyOtp = () => {
    if (otp.some((d) => d === "")) {
      toast.error("Please enter the complete OTP");
      return;
    }
    // TODO: Verify OTP with API
    toast.success("OTP verified!");
    setStep(3);
  };

  const handleResetPassword = async (data: { password: string }) => {
    try {
      // TODO: Reset password API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Password reset successfully!");
      router.replace("/auth/login");
    } catch (error) {
      toast.error("Failed to reset password");
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp.length - 1) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  return (
    <div className="space-y-6 sm:space-y-6 w-full max-w-lg px-4 sm:px-0">
      <Link
        href="/auth/login"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to login
      </Link>

      <div>
        <h2 className="text-3xl font-extrabold text-gray-900">
          Reset Password
        </h2>
        <p className="text-gray-600 mt-2">
          {step === 1 && "Enter your email to receive a reset code"}
          {step === 2 && "Enter the 4-digit code sent to your email"}
          {step === 3 && "Create a new secure password"}
        </p>
      </div>

      <div className="flex items-center justify-between mb-8">
        {[
          { num: 1, icon: Mail, label: "Email" },
          { num: 2, icon: Check, label: "Verify" },
          { num: 3, icon: Lock, label: "New Password" },
        ].map((s, idx) => {
          const Icon = s.icon;
          const isActive = step === s.num;
          const isCompleted = step > s.num;

          return (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${isActive
                    ? "bg-green-600 text-white"
                    : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs mt-1 text-gray-600">{s.label}</span>
              </div>
              {idx < 2 && (
                <div
                  className={`flex-1 h-1 mx-2 ${isCompleted ? "bg-green-500" : "bg-gray-200"
                    }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {step === 1 && (
        <form
          onSubmit={emailForm.handleSubmit(handleSendOtp)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@clinic.com"
              className="h-12"
              {...emailForm.register("email")}
            />
            {emailForm.formState.errors.email && (
              <p className="text-sm text-red-600">
                {emailForm.formState.errors.email.message as string}
              </p>
            )}
          </div>

          <Button type="submit" className="w-full h-12" disabled={isPending}>
            {isPending ? "Sending..." : "Send Reset Code"}
          </Button>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Code sent to <span className="font-semibold">{email}</span>
          </p>

          <div className="flex justify-center gap-3">
            {otp.map((digit, index) => (
              <Input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                className="w-14 h-14 text-center text-2xl font-bold"
              />
            ))}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1 h-12"
            >
              Back
            </Button>
            <Button onClick={handleVerifyOtp} className="flex-1 h-12">
              Verify Code
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <form
          onSubmit={passwordForm.handleSubmit(handleResetPassword)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="password">New Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-12 pr-10"
                {...passwordForm.register("password")}
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
            {passwordForm.formState.errors.password && (
              <p className="text-sm text-red-600">
                {passwordForm.formState.errors.password.message as string}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                className="h-12 pr-10"
                {...passwordForm.register("confirmPassword")}
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
            {passwordForm.formState.errors.confirmPassword && (
              <p className="text-sm text-red-600">
                {
                  passwordForm.formState.errors.confirmPassword
                    .message as string
                }
              </p>
            )}
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
            <p className="font-medium mb-1">Password must contain:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>At least 8 characters</li>
              <li>One uppercase letter</li>
              <li>One lowercase letter</li>
              <li>One number</li>
            </ul>
          </div>

          <Button type="submit" className="w-full h-12" disabled={isPending}>
            {isPending ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      )}
    </div>
  );
}
