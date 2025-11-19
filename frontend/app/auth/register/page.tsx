"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { toast } from "sonner";
import { Mail, User, Phone, Briefcase, Lock, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { CreateStaffData } from "@/types";
import { useRouter } from "next/navigation";

type StaffRole = "CLERK" | "NURSE" | "DOCTOR" | "CASHIER";

type RegisterStaffData = CreateStaffData & {
  password: string;
  confirmPassword: string;
};

const COUNTRIES = [
  { name: "Nigeria", code: "+234" },
  { name: "USA", code: "+1" },
  { name: "UK", code: "+44" },
  { name: "India", code: "+91" },
];

export default function RegisterStaffPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedCountryCode, setSelectedCountryCode] = useState(COUNTRIES[0].code);

  const [formData, setFormData] = useState<
    Omit<RegisterStaffData, "role" | "phone"> & { role: StaffRole; phoneNumber: string }
  >({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    role: "CLERK",
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterStaffData) => {
      const { confirmPassword, ...apiPayload } = data;
      await apiClient.post("/v1/auth/register", apiPayload);
    },
    onSuccess: () => {
      toast.success("Staff member registered! Verification email sent.");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      resetForm();
      router.push("/staff"); // Navigate to staff list or dashboard
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Registration failed");
    },
  });

  const resetForm = () => {
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
      role: "CLERK",
    });
    setSelectedCountryCode(COUNTRIES[0].code);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.email ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.phoneNumber ||
      !formData.password
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(formData.password)) {
      toast.error("Password must be at least 8 characters, contain uppercase, lowercase, and a number.");
      return;
    }

    const formattedPhone = `${selectedCountryCode}${formData.phoneNumber}`;

    const dataToSend: RegisterStaffData = {
      ...formData,
      phone: formattedPhone,
    } as RegisterStaffData;

    registerMutation.mutate(dataToSend);
  };

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-sm rounded-lg p-6 sm:p-8">
          <div className="mb-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Register New Staff Member</h1>
            <p className="mt-2 text-sm text-gray-600">
              Provide details for the new staff member. They will receive an email to verify their account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address <span className="text-red-500">*</span>
              </Label>
              <Input
                className="h-12"
                id="email"
                type="email"
                placeholder="staff@example.com"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  className="h-12"
                  id="firstName"
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  className="h-12"
                  id="lastName"
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Select
                  value={selectedCountryCode}
                  onValueChange={setSelectedCountryCode}
                >
                  <SelectTrigger className="w-24 h-12 flex-shrink-0">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((c) => (
                      <SelectItem key={c.code} value={c.code}>
                        {c.code}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  className="h-12 flex-1"
                  id="phoneNumber"
                  type="tel"
                  placeholder="8012345678"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                Enter the local number. Must be a valid international number when combined with the country code.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Initial Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    className="h-12 pr-10"
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    required
                    minLength={8}
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm Password <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    className="h-12 pr-10"
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    required
                    minLength={8}
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
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Role <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(val) => handleChange("role", val as StaffRole)}
              >
                <SelectTrigger className="w-full h-12">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLERK">Front Desk Clerk</SelectItem>
                  <SelectItem value="NURSE">Nurse</SelectItem>
                  <SelectItem value="DOCTOR">Doctor</SelectItem>
                  <SelectItem value="CASHIER">Cashier</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-xs text-blue-800">
                The user will need to verify their email address before accessing the system.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={registerMutation.isPending}
                className="w-full sm:w-auto"
              >
                {registerMutation.isPending ? "Registering..." : "Register Staff"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}