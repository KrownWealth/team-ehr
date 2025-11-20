"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, FileText, Printer } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { ApiResponse, Consultation } from "@/types";
import { calculateAge, formatDateTime } from "@/lib/utils/formatters";
import Loader from "@/components/shared/Loader";

export default function ConsultationDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const consultationId = params.consultationId as string;
  const clinicId = params.clinicId as string;

  const {
    data: consultationData,
    isLoading,
    error,
  } = useQuery<ApiResponse<Consultation>>({
    queryKey: ["consultation", consultationId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/v1/consultation/${consultationId}`
      );
      return response.data;
    },
  });

  if (isLoading) {
    return <Loader />;
  }

  if (error || !consultationData?.data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            Failed to load consultation details
          </p>
          <Button
            onClick={() => router.push(`/clinic/${clinicId}/consultations`)}
          >
            Back to Consultations
          </Button>
        </div>
      </div>
    );
  }

  const consultation = consultationData.data;
  const patient = consultation.patient;
  const doctor = consultation.doctor;

  if (!patient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Patient data not found</p>
          <Button
            onClick={() => router.push(`/clinic/${clinicId}/consultations`)}
          >
            Back to Consultations
          </Button>
        </div>
      </div>
    );
  }

  const age = calculateAge(patient.birthDate);
  const fullName = `${patient.firstName} ${patient.lastName}`;

  const assessmentParts = consultation.assessment.split("\n\nDiagnosis: ");
  const mainAssessment = assessmentParts[0];
  const diagnosisList = assessmentParts[1]
    ? assessmentParts[1].split(", ")
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="gap-4">
          <button
            className="btn px-0"
            onClick={() => router.push(`/clinic/${clinicId}/consultations`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Consultations
          </button>
          <br />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Consultation Details
            </h1>
            <p className="text-sm text-gray-600">
              {formatDateTime(consultation.createdAt)}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-outline"
            onClick={() =>
              window.open(`/print/consultation/${consultation.id}`, "_blank")
            }
          >
            <Printer className="h-4 w-4 mr-2" />
            Print
          </button>
          <button
            className="btn btn-outline"
            onClick={() =>
              router.push(
                `/clinic/${clinicId}/patients/${consultation.patientId}`
              )
            }
          >
            <FileText className="h-4 w-4 mr-2" />
            Patient Records
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Patient & Doctor Info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Patient Info */}
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-xl">Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="py-0! space-y-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {fullName}
                </p>
                <p className="text-xs text-gray-600">
                  {patient.gender} · {age} years
                </p>
                <p className="text-xs text-gray-600">
                  UPI: {patient.patientNumber}
                </p>
              </div>

              {patient.bloodGroup && (
                <div>
                  <p className="text-xs text-gray-600">Blood Group</p>
                  <Badge variant="outline">{patient.bloodGroup}</Badge>
                </div>
              )}

              {patient.allergies && patient.allergies.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Allergies</p>
                  <div className="flex flex-wrap gap-1">
                    {patient.allergies.map((allergy, i) => (
                      <Badge key={i} variant="destructive" className="text-xs">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {patient.chronicConditions &&
                patient.chronicConditions.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">
                      Chronic Conditions
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {patient.chronicConditions.map((condition, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Doctor Info */}
          {doctor && (
            <Card className="gap-3">
              <CardHeader>
                <CardTitle className="text-xl">Consulting Doctor</CardTitle>
              </CardHeader>
              <CardContent className="py-0! space-y-2">
                <p className="font-medium">
                  Dr. {doctor.firstName} {doctor.lastName}
                </p>
                {doctor.licenseId && (
                  <p className="text-xs text-gray-600">
                    License: {doctor.licenseId}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Follow-up */}
          {consultation.followUpDate && (
            <Card className="gap-3">
              <CardHeader>
                <CardTitle className="text-xl">Follow-up</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">
                  {formatDateTime(consultation.followUpDate)}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right - SOAP Notes */}
        <div className="lg:col-span-2 space-y-4">
          {/* Subjective */}
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-xl">
                S - Subjective (Chief Complaint)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {consultation.subjective}
              </p>
            </CardContent>
          </Card>

          {/* Objective */}
          {consultation.objective && (
            <Card className="gap-3">
              <CardHeader>
                <CardTitle className="text-xl">
                  O - Objective (Physical Exam)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {consultation.objective}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Assessment */}
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-xl">
                A - Assessment (Diagnosis)
              </CardTitle>
            </CardHeader>
            <CardContent className="py-0! space-y-3">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {mainAssessment}
              </p>

              {diagnosisList.length > 0 && (
                <div>
                  <p className="text-xs text-gray-600 mb-2 font-medium">
                    Diagnosis Codes:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {diagnosisList.map((diag, index) => (
                      <Badge key={index} variant="secondary">
                        {diag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plan */}
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-xl">P - Plan (Treatment)</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {consultation.plan}
              </p>
            </CardContent>
          </Card>

          {/* Prescriptions */}
          {consultation.prescriptions &&
            Array.isArray(consultation.prescriptions) &&
            consultation.prescriptions.length > 0 && (
              <Card className="gap-3">
                <CardHeader>
                  <CardTitle className="text-xl">Prescriptions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {consultation.prescriptions.map(
                      (med: any, index: number) => (
                        <div
                          key={index}
                          className="border-l-4 border-blue-500 pl-3 py-2"
                        >
                          <p className="font-medium text-sm">{med.drug}</p>
                          <p className="text-xs text-gray-600">
                            {med.dosage} - {med.frequency}
                          </p>
                          <p className="text-xs text-gray-600">
                            Duration: {med.duration}
                          </p>
                          {med.instructions && (
                            <p className="text-xs text-gray-500 mt-1">
                              {med.instructions}
                            </p>
                          )}
                        </div>
                      )
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

          {/* Lab Orders */}
          {consultation.labOrders &&
            Array.isArray(consultation.labOrders) &&
            consultation.labOrders.length > 0 && (
              <Card className="gap-3">
                <CardHeader>
                  <CardTitle className="text-xl">Laboratory Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {consultation.labOrders.map((lab: any, index: number) => (
                      <div key={index} className="flex items-start gap-2">
                        <Badge variant="outline" className="text-xs">
                          {lab.test || lab}
                        </Badge>
                        {lab.urgency && (
                          <Badge variant="secondary" className="text-xs">
                            {lab.urgency}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
        </div>
      </div>
    </div>
  );
}
