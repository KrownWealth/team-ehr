// src/app/auth/login/page.tsx

"use client";

import React, { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useLogin,
  usePatientRequestOtp,
  usePatientVerifyOtp,
  usePatientResendOtp,
} from "@/lib/hooks/use-auth";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/lib/siteConfig";

enum PatientLoginStep {
  IDENTIFIER_INPUT,
  OTP_VERIFICATION,
}

export default function LoginPage() {
  const router = useRouter();

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"staff" | "patient">("staff");
  const [patientStep, setPatientStep] = useState(
    PatientLoginStep.IDENTIFIER_INPUT
  );

  // Staff login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [patientIdentifier, setPatientIdentifier] = useState(""); // Can be email or phone
  const [patientIdentifierError, setPatientIdentifierError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auth hooks
  const loginMutation = useLogin();
  const requestOtpMutation = usePatientRequestOtp();
  const verifyOtpMutation = usePatientVerifyOtp();
  const resendOtpMutation = usePatientResendOtp();

  // Timer useEffect for OTP
  useEffect(() => {
    if (patientStep === PatientLoginStep.OTP_VERIFICATION && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (
      patientStep === PatientLoginStep.OTP_VERIFICATION &&
      timer === 0
    ) {
      setCanResend(true);
    }
  }, [timer, patientStep]);

  // Handle successful OTP request
  useEffect(() => {
    if (requestOtpMutation.isSuccess) {
      setPatientStep(PatientLoginStep.OTP_VERIFICATION);
      setTimer(60);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setPatientIdentifier(email);
    }
  }, [requestOtpMutation.isSuccess]);

  // --- Staff Login Handlers ---

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setEmailError("");
    setPasswordError("");

    let hasError = false;

    if (!email || !email.includes("@")) {
      setEmailError("Please enter a valid email");
      hasError = true;
    }

    if (!password || password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      hasError = true;
    }

    if (hasError) return;

    loginMutation.mutate({
      email: email,
      password: password,
    });
  };

  // --- Patient Login Handlers ---

  const handlePatientRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setPatientIdentifierError("");

    const identifier = email;
    if (!identifier) {
      setPatientIdentifierError("Please enter your email");
      return;
    }

    let payload: { email?: string; phone?: string } = {};

    if (activeTab === "patient" && email && email.includes("@")) {
      payload.email = email;
    } else {
      setPatientIdentifierError("Please enter a valid email");
      return;
    }

    requestOtpMutation.mutate(payload, {
      onError: (error: any) => {
        const message =
          error.response?.data?.message ||
          "Failed to send OTP. Please try again.";
        toast.error(message);
      },
    });
  };

  const handlePatientVerifyOtp = () => {
    if (otp.some((digit) => digit === "")) {
      toast.error("Please enter the complete OTP");
      return;
    }

    const otpString = otp.join("");

    let payload: { email?: string; phone?: string; code: string } = {
      code: otpString,
    };

    if (patientIdentifier.includes("@")) {
      payload.email = patientIdentifier;
    } else {
      payload.phone = patientIdentifier;
    }

    verifyOtpMutation.mutate(payload);
  };

  const handlePatientResend = () => {
    if (!patientIdentifier) {
      toast.error("Contact information is required to resend OTP");
      return;
    }

    let payload: { email?: string; phone?: string } = {};

    if (patientIdentifier.includes("@")) {
      payload.email = patientIdentifier;
    } else {
      payload.phone = patientIdentifier;
    }

    resendOtpMutation.mutate(payload, {
      onSuccess: () => {
        setTimer(60);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || "Failed to resend OTP";
        toast.error(message);
      },
    });
  };

  // OTP Input Handlers
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

  // --- Patient Login Renderer ---

  const renderPatientIdentifierInput = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="patient-email">Email Address</Label>
        <Input
          id="patient-email"
          type="email"
          placeholder="patient@email.com"
          className="h-12"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {patientIdentifierError && (
          <p className="text-sm text-red-600">{patientIdentifierError}</p>
        )}
      </div>

      <Button
        type="button"
        onClick={handlePatientRequestOtp}
        className="w-full h-12"
        disabled={requestOtpMutation.isPending}
      >
        {requestOtpMutation.isPending ? "Sending OTP..." : "Send OTP to Email"}
      </Button>
    </div>
  );

  const renderPatientOtpVerification = () => (
    <div className="space-y-6">
      <button
        onClick={() => {
          setPatientStep(PatientLoginStep.IDENTIFIER_INPUT);
          requestOtpMutation.reset(); // Reset to allow a new request
          setTimer(0);
          setCanResend(false);
          setOtp(["", "", "", "", "", ""]);
        }}
        className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Change contact
      </button>

      <div>
        <h3 className="text-2xl font-bold text-gray-900">Verify Login</h3>
        <p className="text-gray-600 mt-1">
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-gray-900">{patientIdentifier}</span>
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
            className="size-14 md:size-16 text-center text-2xl font-bold"
            autoFocus={index === 0}
            disabled={verifyOtpMutation.isPending}
          />
        ))}
      </div>

      <div className="text-center space-y-3">
        {canResend ? (
          <Button
            variant="link"
            onClick={handlePatientResend}
            disabled={resendOtpMutation.isPending}
            className="text-green-600 hover:text-green-700"
          >
            {resendOtpMutation.isPending ? "Resending..." : "Resend OTP"}
          </Button>
        ) : (
          <p className="text-sm text-gray-600">
            Resend code in{" "}
            <span className="font-semibold text-green-600">{timer}s</span>
          </p>
        )}
      </div>

      <Button
        onClick={handlePatientVerifyOtp}
        disabled={verifyOtpMutation.isPending || otp.some((d) => d === "")}
        className="w-full h-12"
      >
        {verifyOtpMutation.isPending ? "Verifying..." : "Verify & Login"}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900">Welcome back!</h2>
        <p className="text-gray-600 mt-2">
          Choose your login method to continue
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => {
          setActiveTab(v as "staff" | "patient");
          setPatientStep(PatientLoginStep.IDENTIFIER_INPUT);
          setTimer(0);
          setCanResend(false);
          requestOtpMutation.reset();
          verifyOtpMutation.reset();
        }}
      >
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="staff" className="text-sm font-medium">
            Staff Login
          </TabsTrigger>
          <TabsTrigger value="patient" className="text-sm font-medium">
            Patient Login
          </TabsTrigger>
        </TabsList>

        <TabsContent value="staff" className="space-y-4 mt-6">
          <form onSubmit={handleStaffLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@clinic.com"
                className="h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && (
                <p className="text-sm text-red-600">{emailError}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-12 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              {passwordError && (
                <p className="text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="remember" className="text-sm text-gray-600">
                  Remember me
                </label>
              </div>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-green-600 hover:text-green-700"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-12"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Register
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="patient" className="space-y-4 mt-6">
          <form onSubmit={(e) => e.preventDefault()}>
            {patientStep === PatientLoginStep.IDENTIFIER_INPUT
              ? renderPatientIdentifierInput()
              : renderPatientOtpVerification()}
          </form>

          <div className="text-center text-sm text-gray-600 pt-4">
            Need help?{" "}
            <Link
              href={siteConfig.links.support}
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Contact clinic
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
