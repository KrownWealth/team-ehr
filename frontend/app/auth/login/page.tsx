"use client";

import React, { useState } from "react";
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
import { useLogin } from "@/lib/hooks/use-auth";
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

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"staff" | "patient">("staff");
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const router = useRouter();

  // Staff login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Patient login state
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const loginMutation = useLogin();

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Clear previous errors
    setEmailError("");
    setPasswordError("");

    // Simple validation
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

    // Submit
    loginMutation.mutate({
      email: email,
      password: password,
    });
  };

  const handlePatientOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setPhoneError("");

    if (!phone || phone.length < 4) {
      setPhoneError("Please enter a valid phone number");
      return;
    }

    try {
      const fullPhone = `${selectedCountry.code}${phone}`;
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

        <TabsContent value="staff" className="space-y-4 mt-6">
          <div className="space-y-4">
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
              type="button"
              onClick={handleStaffLogin}
              className="w-full h-12"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </div>

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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
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
                      <SelectItem
                        key={c.code}
                        value={c.code}
                        className="hover:text-white"
                      >
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
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              {phoneError && (
                <p className="text-sm text-red-600">{phoneError}</p>
              )}
            </div>

            <Button
              type="button"
              onClick={handlePatientOtp}
              className="w-full h-12"
            >
              Send OTP
            </Button>
          </div>

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
