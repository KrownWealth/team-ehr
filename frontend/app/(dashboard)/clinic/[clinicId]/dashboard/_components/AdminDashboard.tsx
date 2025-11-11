"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { ResponseSuccess, DashboardStats } from "@/types";
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
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<ResponseSuccess<DashboardStats>>({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const response = await apiClient.get("/admin/dashboard/stats");
      return response.data;
    },
  });

  const statsData = stats?.data;

  const statCards = [
    {
      title: "Total Patients",
      value: statsData?.totalPatients || 0,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: `/${user?.clinicId}/patients`,
    },
    {
      title: "Today's Check-ins",
      value: statsData?.todayCheckIns || 0,
      icon: UserPlus,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: `/${user?.clinicId}/queue`,
    },
    {
      title: "Queue Length",
      value: statsData?.queueLength || 0,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      href: `/${user?.clinicId}/queue`,
    },
    {
      title: "Staff Members",
      value: statsData?.staffCount || 0,
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: `/${user?.clinicId}/staff`,
    },
    {
      title: "Revenue (Today)",
      value: statsData?.revenue ? formatCurrency(statsData.revenue) : "₦0.00",
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      href: `/${user?.clinicId}/billing`,
    },
    {
      title: "Pending Consultations",
      value: statsData?.pendingConsultations || 0,
      icon: TrendingUp,
      color: "text-red-600",
      bgColor: "bg-red-50",
      href: `/${user?.clinicId}/queue`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">
            Welcome back, {user?.firstName}! Here's your clinic overview.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/${user?.clinicId}/patients/register`}>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Register Patient
            </Button>
          </Link>
          <Link href={`/${user?.clinicId}/staff/invite`}>
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              Invite Staff
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))
          : statCards.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Link href={stat.href} key={index}>
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </CardTitle>
                      <div className={`${stat.bgColor} p-2 rounded-lg`}>
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Activity feed coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
}
