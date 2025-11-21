"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { ApiResponse, Medication } from "@/types";
import { Pill, Clock, Info } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";

interface MedicationReminder extends Medication {
  id: string;
  nextDose?: string;
  status: "active" | "completed";
  prescribed_date?: string;
}

interface RemindersResponseData {
  active_medications: MedicationReminder[];
  reminder_note: string;
}

export default function MedicationRemindersCard() {
  const { data, isLoading } = useQuery<ApiResponse<RemindersResponseData>>({
    queryKey: ["patient-medications-reminders"],
    queryFn: async () => {
      const response = await apiClient.get(
        "/v1/patient-portal/medications/reminders"
      );
      return response.data;
    },
  });

  const responseData = data?.data;
  const medications = responseData?.active_medications || [];
  const reminderNote = responseData?.reminder_note;

  if (isLoading) {
    return <Skeleton className="h-64 w-full rounded-xl" />;
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5 text-gray-500" />
            Medications & Reminders
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {medications.length === 0 ? (
          <div className="text-center py-8">
            <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <Pill className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No active medications</p>
            <p className="text-sm text-gray-500">
              {reminderNote || "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {medications.map((med, index) => (
              <div
                key={med.id || `${med.drug}-${index}`}
                className="flex items-start p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="bg-green-50 p-2 rounded-md mr-3">
                  <Pill className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-gray-900">{med.drug}</h4>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 font-medium">
                      {med.frequency}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {med.dosage} • {med.instructions}
                  </p>

                  <div className="flex items-center gap-3 mt-2">
                    {med.nextDose && (
                      <div className="flex items-center gap-1 text-xs text-orange-600 font-medium">
                        <Clock className="h-3 w-3" />
                        Next: {med.nextDose}
                      </div>
                    )}
                    {med.prescribed_date && (
                      <span className="text-xs text-gray-400">
                        Started:{" "}
                        {format(new Date(med.prescribed_date), "MMM d")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {reminderNote && (
              <div className="mt-4 pt-3 border-t border-dashed flex items-start gap-2 text-xs text-gray-500">
                <Info className="h-3 w-3 mt-0.5" />
                <p>{reminderNote}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
