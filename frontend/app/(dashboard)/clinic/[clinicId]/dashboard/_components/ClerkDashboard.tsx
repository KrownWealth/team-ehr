"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { ApiResponse, DashboardStats } from "@/types";
import { UserPlus, Users, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { CardSkeleton } from "@/components/shared/loading/CardSkeleton";

export default function ClerkDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<ApiResponse<DashboardStats>>({
    queryKey: ["clerk-dashboard-stats"],
    queryFn: async () => {
      const response = await apiClient.get("/v1/dashboard/stats");
      return response.data;
    },
  });

  const statsData = stats?.data;

  const statCards = [
    {
      title: "Total Patients",
      value: statsData?.totalPatients || 0,
      icon: Users,
      href: `/clinic/${user?.clinicId}/patients`,
    },
    {
      title: "Total Appointments",
      value: statsData?.todayAppointments || 0,
      icon: CheckCircle,
      href: `/clinic/${user?.clinicId}/queue`,
    },
    {
      title: "Today's Appointments",
      value: statsData?.totalAppointments || 0,
      icon: CheckCircle,
      href: `/clinic/${user?.clinicId}/queue`,
    },
    {
      title: "Total Queue",
      value: statsData?.totalQueue || 0,
      icon: Users,
      href: `/clinic/${user?.clinicId}/patients`,
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-7 px-4 sm:px-0">
      {/* Header Section - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Front Desk
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Welcome, {user?.firstName}! Manage patient check-ins and
            registrations.
          </p>
        </div>
        <Link
          href={`/clinic/${user?.clinicId}/patients/register`}
          className="w-full sm:w-auto"
        >
          <button className="btn btn-block w-full sm:w-auto whitespace-nowrap">
            <UserPlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="text-sm sm:text-base">Register New Patient</span>
          </button>
        </Link>
      </div>

      {/* Stats Cards Grid - Mobile Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)
          : statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link href={stat.href} key={index}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-4 sm:px-6 pt-4 sm:pt-6">
                    <CardTitle className="text-sm sm:text-base lg:text-xl font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <div className="bg-primary/10 p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                      <Icon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-4 sm:px-6 pb-4 sm:pb-6">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
      </div>

      {/* Quick Actions Card - Mobile Responsive */}
      <Card className="w-full">
        <CardHeader className="px-4 sm:px-6 pt-4 sm:pt-6">
          <CardTitle className="text-lg sm:text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-5 px-4 sm:px-6 pb-4 sm:pb-6">
          <Link
            href={`/clinic/${user?.clinicId}/patients`}
            className="w-full sm:w-auto"
          >
            <button className="btn btn-outline w-full sm:w-auto">
              <Users className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-sm sm:text-base">View All Patients</span>
            </button>
          </Link>
          <Link
            href={`/clinic/${user?.clinicId}/queue`}
            className="w-full sm:w-auto"
          >
            <button className="btn btn-outline w-full sm:w-auto">
              <Clock className="mr-2 h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-sm sm:text-base">Manage Queue</span>
            </button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}