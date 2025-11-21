"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { ApiResponse, PatientDashboard } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Lock, LogOut } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PatientProfileDetails from "./_components/PatientProfileDetails";
import ChangePasswordForm from "./_components/ChangePasswordForm";
import { useAuth } from "@/lib/hooks/use-auth";

export default function PatientProfilePage() {
  const router = useRouter();
  const {logout} = useAuth()
  const [activeTab, setActiveTab] = useState("details");

  const { data, isLoading } = useQuery<ApiResponse<PatientDashboard>>({
    queryKey: ["patient-portal-dashboard"],
    queryFn: async () => {
      const response = await apiClient.get("/v1/patient-portal/dashboard");
      return response.data;
    },
  });

  const patient = data?.data?.patient_info;

  const handleLogout = async () => {
    try {
      await apiClient.post("/v1/auth/logout");
      toast.success("Logged out successfully");
      logout()
      router.push("/auth/login");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">Failed to load profile data.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center border-2 border-white shadow-sm">
            <span className="text-2xl font-bold text-green-700">
              {patient.firstName?.[0]}
              {patient.lastName?.[0]}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {patient.firstName} {patient.lastName}
            </h1>
            <p className="text-sm text-gray-600">{patient.patientNumber}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="btn btn-outline border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </button>
      </div>

      <Tabs
        defaultValue="details"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-gray-100 p-1">
          <TabsTrigger
            value="details"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
          >
            <User className="h-4 w-4" />
            Personal Details
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
          >
            <Lock className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="mt-6">
          {/* Passed the patient object directly */}
          <PatientProfileDetails patient={patient} />
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <ChangePasswordForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-12 w-64 rounded-xl" />
      <Skeleton className="h-96 w-full rounded-xl" />
    </div>
  );
}
