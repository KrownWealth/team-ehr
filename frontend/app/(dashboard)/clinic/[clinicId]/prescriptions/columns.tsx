"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Printer, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, useParams } from "next/navigation";
import { Prescription } from "@/types";
import { formatDateTime } from "@/lib/utils/formatters";

const ActionsComponent = ({ prescription }: { prescription: Prescription }) => {
  const router = useRouter();
  const params = useParams();
  const clinicId = params.clinicId as string;

  const handlePrint = () => {
    window.open(
      `/clinic/${clinicId}/prescriptions/${prescription.id}/print`,
      "_blank"
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() =>
            router.push(`/clinic/${clinicId}/prescriptions/${prescription.id}`)
          }
        >
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print Prescription
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            router.push(
              `/clinic/${clinicId}/patients/${prescription.patientId}`
            )
          }
        >
          <FileText className="mr-2 h-4 w-4" />
          Patient Records
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const prescriptionColumns: ColumnDef<Prescription>[] = [
  {
    id: "patient",
    header: "Patient",
    accessorKey: "patient",
    cell: ({ row }) => {
      const patient = row.original.patient;
      if (!patient) return <p className="text-gray-500">N/A</p>;
      return (
        <div>
          <p className="font-medium text-gray-900">
            {patient.firstName} {patient.lastName}
          </p>
          <p className="text-xs text-gray-500">{patient.patientNumber}</p>
        </div>
      );
    },
  },
  {
    id: "doctor",
    header: "Prescribed By",
    accessorKey: "doctor",
    cell: ({ row }) => {
      const doctor = row.original.doctor;
      if (!doctor) return <p className="text-gray-500">N/A</p>;
      return (
        <p className="text-sm">
          Dr. {doctor.firstName} {doctor.lastName}
        </p>
      );
    },
  },
  {
    id: "prescriptions",
    header: "Medications",
    accessorKey: "prescriptions",
    cell: ({ row }) => {
      const meds = row.original.prescriptions;
      return (
        <div className="space-y-1">
          {meds.slice(0, 2).map((med, i) => (
            <p key={i} className="text-sm text-gray-700">
              • {med.drug} ({med.dosage})
            </p>
          ))}
          {meds.length > 2 && (
            <p className="text-xs text-gray-500">+{meds.length - 2} more</p>
          )}
        </div>
      );
    },
  },
  {
    id: "createdAt",
    header: "Date Prescribed",
    accessorKey: "createdAt",
    cell: ({ row }) => (
      <span className="text-sm">{formatDateTime(row.original.createdAt)}</span>
    ),
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => <ActionsComponent prescription={row.original} />,
  },
];

export default prescriptionColumns;
