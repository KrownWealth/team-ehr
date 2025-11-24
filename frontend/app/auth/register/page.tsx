"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useRegister } from "@/lib/hooks/use-auth";
import Link from "next/link";

const countries = [
  { name: "Nigeria", code: "+234" },
  { name: "India", code: "+91" },
  { name: "USA", code: "+1" },
  { name: "UK", code: "+44" },
];

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be at most 50 characters"),
    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be at most 50 characters"),
    email: z.email("Invalid email address"),
    phone: z
      .string()
      .min(4, "Phone number is required")
      .regex(/^\d{7,14}$/, "Enter phone number without country code"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain uppercase, lowercase, and number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof registerSchema>;

const STEPS = [
  { number: 1, title: "Personal Info", icon: User },
  { number: 2, title: "Contact", icon: Phone },
  { number: 3, title: "Security", icon: Mail },
];

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate: registerAdmin, isPending } = useRegister();

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const stepFields: Record<number, (keyof FormData)[]> = {
    1: ["firstName", "lastName"],
    2: ["email", "phone"],
    3: ["password", "confirmPassword"],
  };

  const nextStep = async () => {
    const valid = await trigger(stepFields[step]);
    if (valid && step < 3) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const onSubmit = async (data: FormData) => {
    const formattedPhone = `${selectedCountry.code}${data.phone}`;

    const registerData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: formattedPhone,
      password: data.password,
    };

    registerAdmin(registerData);
  };

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-lg px-4 sm:px-0">
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Register As an Admin!
        </h2>
        <p className="text-gray-600 mt-2">
          Join wecareEHR and modernize your healthcare practice
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {STEPS.map((s, idx) => {
          const Icon = s.icon;
          const isActive = step === s.number;
          const isCompleted = step > s.number;

          return (
            <React.Fragment key={s.number}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isActive
                      ? "bg-green-600 text-white scale-110"
                      : isCompleted
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${isActive ? "text-green-600" : "text-gray-500"
                    }`}
                >
                  {s.title}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded transition-all ${isCompleted ? "bg-green-500" : "bg-gray-200"
                    }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                placeholder="John"
                className="h-12"
                {...register("firstName")}
              />
              {errors.firstName && (
                <p className="text-sm text-red-600">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                placeholder="Doe"
                className="h-12"
                {...register("lastName")}
              />
              {errors.lastName && (
                <p className="text-sm text-red-600">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            <Button
              type="button"
              onClick={nextStep}
              className="w-full h-12 mt-6"
            >
              Continue
            </Button>
          </div>
        )}

        {/* Step 2: Contact Info */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@clinic.com"
                className="h-12"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <div className="flex gap-2">
                <Select
                  value={selectedCountry.code}
                  onValueChange={(value) =>
                    setSelectedCountry(countries.find((c) => c.code === value)!)
                  }
                >
                  <SelectTrigger className="w-28 h-12">
                    <SelectValue>{selectedCountry.code}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.name} ({c.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="8012345678"
                  className="flex-1 h-12"
                  {...register("phone")}
                />
              </div>
              {errors.phone && (
                <p className="text-sm text-red-600">{errors.phone.message}</p>
              )}
              <p className="text-xs text-gray-500">
                Enter phone number without country code
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="flex-1 h-12"
              >
                Back
              </Button>
              <Button type="button" onClick={nextStep} className="flex-1 h-12">
                Continue
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Security */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-12 pr-10"
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
                <p className="text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-12 pr-10"
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

            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-800">
              <p className="font-medium mb-1">Password Requirements:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>At least 8 characters long</li>
                <li>Contains uppercase and lowercase letters</li>
                <li>Includes at least one number</li>
              </ul>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                className="flex-1 h-12"
              >
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12"
                disabled={isPending}
              >
                {isPending ? "Creating Account..." : "Complete Registration"}
              </Button>
            </div>
          </div>
        )}
      </form>

      <div className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-green-600 hover:text-green-700 font-medium"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}
