"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { ResponseSuccess } from "@/types";
import { Heart, Clock, Activity, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";

export default function NurseDashboard() {
  const { user } = useAuth();

  const { data: stats } = useQuery<ResponseSuccess<any>>({
    queryKey: ["nurse-dashboard-stats"],
    queryFn: async () => {
      const response = await apiClient.get("/admin/dashboard/stats");
      return response.data;
    },
  });

  const statsData = stats?.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nurse Station</h1>
          <p className="text-sm text-gray-600 mt-1">
            Welcome, {user?.firstName}! Monitor vitals and patient queue.
          </p>
        </div>
        <Link href={`/${user?.clinicId}/queue`}>
          <Button size="lg">
            <Heart className="mr-2 h-5 w-5" />
            View Queue
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Vitals
            </CardTitle>
            <Activity className="h-5 w-5 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {statsData?.pendingVitals || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">Patients waiting</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Queue Status
            </CardTitle>
            <Clock className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {statsData?.queueLength || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">In queue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Vitals Recorded Today
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {statsData?.todayCheckIns || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href={`/${user?.clinicId}/queue`}>
            <Button variant="outline" className="w-full h-20 text-lg">
              <Clock className="mr-2 h-6 w-6" />
              Patient Queue
            </Button>
          </Link>
          <Link href={`/${user?.clinicId}/vitals`}>
            <Button variant="outline" className="w-full h-20 text-lg">
              <Heart className="mr-2 h-6 w-6" />
              Record Vitals
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
