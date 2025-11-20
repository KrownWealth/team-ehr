"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Trash2,
  AlertTriangle,
  Save,
  FileText,
  Calendar,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { toast } from "sonner";
import { ApiResponse, Patient, Medication } from "@/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LabOrder {
  test: string;
  instructions?: string;
}

interface CurrentMedInput {
  drug: string;
  dosage: string;
  frequency: string;
  duration: number;
  instructions: string;
}

interface CurrentLabInput {
  test: string;
  instructions: string;
}

interface CreateConsultationData {
  patientId: string;
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  prescriptions?: Medication[];
  labOrders?: LabOrder[];
  followUpDate?: string;
}

export default function CreateConsultationPage() {
  const router = useRouter();
  const params = useParams();
  const clinicId = params.clinicId as string;
  const queryClient = useQueryClient();

  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // SOAP Notes
  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  // Prescriptions
  const [prescriptions, setPrescriptions] = useState<Medication[]>([]);
  const [currentMed, setCurrentMed] = useState<CurrentMedInput>({
    drug: "",
    dosage: "1 tablet",
    frequency: "BD",
    duration: 7,
    instructions: "Take after meals",
  });

  // Lab Orders
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [currentLab, setCurrentLab] = useState<CurrentLabInput>({
    test: "",
    instructions: "",
  });

  // Search patient
  const searchPatient = async () => {
    if (!patientSearch.trim()) {
      toast.error("Please enter patient ID or name");
      return;
    }

    try {
      const response = await apiClient.get<ApiResponse<Patient[]>>(
        `/v1/patient?search=${patientSearch}&limit=1`
      );
      if (response.data.data?.length === 1) {
        setSelectedPatient(response.data.data[0]);
      } else {
        toast.error("Patient not found");
      }
    } catch (error) {
      toast.error("Failed to find patient");
    }
  };

  // Check for drug allergies
  const checkAllergies = () => {
    if (!selectedPatient?.allergies) return [];

    return prescriptions
      .filter((med) =>
        selectedPatient.allergies?.some((allergy) =>
          med.drug.toLowerCase().includes(allergy.toLowerCase())
        )
      )
      .map((med) => med.drug);
  };

  const allergyWarnings = checkAllergies();

  // Add medication
  const addMedication = () => {
    if (!currentMed.drug || !currentMed.dosage) {
      toast.error("Please fill drug name and dosage");
      return;
    }

    // Check for allergy
    if (
      selectedPatient?.allergies?.some((allergy) =>
        currentMed.drug.toLowerCase().includes(allergy.toLowerCase())
      )
    ) {
      toast.error(
        `ALLERGY ALERT: Patient may be allergic to a component of ${currentMed.drug}!`,
        {
          duration: 5000,
        }
      );
      return;
    }

    setPrescriptions([
      ...prescriptions,
      {
        ...currentMed,
        duration: `${currentMed.duration} days`,
      },
    ]);

    setCurrentMed({
      drug: "",
      dosage: "1 tablet",
      frequency: "BD",
      duration: 7,
      instructions: "Take after meals",
    });

    toast.success("Medication added");
  };

  const removeMedication = (index: number) => {
    setPrescriptions(prescriptions.filter((_, i) => i !== index));
  };

  // Add lab order
  const addLabOrder = () => {
    if (!currentLab.test) {
      toast.error("Please enter test name");
      return;
    }

    setLabOrders([...labOrders, { ...currentLab }]);
    setCurrentLab({ test: "", instructions: "" });
    toast.success("Lab order added");
  };

  const removeLabOrder = (index: number) => {
    setLabOrders(labOrders.filter((_, i) => i !== index));
  };

  // Create consultation mutation
  const createConsultationMutation = useMutation({
    mutationFn: async (data: CreateConsultationData) => {
      const response = await apiClient.post("/v1/consultation", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Consultation created successfully!");
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      router.push(`/clinic/${clinicId}/consultations`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create consultation"
      );
    },
  });

  const handleSubmit = () => {
    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }

    if (!subjective || !objective || !assessment || !plan) {
      toast.error("Please fill all SOAP note fields");
      return;
    }

    const consultationData: CreateConsultationData = {
      patientId: selectedPatient.id,
      subjective,
      objective,
      assessment,
      plan,
      prescriptions: prescriptions.length > 0 ? prescriptions : undefined,
      labOrders: labOrders.length > 0 ? labOrders : undefined,
      followUpDate: followUpDate || undefined,
    };

    createConsultationMutation.mutate(consultationData);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 mt-4 pb-12">
      <div className="gap-4">
        <button
          className="btn px-0"
          onClick={() => router.push(`/clinic/${clinicId}/consultations`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        <br />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Consultation</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create a new consultation record for a patient
          </p>
        </div>
      </div>

      {/* Patient Selection */}
      {!selectedPatient && (
        <Card>
          <CardHeader>
            <CardTitle>Select Patient</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Enter patient ID or name"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchPatient()}
              />
              <button className="btn btn-block" onClick={searchPatient}>
                Search
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Patient Info */}
      {selectedPatient && (
        <Card className="bg-green-50/20 border-green-200/10">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </h3>
                <p className="text-sm text-gray-600">
                  ID: {selectedPatient.patientNumber} · {selectedPatient.gender}
                </p>
                {selectedPatient.allergies &&
                  selectedPatient.allergies.length > 0 && (
                    <div className="mt-2 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-red-600">
                          ALLERGIES:
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPatient.allergies.map((allergy, i) => (
                            <Badge
                              key={i}
                              variant="destructive"
                              className="text-xs px-2 py-1"
                            >
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                {selectedPatient.chronicConditions &&
                  selectedPatient.chronicConditions.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-orange-600">
                        Chronic Conditions:{" "}
                        {selectedPatient.chronicConditions.join(", ")}
                      </p>
                    </div>
                  )}
              </div>
              <button
                className="btn btn-outline"
                onClick={() => setSelectedPatient(null)}
              >
                Change Patient
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedPatient && (
        <>
          {/* SOAP Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                SOAP Notes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>
                  Subjective (Patient's Complaint){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="What is the patient complaining about? (e.g., Patient reports headache for 3 days...)"
                  value={subjective}
                  onChange={(e) => setSubjective(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Objective (Clinical Findings){" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Physical examination findings, vital signs, test results... (e.g., BP: 120/80, Temp: 37°C, No visible signs of infection...)"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Assessment (Diagnosis) <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Your medical assessment/diagnosis... (e.g., Acute tension headache, likely stress-related...)"
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Plan (Treatment Plan) <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  placeholder="Treatment plan and recommendations... (e.g., Prescribe pain relief, recommend rest, follow-up in 1 week...)"
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Follow-up Date (Optional)
                </Label>
                <Input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Prescriptions Section */}
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Drug Name</Label>
                <Input
                  placeholder="e.g., Paracetamol 500mg"
                  value={currentMed.drug}
                  onChange={(e) =>
                    setCurrentMed({ ...currentMed, drug: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Dosage</Label>
                  <Input
                    placeholder="e.g., 1 tablet"
                    value={currentMed.dosage}
                    onChange={(e) =>
                      setCurrentMed({ ...currentMed, dosage: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={currentMed.frequency}
                    onValueChange={(val) =>
                      setCurrentMed({ ...currentMed, frequency: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OD">OD (Once daily)</SelectItem>
                      <SelectItem value="BD">BD (Twice daily)</SelectItem>
                      <SelectItem value="TDS">TDS (Three times)</SelectItem>
                      <SelectItem value="QID">QID (Four times)</SelectItem>
                      <SelectItem value="PRN">PRN (As needed)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Duration (days)</Label>
                  <Input
                    type="number"
                    value={currentMed.duration}
                    onChange={(e) =>
                      setCurrentMed({
                        ...currentMed,
                        duration: parseInt(e.target.value) || 1,
                      })
                    }
                    min="1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Instructions</Label>
                <Input
                  placeholder="e.g., Take after meals"
                  value={currentMed.instructions}
                  onChange={(e) =>
                    setCurrentMed({
                      ...currentMed,
                      instructions: e.target.value,
                    })
                  }
                />
              </div>

              <button
                type="button"
                onClick={addMedication}
                className="btn btn-outline py-3 w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Medication
              </button>

              {prescriptions.length > 0 && (
                <div className="space-y-3 mt-4">
                  <p className="font-medium text-sm">
                    Added Medications ({prescriptions.length})
                  </p>
                  {prescriptions.map((med, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start p-4 border rounded-lg bg-gray-50"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{med.drug}</p>
                        <p className="text-sm text-gray-600">
                          {med.dosage} · {med.frequency} · {med.duration}
                        </p>
                        {med.instructions && (
                          <p className="text-sm text-gray-500 mt-1">
                            {med.instructions}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMedication(index)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lab Orders Section */}
          <Card>
            <CardHeader>
              <CardTitle>Lab Orders (Optional)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Test Name</Label>
                <Input
                  placeholder="e.g., Complete Blood Count (CBC)"
                  value={currentLab.test}
                  onChange={(e) =>
                    setCurrentLab({ ...currentLab, test: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Instructions (Optional)</Label>
                <Input
                  placeholder="e.g., Fasting required"
                  value={currentLab.instructions}
                  onChange={(e) =>
                    setCurrentLab({
                      ...currentLab,
                      instructions: e.target.value,
                    })
                  }
                />
              </div>

              <button
                type="button"
                onClick={addLabOrder}
                className="btn btn-outline py-3 w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Lab Order
              </button>

              {labOrders.length > 0 && (
                <div className="space-y-3 mt-4">
                  <p className="font-medium text-sm">
                    Added Lab Orders ({labOrders.length})
                  </p>
                  {labOrders.map((lab, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start p-4 border rounded-lg bg-gray-50"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{lab.test}</p>
                        {lab.instructions && (
                          <p className="text-sm text-gray-600">
                            {lab.instructions}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeLabOrder(index)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Allergy Warning */}
          {allergyWarnings.length > 0 && (
            <Card className="border-red-500 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <p className="font-semibold text-red-900">
                      ALLERGY WARNING
                    </p>
                    <p className="text-sm text-red-800">
                      Patient has documented allergies potentially conflicting
                      with: {allergyWarnings.join(", ")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <button
              className="btn btn-outline"
              onClick={() => router.push(`/clinic/${clinicId}/consultations`)}
            >
              Cancel
            </button>
            <button
              className="btn btn-block"
              onClick={handleSubmit}
              disabled={createConsultationMutation.isPending}
            >
              <Save className="mr-2 h-4 w-4" />
              {createConsultationMutation.isPending
                ? "Creating..."
                : "Create Consultation"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
