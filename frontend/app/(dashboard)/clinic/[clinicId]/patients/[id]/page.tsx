"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { ApiResponse, Patient } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, UserPlus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PatientOverview from "./_components/PatientOverview";
import PatientVitals from "./_components/PatientVitals";
import PatientConsultations from "./_components/PatientConsultations";
import PatientPrescriptions from "./_components/PatientPrescriptions";
import { Skeleton } from "@/components/ui/skeleton";

export default function PatientDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;
  const clinicId = params.clinicId as string;

  const { data, isLoading } = useQuery<ApiResponse<Patient>>({
    queryKey: ["patient", patientId],
    queryFn: async () => {
      const response = await apiClient.get(`/v1/patient/${patientId}`);
      return response.data;
    },
  });

  const patient = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-600">Patient not found</p>
      </div>
    );
  }

  const fullName = `${patient.firstName} ${patient.lastName}`;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/clinic/${clinicId}/patients`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>

          <div className="flex items-start gap-4">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
              <span className="text-2xl font-bold text-green-600">
                {patient.firstName[0]}
                {patient.lastName[0]}
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">{fullName}</h1>
              <p className="text-sm text-gray-600 mt-1">
                ID: {patient.patientNumber} · {patient.gender}
              </p>
              {patient.allergies && patient.allergies.length > 0 && (
                <p className="text-xs text-red-600 mt-1 font-medium">
                  ⚠️ Allergies: {patient.allergies.join(", ")}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/clinic/${clinicId}/queue?add=${patientId}`)
            }
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add to Queue
          </Button>
          <Button
            onClick={() =>
              router.push(`/clinic/${clinicId}/patients/${patientId}?edit=true`)
            }
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Patient
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="vitals">Vitals History</TabsTrigger>
          <TabsTrigger value="consultations">Consultations</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <PatientOverview patient={patient} />
        </TabsContent>

        <TabsContent value="vitals">
          <PatientVitals patientId={patientId} />
        </TabsContent>

        <TabsContent value="consultations">
          <PatientConsultations patientId={patientId} />
        </TabsContent>

        <TabsContent value="prescriptions">
          <PatientPrescriptions patientId={patientId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
