"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useVerifyOtp, useResendOtp } from "@/lib/hooks/use-auth";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function OTPVerificationPage() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { mutate: verifyOtp, isPending } = useVerifyOtp();
  const { mutate: resendOtp, isPending: isResending } = useResendOtp();

  const phone = searchParams.get("phone");
  const email = searchParams.get("email");
  const type = searchParams.get("type")?.toUpperCase() || "ADMIN";

  useEffect(() => {
    if (!email && !phone) {
      toast.error("Invalid verification request. Please login again.");
      router.push("/auth/login");
    }
  }, [email, phone, router]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const handleChange = (index: number, value: string) => {
    if (/^\d?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < otp.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split("");
      setOtp([...newOtp, ...Array(6 - newOtp.length).fill("")]);
      inputRefs.current[Math.min(pastedData.length, 5)]?.focus();
    }
  };

  const handleSubmit = () => {
    if (otp.some((digit) => digit === "")) {
      toast.error("Please enter the complete OTP");
      return;
    }

    const otpString = otp.join("");

    const payload: any = {
      code: otpString,
      type: type,
    };

    if (email) {
      payload.email = email;
    } else if (phone) {
      payload.phone = phone;
    }

    verifyOtp(payload);
  };

  const handleResend = () => {
    if (!email) {
      toast.error("Email is required to resend OTP");
      return;
    }

    resendOtp(email, {
      onSuccess: () => {
        setTimer(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      },
    });
  };

  if (!email && !phone) {
    return null;
  }

  return (
    <div className="space-y-6 w-full max-w-md">
      <Link
        href="/auth/login"
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to login
      </Link>

      <div>
        <h2 className="text-3xl font-extrabold text-gray-900">
          Verify Your Account
        </h2>
        <p className="text-gray-600 mt-2">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-gray-900">
            {phone || email || "your contact"}
          </span>
        </p>
      </div>

      <div className="flex justify-between gap-4" onPaste={handlePaste}>
        {otp.map((digit, index) => (
          <Input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-14 h-14 text-center text-2xl font-bold"
            autoFocus={index === 0}
          />
        ))}
      </div>

      <div className="text-center">
        {canResend ? (
          <Button
            variant="link"
            onClick={handleResend}
            disabled={isResending}
            className="text-green-600 hover:text-green-700"
          >
            {isResending ? "Resending..." : "Resend OTP"}
          </Button>
        ) : (
          <p className="text-sm text-gray-600">
            Resend code in{" "}
            <span className="font-semibold text-green-600">{timer}s</span>
          </p>
        )}
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isPending || otp.some((d) => d === "")}
        className="w-full h-12"
      >
        {isPending ? "Verifying..." : "Verify & Continue"}
      </Button>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-medium mb-1">Didn't receive the code?</p>
        <ul className="list-disc list-inside space-y-1 text-xs">
          <li>Check your spam/junk folder</li>
          <li>Ensure your contact information is correct</li>
          <li>Wait a few moments before requesting a new code</li>
        </ul>
      </div>
    </div>
  );
}
