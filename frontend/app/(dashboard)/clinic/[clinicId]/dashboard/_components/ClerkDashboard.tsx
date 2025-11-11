"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { ResponseSuccess } from "@/types";
import { UserPlus, Users, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";

export default function ClerkDashboard() {
  const { user } = useAuth();

  const { data: stats } = useQuery<ResponseSuccess<any>>({
    queryKey: ["clerk-dashboard-stats"],
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
          <h1 className="text-2xl font-bold text-gray-900">Front Desk</h1>
          <p className="text-sm text-gray-600 mt-1">
            Welcome, {user?.firstName}! Manage patient check-ins and
            registrations.
          </p>
        </div>
        <Link href={`/${user?.clinicId}/patients/register`}>
          <Button size="lg">
            <UserPlus className="mr-2 h-5 w-5" />
            Register New Patient
          </Button>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Today's Check-ins
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {statsData?.todayCheckIns || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Queue Length
            </CardTitle>
            <Clock className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {statsData?.queueLength || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Patients
            </CardTitle>
            <Users className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {statsData?.totalPatients || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href={`/${user?.clinicId}/patients`}>
            <Button variant="outline" className="w-full h-20 text-lg">
              <Users className="mr-2 h-6 w-6" />
              View All Patients
            </Button>
          </Link>
          <Link href={`/${user?.clinicId}/queue`}>
            <Button variant="outline" className="w-full h-20 text-lg">
              <Clock className="mr-2 h-6 w-6" />
              Manage Queue
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
