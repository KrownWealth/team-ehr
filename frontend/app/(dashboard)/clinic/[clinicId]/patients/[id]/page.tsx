"use client";

import { Suspense, useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { ApiResponse, Patient } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, InfoIcon, UserPlus, Save, X } from "lucide-react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PatientOverview from "./_components/PatientOverview";
import PatientVitals from "./_components/PatientVitals";
import PatientConsultations from "./_components/PatientConsultations";
import PatientPrescriptions from "./_components/PatientPrescriptions";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

function PatientDetailsContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const patientId = params.id as string;
  const clinicId = params.clinicId as string;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const isEditMode = searchParams.get("edit") === "true";
  const [formData, setFormData] = useState<Partial<Patient>>({});
  const [allergyInput, setAllergyInput] = useState("");
  const [conditionInput, setConditionInput] = useState("");

  const { data, isLoading } = useQuery<ApiResponse<Patient>>({
    queryKey: ["patient", patientId],
    queryFn: async () => {
      const response = await apiClient.get(`/v1/patient/${patientId}`);
      return response.data;
    },
  });

  // Replace onSuccess with useEffect
  useEffect(() => {
    if (data?.data && isEditMode) {
      setFormData(data.data);
    }
  }, [data, isEditMode]);

  const updateMutation = useMutation({
    mutationFn: async (updateData: Partial<Patient>) => {
      const response = await apiClient.put(
        `/v1/patient/${patientId}`,
        updateData
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Patient updated successfully");
      queryClient.invalidateQueries({ queryKey: ["patient", patientId] });
      router.push(`/clinic/${clinicId}/patients/${patientId}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update patient");
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

  const handleChange = (field: keyof Patient, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    router.push(`/clinic/${clinicId}/patients/${patientId}`);
  };

  const handleAddAllergy = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && allergyInput.trim()) {
      e.preventDefault();
      const currentAllergies = formData.allergies || [];
      if (!currentAllergies.includes(allergyInput.trim())) {
        handleChange("allergies", [...currentAllergies, allergyInput.trim()]);
      }
      setAllergyInput("");
    }
  };

  const handleRemoveAllergy = (allergyToRemove: string) => {
    const currentAllergies = formData.allergies || [];
    handleChange(
      "allergies",
      currentAllergies.filter((a) => a !== allergyToRemove)
    );
  };

  const handleAddCondition = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && conditionInput.trim()) {
      e.preventDefault();
      const currentConditions = formData.chronicConditions || [];
      if (!currentConditions.includes(conditionInput.trim())) {
        handleChange("chronicConditions", [
          ...currentConditions,
          conditionInput.trim(),
        ]);
      }
      setConditionInput("");
    }
  };

  const handleRemoveCondition = (conditionToRemove: string) => {
    const currentConditions = formData.chronicConditions || [];
    handleChange(
      "chronicConditions",
      currentConditions.filter((c) => c !== conditionToRemove)
    );
  };

  if (isEditMode) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-start">
          <div className="gap-4">
            <button
              className="btn px-0"
              onClick={() =>
                router.push(`/clinic/${clinicId}/patients/${patientId}`)
              }
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            <br />
            <h1 className="text-2xl font-bold text-gray-900 mt-2">
              Edit Patient
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>First Name *</Label>
                  <Input
                    value={formData.firstName || ""}
                    onChange={(e) => handleChange("firstName", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input
                    value={formData.lastName || ""}
                    onChange={(e) => handleChange("lastName", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Gender *</Label>
                  <Select
                    value={formData.gender || ""}
                    onValueChange={(value) => handleChange("gender", value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date of Birth *</Label>
                  <Input
                    type="date"
                    value={
                      formData.birthDate
                        ? new Date(formData.birthDate)
                          .toISOString()
                          .split("T")[0]
                        : ""
                    }
                    onChange={(e) => handleChange("birthDate", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label>Blood Group</Label>
                <Select
                  value={formData.bloodGroup || ""}
                  onValueChange={(value) => handleChange("bloodGroup", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select blood group" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A+">A+</SelectItem>
                    <SelectItem value="A-">A-</SelectItem>
                    <SelectItem value="B+">B+</SelectItem>
                    <SelectItem value="B-">B-</SelectItem>
                    <SelectItem value="AB+">AB+</SelectItem>
                    <SelectItem value="AB-">AB-</SelectItem>
                    <SelectItem value="O+">O+</SelectItem>
                    <SelectItem value="O-">O-</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Phone *</Label>
                <Input
                  value={formData.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
              <div>
                <Label>Address *</Label>
                <Textarea
                  value={formData.addressLine || ""}
                  onChange={(e) => handleChange("addressLine", e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>City *</Label>
                  <Input
                    value={formData.city || ""}
                    onChange={(e) => handleChange("city", e.target.value)}
                  />
                </div>
                <div>
                  <Label>State *</Label>
                  <Input
                    value={formData.state || ""}
                    onChange={(e) => handleChange("state", e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Known Allergies</Label>
                <Input
                  placeholder="Type an allergy and press Enter"
                  value={allergyInput}
                  onChange={(e) => setAllergyInput(e.target.value)}
                  onKeyDown={handleAddAllergy}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.allergies?.map((allergy, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm"
                    >
                      {allergy}
                      <button
                        type="button"
                        onClick={() => handleRemoveAllergy(allergy)}
                        className="hover:bg-red-100 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <Label>Chronic Conditions</Label>
                <Input
                  placeholder="Type a condition and press Enter"
                  value={conditionInput}
                  onChange={(e) => setConditionInput(e.target.value)}
                  onKeyDown={handleAddCondition}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.chronicConditions?.map((condition, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm"
                    >
                      {condition}
                      <button
                        type="button"
                        onClick={() => handleRemoveCondition(condition)}
                        className="hover:bg-blue-100 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="gap-4">
          <button
            className="btn px-0"
            onClick={() => router.push(`/clinic/${clinicId}/patients`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>

          <br />

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
                <div className="flex gap-2 text-red-600 items-center mt-2">
                  <InfoIcon size={16} />
                  <p className="text-xs font-medium">
                    Allergies: {patient.allergies.join(", ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {["CLERK", "NURSE"].includes(user?.role!) && (
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/clinic/${clinicId}/queue?add=${patientId}`)
              }
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add to Queue
            </Button>
          )}
          {["ADMIN", "CLERK"].includes(user?.role!) && (
            <button
              className="btn btn-block"
              onClick={() =>
                router.push(
                  `/clinic/${clinicId}/patients/${patientId}?edit=true`
                )
              }
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Patient
            </button>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="p-2 h-fit">
          <TabsTrigger className="p-2 px-4" value="overview">
            Overview
          </TabsTrigger>
          <TabsTrigger className="p-2 px-4" value="vitals">
            Vitals History
          </TabsTrigger>
          <TabsTrigger className="p-2 px-4" value="consultations">
            Consultations
          </TabsTrigger>
          <TabsTrigger className="p-2 px-4" value="prescriptions">
            Prescriptions
          </TabsTrigger>
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

export default function PatientDetailsPage() {
  return (
    <Suspense fallback={<Skeleton className="h-screen w-full" />}>
      <PatientDetailsContent />
    </Suspense>
  );
}
