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
import { Calendar, Clock, Save } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { toast } from "sonner";

interface AppointmentRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface RequestData {
  preferredDate: string;
  reason: string;
  notes: string;
}

export default function AppointmentRequestDialog({
  open,
  onOpenChange,
}: AppointmentRequestDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<RequestData>({
    preferredDate: "",
    reason: "",
    notes: "",
  });

  const requestMutation = useMutation({
    mutationFn: async (data: RequestData) => {
      const response = await apiClient.post(
        "/v1/patient-portal/appointments/request",
        data
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Appointment request sent successfully!");
      queryClient.invalidateQueries({ queryKey: ["patient-portal-dashboard"] });
      onOpenChange(false);
      // Reset form
      setFormData({ preferredDate: "", reason: "", notes: "" });
    },
    onError: (error: any) => {
      toast.error(
        error.response?.data?.message || "Failed to request appointment"
      );
    },
  });

  const handleSubmit = () => {
    if (!formData.preferredDate) {
      toast.error("Please select a preferred date");
      return;
    }
    if (!formData.reason) {
      toast.error("Please enter a reason for the visit");
      return;
    }

    requestMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Request Appointment</DialogTitle>
          <DialogDescription>
            Fill in the details below to request a consultation. Our team will
            confirm the exact time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              Preferred Date <span className="text-red-500">*</span>
            </Label>
            <Input
              type="datetime-local"
              value={formData.preferredDate}
              onChange={(e) =>
                setFormData({ ...formData, preferredDate: e.target.value })
              }
              className="h-11"
            />
            <p className="text-xs text-gray-500">
              Please select a date and time during clinic hours (8 AM - 5 PM).
            </p>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              Reason for Visit <span className="text-red-500">*</span>
            </Label>
            <Input
              placeholder="e.g., Annual Checkup, Fever, Follow-up..."
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label>Additional Notes (Optional)</Label>
            <Textarea
              placeholder="Any specific symptoms or questions?"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              rows={3}
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
            disabled={requestMutation.isPending}
          >
            {requestMutation.isPending ? (
              "Sending..."
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Submit Request
              </>
            )}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
