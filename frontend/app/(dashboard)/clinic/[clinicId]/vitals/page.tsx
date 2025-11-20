"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { toast } from "sonner";
import { ApiResponse, Patient, RecordVitalsData } from "@/types";
import {
  calculateBMI,
  getBMICategory,
  calculateAge,
} from "@/lib/utils/formatters";
import {
  Heart,
  Activity,
  Thermometer,
  Wind,
  Droplet,
  Scale,
  Ruler,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { getErrorMessage } from "@/lib/helper";
import { cn } from "@/lib/utils";

interface VitalsFormState {
  systolic: string;
  diastolic: string;
  temperature: string;
  pulse: string;
  respiration: string;
  weight: string;
  height: string;
  spo2: string;
  bloodGlucose: string;
  notes: string;
}

export default function VitalsPage() {
  const router = useRouter();
  const params = useParams();
  const clinicId = params.clinicId as string;
  const queryClient = useQueryClient();

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [vitalsData, setVitalsData] = useState<VitalsFormState>({
    systolic: "",
    diastolic: "",
    temperature: "",
    pulse: "",
    respiration: "",
    weight: "",
    height: "",
    spo2: "",
    bloodGlucose: "",
    notes: "",
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

  const weight = parseFloat(vitalsData.weight);
  const height = parseFloat(vitalsData.height);
  const bmi = weight > 0 && height > 0 ? calculateBMI(weight, height) : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  const recordVitalsMutation = useMutation({
    mutationFn: async (data: RecordVitalsData) => {
      await apiClient.post("/v1/vitals", data);
    },
    onSuccess: () => {
      toast.success("Vitals recorded successfully!");
      queryClient.invalidateQueries({ queryKey: ["vitals"] });
      queryClient.invalidateQueries({ queryKey: ["queue"] });

      setSelectedPatient(null);
      setSearchQuery("");
      setVitalsData({
        systolic: "",
        diastolic: "",
        temperature: "",
        pulse: "",
        respiration: "",
        weight: "",
        height: "",
        spo2: "",
        bloodGlucose: "",
        notes: "",
      });

      toast.info("Ready for next patient");
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed to record vitals"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }

    const hasSystolic = !!vitalsData.systolic;
    const hasDiastolic = !!vitalsData.diastolic;
    const bloodPressure =
      hasSystolic || hasDiastolic
        ? `${vitalsData.systolic || "N/A"}/${vitalsData.diastolic || "N/A"}`
        : undefined;

    const parseNum = (val: string) => (val ? parseFloat(val) : undefined);

    const payload: RecordVitalsData = {
      patientId: selectedPatient.id,
      bloodPressure: bloodPressure || "",
      temperature: parseNum(vitalsData.temperature),
      pulse: parseNum(vitalsData.pulse),
      respiration: parseNum(vitalsData.respiration),
      weight: parseNum(vitalsData.weight),
      height: parseNum(vitalsData.height),
      spo2: parseNum(vitalsData.spo2),
      bloodGlucose: parseNum(vitalsData.bloodGlucose),
      notes: vitalsData.notes || undefined,
    };

    if (!payload.bloodPressure || payload.bloodPressure === "N/A/N/A") {
      toast.error("Blood Pressure is required.");
      return;
    }

    recordVitalsMutation.mutate(payload);
  };

  const handleChange = (field: keyof VitalsFormState, value: string) => {
    setVitalsData({ ...vitalsData, [field]: value });
  };

  return (
    <div className="max-w-6xl w-full mx-auto space-y-6 pt-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Record Patient Vitals
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Record vital signs for patients in the queue
        </p>
      </div>

      {!selectedPatient && (
        <Card>
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
        <Card className="bg-green-50/10 border-green-200/70">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </h3>
                <p className="text-sm text-gray-600">
                  ID: {selectedPatient.patientNumber} · {selectedPatient.gender}{" "}
                  · {selectedPatient.phone}
                </p>
                {selectedPatient.allergies &&
                  selectedPatient.allergies.length > 0 && (
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      Allergies: {selectedPatient.allergies.join(", ")}
                    </p>
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
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Vital Signs</CardTitle>
              <CardDescription>
                Record all available vital measurements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Blood Pressure (mmHg) <span className="text-red-500">*</span>
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="number"
                      placeholder="Systolic (e.g., 120)"
                      value={vitalsData.systolic}
                      onChange={(e) => handleChange("systolic", e.target.value)}
                      min="50"
                      max="300"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Systolic (upper)
                    </p>
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Diastolic (e.g., 80)"
                      value={vitalsData.diastolic}
                      onChange={(e) =>
                        handleChange("diastolic", e.target.value)
                      }
                      min="30"
                      max="200"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Diastolic (lower)
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Thermometer className="h-4 w-4" />
                    Temperature (°C)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 37.5"
                    value={vitalsData.temperature}
                    onChange={(e) =>
                      handleChange("temperature", e.target.value)
                    }
                    min="0"
                    max="100"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Pulse (bpm)
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 72"
                    value={vitalsData.pulse}
                    onChange={(e) => handleChange("pulse", e.target.value)}
                    min="30"
                    max="220"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Wind className="h-4 w-4" />
                    Respiratory Rate (breaths/min)
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 16"
                    value={vitalsData.respiration}
                    onChange={(e) =>
                      handleChange("respiration", e.target.value)
                    }
                    min="5"
                    max="60"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Droplet className="h-4 w-4" />
                    Oxygen Saturation (SpO₂ %)
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 98"
                    value={vitalsData.spo2}
                    onChange={(e) => handleChange("spo2", e.target.value)}
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Weight (kg)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 70.5"
                    value={vitalsData.weight}
                    onChange={(e) => handleChange("weight", e.target.value)}
                    min="1"
                    max="500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Ruler className="h-4 w-4" />
                    Height (cm)
                  </Label>
                  <Input
                    type="number"
                    step="0.1"
                    placeholder="e.g., 175"
                    value={vitalsData.height}
                    onChange={(e) => handleChange("height", e.target.value)}
                    min="30"
                    max="250"
                  />
                </div>
              </div>

              {bmi && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-900">
                    BMI: {bmi.toFixed(2)} ({bmiCategory})
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label>Blood Glucose (mg/dL) - Optional</Label>
                <Input
                  type="number"
                  placeholder="e.g., 95"
                  value={vitalsData.bloodGlucose}
                  onChange={(e) => handleChange("bloodGlucose", e.target.value)}
                  min="0"
                  max="1000"
                />
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Any additional observations..."
                  value={vitalsData.notes}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/clinic/${clinicId}/queue`)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={recordVitalsMutation.isPending}>
              {recordVitalsMutation.isPending
                ? "Recording..."
                : "Record Vitals"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
