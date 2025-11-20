"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { toast } from "sonner";
import { ApiResponse, User } from "@/types";
import {
  ArrowLeft,
  Save,
  User as UserIcon,
  Lock,
  Bell,
  Shield,
  Camera,
  Mail,
  Phone,
  Briefcase,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import Loader from "@/components/shared/Loader";
import { formatDateTime } from "@/lib/utils/formatters";

interface UpdateProfileData {
  firstName: string;
  lastName: string;
  phone?: string;
  licenseId?: string;
  photoUrl?: string;
}

interface ChangePasswordData {
  oldPassword: string;
  newPassword: string;
}

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const clinicId = params.clinicId as string;
  const { user: authUser } = useAuth();
  const queryClient = useQueryClient();

  // Profile state
  const [profileData, setProfileData] = useState<UpdateProfileData>({
    firstName: "",
    lastName: "",
    phone: "",
    licenseId: "",
    photoUrl: "",
  });

  // Password state
  const [passwordData, setPasswordData] = useState<ChangePasswordData>({
    oldPassword: "",
    newPassword: "",
  });
  const [confirmPassword, setConfirmPassword] = useState("");

  // Get user profile
  const { data, isLoading } = useQuery<ApiResponse<User>>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await apiClient.get("/v1/staff/me");
      return response.data;
    },
  });

  const user = data?.data;

  // Initialize form data
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || "",
        licenseId: user.licenseId || "",
        photoUrl: user.photoUrl || "",
      });
    }
  }, [user]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const response = await apiClient.put("/v1/admin/profile", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update profile");
    },
  });

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: ChangePasswordData) => {
      const response = await apiClient.post("/v1/auth/change-password", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Password changed successfully!");
      setPasswordData({ oldPassword: "", newPassword: "" });
      setConfirmPassword("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to change password");
    },
  });

  const handleProfileUpdate = () => {
    if (!profileData.firstName || !profileData.lastName) {
      toast.error("First name and last name are required");
      return;
    }

    updateProfileMutation.mutate(profileData);
  };

  const handlePasswordChange = () => {
    if (!passwordData.oldPassword || !passwordData.newPassword) {
      toast.error("Please fill all password fields");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    if (passwordData.newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    changePasswordMutation.mutate(passwordData);
  };

  if (isLoading) {
    return <Loader />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">Failed to load profile</p>
      </div>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      ADMIN: "bg-purple-100 text-purple-700",
      DOCTOR: "bg-blue-100 text-blue-700",
      NURSE: "bg-green-100 text-green-700",
      CLERK: "bg-orange-100 text-orange-700",
      PATIENT: "bg-gray-100 text-gray-700",
    };
    return colors[role] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8 gap-4">
        <button
          className="btn px-0"
          onClick={() => router.push(`/clinic/${clinicId}/dashboard`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </button>
        <br />
        <div className="flex items-start gap-6 mt-4">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
              {user.photoUrl ? (
                <img
                  src={user.photoUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-green-600">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </span>
              )}
            </div>
            <button className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50">
              <Camera className="h-4 w-4 text-gray-600" />
            </button>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user.firstName} {user.lastName}
            </h1>
            <p className="text-gray-600 mt-1">{user.email}</p>
            <div className="flex items-center gap-3 mt-3">
              <Badge className={getRoleBadgeColor(user.role)}>
                {user.role}
              </Badge>
              {user.isVerified && (
                <Badge variant="outline" className="gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              )}
              <Badge variant={user.isActive ? "default" : "secondary"}>
                {user.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-gray-100 p-1">
          <TabsTrigger
            value="profile"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
          >
            <UserIcon className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
          >
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
          >
            <Calendar className="h-4 w-4" />
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserIcon className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={profileData.firstName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        firstName: e.target.value,
                      })
                    }
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={profileData.lastName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        lastName: e.target.value,
                      })
                    }
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  value={user.email}
                  disabled
                  className="h-11 bg-gray-50"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  placeholder="08012345678"
                  className="h-11"
                />
              </div>

              {["DOCTOR", "NURSE"].includes(user.role) && (
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    License ID
                  </Label>
                  <Input
                    value={profileData.licenseId}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        licenseId: e.target.value,
                      })
                    }
                    placeholder="Professional license number"
                    className="h-11"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Photo URL
                </Label>
                <Input
                  value={profileData.photoUrl}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      photoUrl: e.target.value,
                    })
                  }
                  placeholder="https://example.com/photo.jpg"
                  className="h-11"
                />
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={handleProfileUpdate}
                  disabled={updateProfileMutation.isPending}
                  className="btn btn-block"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Change Password
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input
                  type="password"
                  value={passwordData.oldPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      oldPassword: e.target.value,
                    })
                  }
                  placeholder="Enter current password"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Enter new password (min 8 characters)"
                  className="h-11"
                />
              </div>

              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="h-11"
                />
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-900 font-medium mb-2">
                  Password Requirements:
                </p>
                <ul className="text-sm text-green-800 space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Contains uppercase and lowercase letters</li>
                  <li>• Contains at least one number</li>
                  <li>• Contains at least one special character</li>
                </ul>
              </div>

              <div className="flex justify-end pt-4 border-t">
                <button
                  onClick={handlePasswordChange}
                  disabled={changePasswordMutation.isPending}
                  className="btn btn-block"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Changing...
                    </>
                  ) : (
                    <>
                      <Shield className="mr-2 h-4 w-4" />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Session Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Current Session</p>
                  <p className="text-sm text-gray-600">
                    Last login:{" "}
                    {formatDateTime(user.lastLogin || user.createdAt)}
                  </p>
                </div>
                <Badge variant="default">Active</Badge>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={async () => {
                    try {
                      await apiClient.post("/v1/auth/logout");
                      toast.success("Logged out successfully");
                      router.push("/auth/login");
                    } catch (error) {
                      toast.error("Failed to logout");
                    }
                  }}
                >
                  Logout
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={async () => {
                    try {
                      await apiClient.post("/v1/auth/logout-all");
                      toast.success("Logged out from all devices");
                      router.push("/auth/login");
                    } catch (error) {
                      toast.error("Failed to logout from all devices");
                    }
                  }}
                >
                  Logout All Devices
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Account Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Account Created</p>
                  <p className="font-medium">
                    {formatDateTime(user.createdAt)}
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Last Login</p>
                  <p className="font-medium">
                    {formatDateTime(user.lastLogin || user.createdAt)}
                  </p>
                </div>

                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Account Status</p>
                  <Badge variant={user.isActive ? "default" : "secondary"}>
                    {user.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">
                    Verification Status
                  </p>
                  <Badge variant={user.isVerified ? "default" : "secondary"}>
                    {user.isVerified ? "Verified" : "Not Verified"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
