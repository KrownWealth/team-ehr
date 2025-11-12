"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import AdminDashboard from "./_components/AdminDashboard";
import ClerkDashboard from "./_components/ClerkDashboard";
import NurseDashboard from "./_components/NurseDashboard";
import DoctorDashboard from "./_components/DoctorDashboard";
import { DashboardSkeleton } from "@/components/shared/loading/DashboardSkeleton";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return <DashboardSkeleton />;
  }

  switch (user.role) {
    case "ADMIN":
      return <AdminDashboard />;
    case "CLERK":
      return <ClerkDashboard />;
    case "NURSE":
      return <NurseDashboard />;
    case "DOCTOR":
      return <DoctorDashboard />;

    default:
      return (
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">
            Unknown role. Please contact administrator.
          </p>
        </div>
      );
  }
}
