"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { ApiResponse, PatientDashboard as PatientDashboardType } from "@/types";
import { Activity, FileText, Plus, User } from "lucide-react";
import { useAuth } from "@/lib/hooks/use-auth";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardVitalsCard from "./_components/DashboardVitalsCard";
import NextAppointmentCard from "./_components/NextAppointmentCard";
import MedicationRemindersCard from "./_components/MedicationRemindersCard";

export default function PatientDashboard() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery<ApiResponse<PatientDashboardType>>({
    queryKey: ["patient-portal-dashboard"],
    queryFn: async () => {
      const response = await apiClient.get("/v1/patient-portal/dashboard");
      return response.data;
    },
  });

  const dashboardData = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">Failed to load dashboard data.</p>
      </div>
    );
  }

  const nextAppointment = dashboardData.upcoming_appointments?.[0] || null;
  const latestVitals = dashboardData.recent_vitals?.[0] || null;

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Good Morning, {dashboardData.patient_info.firstName}
          </h1>
          <p className="text-base text-gray-600 mt-1">
            Here is your health overview for today.
          </p>
        </div>
        <Link href="/patient-portal/appointments">
          <button className="btn btn-outline">
            <Plus className="mr-2 h-5 w-5" />
            Book Appointment
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardVitalsCard latestVitals={latestVitals} />
        <NextAppointmentCard appointment={nextAppointment} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MedicationRemindersCard /> 
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm h-fit">
          <h3 className="font-semibold text-lg mb-4 text-gray-900">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <Link className="block" href="/patient-portal/vitals">
              <button className="btn btn-outline w-full justify-start">
                <Activity className="mr-3 h-5 w-5 text-green-600" />
                Record Vitals
              </button>
            </Link>
            <Link className="block" href="/patient-portal/records">
              <button className="btn btn-outline w-full justify-start">
                <FileText className="mr-3 h-5 w-5 text-green-600" />
                Medical Records
              </button>
            </Link>
            <Link className="block" href="/patient-portal/profile">
              <button className="btn btn-outline w-full justify-start">
                <User className="mr-3 h-5 w-5 text-green-600" />
                Profile Settings
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
