"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { ApiResponse, DashboardStats } from "@/types";
import { Heart, Clock, Activity, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { CardSkeleton } from "@/components/shared/loading/CardSkeleton";

export default function NurseDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<ApiResponse<DashboardStats>>({
    queryKey: ["nurse-dashboard-stats"],
    queryFn: async () => {
      const response = await apiClient.get("/v1/dashboard/stats");
      return response.data;
    },
  });

  const statsData = stats?.data;

  const statCards = [
    {
      title: "Pending Vitals",
      value: statsData?.todayAppointments || 0,
      subtitle: "Patients waiting",
      icon: Activity,
      href: `/clinic/${user?.clinicId}/vitals`,
    },
    {
      title: "Queue Status",
      value: statsData?.totalPatients || 0,
      subtitle: "In queue",
      icon: Clock,
      href: `/clinic/${user?.clinicId}/queue`,
    },
    {
      title: "Vitals Recorded Today",
      value: statsData?.todayAppointments || 0,
      subtitle: "Completed",
      icon: TrendingUp,
      href: `/clinic/${user?.clinicId}/vitals`,
    },
  ];

  return (
    <div className="space-y-7">
      <div className="flex justify-between gap-3 md:items-center md:flex-row flex-col">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Nurse Station</h1>
          <p className="text-base text-gray-600 mt-1">
            Welcome, {user?.firstName}\! Monitor vitals and patient queue.
          </p>
        </div>
        <Link href={`/clinic/${user?.clinicId}/queue`}>
          <button className="btn btn-block">
            <Heart className="mr-2 h-5 w-5" />
            View Queue
          </button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
          : statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link href={stat.href} key={index}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xl font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <div className="bg-primary/10 p-2 rounded-lg">
                      <Icon className="h-10 w-10 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-gray-900">
                      {stat.value}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {stat.subtitle}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
      </div>

      <Card className="w-fit">
        <CardHeader>
          <CardTitle className="text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-5">
          <Link href={`/clinic/${user?.clinicId}/queue`}>
            <button className="btn btn-outline">
              <Clock className="mr-2 h-6 w-6" />
              Patient Queue
            </button>
          </Link>
          <Link href={`/clinic/${user?.clinicId}/vitals`}>
            <button className="btn btn-outline">
              <Heart className="mr-2 h-6 w-6" />
              Record Vitals
            </button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
