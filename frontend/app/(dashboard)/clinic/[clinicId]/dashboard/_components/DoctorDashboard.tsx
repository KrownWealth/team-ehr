"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { ResponseSuccess } from "@/types";
import { Stethoscope, Clock, FileText, Pill } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { CardSkeleton } from "@/components/shared/loading/CardSkeleton";

export default function DoctorDashboard() {
  const { user } = useAuth();

  const { data: stats, isLoading } = useQuery<ResponseSuccess<any>>({
    queryKey: ["doctor-dashboard-stats"],
    queryFn: async () => {
      const response = await apiClient.get("/admin/dashboard/stats");
      return response.data;
    },
  });

  const statsData = stats?.data;

  const statCards = [
    {
      title: "Pending Consultations",
      value: statsData?.pendingConsultations || 0,
      subtitle: "Waiting patients",
      icon: Clock,
      href: `/clinic/${user?.clinicId}/queue`,
    },
    {
      title: "Today's Consultations",
      value: statsData?.todayCheckIns || 0,
      subtitle: "Completed",
      icon: FileText,
      href: `/clinic/${user?.clinicId}/consultations`,
    },
    {
      title: "Total Patients",
      value: statsData?.totalPatients || 0,
      subtitle: "Under care",
      icon: Stethoscope,
      href: `/clinic/${user?.clinicId}/patients`,
    },
  ];

  return (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Doctor's Console</h1>
          <p className="text-base text-gray-600 mt-1">
            Welcome, Dr. {user?.lastName}! Here are your pending consultations.
          </p>
        </div>
        <Link href={`/clinic/${user?.clinicId}/queue`}>
          <button className="btn btn-block">
            <Stethoscope className="mr-2 h-5 w-5" />
            Start Consultation
          </button>
        </Link>
      </div>

      {/* Stats Grid */}
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

      {/* Quick Actions */}
      <Card className="w-fit">
        <CardHeader>
          <CardTitle className="text-xl">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Link href={`/clinic/${user?.clinicId}/consultations`}>
            <button className="btn btn-outline">
              <Stethoscope className="mr-2 h-6 w-6" />
              Consultations
            </button>
          </Link>
          <Link href={`/clinic/${user?.clinicId}/prescriptions`}>
            <button className="btn btn-outline">
              <Pill className="mr-2 h-6 w-6" />
              Prescriptions
            </button>
          </Link>
          <Link href={`/clinic/${user?.clinicId}/patients`}>
            <button className="btn btn-outline">
              <FileText className="mr-2 h-6 w-6" />
              Patient Records
            </button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
