"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Activity, Save, AlertTriangle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { toast } from "sonner";

interface RecordVitalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface VitalsData {
  bloodPressure?: string;
  temperature?: string;
  weight?: string;
  notes?: string;
}

export default function RecordVitalsDialog({
  open,
  onOpenChange,
}: RecordVitalsDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<VitalsData>({});

  const recordMutation = useMutation({
    mutationFn: async (data: VitalsData) => {
      const response = await apiClient.post(
        "/v1/patient-portal/vitals/record",
        data
      );
      return response.data;
    },
    onSuccess: (response) => {
      toast.success("Vitals recorded successfully!");

      if (response.data?.alerts && response.data.alerts.length > 0) {
        toast.warning("Note: Some vitals are outside normal range.", {
          duration: 5000,
          icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
        });
      }

      queryClient.invalidateQueries({ queryKey: ["patient-portal-dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["patient-portal-records"] });

      onOpenChange(false);
      setFormData({});
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to record vitals");
    },
  });

  const handleSubmit = () => {
    if (!formData.bloodPressure && !formData.temperature && !formData.weight) {
      toast.error("Please enter at least one vital sign");
      return;
    }

    const payload = {
      ...formData,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      temperature: formData.temperature
        ? parseFloat(formData.temperature)
        : undefined,
    };

    recordMutation.mutate(payload as any);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Log Vitals
          </DialogTitle>
          <DialogDescription>
            Self-report your health metrics. These will be added to your medical
            file.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Blood Pressure</Label>
              <Input
                placeholder="120/80"
                value={formData.bloodPressure || ""}
                onChange={(e) =>
                  setFormData({ ...formData, bloodPressure: e.target.value })
                }
              />
              <span className="text-xs text-gray-500">mmHg</span>
            </div>
            <div className="space-y-2">
              <Label>Weight</Label>
              <Input
                type="number"
                placeholder="70.5"
                value={formData.weight || ""}
                onChange={(e) =>
                  setFormData({ ...formData, weight: e.target.value })
                }
              />
              <span className="text-xs text-gray-500">kg</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Temperature</Label>
            <Input
              type="number"
              placeholder="36.5"
              value={formData.temperature || ""}
              onChange={(e) =>
                setFormData({ ...formData, temperature: e.target.value })
              }
            />
            <span className="text-xs text-gray-500">°C</span>
          </div>

          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Textarea
              placeholder="How are you feeling?"
              value={formData.notes || ""}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            className="btn btn-outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </button>
          <button
            className="btn btn-block"
            onClick={handleSubmit}
            disabled={recordMutation.isPending}
          >
            {recordMutation.isPending ? (
              "Saving..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Record
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
