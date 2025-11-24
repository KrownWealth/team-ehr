"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { useForgotPassword } from "@/lib/hooks/use-auth";
import Link from "next/link";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

type EmailFormData = z.infer<typeof emailSchema>;

export default function ForgotPasswordPage() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const { mutate: forgotPassword, isPending } = useForgotPassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
  });

  const onSubmit = (data: EmailFormData) => {
    setSubmittedEmail(data.email);
    forgotPassword(data.email, {
      onSuccess: () => {
        setIsSuccess(true);
      },
    });
  };

  if (isSuccess) {
    return (
      <div className="space-y-6 w-full max-w-xl">
        <Link
          href="/auth/login"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to login
        </Link>

        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Check Your Email
            </h2>
            <p className="text-gray-600 mt-2">
              We've sent a password reset link to
            </p>
            <p className="font-semibold text-gray-900 mt-1">{submittedEmail}</p>
          </div>

          <div className="pt-4">
            <Button
              onClick={() => {
                setIsSuccess(false);
                reset();
              }}
              variant="outline"
              className="w-full h-12"
            >
              Send Another Link
            </Button>
          </div>
        </div>
      </div>
    );
  }

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
          Forgot Password?
        </h2>
        <p className="text-gray-600 mt-2">
          Enter your email address and we'll send you a link to reset your
          password
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
              className="h-12 pl-10"
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <Button
          onClick={handleSubmit(onSubmit)}
          className="w-full h-12"
          disabled={isPending}
        >
          {isPending ? "Sending..." : "Send Reset Link"}
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
    </div >
  );
}
