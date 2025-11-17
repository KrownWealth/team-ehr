"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { ResponseSuccess, Vitals } from "@/types";
import {
  formatDateTime,
  formatBloodPressure,
  formatTemperature,
} from "@/lib/utils/formatters";

export default function PatientVitals({ patientId }: { patientId: string }) {
  const { data, isLoading } = useQuery<ResponseSuccess<Vitals[]>>({
    queryKey: ["vitals", patientId],
    queryFn: async () => {
      const response = await apiClient.get(`/vitals/patient/${patientId}`);
      return response.data;
    },
  });

  const vitals = data?.data || [];

  if (isLoading) {
    return <div className="text-center py-8">Loading vitals...</div>;
  }

  if (vitals.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="py-8">
          <p className="text-center text-gray-600">No vitals recorded yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      {vitals.map((vital) => (
        <Card key={vital.id}>
          <CardContent className="pt-6">
            <div className="flex justify-between items-start mb-4">
              <p className="text-sm text-gray-600">
                {formatDateTime(vital.recordedAt)}
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {vital.bloodPressureSystolic && vital.bloodPressureDiastolic && (
                <div>
                  <p className="text-xs text-gray-600">Blood Pressure</p>
                  <p className="font-semibold">
                    {formatBloodPressure(
                      vital.bloodPressureSystolic,
                      vital.bloodPressureDiastolic
                    )}
                  </p>
                </div>
              )}
              {vital.temperature && (
                <div>
                  <p className="text-xs text-gray-600">Temperature</p>
                  <p className="font-semibold">
                    {formatTemperature(vital.temperature)}
                  </p>
                </div>
              )}
              {vital.pulse && (
                <div>
                  <p className="text-xs text-gray-600">Pulse</p>
                  <p className="font-semibold">{vital.pulse} bpm</p>
                </div>
              )}
              {vital.weight && (
                <div>
                  <p className="text-xs text-gray-600">Weight</p>
                  <p className="font-semibold">{vital.weight} kg</p>
                </div>
              )}
              {vital.bmi && (
                <div>
                  <p className="text-xs text-gray-600">BMI</p>
                  <p className="font-semibold">{vital.bmi}</p>
                </div>
              )}
              {vital.oxygenSaturation && (
                <div>
                  <p className="text-xs text-gray-600">SpO₂</p>
                  <p className="font-semibold">{vital.oxygenSaturation}%</p>
                </div>
              )}
            </div>
            {vital.notes && (
              <p className="text-sm text-gray-600 mt-3 border-t pt-3">
                <strong>Notes:</strong> {vital.notes}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
