"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { ApiResponse, DashboardStats } from "@/types";
import {
  Users,
  UserPlus,
  DollarSign,
  Activity,
  TrendingUp,
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
    <div className="space-y-7">
      <div className="flex justify-between gap-4 md:items-center md:flex-row flex-col">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-base text-gray-600 mt-1">
            Welcome back, {user?.firstName}! Here's your clinic overview.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/clinic/${user?.clinicId}/patients/register`}>
            <button className="btn btn-outline btn-block">
              <UserPlus className="mr-2 h-5 w-5" />
              Register Patient
            </button>
          </Link>
          <Link href={`/clinic/${user?.clinicId}/staff?to=invite`}>
            <button className="btn btn-outline">
              <Users className="mr-2 h-5 w-5" />
              Invite Staff
            </button>
          </Link>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)
          : statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link href={stat.href} key={index}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <div className={`bg-primary/4 p-2 rounded-lg`}>
                      <Icon className={`h-10 w-10 text-primary`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-gray-900">
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
