"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { ApiResponse } from "@/types";
import { Activity, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import VitalsTrendOverview from "./_components/VitalsTrendOverview";
import VitalsHistory from "./_components/VitalsHistory";
import LogVitalsDialog from "./_components/LogVitalsDialog";

// Specific interface for Vitals in this context
export interface VitalRecord {
  id: string;
  bloodPressure?: string; // e.g., "120/80"
  temperature?: number;
  weight?: number;
  heartRate?: number; // mapped from 'pulse' in some endpoints
  respiration?: number;
  spo2?: number;
  notes?: string;
  recordedAt: string;
  createdAt: string;
}

export default function PatientVitalsPage() {
  const [isLogOpen, setIsLogOpen] = useState(false);

  const { data, isLoading } = useQuery<ApiResponse<{ vitals: VitalRecord[] }>>({
    queryKey: ["patient-portal-vitals-full"],
    queryFn: async () => {
      const response = await apiClient.get(
        "/v1/patient-portal/medical-records",
        {
          params: { type: "vitals", limit: 50 }, // Fetch more for trends
        }
      );
      return response.data;
    },
  });

  const vitals = data?.data?.vitals || [];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vitals Tracker</h1>
          <p className="text-base text-gray-600 mt-1">
            Monitor your health trends and log daily measurements.
          </p>
        </div>
        <button
          className="btn btn-block md:w-auto"
          onClick={() => setIsLogOpen(true)}
        >
          <Plus className="mr-2 h-5 w-5" />
          Log New Entry
        </button>
      </div>

      {isLoading ? (
        <VitalsSkeleton />
      ) : (
        <>
          {/* Trend Charts Section */}
          <VitalsTrendOverview vitals={vitals} />

          {/* Detailed History List */}
          <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-600" />
              History Log
            </h3>
            <VitalsHistory vitals={vitals} />
          </div>
        </>
      )}

      <LogVitalsDialog open={isLogOpen} onOpenChange={setIsLogOpen} />
    </div>
  );
}

function VitalsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}
