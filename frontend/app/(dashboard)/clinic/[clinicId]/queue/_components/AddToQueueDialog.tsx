"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { toast } from "sonner";
import { AddToQueueData, Patient } from "@/types";
import { Check, ChevronsUpDown, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { calculateAge } from "@/lib/utils/formatters";
import { getErrorMessage } from "@/lib/helper";

interface AddToQueueDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AddToQueueDialog({
  open,
  onClose,
}: AddToQueueDialogProps) {
  const queryClient = useQueryClient();
  const [patientId, setPatientId] = useState("");
  const [priority, setPriority] = useState("3");
  const [searchQuery, setSearchQuery] = useState("");
  const [comboboxOpen, setComboboxOpen] = useState(false);

  const { data: patientsData, isLoading: loadingPatients } = useQuery({
    queryKey: ["patients-search", searchQuery],
    queryFn: async () => {
      const response = await apiClient.get("/v1/patient", {
        params: {
          search: searchQuery,
          limit: 50,
        },
      });
      return response.data;
    },
    enabled: open,
  });

  const patients: Patient[] = patientsData?.data?.items || [];

  const addToQueueMutation = useMutation({
    mutationFn: async (data: AddToQueueData) => {
      await apiClient.post("/v1/queue/add", data);
    },
    onSuccess: () => {
      toast.success("Patient added to queue");
      queryClient.invalidateQueries({ queryKey: ["queue"] });
      onClose();
      resetForm();
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed to add to queue"));
    },
  });

  const resetForm = () => {
    setPatientId("");
    setPriority("3");
    setSearchQuery("");
  };

  const handleSubmit = () => {
    if (!patientId) {
      toast.error("Please select a patient");
      return;
    }

    const data: AddToQueueData = {
      patientId,
      priority: parseInt(priority, 10),
    };

    addToQueueMutation.mutate(data);
  };

  const selectedPatient = patients?.find((p) => p.id === patientId);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Patient to Queue</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Patient</Label>
            <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={comboboxOpen}
                  className="w-full justify-between h-12"
                >
                  {selectedPatient ? (
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-xs font-semibold text-green-600">
                          {selectedPatient.firstName[0]}
                          {selectedPatient.lastName[0]}
                        </span>
                      </div>
                      <span className="font-medium">
                        {selectedPatient.firstName} {selectedPatient.lastName}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({selectedPatient.patientNumber})
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">
                      Search and select patient...
                    </span>
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[460px] p-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search by name, ID, phone, or email..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    {loadingPatients ? (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        Loading patients...
                      </div>
                    ) : patients.length === 0 ? (
                      <CommandEmpty>
                        {searchQuery
                          ? "No patients found matching your search."
                          : "Start typing to search for patients..."}
                      </CommandEmpty>
                    ) : (
                      <CommandGroup>
                        {patients.map((patient) => {
                          const age = calculateAge(patient.birthDate);
                          return (
                            <CommandItem
                              key={patient.id}
                              value={patient.id}
                              onSelect={(currentValue) => {
                                setPatientId(
                                  currentValue === patientId ? "" : currentValue
                                );
                                setComboboxOpen(false);
                              }}
                              className="flex items-center gap-3 py-3"
                            >
                              <Check
                                className={cn(
                                  "h-4 w-4",
                                  patientId === patient.id
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-semibold text-green-600">
                                  {patient.firstName[0]}
                                  {patient.lastName[0]}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium truncate">
                                    {patient.firstName} {patient.lastName}
                                  </span>
                                  <span className="text-xs text-muted-foreground font-mono">
                                    {patient.patientNumber}
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                                  <span>{patient.gender}</span>
                                  <span>{age} yrs</span>
                                  {patient.phone && (
                                    <span className="font-mono">
                                      {patient.phone}
                                    </span>
                                  )}
                                  {patient.email && (
                                    <span className="truncate">
                                      {patient.email}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Priority (0-5)</Label>
            <Select value={priority} onValueChange={setPriority}>
              <SelectTrigger className="w-full">
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
            <Button
              onClick={handleSubmit}
              disabled={addToQueueMutation.isPending}
            >
              {addToQueueMutation.isPending ? "Adding..." : "Add to Queue"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
