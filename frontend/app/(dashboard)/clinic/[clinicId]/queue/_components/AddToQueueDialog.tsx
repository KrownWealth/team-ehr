"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { toast } from "sonner";

interface AddToQueueDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AddToQueueDialog({ open, onClose }: AddToQueueDialogProps) {
  const queryClient = useQueryClient();
  const [patientId, setPatientId] = useState("");
  const [visitType, setVisitType] = useState("New");
  const [priority, setPriority] = useState("Normal");
  const [chiefComplaint, setChiefComplaint] = useState("");

  const addToQueueMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiClient.post("/queue", data);
    },
    onSuccess: () => {
      toast.success("Patient added to queue");
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to add to queue");
    },
  });

  const resetForm = () => {
    setPatientId("");
    setVisitType("New");
    setPriority("Normal");
    setChiefComplaint("");
  };

  const handleSubmit = () => {
    if (!patientId) {
      toast.error("Please enter patient ID");
      return;
    }

    addToQueueMutation.mutate({
      patientId,
      visitType,
      priority,
      chiefComplaint,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Patient to Queue</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Patient ID (UPI)</Label>
            <Input
              placeholder="Enter patient UPI or search"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Visit Type</Label>
            <Select value={visitType} onValueChange={setVisitType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New">New Visit</SelectItem>
                <SelectItem value="Follow-up">Follow-up</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Priority</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Urgent">Urgent</SelectItem>
                <SelectItem value="Emergency">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Chief Complaint (Optional)</Label>
            <Textarea
              placeholder="Brief description of complaint"
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={addToQueueMutation.isPending}>
              {addToQueueMutation.isPending ? "Adding..." : "Add to Queue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}