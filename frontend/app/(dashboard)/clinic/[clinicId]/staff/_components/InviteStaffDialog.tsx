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
import { Mail, User, Phone, Briefcase } from "lucide-react";
import { CreateStaffData } from "@/types";
import { getErrorMessage } from "@/lib/helper";
import { useAuth } from "@/lib/hooks/use-auth";

interface InviteStaffDialogProps {
  open: boolean;
  onClose: () => void;
}

type StaffRole = "CLERK" | "NURSE" | "DOCTOR" | "CASHIER";

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
    CreateStaffData & { role: StaffRole }
  >({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    role: "CLERK",
  });
  const [selectedCountryCode, setSelectedCountryCode] = useState(
    countries[0].code
  );

  const inviteStaffMutation = useMutation({
    mutationFn: async (data: CreateStaffData) => {
      await apiClient.post("/v1/staff/create", data);
    },
    onSuccess: () => {
      toast.success("Staff member invited! Invitation email sent.");
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
      role: "CLERK",
    });
    setSelectedCountryCode(countries[0].code);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !formData.email ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.phone
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const formattedPhone = `${selectedCountryCode}${formData.phone}`;

    const apiData: CreateStaffData = {
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formattedPhone,
      role: formData.role,
    };

    inviteStaffMutation.mutate(apiData);
  };

  const handleChange = (
    field: keyof typeof formData,
    value: string | StaffRole
  ) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
    sm:max-w-xl
    max-h-[90vh]
   overflow-y-auto 
    sm:max-h-none sm:overflow-visible
    rounded-lg
    p-4 sm:p-6
  ">
        <DialogHeader>
          <DialogTitle>Invite New Staff Member</DialogTitle>
          <DialogDescription>
            Enter the staff member details to send an invitation email.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
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
              Enter phone number without country code
            </p>
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
              </SelectContent>
            </Select>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-xs text-green-800">
              The staff member will receive an invitation email with a
              system-generated temporary password and be forced to set their
              permanent password on first login.
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
              disabled={inviteStaffMutation.isPending}
              className="h-12"
            >
              {inviteStaffMutation.isPending ? "Inviting..." : "Invite Staff"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
