"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { ApiResponse } from "@/types";
import { formatDateTime } from "@/lib/utils/formatters";
import { Pill, Calendar, User, FileText } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Doctor {
  firstName: string;
  lastName: string;
  licenseId: string;
}

interface Prescription {
  drug: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionRecord {
  id: string;
  prescriptions: Prescription[];
  createdAt: string;
  doctor: Doctor;
}

export default function PatientPrescriptions({
  patientId,
}: {
  patientId: string;
}) {
  const { data, isLoading, error } = useQuery<
    ApiResponse<PrescriptionRecord[]>
  >({
    queryKey: ["prescriptions", "patient", patientId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/v1/prescription/patient/${patientId}`
      );
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 mt-6">
        {[1, 2].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="mt-6">
        <CardContent className="py-14">
          <p className="text-center text-red-600">
            Failed to load prescriptions
          </p>
        </CardContent>
      </Card>
    );
  }

  const prescriptions = data?.data || [];

  if (prescriptions.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="py-14">
          <div className="text-center">
            <Pill className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No prescriptions issued yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      {prescriptions.map((record) => (
        <Card key={record.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Prescription
                </CardTitle>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>
                    Dr. {record.doctor.firstName} {record.doctor.lastName}
                  </span>
                  {record.doctor.licenseId && (
                    <Badge variant="outline" className="text-xs">
                      {record.doctor.licenseId}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDateTime(record.createdAt)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Medications ({record.prescriptions.length})
              </p>
              {record.prescriptions.map((rx, idx) => (
                <div
                  key={idx}
                  className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border border-green-100"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-base">
                        {rx.drug}
                      </p>
                      <div className="mt-2 grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Dosage
                          </p>
                          <p className="text-gray-900">{rx.dosage}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Frequency
                          </p>
                          <p className="text-gray-900">{rx.frequency}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-medium">
                            Duration
                          </p>
                          <p className="text-gray-900">{rx.duration}</p>
                        </div>
                      </div>
                      {rx.instructions && (
                        <div className="mt-2 pt-2 border-t border-green-200">
                          <p className="text-xs text-gray-500 font-medium">
                            Instructions
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            {rx.instructions}
                          </p>
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="ml-2">
                      #{idx + 1}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
