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

interface LogVitalsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface VitalsInputData {
  bloodPressure?: string;
  temperature?: string;
  weight?: string;
  notes?: string;
}

export default function LogVitalsDialog({
  open,
  onOpenChange,
}: LogVitalsDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<VitalsInputData>({});

  const logMutation = useMutation({
    mutationFn: async (data: VitalsInputData) => {
      const response = await apiClient.post(
        "/v1/patient-portal/vitals/record",
        data
      );
      return response.data;
    },
    onSuccess: (response) => {
      toast.success("Vitals logged successfully!");

      // Handle API alerts (e.g. "High BP detected")
      if (response.data?.alerts && response.data.alerts.length > 0) {
        toast.warning("Attention: Some vitals are outside normal range.", {
          duration: 5000,
          icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
        });
      }

      queryClient.invalidateQueries({
        queryKey: ["patient-portal-vitals-full"],
      });
      queryClient.invalidateQueries({ queryKey: ["patient-portal-dashboard"] });

      onOpenChange(false);
      setFormData({});
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to log vitals");
    },
  });

  const handleSubmit = () => {
    if (!formData.bloodPressure && !formData.temperature && !formData.weight) {
      toast.error("Please enter at least one vital sign");
      return;
    }

    // Convert strings to numbers where API expects numbers
    const payload = {
      ...formData,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      temperature: formData.temperature
        ? parseFloat(formData.temperature)
        : undefined,
    };

    logMutation.mutate(payload as any);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-green-600" />
            Log New Vitals
          </DialogTitle>
          <DialogDescription>
            Enter your latest measurements below.
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
              placeholder="Any symptoms? (e.g., Headache, dizzy)"
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
            disabled={logMutation.isPending}
          >
            {logMutation.isPending ? (
              "Saving..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Entry
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
