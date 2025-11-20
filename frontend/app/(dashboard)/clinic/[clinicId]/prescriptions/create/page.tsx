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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  Trash2,
  AlertTriangle,
  Save,
  ChevronsUpDown,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { toast } from "sonner";
import {
  ApiResponse,
  Patient,
  Medication,
  CreatePrescriptionData,
} from "@/types";
import { calculateAge } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";

interface CurrentMedInput {
  drug: string;
  dosage: string;
  frequency: string;
  duration: number;
  instructions: string;
}

export default function CreatePrescriptionPage() {
  const router = useRouter();
  const params = useParams();
  const clinicId = params.clinicId as string;
  const queryClient = useQueryClient();

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Medication[]>([]);
  const [notes, setNotes] = useState("");
  const [currentMed, setCurrentMed] = useState<CurrentMedInput>({
    drug: "",
    dosage: "1 tablet",
    frequency: "BD",
    duration: 7,
    instructions: "Take after meals",
  });

  const { data: patientsData, isLoading: loadingPatients } = useQuery({
    queryKey: ["patients-search", searchQuery],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Patient[]>>(
        "/v1/patient",
        {
          params: {
            search: searchQuery,
            limit: 50,
          },
        }
      );
      return response.data;
    },
  });

  const patients: Patient[] = patientsData?.data || [];

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

  const addMedication = () => {
    if (!currentMed.drug || !currentMed.dosage) {
      toast.error("Please fill drug name and dosage");
      return;
    }

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
        drug: currentMed.drug,
        dosage: currentMed.dosage,
        frequency: currentMed.frequency,
        instructions: currentMed.instructions,
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

  const savePrescriptionMutation = useMutation({
    mutationFn: async (data: CreatePrescriptionData) => {
      await apiClient.post("/v1/prescription/create", data);
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

    if (prescriptions.length === 0) {
      toast.error("Please add at least one medication");
      return;
    }

    const prescriptionData: CreatePrescriptionData = {
      patientId: selectedPatient.id,
      prescriptions: prescriptions,
      notes: notes || undefined,
    };

    savePrescriptionMutation.mutate(prescriptionData);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 mt-4">
      <div className="gap-4">
        <button
          className="btn px-0"
          onClick={() => router.push(`/clinic/${clinicId}/prescriptions`)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </button>
        <br />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Prescription</h1>
          <p className="text-sm text-gray-600 mt-1">
            Create a new prescription for a patient
          </p>
        </div>
      </div>

      {!selectedPatient && (
        <Card>
          <CardHeader>
            <CardTitle>Select Patient</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Select Patient</Label>
              <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={comboboxOpen}
                    className="w-full justify-between h-12"
                  >
                    <span className="text-muted-foreground">
                      Search and select patient...
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search by name, ID, phone, or email..."
                      value={searchQuery}
                      onValueChange={setSearchQuery}
                    />
                    <CommandList>
                      {loadingPatients ? (
                        <div className="py-6 text-center text-sm text-muted-foreground">
                          Loading patients...
                        </div>
                      ) : patients.length === 0 ? (
                        <CommandEmpty>
                          {searchQuery
                            ? "No patients found matching your search."
                            : "Start typing to search for patients..."}
                        </CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {patients.map((patient) => {
                            const age = calculateAge(patient.birthDate);
                            return (
                              <CommandItem
                                key={patient.id}
                                value={patient.id}
                                onSelect={() => {
                                  setSelectedPatient(patient);
                                  setComboboxOpen(false);
                                }}
                                className="flex items-center gap-3 py-3"
                              >
                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                  <span className="text-xs font-semibold text-green-600">
                                    {patient.firstName[0]}
                                    {patient.lastName[0]}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium truncate">
                                      {patient.firstName} {patient.lastName}
                                    </span>
                                    <span className="text-xs text-muted-foreground font-mono">
                                      {patient.patientNumber}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                    <span>{patient.gender}</span>
                                    <span>{age} yrs</span>
                                    {patient.phone && (
                                      <span className="font-mono">
                                        {patient.phone}
                                      </span>
                                    )}
                                    {patient.email && (
                                      <span className="truncate">
                                        {patient.email}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
      )}

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
          <Card>
            <CardHeader>
              <CardTitle>Add Medication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Drug Name *</Label>
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
                  <Label>Dosage *</Label>
                  <Input
                    placeholder="e.g., 1 tablet"
                    value={currentMed.dosage}
                    onChange={(e) =>
                      setCurrentMed({ ...currentMed, dosage: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Frequency *</Label>
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
                  <Label>Duration (days) *</Label>
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
                <Label>Instructions (Optional)</Label>
                <Input
                  placeholder="e.g., Take after meals, Apply topically"
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
                className="btn btn-block py-3 w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add to Prescription
              </button>
            </CardContent>
          </Card>

          {prescriptions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Prescription ({prescriptions.length} medications)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {prescriptions.map((med, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-start p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-semibold">{med.drug}</p>
                        <p className="text-sm text-gray-600">
                          Dosage: {med.dosage} · Frequency: {med.frequency} ·
                          Duration: {med.duration}
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

          <div className="flex justify-end gap-3">
            <button
              className="btn btn-outline"
              onClick={() => router.push(`/clinic/${clinicId}/prescriptions`)}
            >
              Cancel
            </button>
            <button
              className="btn btn-block"
              onClick={handleSubmit}
              disabled={
                savePrescriptionMutation.isPending || prescriptions.length === 0
              }
            >
              <Save className="mr-2 h-4 w-4" />
              {savePrescriptionMutation.isPending
                ? "Saving..."
                : "Create Prescription"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
