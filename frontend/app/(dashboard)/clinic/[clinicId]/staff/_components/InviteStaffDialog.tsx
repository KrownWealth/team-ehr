"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { toast } from "sonner";
import { Mail, User, Phone, Briefcase, Lock, Eye, EyeOff } from "lucide-react";
import { CreateStaffData } from "@/types";
import { getErrorMessage } from "@/lib/helper";
import { useAuth } from "@/lib/hooks/use-auth";

interface InviteStaffDialogProps {
  open: boolean;
  onClose: () => void;
}

type StaffRole = "CLERK" | "NURSE" | "DOCTOR" | "CASHIER";

// Updated type to include confirmPassword
type RegisterStaffData = CreateStaffData & {
  password: string;
  confirmPassword: string;
};

const countries = [
  { name: "Nigeria", code: "+234" },
  { name: "India", code: "+91" },
  { name: "USA", code: "+1" },
  { name: "UK", code: "+44" },
];

export default function InviteStaffDialog({
  open,
  onClose,
}: InviteStaffDialogProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [formData, setFormData] = useState<
    Omit<RegisterStaffData, "role"> & { role: StaffRole }
  >({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "CLERK",
  });
  const [selectedCountryCode, setSelectedCountryCode] = useState(
    countries[0].code
  );
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const registerMutation = useMutation({
    mutationFn: async (data: Omit<RegisterStaffData, "confirmPassword">) => {
      await apiClient.post("/v1/auth/register", {
        ...data,
        clinicId: user?.clinicId,
      });
    },
    onSuccess: () => {
      toast.success("Staff member registered! Verification email sent.");
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error));
    },
  });

  const resetForm = () => {
    setFormData({
      email: "",
      firstName: "",
      lastName: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: "CLERK",
    });
    setSelectedCountryCode(countries[0].code);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation check
    if (
      !formData.email ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.phone ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    // New: Check if passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    // New: Concatenate phone number with selected country code
    const formattedPhone = `${selectedCountryCode}${formData.phone}`;

    // Data structure for the API call (excluding confirmPassword)
    const apiData = {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formattedPhone, // Formatted number
      password: formData.password,
      role: formData.role,
    };

    registerMutation.mutate(apiData);
  };

  const handleChange = (
    field: keyof typeof formData,
    value: string | StaffRole
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-xl">
        {" "}
        {/* Increased width slightly */}
        <DialogHeader>
          <DialogTitle>Register New Staff Member</DialogTitle>
          <DialogDescription>
            Register a new staff member and send an email verification link.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {" "}
          {/* Increased spacing */}
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
          <div className="grid grid-cols-2 gap-4">
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
            {/* Split Phone Number Input */}
            <div className="flex gap-2">
              <Select
                value={selectedCountryCode}
                onValueChange={(value) => setSelectedCountryCode(value)}
              >
                <SelectTrigger className="w-28 h-12">
                  <SelectValue>{selectedCountryCode}</SelectValue>
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
                className="flex-1 h-12"
                id="phone"
                type="tel"
                placeholder="8012345678"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                required
              />
            </div>
            <p className="text-xs text-gray-500">
              Enter phone number without the country code. The full number will
              be **concatenated** on submit.
            </p>
          </div>
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
                placeholder="Set a temporary password"
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
            <p className="text-xs text-gray-500">
              Must be at least 8 characters and include uppercase, lowercase,
              and a number.
            </p>
          </div>
          {/* New: Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">
              Confirm Password <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                className="h-12 pr-10"
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm temporary password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleChange("confirmPassword", e.target.value)
                }
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
            {/* Simple feedback if the two password fields don't match */}
            {formData.password &&
              formData.confirmPassword &&
              formData.password !== formData.confirmPassword && (
                <p className="text-sm text-red-600">Passwords do not match</p>
              )}
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
                {/* <SelectItem value="CASHIER">Cashier</SelectItem> */}
              </SelectContent>
            </Select>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-800">
              The staff member will receive an email to verify their account and
              set their permanent password after initial registration.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-12"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={registerMutation.isPending}
              className="h-12"
            >
              {registerMutation.isPending ? "Registering..." : "Register Staff"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
