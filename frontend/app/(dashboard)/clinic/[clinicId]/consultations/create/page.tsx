"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { toast } from "sonner";
import { ApiResponse, Patient, Medication } from "@/types";
import PatientSelectionCard from "./_components/PatientSelectionCard";
import SoapNotesCard from "./_components/SoapNotesCard";
import PrescriptionsCard from "./_components/PrescriptionsCard";
import LabOrdersCard from "./_components/LabOrdersCard";
import AIInsightsCard from "./_components/AIInsightsCard";

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

interface AIInsight {
  type: "diagnosis" | "interaction" | "risk";
  severity?: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  recommendations?: string[];
}

export default function CreateConsultationPage() {
  const router = useRouter();
  const params = useParams();
  const clinicId = params.clinicId as string;

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [subjective, setSubjective] = useState("");
  const [objective, setObjective] = useState("");
  const [assessment, setAssessment] = useState("");
  const [plan, setPlan] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");

  const [prescriptions, setPrescriptions] = useState<Medication[]>([]);
  const [currentMed, setCurrentMed] = useState<CurrentMedInput>({
    drug: "",
    dosage: "1 tablet",
    frequency: "BD",
    duration: 7,
    instructions: "Take after meals",
  });

  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [currentLab, setCurrentLab] = useState<CurrentLabInput>({
    test: "",
    instructions: "",
  });

  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [loadingInteractions, setLoadingInteractions] = useState(false);

  const { data: patientsData, isLoading: loadingPatients } = useQuery({
    queryKey: ["patients-search", searchQuery],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<Patient[]>>(
        "/v1/patient",
        {
          params: { search: searchQuery, limit: 50 },
        }
      );
      return response.data;
    },
  });

  const patients: Patient[] = patientsData?.data || [];

  const handleAIDiagnosis = async () => {
    if (!selectedPatient || !subjective) {
      toast.error("Please enter patient symptoms first");
      return;
    }

    setLoadingAI(true);
    try {
      const response = await apiClient.post("/v1/ai/diagnose", {
        patientId: selectedPatient.id,
        symptoms: subjective,
        chiefComplaint: subjective.split(".")[0],
      });

      const diagnosisData = response.data.data;
      const aiSuggestions = diagnosisData.ai_suggestions;
      const patientContext = diagnosisData.patient_context;

      setAiInsights([]);
      const newInsights: AIInsight[] = [];

      if (aiSuggestions.red_flags && aiSuggestions.red_flags.length > 0) {
        newInsights.push({
          type: "risk",
          severity: "critical",
          title: "⚠️ Red Flags Detected",
          description: `Critical findings requiring immediate attention: ${aiSuggestions.red_flags.join(
            ", "
          )}`,
          recommendations: [
            "Review patient vitals immediately",
            "Consider urgent intervention if necessary",
          ],
        });
      }

      if (
        aiSuggestions.differential_diagnoses &&
        aiSuggestions.differential_diagnoses.length > 0
      ) {
        const diagnosesList = aiSuggestions.differential_diagnoses
          .map(
            (dx: any) =>
              `• ${dx.condition} (${dx.probability} probability${dx.icd10_code ? `, ICD-10: ${dx.icd10_code}` : ""
              }) - ${dx.reasoning}`
          )
          .join("\n");

        newInsights.push({
          type: "diagnosis",
          severity: "medium",
          title: "🔍 AI Differential Diagnoses",
          description: diagnosesList,
          recommendations: aiSuggestions.management_suggestions || [],
        });
      }

      if (
        aiSuggestions.recommended_tests &&
        aiSuggestions.recommended_tests.length > 0
      ) {
        newInsights.push({
          type: "diagnosis",
          severity: "low",
          title: "🧪 Recommended Laboratory Tests",
          description: `Consider ordering the following tests: ${aiSuggestions.recommended_tests.join(
            ", "
          )}`,
          recommendations: [
            "These tests will help confirm or rule out differential diagnoses",
          ],
        });

        const autoLabOrders = aiSuggestions.recommended_tests
          .filter(
            (test: string) => !labOrders.some((order) => order.test === test)
          )
          .map((test: string) => ({
            test,
            instructions: "As per clinical indication",
          }));

        if (autoLabOrders.length > 0) {
          setLabOrders((prev) => [...prev, ...autoLabOrders]);
          toast.info(`Added ${autoLabOrders.length} recommended lab orders`);
        }
      }

      if (aiSuggestions.follow_up) {
        newInsights.push({
          type: "diagnosis",
          severity: "low",
          title: "📅 Follow-up Recommendation",
          description: aiSuggestions.follow_up,
          recommendations: ["Set appropriate follow-up date below"],
        });

        if (
          aiSuggestions.follow_up.toLowerCase().includes("1 week") &&
          !followUpDate
        ) {
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          setFollowUpDate(nextWeek.toISOString().split("T")[0]);
        }
      }

      if (patientContext) {
        const contextSummary: string[] = [];

        if (patientContext.chronic_conditions?.length > 0) {
          contextSummary.push(
            `Chronic conditions: ${patientContext.chronic_conditions.join(
              ", "
            )}`
          );
        }

        if (patientContext.allergies?.length > 0) {
          contextSummary.push(
            `⚠️ Known allergies: ${patientContext.allergies.join(", ")}`
          );
        }

        if (patientContext.recent_vitals?.length > 0) {
          const vitals = patientContext.recent_vitals[0];
          contextSummary.push(
            `Recent vitals: BP ${vitals.bp}, Temp ${vitals.temp}°C, Pulse ${vitals.pulse} bpm`
          );
        }

        if (contextSummary.length > 0) {
          newInsights.push({
            type: "risk",
            severity: "low",
            title: "📋 Patient Context",
            description: contextSummary.join(" | "),
            recommendations: [
              "Consider patient history when prescribing medications",
            ],
          });
        }
      }

      setAiInsights(newInsights);

      toast.success(
        `AI analysis complete! Generated ${newInsights.length} clinical insights`,
        {
          duration: 4000,
        }
      );

      if (diagnosisData.disclaimer) {
        toast.info("Remember: AI suggestions are for decision support only", {
          duration: 3000,
        });
      }
    } catch (error: any) {
      console.error("AI Diagnosis Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to get AI diagnosis"
      );
    } finally {
      setLoadingAI(false);
    }
  };

  const handleCheckInteractions = async () => {
    if (!selectedPatient || prescriptions.length < 2) {
      toast.error("Add at least 2 medications to check interactions");
      return;
    }

    setLoadingInteractions(true);
    try {
      const response = await apiClient.post("/v1/ai/drug-interactions", {
        patientId: selectedPatient.id,
        proposedMedications: prescriptions.map((p) => p.drug),
      });

      const interactionData = response.data.data;

      if (
        interactionData.interactions &&
        interactionData.interactions.length > 0
      ) {
        interactionData.interactions.forEach((interaction: any) => {
          const newInsight: AIInsight = {
            type: "interaction",
            severity: interaction.severity || "medium",
            title: `Drug Interaction: ${interaction.drugs.join(" + ")}`,
            description:
              interaction.description || "Potential interaction detected",
            recommendations: interaction.recommendations || [],
          };
          setAiInsights((prev) => [...prev, newInsight]);
        });
        toast.warning("Drug interactions detected! Review AI insights.");
      } else {
        toast.success("No significant drug interactions detected");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to check interactions"
      );
    } finally {
      setLoadingInteractions(false);
    }
  };

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
        { duration: 5000 }
      );
      return;
    }

    setPrescriptions([
      ...prescriptions,
      { ...currentMed, duration: `${currentMed.duration} days` },
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

  const createConsultationMutation = useMutation({
    mutationFn: async (data: CreateConsultationData) => {
      const response = await apiClient.post("/v1/consultation", data);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Consultation created successfully!");
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
            Create a new consultation record with AI assistance
          </p>
        </div>
      </div>

      <PatientSelectionCard
        selectedPatient={selectedPatient}
        onSelectPatient={setSelectedPatient}
        onChangePatient={() => {
          setSelectedPatient(null);
          setSearchQuery("");
        }}
        patients={patients}
        loadingPatients={loadingPatients}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {selectedPatient && (
        <>
          <SoapNotesCard
            subjective={subjective}
            objective={objective}
            assessment={assessment}
            plan={plan}
            followUpDate={followUpDate}
            onSubjectiveChange={setSubjective}
            onObjectiveChange={setObjective}
            onAssessmentChange={setAssessment}
            onPlanChange={setPlan}
            onFollowUpDateChange={setFollowUpDate}
            onAIDiagnosis={handleAIDiagnosis}
            loadingAI={loadingAI}
          />

          <AIInsightsCard insights={aiInsights} />

          <PrescriptionsCard
            prescriptions={prescriptions}
            currentMed={currentMed}
            onCurrentMedChange={(field, value) =>
              setCurrentMed({ ...currentMed, [field]: value })
            }
            onAddMedication={addMedication}
            onRemoveMedication={removeMedication}
            onCheckInteractions={handleCheckInteractions}
            loadingInteractions={loadingInteractions}
          />

          <LabOrdersCard
            labOrders={labOrders}
            currentLab={currentLab}
            onCurrentLabChange={(field, value) =>
              setCurrentLab({ ...currentLab, [field]: value })
            }
            onAddLabOrder={addLabOrder}
            onRemoveLabOrder={removeLabOrder}
          />

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
              onClick={() => router.push(`/clinic/${clinicId}/consultations`)}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={createConsultationMutation.isPending}
              className="btn btn-block"
            >
              <Save className="h-4 w-4" />
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
