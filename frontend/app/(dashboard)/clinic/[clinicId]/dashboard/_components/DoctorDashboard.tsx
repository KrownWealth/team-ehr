"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { ResponseSuccess } from "@/types";
import { Stethoscope, Clock, FileText, Pill } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";

export default function DoctorDashboard() {
  const { user } = useAuth();

  const { data: stats } = useQuery<ResponseSuccess<any>>({
    queryKey: ["doctor-dashboard-stats"],
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
          <h1 className="text-2xl font-bold text-gray-900">Doctor's Console</h1>
          <p className="text-sm text-gray-600 mt-1">
            Welcome, Dr. {user?.lastName}! Here are your pending consultations.
          </p>
        </div>
        <Link href={`/clinic/${user?.clinicId}/queue`}>
          <Button size="lg">
            <Stethoscope className="mr-2 h-5 w-5" />
            Start Consultation
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Consultations
            </CardTitle>
            <Clock className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {statsData?.pendingConsultations || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">Waiting patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Today's Consultations
            </CardTitle>
            <FileText className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {statsData?.todayCheckIns || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Patients
            </CardTitle>
            <Stethoscope className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {statsData?.totalPatients || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">Under care</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href={`/clinic/${user?.clinicId}/consultations`}>
            <Button variant="outline" className="w-full h-20 text-lg">
              <Stethoscope className="mr-2 h-6 w-6" />
              Consultations
            </Button>
          </Link>
          <Link href={`/clinic/${user?.clinicId}/prescriptions`}>
            <Button variant="outline" className="w-full h-20 text-lg">
              <Pill className="mr-2 h-6 w-6" />
              Prescriptions
            </Button>
          </Link>
          <Link href={`/clinic/${user?.clinicId}/patients`}>
            <Button variant="outline" className="w-full h-20 text-lg">
              <FileText className="mr-2 h-6 w-6" />
              Patient Records
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
