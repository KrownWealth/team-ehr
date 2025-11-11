"use client";

import { useAuth } from "@/lib/hooks/use-auth";
import AdminDashboard from "./_components/AdminDashboard";
import ClerkDashboard from "./_components/ClerkDashboard";
import NurseDashboard from "./_components/NurseDashboard";
import DoctorDashboard from "./_components/DoctorDashboard";

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Render role-specific dashboard
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
