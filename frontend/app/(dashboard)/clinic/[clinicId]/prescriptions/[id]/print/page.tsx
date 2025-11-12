"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { ResponseSuccess, Prescription, Clinic } from "@/types";
import { useParams } from "next/navigation";
import { formatDate, calculateAge } from "@/lib/utils/formatters";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrintPrescriptionPage() {
  const params = useParams();
  const prescriptionId = params.id as string;

  // Fetch prescription
  const { data: prescriptionData } = useQuery<ResponseSuccess<Prescription>>({
    queryKey: ["prescription", prescriptionId],
    queryFn: async () => {
      const response = await apiClient.get(`/prescription/${prescriptionId}`);
      return response.data;
    },
  });

  // Fetch clinic data
  const { data: clinicData } = useQuery<ResponseSuccess<Clinic>>({
    queryKey: ["clinic"],
    queryFn: async () => {
      const response = await apiClient.get("/clinic/profile");
      return response.data;
    },
  });

  const prescription = prescriptionData?.data;
  const clinic = clinicData?.data;

  // Auto-print on load
  useEffect(() => {
    if (prescription && clinic) {
      // Small delay to ensure rendering is complete
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [prescription, clinic]);

  if (!prescription || !clinic) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading prescription...</p>
      </div>
    );
  }

  const patient = prescription.patient;
  const doctor = prescription.doctor;
  const age = calculateAge(patient.birthDate);

  return (
    <div className="min-h-screen bg-white">
      {/* Print Button (hidden when printing) */}
      <div className="print:hidden fixed top-4 right-4 z-50">
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Print
        </Button>
      </div>

      {/* Printable Prescription */}
      <div className="max-w-3xl mx-auto p-8 space-y-6">
        {/* Header */}
        <div className="border-b-2 border-gray-300 pb-6">
          <div className="flex justify-between items-start">
            <div>
              {clinic.logoUrl && (
                <img
                  src={clinic.logoUrl}
                  alt={clinic.name}
                  className="h-16 mb-2"
                />
              )}
              <h1 className="text-2xl font-bold text-gray-900">
                {clinic.name}
              </h1>
              <p className="text-sm text-gray-600">{clinic.address}</p>
              <p className="text-sm text-gray-600">
                {clinic.city}, {clinic.state}
              </p>
              <p className="text-sm text-gray-600">
                Tel: {clinic.phone} | Email: {clinic.email}
              </p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold">PRESCRIPTION</p>
              <p className="text-sm text-gray-600">
                Date: {formatDate(prescription.prescribedDate)}
              </p>
              <p className="text-xs text-gray-500 font-mono">
                Ref: {prescription.id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
          <div>
            <p className="text-xs text-gray-600 uppercase">Patient Name</p>
            <p className="font-semibold">
              {patient.firstName} {patient.lastName}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase">Patient ID</p>
            <p className="font-semibold font-mono">{patient.upi}</p>
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
        </div>

        {/* Allergies Warning */}
        {patient.allergies && patient.allergies.length > 0 && (
          <div className="bg-red-50 border-2 border-red-300 p-3 rounded">
            <p className="text-sm font-bold text-red-900">⚠️ ALLERGIES:</p>
            <p className="text-sm text-red-800">
              {patient.allergies.join(", ")}
            </p>
          </div>
        )}

        {/* Rx Symbol */}
        <div className="flex items-center gap-2 my-4">
          <span className="text-4xl font-serif">℞</span>
          <div className="flex-1 border-t-2 border-gray-300" />
        </div>

        {/* Medications */}
        <div className="space-y-4">
          {prescription.medications.map((med, index) => (
            <div key={index} className="border-l-4 border-green-500 pl-4 py-2">
              <p className="font-bold text-lg">
                {index + 1}. {med.drugName} {med.strength}
              </p>
              <div className="text-sm text-gray-700 space-y-1 mt-2">
                <p>
                  <span className="font-medium">Form:</span> {med.form}
                </p>
                <p>
                  <span className="font-medium">Dosage:</span> {med.frequency} (
                  {med.route})
                </p>
                <p>
                  <span className="font-medium">Duration:</span> {med.duration}{" "}
                  days
                </p>
                <p>
                  <span className="font-medium">Quantity:</span> {med.quantity}
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

        {/* Additional Notes */}
        {prescription.notes && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
            <p className="text-sm font-semibold text-gray-900 mb-1">
              Additional Notes:
            </p>
            <p className="text-sm text-gray-700">{prescription.notes}</p>
          </div>
        )}

        {/* Doctor's Signature */}
        <div className="mt-12 pt-6 border-t-2 border-gray-300">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm text-gray-600">Prescribed by:</p>
              <p className="text-lg font-bold">
                Dr. {doctor.firstName} {doctor.lastName}
              </p>
              {/* TODO: add these */}
              {/* {doctor.specialization && (
                <p className="text-sm text-gray-600">{doctor.specialization}</p>
              )}
              {doctor.licenseNumber && (
                <p className="text-xs text-gray-500">
                  License: {doctor.licenseNumber}
                </p>
              )} */}
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
            This is a computer-generated prescription and does not require a
            physical signature.
          </p>
          <p className="mt-1">
            For verification, contact {clinic.phone} or {clinic.email}
          </p>
        </div>
      </div>
    </div>
  );
}
