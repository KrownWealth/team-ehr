import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ShieldAlert, Loader2 } from "lucide-react";
import { Medication } from "@/types";

interface PrescriptionsCardProps {
  prescriptions: Medication[];
  currentMed: {
    drug: string;
    dosage: string;
    frequency: string;
    duration: number;
    instructions: string;
  };
  onCurrentMedChange: (field: string, value: string | number) => void;
  onAddMedication: () => void;
  onRemoveMedication: (index: number) => void;
  onCheckInteractions?: () => void;
  loadingInteractions?: boolean;
}

export default function PrescriptionsCard({
  prescriptions,
  currentMed,
  onCurrentMedChange,
  onAddMedication,
  onRemoveMedication,
  onCheckInteractions,
  loadingInteractions,
}: PrescriptionsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Prescriptions (Optional)</CardTitle>
          {onCheckInteractions && prescriptions.length > 1 && (
            <button
              onClick={onCheckInteractions}
              disabled={loadingInteractions}
              className="gap-2 btn btn-outline"
            >
              {loadingInteractions ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <ShieldAlert className="h-4 w-4" />
                  Check Interactions
                </>
              )}
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Drug Name</Label>
          <Input
            placeholder="e.g., Paracetamol 500mg"
            value={currentMed.drug}
            onChange={(e) => onCurrentMedChange("drug", e.target.value)}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Dosage</Label>
            <Input
              placeholder="e.g., 1 tablet"
              value={currentMed.dosage}
              onChange={(e) => onCurrentMedChange("dosage", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Frequency</Label>
            <Select
              value={currentMed.frequency}
              onValueChange={(val) => onCurrentMedChange("frequency", val)}
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
                onCurrentMedChange("duration", parseInt(e.target.value) || 1)
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
            onChange={(e) => onCurrentMedChange("instructions", e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={onAddMedication}
          className="w-full btn btn-block"
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
                <button
                  onClick={() => onRemoveMedication(index)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
