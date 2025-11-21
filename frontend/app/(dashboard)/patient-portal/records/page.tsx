"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { ApiResponse } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, FileText, Pill, Stethoscope, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import MedicalHistoryList from "./_components/MedicalHistoryList";
import RecordVitalsDialog from "./_components/RecordVitalsDialog";

export default function PatientRecordsPage() {
  const [activeTab, setActiveTab] = useState("consultations");
  const [isVitalsOpen, setIsVitalsOpen] = useState(false);

  // Fetch records based on the active tab
  const { data, isLoading } = useQuery<
    ApiResponse<{ consultations: any[]; vitals: any[]; prescriptions: any[] }>
  >({
    queryKey: ["patient-portal-records", activeTab],
    queryFn: async () => {
      const response = await apiClient.get(
        "/v1/patient-portal/medical-records",
        {
          params: { type: activeTab, limit: 20 },
        }
      );
      return response.data;
    },
  });

  const records =
    data?.data?.consultations ||
    data?.data?.vitals ||
    data?.data?.prescriptions ||
    [];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-base text-gray-600 mt-1">
            View your health history and track your vitals.
          </p>
        </div>
        <button
          className="btn btn-block md:w-auto"
          onClick={() => setIsVitalsOpen(true)}
        >
          <Plus className="mr-2 h-5 w-5" />
          Log Vitals
        </button>
      </div>

      <Tabs
        defaultValue="consultations"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-gray-100 p-1">
          <TabsTrigger
            value="consultations"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
          >
            <Stethoscope className="h-4 w-4" />
            Consultations
          </TabsTrigger>
          <TabsTrigger
            value="prescriptions"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
          >
            <Pill className="h-4 w-4" />
            Prescriptions
          </TabsTrigger>
          <TabsTrigger
            value="vitals"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium"
          >
            <Activity className="h-4 w-4" />
            Vitals History
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-xl" />
              ))}
            </div>
          ) : (
            <MedicalHistoryList records={records} type={activeTab} />
          )}
        </TabsContent>
      </Tabs>

      <RecordVitalsDialog open={isVitalsOpen} onOpenChange={setIsVitalsOpen} />
    </div>
  );
}
