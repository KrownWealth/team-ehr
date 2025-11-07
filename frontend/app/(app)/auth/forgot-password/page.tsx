"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordForm() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleOtpChange = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newOtpArr = [...otp];
      newOtpArr[index] = value;
      setOtp(newOtpArr);
      if (value && index < otp.length - 1) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const nextStep = async () => {
    if (step === 1) {
      if (!email) return toast.error("Email is required");
      // TODO: Send OTP API call
      toast.success("OTP sent to your email");
      setStep(2);
    } else if (step === 2) {
      if (otp.some((d) => d === "")) return toast.error("Enter full OTP");
      // TODO: Verify OTP API call
      setStep(3);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword)
      return toast.error("Both password fields are required");
    if (newPassword !== confirmPassword)
      return toast.error("Passwords do not match");
    // TODO: Reset password API call
    toast.success("Password reset successfully!");
    setStep(1);
    setEmail("");
    setOtp(["", "", "", ""]);
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-extrabold mb-4 text-gray-900">
        Forgot Password
      </h2>

      {step === 1 && (
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12"
          />
          <Button
            onClick={nextStep}
            className="w-full h-12 bg-primary text-primary-foreground"
          >
            Send OTP
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <p className="text-gray-600 text-sm">
            Enter the 4-digit OTP sent to <strong>{email}</strong>
          </p>
          <div className="flex justify-center gap-4">
            {otp.map((digit, i) => (
              <Input
                key={i}
                id={`otp-${i}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                className="w-16 h-16 text-center text-xl font-bold"
              />
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              className="h-12"
              onClick={() => setStep(1)}
            >
              Back
            </Button>
            <Button
              onClick={nextStep}
              className="h-12 bg-primary text-primary-foreground"
            >
              Verify OTP
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="h-12"
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

          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="h-12"
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

          <Button
            onClick={handleResetPassword}
            className="w-full h-12 bg-primary text-primary-foreground"
          >
            Reset Password
          </Button>
        </div>
      )}
    </div>
  );
}
