"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { ApiResponse, DashboardStats } from "@/types";
import {
  Users,
  UserPlus,
  DollarSign,
  Activity,
  Clock,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/formatters";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { CardSkeleton } from "@/components/shared/loading/CardSkeleton";

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<ApiResponse<DashboardStats>>({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const response = await apiClient.get("/v1/admin/dashboard/stats");
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
      title: "Today's Appointments",
      value: statsData?.todayAppointments || 0,
      icon: UserPlus,
      href: `/clinic/${user?.clinicId}/queue`,
    },
    {
      title: "Staff Members",
      value: statsData?.totalStaff || 0,
      icon: Activity,
      href: `/clinic/${user?.clinicId}/staff`,
    },
    {
      title: "Pending Bills",
      value: statsData?.pendingBills || 0,
      icon: Clock,
      href: "#",
    },
    {
      title: "Revenue (Today)",
      value: statsData?.todayRevenue
        ? formatCurrency(statsData.todayRevenue)
        : "₦0.00",
      icon: DollarSign,
      href: "#",
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-7 p-4 sm:p-6 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        {/* Title Section */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">
            Admin Dashboard
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Welcome back, {user?.firstName}! Here's your clinic overview.
          </p>
        </div>

        {/* Action Buttons - Stack on mobile, side-by-side on desktop */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
          <Link
            href={`/clinic/${user?.clinicId}/patients/register`}
            className="w-full sm:w-auto"
          >
            <button className="btn btn-outline btn-block w-full sm:w-auto whitespace-nowrap">
              <UserPlus className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">Register Patient</span>
            </button>
          </Link>
          <Link
            href={`/clinic/${user?.clinicId}/staff?to=invite`}
            className="w-full sm:w-auto"
          >
            <button className="btn btn-outline w-full sm:w-auto whitespace-nowrap">
              <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              <span className="truncate">Invite Staff</span>
            </button>
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))
          : statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link href={stat.href} key={index} className="block">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base sm:text-lg font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <div className="bg-primary/4 p-2 rounded-lg flex-shrink-0">
                      <Icon className="h-6 w-6 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 truncate">
                      {stat.value}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
      </div>
    </div>
  );
}