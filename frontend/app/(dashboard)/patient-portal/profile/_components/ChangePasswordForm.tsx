"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, ShieldCheck } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { toast } from "sonner";

interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export default function ChangePasswordForm() {
  const [formData, setFormData] = useState<ChangePasswordData>({
    oldPassword: "",
    newPassword: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const response = await apiClient.post("/v1/auth/change-password", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Password updated successfully");
      setFormData({ oldPassword: "", newPassword: "" });
      setConfirmPassword("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to change password");
    },
  });

  const handleSubmit = () => {
    if (!formData.oldPassword || !formData.newPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (formData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }
    if (formData.newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    changePasswordMutation.mutate(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Lock className="h-5 w-5 text-gray-500" />
          Change Password
        </CardTitle>
        <CardDescription>
          Ensure your account stays secure by using a strong password.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-w-md">
        <div className="space-y-2">
          <Label>Current Password</Label>
          <Input 
            type="password" 
            placeholder="Enter current password"
            value={formData.oldPassword}
            onChange={(e) => setFormData({...formData, oldPassword: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label>New Password</Label>
          <Input 
            type="password" 
            placeholder="Enter new password"
            value={formData.newPassword}
            onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
          />
        </div>

        <div className="space-y-2">
          <Label>Confirm New Password</Label>
          <Input 
            type="password" 
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <div className="pt-4">
          <button
            onClick={handleSubmit}
            disabled={changePasswordMutation.isPending}
            className="btn btn-block"
          >
            {changePasswordMutation.isPending ? (
              "Updating..."
            ) : (
              <>
                <ShieldCheck className="mr-2 h-4 w-4" />
                Update Password
              </>
            )}
          </button>
        </div>
      </CardContent>
    </Card>
  );
}