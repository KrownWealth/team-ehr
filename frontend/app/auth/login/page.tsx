"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";
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
import { useAuth } from "@/lib/hooks/use-auth";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/lib/siteConfig";

const countries = [
  { name: "Nigeria", code: "+234" },
  { name: "India", code: "+91" },
  { name: "USA", code: "+1" },
  { name: "UK", code: "+44" },
];

const staffSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const patientSchema = z.object({
  phone: z.string().min(4, "Phone number is required"),
});

type StaffFormData = z.infer<typeof staffSchema>;
type PatientFormData = z.infer<typeof patientSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"staff" | "patient">("staff");
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const { login, isLoading } = useAuth();
  const router = useRouter();

  const staffForm = useForm<StaffFormData>({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const patientForm = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      phone: "",
    },
  });

  const handleStaffLogin = (data: StaffFormData) => {
    login({
      email: data.email,
      password: data.password,
    });
  };

  const handlePatientOtp = async (data: PatientFormData) => {
    try {
      const fullPhone = `${selectedCountry.code}${data.phone}`;

      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success("OTP sent to your phone!");
      router.push(
        `/auth/verify-otp?phone=${encodeURIComponent(fullPhone)}&type=patient`
      );
    } catch (error) {
      toast.error("Failed to send OTP. Please try again.");
    }
  };

  return (
    <div className="space-y-6 w-full max-w-lg">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900">Welcome back!</h2>
        <p className="text-gray-600 mt-2">
          Choose your login method to continue
        </p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as "staff" | "patient")}
      >
        <TabsList className="grid w-full grid-cols-2 h-12">
          <TabsTrigger value="staff" className="text-sm font-medium">
            Staff Login
          </TabsTrigger>
          <TabsTrigger value="patient" className="text-sm font-medium">
            Patient Login
          </TabsTrigger>
        </TabsList>

        {/* Staff Login */}
        <TabsContent value="staff" className="space-y-4 mt-6">
          <form
            onSubmit={staffForm.handleSubmit(handleStaffLogin)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@clinic.com"
                className="h-12"
                {...staffForm.register("email")}
              />
              {staffForm.formState.errors.email && (
                <p className="text-sm text-red-600">
                  {staffForm.formState.errors.email.message}
                </p>
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
                  {...staffForm.register("password")}
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
              {staffForm.formState.errors.password && (
                <p className="text-sm text-red-600">
                  {staffForm.formState.errors.password.message}
                </p>
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

            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              Register your clinic
            </Link>
          </div>
        </TabsContent>

        {/* Patient Login */}
        <TabsContent value="patient" className="space-y-4 mt-6">
          <form
            onSubmit={patientForm.handleSubmit(handlePatientOtp)}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <div className="flex gap-2">
                <Select
                  value={selectedCountry.code}
                  onValueChange={(value) =>
                    setSelectedCountry(countries.find((c) => c.code === value)!)
                  }
                >
                  <SelectTrigger className="w-28 h-12!">
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
                  {...patientForm.register("phone")}
                />
              </div>
              {patientForm.formState.errors.phone && (
                <p className="text-sm text-red-600">
                  {patientForm.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                📱 We'll send a 4-digit OTP to verify your phone number
              </p>
            </div>

            <Button type="submit" className="w-full h-12" disabled={isLoading}>
              {isLoading ? "Sending OTP..." : "Send OTP"}
            </Button>
          </form>

          <div className="text-center text-sm text-gray-600">
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
