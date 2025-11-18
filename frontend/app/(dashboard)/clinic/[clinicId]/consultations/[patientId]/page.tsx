"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, CheckCircle, AlertTriangle, X } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { toast } from "sonner";
import {
  ApiResponse,
  Patient,
  Vitals,
  CreateConsultationData,
  Medication,
} from "@/types";
import { calculateAge, formatDateTime } from "@/lib/utils/formatters";

export default function ConsultationPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.patientId as string;
  const clinicId = params.clinicId as string;
  const queryClient = useQueryClient();

  const [consultationData, setConsultationData] =
    useState<CreateConsultationData>({
      patientId,
      subjective: "",
      objective: "",
      assessment: "",
      plan: "",
      prescriptions: [],
      labOrders: [],
      followUpDate: "",
    });

  const [diagnosisInput, setDiagnosisInput] = useState("");
  const [diagnosisList, setDiagnosisList] = useState<string[]>([]);

  const { data: patientData } = useQuery<ApiResponse<Patient>>({
    queryKey: ["patient", patientId],
    queryFn: async () => {
      const response = await apiClient.get(`/v1/patient/${patientId}`);
      return response.data;
    },
  });

  const { data: vitalsData } = useQuery<ApiResponse<Vitals[]>>({
    queryKey: ["vitals", patientId],
    queryFn: async () => {
      const response = await apiClient.get(
        `/v1/vitals/patient/${patientId}?limit=1`
      );
      return response.data;
    },
  });

  const patient = patientData?.data;
  const latestVitals = vitalsData?.data?.[0];

  const saveConsultationMutation = useMutation({
    mutationFn: async (data: CreateConsultationData) => {
      await apiClient.post("/v1/consultation", data);
    },
    onSuccess: () => {
      toast.success("Consultation saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["consultations"] });
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      router.push(`/clinic/${clinicId}/consultations`);
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to save consultation"
      );
    },
  });

  const handleChange = (field: keyof CreateConsultationData, value: string) => {
    setConsultationData({ ...consultationData, [field]: value });
  };

  const addDiagnosis = () => {
    if (diagnosisInput.trim()) {
      setDiagnosisList([...diagnosisList, diagnosisInput.trim()]);
      setDiagnosisInput("");
    }
  };

  const removeDiagnosis = (index: number) => {
    setDiagnosisList(diagnosisList.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!consultationData.subjective || !consultationData.assessment) {
      toast.error("Please fill subjective and assessment sections");
      return;
    }

    const finalAssessment =
      diagnosisList.length > 0
        ? `${consultationData.assessment}\n\nDiagnosis: ${diagnosisList.join(
            ", "
          )}`
        : consultationData.assessment;

    saveConsultationMutation.mutate({
      ...consultationData,
      assessment: finalAssessment,
    });
  };

  if (!patient) {
    return <div className="text-center py-8">Loading patient data...</div>;
  }

  const age = calculateAge(patient.birthDate);
  const fullName = `${patient.firstName} ${patient.lastName}`;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/clinic/${clinicId}/queue`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Queue
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Consultation - {fullName}
            </h1>
            <p className="text-sm text-gray-600">
              {patient.gender} · {age} years · UPI: {patient.patientNumber}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Patient Summary */}
        <div className="lg:col-span-1 space-y-4">
          {/* Patient Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Patient Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Blood Group</p>
                <Badge variant="outline">{patient.bloodGroup || "N/A"}</Badge>
              </div>

              {patient.allergies && patient.allergies.length > 0 && (
                <div>
                  <p className="text-gray-600 flex items-center gap-1 mb-1">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    Allergies
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {patient.allergies.map((allergy, i) => (
                      <Badge key={i} variant="destructive" className="text-xs">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {patient.chronicConditions &&
                patient.chronicConditions.length > 0 && (
                  <div>
                    <p className="text-gray-600">Chronic Conditions</p>
                    <div className="flex flex-wrap gap-1">
                      {patient.chronicConditions.map((condition, i) => (
                        <Badge key={i} variant="secondary" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>

          {/* Latest Vitals */}
          {latestVitals && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Latest Vitals</CardTitle>
                <p className="text-xs text-gray-500">
                  {formatDateTime(latestVitals.createdAt)}
                </p>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {/* bloodPressure is a string in format "120/80" */}
                {latestVitals.bloodPressure && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">BP:</span>
                    <span className="font-medium">
                      {latestVitals.bloodPressure} mmHg
                    </span>
                  </div>
                )}
                {latestVitals.temperature && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Temp:</span>
                    <span className="font-medium">
                      {latestVitals.temperature}°C
                    </span>
                  </div>
                )}
                {latestVitals.pulse && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Pulse:</span>
                    <span className="font-medium">
                      {latestVitals.pulse} bpm
                    </span>
                  </div>
                )}
                {latestVitals.weight && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Weight:</span>
                    <span className="font-medium">
                      {latestVitals.weight} kg
                    </span>
                  </div>
                )}
                {latestVitals.bmi && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">BMI:</span>
                    <span className="font-medium">{latestVitals.bmi}</span>
                  </div>
                )}
                {latestVitals.respiratoryRate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resp. Rate:</span>
                    <span className="font-medium">
                      {latestVitals.respiratoryRate} /min
                    </span>
                  </div>
                )}
                {latestVitals.spo2 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">SpO2:</span>
                    <span className="font-medium">{latestVitals.spo2}%</span>
                  </div>
                )}
                {latestVitals.bloodGlucose && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Blood Glucose:</span>
                    <span className="font-medium">
                      {latestVitals.bloodGlucose} mg/dL
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right - SOAP Notes Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Subjective */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                S - Subjective (Chief Complaint & HPI)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Patient's chief complaint and history of present illness..."
                value={consultationData.subjective}
                onChange={(e) => handleChange("subjective", e.target.value)}
                rows={4}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* Objective */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                O - Objective (Physical Exam Findings)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Physical examination findings, lab results, imaging..."
                value={consultationData.objective}
                onChange={(e) => handleChange("objective", e.target.value)}
                rows={4}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                A - Assessment (Diagnosis)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                placeholder="Clinical impression and diagnosis..."
                value={consultationData.assessment}
                onChange={(e) => handleChange("assessment", e.target.value)}
                rows={3}
                className="resize-none"
              />

              {/* Diagnosis Tags */}
              <div className="space-y-2">
                <Label>Diagnosis Codes (ICD-10)</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter diagnosis code or name"
                    value={diagnosisInput}
                    onChange={(e) => setDiagnosisInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addDiagnosis())
                    }
                  />
                  <Button type="button" onClick={addDiagnosis}>
                    Add
                  </Button>
                </div>
                {diagnosisList.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {diagnosisList.map((diag, index) => (
                      <Badge key={index} className="flex items-center gap-1">
                        {diag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeDiagnosis(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Plan */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                P - Plan (Treatment & Follow-up)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Treatment plan, prescriptions, investigations, patient education..."
                value={consultationData.plan}
                onChange={(e) => handleChange("plan", e.target.value)}
                rows={4}
                className="resize-none"
              />

              <div className="space-y-2">
                <Label>Follow-up Date (Optional)</Label>
                <Input
                  type="date"
                  value={consultationData.followUpDate}
                  onChange={(e) => handleChange("followUpDate", e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/clinic/${clinicId}/queue`)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={saveConsultationMutation.isPending}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              {saveConsultationMutation.isPending
                ? "Saving..."
                : "Complete Consultation"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
