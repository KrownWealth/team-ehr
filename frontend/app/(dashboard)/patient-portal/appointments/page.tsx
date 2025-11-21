"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { ApiResponse } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, CalendarClock, History } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import AppointmentList from "./_components/AppointmentList";
import AppointmentRequestDialog from "./_components/AppointmentRequestDialog";

export interface PortalAppointment {
  id: string;
  appointmentDate: string;
  reason: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "COMPLETED"
    | "CANCELLED"
    | "WAITING"
    | "IN_CONSULTATION";
  doctorName?: string;
  notes?: string;
}

interface DashboardResponse {
  upcoming_appointments: PortalAppointment[]; // Upcoming
}

export default function PatientAppointmentsPage() {
  const [isRequestOpen, setIsRequestOpen] = useState(false);

  const { data: dashboardData, isLoading: loadingUpcoming } = useQuery<
    ApiResponse<DashboardResponse>
  >({
    queryKey: ["patient-portal-dashboard"],
    queryFn: async () => {
      const response = await apiClient.get("/v1/patient-portal/dashboard");
      return response.data;
    },
  });

  const { data: recordsData, isLoading: loadingHistory } = useQuery<
    ApiResponse<{ appointments: PortalAppointment[] }>
  >({
    queryKey: ["patient-portal-history-appointments"],
    queryFn: async () => {
      const response = await apiClient.get(
        "/v1/patient-portal/medical-records",
        {
          params: { type: "appointments" },
        }
      );
      return response.data;
    },
  });

  const upcomingAppointments = dashboardData?.data?.upcoming_appointments || [];
  const pastAppointments = recordsData?.data?.appointments || [];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-base text-gray-600 mt-1">
            Manage your visits and schedule new consultations.
          </p>
        </div>
        <button
          className="btn btn-block md:w-auto"
          onClick={() => setIsRequestOpen(true)}
        >
          <Plus className="mr-2 h-5 w-5" />
          Book Appointment
        </button>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-6">
        <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-gray-100 p-1">
          <TabsTrigger
            value="upcoming"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
          >
            <CalendarClock className="h-4 w-4" />
            Upcoming
          </TabsTrigger>
          <TabsTrigger
            value="history"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
          >
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {loadingUpcoming ? (
            <AppointmentListSkeleton />
          ) : (
            <AppointmentList
              appointments={upcomingAppointments}
              type="upcoming"
            />
          )}
        </TabsContent>

        <TabsContent value="history">
          {loadingHistory ? (
            <AppointmentListSkeleton />
          ) : (
            <AppointmentList appointments={pastAppointments} type="history" />
          )}
        </TabsContent>
      </Tabs>

      <AppointmentRequestDialog
        open={isRequestOpen}
        onOpenChange={setIsRequestOpen}
      />
    </div>
  );
}

function AppointmentListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Skeleton key={i} className="h-32 w-full rounded-xl" />
      ))}
    </div>
  );
}
