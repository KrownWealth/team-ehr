"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Check, User, Heart, Phone } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import PersonalInfoStep from "./_components/PersonalInfoStep";
import MedicalInfoStep from "./_components/MedicalInfoStep";
import EmergencyContactStep from "./_components/EmergencyContactStep";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { toast } from "sonner";
import { ApiResponse, RegisterPatientData, Gender, BloodGroup } from "@/types";
import { getErrorMessage } from "@/lib/helper";

const STEPS = [
  { id: 1, name: "Personal Info", icon: User },
  { id: 2, name: "Medical Info", icon: Heart },
  { id: 3, name: "Emergency Contact", icon: Phone },
];

type PatientFormData = Partial<RegisterPatientData> & {
  emergencyContact?: string;
  emergencyPhone?: string;
  emergencyRelation?: string;
  addressLine: string;
  city: string;
  state: string;
};

export default function RegisterPatientPage() {
  const router = useRouter();
  const params = useParams();
  const clinicId = params.clinicId as string;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: "",
    lastName: "",
    birthDate: "",
    gender: undefined,
    phone: "",
    email: "",
    bloodGroup: undefined,
    allergies: [],
    chronicConditions: [],
    emergencyContact: "",
    emergencyPhone: "",
    emergencyRelation: "",

    addressLine: "",
    city: "",
    state: "",
  });

  const registerMutation = useMutation({
    mutationFn: async (data: PatientFormData) => {
      const response = await apiClient.post<ApiResponse<any>>(
        "/v1/patient/register",
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Patient registered successfully!");
      router.push(`/clinic/${clinicId}/patients/${data.data.id}`);
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Registration failed"));
    },
  });

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
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

  const updateFormData = (data: Partial<PatientFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  return (
    <div className="space-y-8 w-full max-w-3xl mx-auto pb-12">
      <div className="space-y-4 justify-center flex flex-col">
        <Button
          variant="ghost"
          size="sm"
          className="lg:mx-auto text-center justify-start lg:justify-center"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div className="text-start lg:text-center">
          <h1 className="text-2xl lg:text-4xl font-bold text-gray-900">
            Register New Patient
          </h1>
          <p className="text-gray-600 mt-3 text-[15px]">
            Complete all steps to register a new patient
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-between px-4">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${isActive
                    ? "bg-green-600 text-white scale-110"
                    : isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                    }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span
                  className={`text-xs lg:text-sm font-medium ${isActive || isCompleted ? "text-gray-900" : "text-gray-400"
                    }`}
                >
                  {step.name}
                </span>
              </div> {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-1 mx-2 rounded transition-all ${isCompleted ? "bg-green-500" : "bg-gray-200"
                    }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      <Card className="border-gray-200 shadow-sm rounded-2xl">
        <CardContent className="p-8">
          <div className="animate-in fade-in duration-300">
            {currentStep === 1 && (
              <PersonalInfoStep data={formData} onChange={updateFormData} />
            )}
            {currentStep === 2 && (
              <MedicalInfoStep data={formData} onChange={updateFormData} />
            )}
            {currentStep === 3 && (
              <EmergencyContactStep data={formData} onChange={updateFormData} />
            )}
          </div>

          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-12 text-[15px]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {currentStep === 1 ? "Cancel" : "Previous"}
            </Button>
            <Button
              onClick={handleNext}
              disabled={registerMutation.isPending}
              className="flex-1 h-12 text-[15px]"
            >
              {registerMutation.isPending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Registering...
                </>
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
        </CardContent>
      </Card>
    </div>
  );
}
