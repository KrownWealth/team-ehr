"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { ApiResponse } from "@/types";
import { formatDateTime } from "@/lib/utils/formatters";
import { Stethoscope, Calendar, User, FileText, Pill } from "lucide-react";
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

interface Consultation {
  id: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  prescriptions: Prescription[];
  labOrders: {
    test: string;
    instructions: string;
  }[];
  followUpDate: string | null;
  createdAt: string;
  doctor: Doctor;
}

interface PaginatedResponse {
  data: Consultation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export default function PatientConsultations({
  patientId,
}: {
  patientId: string;
}) {
  const { data, isLoading, error } = useQuery<ApiResponse<Consultation[]>>({
    queryKey: ["consultations", "patient", patientId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/v1/consultation/patient/${patientId}`
      );
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4 mt-6">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-32 w-full" />
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
            Failed to load consultations
          </p>
        </CardContent>
      </Card>
    );
  }

  const consultations = data?.data || [];

  if (consultations.length === 0) {
    return (
      <Card className="mt-6">
        <CardContent className="py-14">
          <div className="text-center">
            <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No consultations recorded yet</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4 mt-6">
      {consultations.map((consultation) => (
        <Card key={consultation.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Consultation
                </CardTitle>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>
                    Dr. {consultation.doctor.firstName}{" "}
                    {consultation.doctor.lastName}
                  </span>
                  {consultation.doctor.licenseId && (
                    <Badge variant="outline" className="text-xs">
                      {consultation.doctor.licenseId}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-right text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {formatDateTime(consultation.createdAt)}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* SOAP Notes */}
            <div className="grid gap-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                  Subjective (Chief Complaint)
                </p>
                <p className="text-sm">{consultation.subjective}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                  Objective (Findings)
                </p>
                <p className="text-sm">{consultation.objective}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                  Assessment (Diagnosis)
                </p>
                <p className="text-sm font-medium text-primary">
                  {consultation.assessment}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                  Plan (Treatment)
                </p>
                <p className="text-sm">{consultation.plan}</p>
              </div>
            </div>

            {/* Prescriptions */}
            {consultation.prescriptions &&
              consultation.prescriptions.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                    <Pill className="h-4 w-4" />
                    Prescriptions ({consultation.prescriptions.length})
                  </p>
                  <div className="space-y-2">
                    {consultation.prescriptions.map((rx, idx) => (
                      <div
                        key={idx}
                        className="bg-gray-50 p-3 rounded-lg text-sm"
                      >
                        <p className="font-semibold text-gray-900">{rx.drug}</p>
                        <p className="text-gray-600">
                          <span className="font-medium">Dosage:</span>{" "}
                          {rx.dosage} •{" "}
                          <span className="font-medium">Frequency:</span>{" "}
                          {rx.frequency} •{" "}
                          <span className="font-medium">Duration:</span>{" "}
                          {rx.duration}
                        </p>
                        {rx.instructions && (
                          <p className="text-gray-500 text-xs mt-1">
                            <span className="font-medium">Instructions:</span>{" "}
                            {rx.instructions}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Lab Orders */}
            {consultation.labOrders && consultation.labOrders.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Lab Orders
                </p>
                <div className="flex flex-wrap gap-2">
                  {consultation.labOrders.map((lab, idx) => (
                    <Badge key={idx} variant="secondary">
                      {lab.test}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Follow-up */}
            {consultation.followUpDate && (
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">
                  Follow-up Date
                </p>
                <p className="text-sm text-gray-900">
                  {formatDateTime(consultation.followUpDate)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
