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
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { toast } from "sonner";
import { ResponseSuccess, Patient } from "@/types";
import { calculateBMI, getBMICategory } from "@/lib/utils/formatters";
import {
  Heart,
  Activity,
  Thermometer,
  Wind,
  Droplet,
  Scale,
  Ruler,
} from "lucide-react";

export default function VitalsPage() {
  const router = useRouter();
  const params = useParams();
  const clinicId = params.clinicId as string;
  const queryClient = useQueryClient();

  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [vitalsData, setVitalsData] = useState({
    bloodPressureSystolic: "",
    bloodPressureDiastolic: "",
    temperature: "",
    pulse: "",
    respirationRate: "",
    weight: "",
    height: "",
    oxygenSaturation: "",
    bloodGlucose: "",
    notes: "",
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

  // Calculate BMI when weight or height changes
  const bmi =
    vitalsData.weight && vitalsData.height
      ? calculateBMI(
          parseFloat(vitalsData.weight),
          parseFloat(vitalsData.height)
        )
      : null;

  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  // Record vitals mutation
  const recordVitalsMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiClient.post("/vitals", data);
    },
    onSuccess: () => {
      toast.success("Vitals recorded successfully!");
      queryClient.invalidateQueries({ queryKey: ["vitals"] });
      queryClient.invalidateQueries({ queryKey: ["queue"] });

      // Reset form
      setSelectedPatient(null);
      setPatientSearch("");
      setVitalsData({
        bloodPressureSystolic: "",
        bloodPressureDiastolic: "",
        temperature: "",
        pulse: "",
        respirationRate: "",
        weight: "",
        height: "",
        oxygenSaturation: "",
        bloodGlucose: "",
        notes: "",
      });

      toast.info("Ready for next patient");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to record vitals");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      toast.error("Please select a patient");
      return;
    }

    // Convert empty strings to null, parse numbers
    const payload = {
      patientId: selectedPatient.id,
      bloodPressureSystolic: vitalsData.bloodPressureSystolic
        ? parseFloat(vitalsData.bloodPressureSystolic)
        : undefined,
      bloodPressureDiastolic: vitalsData.bloodPressureDiastolic
        ? parseFloat(vitalsData.bloodPressureDiastolic)
        : undefined,
      temperature: vitalsData.temperature
        ? parseFloat(vitalsData.temperature)
        : undefined,
      pulse: vitalsData.pulse ? parseFloat(vitalsData.pulse) : undefined,
      respirationRate: vitalsData.respirationRate
        ? parseFloat(vitalsData.respirationRate)
        : undefined,
      weight: vitalsData.weight ? parseFloat(vitalsData.weight) : undefined,
      height: vitalsData.height ? parseFloat(vitalsData.height) : undefined,
      bmi: bmi || undefined,
      oxygenSaturation: vitalsData.oxygenSaturation
        ? parseFloat(vitalsData.oxygenSaturation)
        : undefined,
      bloodGlucose: vitalsData.bloodGlucose
        ? parseFloat(vitalsData.bloodGlucose)
        : undefined,
      notes: vitalsData.notes || undefined,
    };

    recordVitalsMutation.mutate(payload);
  };

  const handleChange = (field: string, value: string) => {
    setVitalsData({ ...vitalsData, [field]: value });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Record Patient Vitals
        </h1>
        <p className="text-sm text-gray-600 mt-1">
          Record vital signs for patients in the queue
        </p>
      </div>

      {/* Patient Search */}
      {!selectedPatient && (
        <Card>
          <CardHeader>
            <CardTitle>Select Patient</CardTitle>
            <CardDescription>
              Search by patient ID (UPI) or name to record vitals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Enter patient ID or name"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && searchPatient()}
              />
              <Button onClick={searchPatient}>Search</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Patient Info */}
      {selectedPatient && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </h3>
                <p className="text-sm text-gray-600">
                  UPI: {selectedPatient.upi} · {selectedPatient.gender} ·{" "}
                  {selectedPatient.phone}
                </p>
                {selectedPatient.allergies &&
                  selectedPatient.allergies.length > 0 && (
                    <p className="text-xs text-red-600 mt-1 font-medium">
                      ⚠️ Allergies: {selectedPatient.allergies.join(", ")}
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

      {/* Vitals Form */}
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
              {/* Blood Pressure */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Blood Pressure (mmHg)
                </Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Input
                      type="number"
                      placeholder="Systolic (e.g., 120)"
                      value={vitalsData.bloodPressureSystolic}
                      onChange={(e) =>
                        handleChange("bloodPressureSystolic", e.target.value)
                      }
                      min="50"
                      max="300"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Systolic (upper)
                    </p>
                  </div>
                  <div>
                    <Input
                      type="number"
                      placeholder="Diastolic (e.g., 80)"
                      value={vitalsData.bloodPressureDiastolic}
                      onChange={(e) =>
                        handleChange("bloodPressureDiastolic", e.target.value)
                      }
                      min="30"
                      max="200"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Diastolic (lower)
                    </p>
                  </div>
                </div>
              </div>

              {/* Temperature & Pulse */}
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
                    min="30"
                    max="45"
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

              {/* Respiration & SpO2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Wind className="h-4 w-4" />
                    Respiration Rate (breaths/min)
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 16"
                    value={vitalsData.respirationRate}
                    onChange={(e) =>
                      handleChange("respirationRate", e.target.value)
                    }
                    min="5"
                    max="60"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Droplet className="h-4 w-4" />
                    Oxygen Saturation (%)
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 98"
                    value={vitalsData.oxygenSaturation}
                    onChange={(e) =>
                      handleChange("oxygenSaturation", e.target.value)
                    }
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              {/* Weight & Height */}
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

              {/* BMI Display */}
              {bmi && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900">
                    BMI: {bmi} ({bmiCategory})
                  </p>
                </div>
              )}

              {/* Blood Glucose */}
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

              {/* Notes */}
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

          {/* Submit Button */}
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
