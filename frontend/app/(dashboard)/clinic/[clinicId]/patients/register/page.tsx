"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import PersonalInfoStep from "./_components/PersonalInfoStep";
import MedicalInfoStep from "./_components/MedicalInfoStep";
import EmergencyContactStep from "./_components/EmergencyContactStep";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { toast } from "sonner";
import { ResponseSuccess } from "@/types";

const STEPS = [
  { id: 1, name: "Personal Information", description: "Basic patient details" },
  { id: 2, name: "Medical Information", description: "Health history & allergies" },
  { id: 3, name: "Emergency Contact", description: "Emergency contact details" },
];

export default function RegisterPatientPage() {
  const router = useRouter();
  const params = useParams();
  const clinicId = params.clinicId as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    // Step 1
    nationalId: "",
    firstName: "",
    lastName: "",
    otherNames: "",
    gender: "",
    birthDate: "",
    phone: "",
    email: "",
    addressLine: "",
    city: "",
    state: "",
    photoUrl: "",

    // Step 2
    bloodGroup: "",
    allergies: [],
    chronicConditions: [],

    // Step 3
    emergencyContact: "",
    emergencyPhone: "",
    emergencyRelation: "",
  });

  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiClient.post<ResponseSuccess<any>>(
        "/patient/register",
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Patient registered successfully!");
      router.push(`/${clinicId}/patients/${data.data.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Registration failed");
    },
  });

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Submit form
      registerMutation.mutate(formData);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const updateFormData = (data: any) => {
    setFormData({ ...formData, ...data });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Register New Patient</h1>
          <p className="text-sm text-gray-600 mt-1">
            Complete all steps to register a new patient
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  currentStep >= step.id
                    ? "bg-blue-600 border-blue-600 text-white"
                    : "border-gray-300 text-gray-500"
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.id
                )}
              </div>
              <div className="text-center mt-2">
                <p
                  className={`text-sm font-medium ${
                    currentStep >= step.id ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {step.name}
                </p>
                <p className="text-xs text-gray-500">{step.description}</p>
              </div>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-4 transition-colors ${
                  currentStep > step.id ? "bg-blue-600" : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].name}</CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {currentStep === 1 && (
            <PersonalInfoStep
              data={formData}
              onChange={updateFormData}
            />
          )}
          {currentStep === 2 && (
            <MedicalInfoStep
              data={formData}
              onChange={updateFormData}
            />
          )}
          {currentStep === 3 && (
            <EmergencyContactStep
              data={formData}
              onChange={updateFormData}
            />
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? "Cancel" : "Previous"}
        </Button>
        <Button onClick={handleNext} disabled={registerMutation.isPending}>
          {registerMutation.isPending ? (
            "Registering..."
          ) : currentStep === 3 ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Register Patient
            </>
          ) : (
            <>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}