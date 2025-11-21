import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { FileText, Calendar, Sparkles, Loader2 } from "lucide-react";

interface SoapNotesCardProps {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
  followUpDate: string;
  onSubjectiveChange: (value: string) => void;
  onObjectiveChange: (value: string) => void;
  onAssessmentChange: (value: string) => void;
  onPlanChange: (value: string) => void;
  onFollowUpDateChange: (value: string) => void;
  onAIDiagnosis?: () => void;
  loadingAI?: boolean;
}

export default function SoapNotesCard({
  subjective,
  objective,
  assessment,
  plan,
  followUpDate,
  onSubjectiveChange,
  onObjectiveChange,
  onAssessmentChange,
  onPlanChange,
  onFollowUpDateChange,
  onAIDiagnosis,
  loadingAI,
}: SoapNotesCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            SOAP Notes
          </CardTitle>
          {onAIDiagnosis && (
            <button
              onClick={onAIDiagnosis}
              disabled={loadingAI || !subjective}
              className="btn btn-block"
            >
              {loadingAI ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  AI Diagnosis
                </>
              )}
            </button>
          )}
        </div>
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
            onChange={(e) => onSubjectiveChange(e.target.value)}
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
            onChange={(e) => onObjectiveChange(e.target.value)}
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
            onChange={(e) => onAssessmentChange(e.target.value)}
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
            onChange={(e) => onPlanChange(e.target.value)}
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
            onChange={(e) => onFollowUpDateChange(e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
