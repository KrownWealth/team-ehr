"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { ApiResponse, Consultation, Clinic } from "@/types";
import { useParams, useRouter } from "next/navigation";
import {
  formatDate,
  formatDateTime,
  calculateAge,
} from "@/lib/utils/formatters";
import Loader from "@/components/shared/Loader";

export default function PrintConsultationPage() {
  const params = useParams();
  const router = useRouter();
  const consultationId = params.id as string;
  const [isPrinting, setIsPrinting] = useState(false);

  const { data: consultationData } = useQuery<ApiResponse<Consultation>>({
    queryKey: ["consultation", consultationId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/v1/consultation/${consultationId}`
      );
      return response.data;
    },
  });

  const { data: clinicData } = useQuery<ApiResponse<Clinic>>({
    queryKey: ["clinic"],
    queryFn: async () => {
      const response = await apiClient.get("/v1/staff/me");
      return response.data;
    },
  });

  const consultation = consultationData?.data;
  const clinic = clinicData?.data;

  useEffect(() => {
    if (consultation && clinic && !isPrinting) {
      const timer = setTimeout(() => {
        setIsPrinting(true);
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [consultation, clinic, isPrinting]);

  useEffect(() => {
    const handleAfterPrint = () => {
      router.back();
    };

    window.addEventListener("afterprint", handleAfterPrint);
    return () => window.removeEventListener("afterprint", handleAfterPrint);
  }, [router]);

  if (!consultation || !clinic) {
    return <Loader />;
  }

  const patient = consultation.patient;
  const doctor = consultation.doctor;

  if (!patient || !doctor) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Incomplete consultation data.</p>
      </div>
    );
  }

  const age = calculateAge(patient.birthDate);
  const assessmentParts = consultation.assessment.split("\n\nDiagnosis: ");
  const mainAssessment = assessmentParts[0];
  const diagnosisList = assessmentParts[1]
    ? assessmentParts[1].split(", ")
    : [];

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 0.5cm;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="min-h-screen bg-white">
        <div className="max-w-3xl mx-auto p-8 space-y-6">
          {/* Header */}
          <div className="border-b-2 border-gray-300 pb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {clinic.name}
                </h1>
                <p className="text-sm text-gray-600">{clinic.address}</p>
                <p className="text-sm text-gray-600">
                  {clinic.city} {clinic.state && `, ${clinic.state}`}
                </p>
                <p className="text-sm text-gray-600">
                  Tel: {clinic.phone} | Email: {clinic.email}
                </p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold">CONSULTATION RECORD</p>
                <p className="text-sm text-gray-600">
                  Date: {formatDateTime(consultation.createdAt)}
                </p>
                <p className="text-xs text-gray-500 font-mono">
                  Ref: {consultation.id.slice(0, 8).toUpperCase()}
                </p>
              </div>
            </div>
          </div>

          {/* Patient Info */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
            <div>
              <p className="text-xs text-gray-600 uppercase">Patient Name</p>
              <p className="font-semibold">
                {patient.firstName} {patient.lastName}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase">Patient ID</p>
              <p className="font-semibold font-mono">{patient.patientNumber}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase">Age / Gender</p>
              <p className="font-semibold">
                {age} years / {patient.gender}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 uppercase">Phone</p>
              <p className="font-semibold">{patient.phone}</p>
            </div>
            {patient.bloodGroup && (
              <div>
                <p className="text-xs text-gray-600 uppercase">Blood Group</p>
                <p className="font-semibold">{patient.bloodGroup}</p>
              </div>
            )}
          </div>

          {/* Allergies & Chronic Conditions */}
          {((patient.allergies && patient.allergies.length > 0) ||
            (patient.chronicConditions &&
              patient.chronicConditions.length > 0)) && (
            <div className="bg-red-50 border-2 border-red-300 p-3 rounded space-y-2">
              {patient.allergies && patient.allergies.length > 0 && (
                <div>
                  <p className="text-sm font-bold text-red-900">ALLERGIES:</p>
                  <p className="text-sm text-red-800">
                    {patient.allergies.join(", ")}
                  </p>
                </div>
              )}
              {patient.chronicConditions &&
                patient.chronicConditions.length > 0 && (
                  <div>
                    <p className="text-sm font-bold text-red-900">
                      CHRONIC CONDITIONS:
                    </p>
                    <p className="text-sm text-red-800">
                      {patient.chronicConditions.join(", ")}
                    </p>
                  </div>
                )}
            </div>
          )}

          {/* SOAP Notes */}
          <div className="space-y-4">
            {/* Subjective */}
            <div className="border-l-4 border-blue-500 pl-4 py-2">
              <p className="font-bold text-lg mb-2">
                S - Subjective (Chief Complaint)
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {consultation.subjective}
              </p>
            </div>

            {/* Objective */}
            {consultation.objective && (
              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <p className="font-bold text-lg mb-2">
                  O - Objective (Physical Examination)
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {consultation.objective}
                </p>
              </div>
            )}

            {/* Assessment */}
            <div className="border-l-4 border-orange-500 pl-4 py-2">
              <p className="font-bold text-lg mb-2">
                A - Assessment (Diagnosis)
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap mb-2">
                {mainAssessment}
              </p>
              {diagnosisList.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-semibold text-gray-700 mb-1">
                    Diagnosis Codes:
                  </p>
                  <p className="text-sm text-gray-600">
                    {diagnosisList.join(", ")}
                  </p>
                </div>
              )}
            </div>

            {/* Plan */}
            <div className="border-l-4 border-green-500 pl-4 py-2">
              <p className="font-bold text-lg mb-2">
                P - Plan (Treatment Plan)
              </p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {consultation.plan}
              </p>
            </div>
          </div>

          {/* Prescriptions */}
          {consultation.prescriptions &&
            Array.isArray(consultation.prescriptions) &&
            consultation.prescriptions.length > 0 && (
              <div>
                <div className="flex items-center gap-2 my-4">
                  <span className="text-4xl font-serif">℞</span>
                  <div className="flex-1 border-t-2 border-gray-300" />
                </div>

                <div className="space-y-4">
                  {consultation.prescriptions.map((med: any, index: number) => (
                    <div
                      key={index}
                      className="border-l-4 border-green-500 pl-4 py-2"
                    >
                      <p className="font-bold text-lg">
                        {index + 1}. {med.drug}
                      </p>
                      <div className="text-sm text-gray-700 space-y-1 mt-2">
                        <p>
                          <span className="font-medium">Dosage:</span>{" "}
                          {med.dosage}
                        </p>
                        <p>
                          <span className="font-medium">Frequency:</span>{" "}
                          {med.frequency}
                        </p>
                        <p>
                          <span className="font-medium">Duration:</span>{" "}
                          {med.duration}
                        </p>
                        {med.instructions && (
                          <p>
                            <span className="font-medium">Instructions:</span>{" "}
                            {med.instructions}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Lab Orders */}
          {consultation.labOrders &&
            Array.isArray(consultation.labOrders) &&
            consultation.labOrders.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded">
                <p className="text-sm font-semibold text-gray-900 mb-2">
                  Laboratory Orders:
                </p>
                <div className="space-y-1">
                  {consultation.labOrders.map((lab: any, index: number) => (
                    <div key={index} className="text-sm text-gray-700">
                      • {lab.test || lab}
                      {lab.urgency && (
                        <span className="ml-2 text-xs text-blue-600 font-medium">
                          ({lab.urgency})
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Follow-up */}
          {consultation.followUpDate && (
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
              <p className="text-sm font-semibold text-gray-900 mb-1">
                Follow-up Appointment:
              </p>
              <p className="text-sm text-gray-700">
                {formatDateTime(consultation.followUpDate)}
              </p>
            </div>
          )}

          {/* Doctor Signature */}
          <div className="mt-12 pt-6 border-t-2 border-gray-300">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm text-gray-600">Consulting Physician:</p>
                <p className="text-lg font-bold">
                  Dr. {doctor.firstName} {doctor.lastName}
                </p>
                {doctor.licenseId && (
                  <p className="text-xs text-gray-500">
                    License: {doctor.licenseId}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="border-t-2 border-gray-400 w-48 pt-2">
                  <p className="text-xs text-gray-600">Doctor's Signature</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-gray-500 mt-8 pt-4 border-t">
            <p>
              This is a computer-generated consultation record and does not
              require a physical signature.
            </p>
            <p className="mt-1">
              For verification, contact {clinic.phone} or {clinic.email}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
