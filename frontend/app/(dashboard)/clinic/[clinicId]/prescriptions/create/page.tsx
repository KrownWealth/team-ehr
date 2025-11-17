"use client";

import { useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2, AlertTriangle, Save } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { toast } from "sonner";
import { ResponseSuccess, Patient, Medication } from "@/types";

export default function CreatePrescriptionPage() {
  const router = useRouter();
  const params = useParams();
  const clinicId = params.clinicId as string;
  const queryClient = useQueryClient();

  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [notes, setNotes] = useState("");
  const [currentMed, setCurrentMed] = useState<Medication>({
    drugName: "",
    strength: "",
    form: "Tablet",
    frequency: "BD",
    route: "Oral",
    duration: 7,
    quantity: 14,
    instructions: "",
  });

  // Search patient
  const searchPatient = async () => {
    if (!patientSearch.trim()) {
      toast.error("Please enter patient ID or name");
      return;
    }

    try {
      const response = await apiClient.get<ResponseSuccess<Patient[]>>(
        `/patient?search=${patientSearch}&limit=1`
      );
      if (response.data.data.length > 0) {
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

    return medications
      .filter((med) =>
        selectedPatient.allergies?.some((allergy) =>
          med.drugName.toLowerCase().includes(allergy.toLowerCase())
        )
      )
      .map((med) => med.drugName);
  };

  const allergyWarnings = checkAllergies();

  // Add medication to list
  const addMedication = () => {
    if (!currentMed.drugName || !currentMed.strength) {
      toast.error("Please fill drug name and strength");
      return;
    }

    // Check for allergy
    if (
      selectedPatient?.allergies?.some((allergy) =>
        currentMed.drugName.toLowerCase().includes(allergy.toLowerCase())
      )
    ) {
      toast.error(
        `⚠️ ALLERGY ALERT: Patient is allergic to ${currentMed.drugName}!`,
        {
          duration: 5000,
        }
      );
      return;
    }

    setMedications([...medications, { ...currentMed }]);

    // Reset current medication form
    setCurrentMed({
      drugName: "",
      strength: "",
      form: "Tablet",
      frequency: "BD",
      route: "Oral",
      duration: 7,
      quantity: 14,
      instructions: "",
    });

    toast.success("Medication added");
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  // Save prescription mutation
  const savePrescriptionMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiClient.post("/prescription", data);
    },
    onSuccess: () => {
      toast.success("Prescription created successfully!");
      queryClient.invalidateQueries({ queryKey: ["prescriptions"] });
      router.push(`/clinic/${clinicId}/prescriptions`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to create prescription"
      );
    },
  });

  const handleSubmit = () => {
    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }

    if (medications.length === 0) {
      toast.error("Please add at least one medication");
      return;
    }

    savePrescriptionMutation.mutate({
      patientId: selectedPatient.id,
      medications,
      notes,
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/clinic/${clinicId}/prescriptions`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Prescription</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create a new prescription for a patient
          </p>
        </div>
      </div>

      {/* Patient Search */}
      {!selectedPatient && (
        <Card>
          <CardHeader>
            <CardTitle>Select Patient</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Enter patient ID (UPI) or name"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchPatient()}
              />
              <Button onClick={searchPatient}>Search</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Patient */}
      {selectedPatient && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </h3>
                <p className="text-sm text-gray-600">
                  UPI: {selectedPatient.upi} · {selectedPatient.gender}
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
                              className="text-xs"
                            >
                              {allergy}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedPatient(null)}
              >
                Change Patient
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {selectedPatient && (
        <>
          {/* Add Medication Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add Medication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Drug Name & Strength */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Drug Name *</Label>
                  <Input
                    placeholder="e.g., Paracetamol"
                    value={currentMed.drugName}
                    onChange={(e) =>
                      setCurrentMed({ ...currentMed, drugName: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Strength *</Label>
                  <Input
                    placeholder="e.g., 500mg"
                    value={currentMed.strength}
                    onChange={(e) =>
                      setCurrentMed({ ...currentMed, strength: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* Form & Route */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Form</Label>
                  <Select
                    value={currentMed.form}
                    onValueChange={(val: any) =>
                      setCurrentMed({ ...currentMed, form: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tablet">Tablet</SelectItem>
                      <SelectItem value="Syrup">Syrup</SelectItem>
                      <SelectItem value="Injection">Injection</SelectItem>
                      <SelectItem value="Cream">Cream</SelectItem>
                      <SelectItem value="Drops">Drops</SelectItem>
                      <SelectItem value="Inhaler">Inhaler</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Route</Label>
                  <Select
                    value={currentMed.route}
                    onValueChange={(val: any) =>
                      setCurrentMed({ ...currentMed, route: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Oral">Oral</SelectItem>
                      <SelectItem value="IV">IV (Intravenous)</SelectItem>
                      <SelectItem value="IM">IM (Intramuscular)</SelectItem>
                      <SelectItem value="Topical">Topical</SelectItem>
                      <SelectItem value="Sublingual">Sublingual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Frequency & Duration */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select
                    value={currentMed.frequency}
                    onValueChange={(val: any) =>
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
                        duration: parseInt(e.target.value),
                      })
                    }
                    min="1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={currentMed.quantity}
                    onChange={(e) =>
                      setCurrentMed({
                        ...currentMed,
                        quantity: parseInt(e.target.value),
                      })
                    }
                    min="1"
                  />
                </div>
              </div>

              {/* Instructions */}
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

              <Button type="button" onClick={addMedication} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Add to Prescription
              </Button>
            </CardContent>
          </Card>

          {/* Medications List */}
          {medications.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Prescription ({medications.length} medications)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {medications.map((med, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">
                          {med.drugName} {med.strength}
                        </p>
                        <p className="text-sm text-gray-600">
                          {med.form} · {med.frequency} · {med.route} ·{" "}
                          {med.duration} days
                        </p>
                        {med.instructions && (
                          <p className="text-sm text-gray-500 mt-1">
                            <strong>Instructions:</strong> {med.instructions}
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
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any additional instructions or notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Allergy Warnings */}
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
                      Patient has documented allergies to:{" "}
                      {allergyWarnings.join(", ")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submit */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/clinic/${clinicId}/prescriptions`)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                savePrescriptionMutation.isPending || medications.length === 0
              }
            >
              <Save className="mr-2 h-4 w-4" />
              {savePrescriptionMutation.isPending
                ? "Saving..."
                : "Create Prescription"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
