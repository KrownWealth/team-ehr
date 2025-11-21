import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronsUpDown, Activity } from "lucide-react";
import { Patient } from "@/types";
import { calculateAge } from "@/lib/utils/formatters";

interface PatientSelectionCardProps {
  selectedPatient: Patient | null;
  onSelectPatient: (patient: Patient) => void;
  onChangePatient: () => void;
  patients: Patient[];
  loadingPatients: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function PatientSelectionCard({
  selectedPatient,
  onSelectPatient,
  onChangePatient,
  patients,
  loadingPatients,
  searchQuery,
  onSearchChange,
}: PatientSelectionCardProps) {
  const [comboboxOpen, setComboboxOpen] = useState(false);

  if (selectedPatient) {
    return (
      <Card className="bg-green-50/20 border-green-200/10">
        <CardContent className="pt-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-semibold text-lg">
                {selectedPatient.firstName} {selectedPatient.lastName}
              </h3>
              <p className="text-sm text-gray-600">
                ID: {selectedPatient.patientNumber} · {selectedPatient.gender} ·{" "}
                {calculateAge(selectedPatient.birthDate)} years
              </p>
              {selectedPatient.allergies &&
                selectedPatient.allergies.length > 0 && (
                  <div className="mt-2 flex items-start gap-2">
                    <div>
                      <p className="text-xs font-medium text-red-600">
                        ALLERGIES:
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedPatient.allergies.map((allergy, i) => (
                          <Badge
                            key={i}
                            variant="destructive"
                            className="text-xs px-2 py-1"
                          >
                            {allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              {selectedPatient.chronicConditions &&
                selectedPatient.chronicConditions.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-orange-600">
                      Chronic Conditions:{" "}
                      {selectedPatient.chronicConditions.join(", ")}
                    </p>
                  </div>
                )}
            </div>
            <button className="btn btn-outline" onClick={onChangePatient}>
              Change Patient
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-2 w-full">
          <Label>Select Patient</Label>
          <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
            <PopoverTrigger asChild>
              <button
                className="btn btn-outline w-full justify-between h-12"
                role="combobox"
                aria-expanded={comboboxOpen}
              >
                <span className="text-muted-foreground">
                  Search and select patient...
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0" align="start">
              <Command shouldFilter={false} className="w-full">
                <CommandInput
                  placeholder="Search by name, ID, phone, or email..."
                  value={searchQuery}
                  onValueChange={onSearchChange}
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
                            onSelect={() => {
                              onSelectPatient(patient);
                              setComboboxOpen(false);
                            }}
                            className="flex items-center gap-3 py-3"
                          >
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
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
      </CardContent>
    </Card>
  );
}
