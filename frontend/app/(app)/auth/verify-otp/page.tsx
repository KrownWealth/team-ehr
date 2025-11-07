"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function OTPVerificationForm() {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      // Move focus automatically
      if (value && index < otp.length - 1) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleSubmit = async () => {
    if (otp.some((digit) => digit === "")) {
      toast.error("Please enter the full OTP");
      return;
    }
    setIsSubmitting(true);
    try {
      // TODO: Replace with API call
      await new Promise((res) => setTimeout(res, 1000));
      toast.success("OTP verified successfully!");
    } catch (err) {
      toast.error("Invalid OTP");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-3xl font-extrabold mb-2 text-gray-900">
        OTP Verification
      </h2>
      <p className="text-gray-600 mb-6">
        Enter the 4-digit code sent to your email/phone
      </p>

      <div className="flex justify-center gap-6g mb-6">
        {otp.map((digit, i) => (
          <Input
            key={i}
            id={`otp-${i}`}
            type="text"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            className="w-16 h-16 text-center text-xl font-bold m-0!"
          />
        ))}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-primary text-primary-foreground h-12"
      >
        {isSubmitting ? "Verifying..." : "Verify OTP"}
      </Button>
    </div>
  );
}
