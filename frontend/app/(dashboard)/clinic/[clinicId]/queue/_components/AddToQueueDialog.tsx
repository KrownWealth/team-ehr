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
import { AddToQueueData } from "@/types";

interface AddToQueueDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AddToQueueDialog({ open, onClose }: AddToQueueDialogProps) {
  const queryClient = useQueryClient();
  const [patientId, setPatientId] = useState("");
  const [priority, setPriority] = useState("3");

  const addToQueueMutation = useMutation({
    mutationFn: async (data: AddToQueueData) => {
      await apiClient.post("/v1/queue", data);
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
    setPriority("3");
  };

  const handleSubmit = () => {
    if (!patientId) {
      toast.error("Please enter patient ID");
      return;
    }

    const data: AddToQueueData = {
      patientId,
      priority: parseInt(priority, 10),
    };

    addToQueueMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Patient to Queue</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Patient ID</Label>
            <Input
              placeholder="Enter patient ID (patientNumber)"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
            />
          </div>

          {/* Priority field, using 0-5 scale as suggested in the QueueItem type comment */}
          <div className="space-y-2">
            <Label>Priority (0-5)</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 - Emergency (Highest)</SelectItem>
                <SelectItem value="4">4 - Urgent</SelectItem>
                <SelectItem value="3">3 - Normal</SelectItem>
                <SelectItem value="2">2 - Low</SelectItem>
                <SelectItem value="1">1 - Routine</SelectItem>
                <SelectItem value="0">0 - Least Priority</SelectItem>
              </SelectContent>
            </Select>
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