"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  MapPin,
  BarChart,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { toast } from "sonner";
import { OnboardClinicData, OnboardingStatus } from "@/types";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth-store";
import { getErrorMessage } from "@/lib/helper";

const STEPS = [
  { id: 1, name: "Clinic Info", icon: Building2 },
  { id: 2, name: "Location Details", icon: MapPin },
  { id: 3, name: "Capacity & Finish", icon: BarChart },
];

const CLINIC_TYPES = [
  "General Practice",
  "Specialty Clinic",
  "Diagnostic Center",
  "Maternity Hospital",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { setOnboardingStatus } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<OnboardClinicData>>({
    name: "",
    type: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    lga: "",
    numberOfDoctors: 1,
    averageDailyPatients: 20,
  });

  const onboardMutation = useMutation({
    mutationFn: async (data: OnboardClinicData) => {
      const response = await apiClient.post("/v1/clinic/onboard", data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success("Clinic setup complete! Redirecting to dashboard.");
      setOnboardingStatus(OnboardingStatus.COMPLETED, data.data.id);
      router.replace(`/clinic/${data.data.id}/dashboard`);
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Clinic onboarding failed."));
    },
  });

  const updateFormData = (data: Partial<OnboardClinicData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (
          !formData.name ||
          !formData.type ||
          !formData.email ||
          !formData.phone
        ) {
          toast.error("Please fill in all required clinic info.");
          return false;
        }
        return true;
      case 2:
        if (
          !formData.address ||
          !formData.city ||
          !formData.state ||
          !formData.lga
        ) {
          toast.error("Please fill in all required location details.");
          return false;
        }
        return true;
      case 3:
        if (!formData.numberOfDoctors || !formData.averageDailyPatients) {
          toast.error("Please fill in capacity details.");
          return false;
        }
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        // Final submission
        onboardMutation.mutate(formData as OnboardClinicData);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // --- Step Components ---

  const Step1 = (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
      <div className="space-y-3">
        <Label htmlFor="name">Clinic Name *</Label>
        <Input
          id="name"
          className="h-12"
          placeholder="e.g., City General Hospital"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          required
        />
      </div>
      <div className="space-y-3">
        <Label htmlFor="type">Clinic Type *</Label>
        <Select
          value={formData.type}
          onValueChange={(val) => updateFormData({ type: val })}
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Clinic Type" />
          </SelectTrigger>
          <SelectContent>
            {CLINIC_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            className="h-12"
            placeholder="contact@clinic.com"
            value={formData.email}
            onChange={(e) => updateFormData({ email: e.target.value })}
            required
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="phone">Phone *</Label>
          <Input
            id="phone"
            type="tel"
            className="h-12"
            placeholder="08012345678"
            value={formData.phone}
            onChange={(e) => updateFormData({ phone: e.target.value })}
            required
          />
        </div>
      </div>
    </div>
  );

  const Step2 = (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Location Details</h3>
      <div className="space-y-3">
        <Label htmlFor="address">Full Address *</Label>
        <Textarea
          id="address"
          className="h-12"
          placeholder="Street name and number"
          value={formData.address}
          onChange={(e) => updateFormData({ address: e.target.value })}
          required
        />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-3">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            className="h-12"
            placeholder="e.g., Lagos"
            value={formData.city}
            onChange={(e) => updateFormData({ city: e.target.value })}
            required
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            className="h-12"
            placeholder="e.g., Lagos State"
            value={formData.state}
            onChange={(e) => updateFormData({ state: e.target.value })}
            required
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="lga">LGA *</Label>
          <Input
            id="lga"
            className="h-12"
            placeholder="e.g., Ikeja"
            value={formData.lga}
            onChange={(e) => updateFormData({ lga: e.target.value })}
            required
          />
        </div>
      </div>
    </div>
  );

  const Step3 = (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-gray-900">Capacity Metrics</h3>
      <p className="text-sm text-gray-600">
        These help us optimize your initial setup.
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <Label htmlFor="numberOfDoctors">Number of Doctors</Label>
          <Input
            id="numberOfDoctors"
            className="h-12"
            type="number"
            placeholder="e.g., 5"
            value={formData.numberOfDoctors}
            onChange={(e) =>
              updateFormData({ numberOfDoctors: parseInt(e.target.value) || 0 })
            }
            min="1"
          />
        </div>
        <div className="space-y-3">
          <Label htmlFor="averageDailyPatients">Avg. Daily Patients</Label>
          <Input
            id="averageDailyPatients"
            type="number"
            placeholder="e.g., 50"
            className="h-12"
            value={formData.averageDailyPatients}
            onChange={(e) =>
              updateFormData({
                averageDailyPatients: parseInt(e.target.value) || 0,
              })
            }
            min="0"
          />
        </div>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <p className="text-sm text-green-800 font-medium">
          Once submitted, you will be directed to your dashboard. This completes
          the primary setup.
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12 px-5 py-14">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Clinic Onboarding</h1>
        <p className="text-gray-600 mt-2 text-base">
          Just a few steps to set up your clinic profile.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-between px-4">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
                    isActive
                      ? "bg-green-600 text-white shadow-lg shadow-green-200"
                      : isCompleted
                      ? "bg-green-600 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isActive || isCompleted ? "text-gray-900" : "text-gray-400"
                  }`}
                >
                  {step.name}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${
                    isCompleted ? "bg-green-600" : "bg-gray-200"
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Form Card */}
      <Card className="border-gray-200 shadow-sm rounded-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-gray-900">
            Step {currentStep}: {STEPS[currentStep - 1].name}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <div className="animate-in fade-in duration-300 min-h-[300px]">
            {currentStep === 1 && Step1}
            {currentStep === 2 && Step2}
            {currentStep === 3 && Step3}
          </div>

          {/* Navigation */}
          <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || onboardMutation.isPending}
              className="flex-1 h-12 text-[15px]"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={onboardMutation.isPending}
              className="flex-1 h-12 text-[15px]"
            >
              {onboardMutation.isPending ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processing...
                </>
              ) : currentStep === 3 ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Complete Setup
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
