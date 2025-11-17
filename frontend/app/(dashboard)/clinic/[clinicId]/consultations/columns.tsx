"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, FileText } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, useParams } from "next/navigation";
import { Consultation } from "@/types";
import { formatDateTime } from "@/lib/utils/formatters";

const ActionsComponent = ({ consultation }: { consultation: Consultation }) => {
  const router = useRouter();
  const params = useParams();
  const clinicId = params.clinicId as string;

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
            router.push(`/clinic/${clinicId}/consultations/${consultation.id}`)
          }
        >
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        {consultation.status === "In Progress" && (
          <DropdownMenuItem
            onClick={() =>
              router.push(
                `/clinic/${clinicId}/consultations/${consultation.id}?edit=true`
              )
            }
          >
            <Edit className="mr-2 h-4 w-4" />
            Continue Editing
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() =>
            router.push(
              `/clinic/${clinicId}/patients/${consultation.patientId}`
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

const consultationColumns: ColumnDef<Consultation>[] = [
  {
    id: "patient",
    header: "Patient",
    accessorKey: "patientId",
    cell: ({ row }) => {
      const consultation = row.original;
      // Assuming patient data is populated
      return (
        <div>
          <p className="font-medium text-gray-900">Patient</p>
          <p className="text-xs text-gray-500">
            {consultation.patientId.slice(0, 8)}...
          </p>
        </div>
      );
    },
  },
  {
    id: "doctor",
    header: "Doctor",
    accessorKey: "doctor",
    cell: ({ row }) => {
      const doctor = row.original.doctor;
      return (
        <div>
          <p className="font-medium text-sm">
            Dr. {doctor.firstName} {doctor.lastName}
          </p>
        </div>
      );
    },
  },
  {
    id: "diagnosis",
    header: "Primary Diagnosis",
    accessorKey: "assessment",
    cell: ({ row }) => {
      const diagnosis = row.original.diagnosis?.[0] || row.original.assessment;
      return (
        <p className="text-sm text-gray-700 max-w-xs truncate">{diagnosis}</p>
      );
    },
  },
  {
    id: "consultationDate",
    header: "Date",
    accessorKey: "consultationDate",
    cell: ({ row }) => (
      <span className="text-sm">
        {formatDateTime(row.original.consultationDate)}
      </span>
    ),
  },
  {
    id: "followUpDate",
    header: "Follow-up",
    accessorKey: "followUpDate",
    cell: ({ row }) =>
      row.original.followUpDate ? (
        <span className="text-sm">
          {formatDateTime(row.original.followUpDate)}
        </span>
      ) : (
        <span className="text-sm text-gray-400">None</span>
      ),
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const isCompleted = row.original.status === "Completed";
      return (
        <Badge variant={isCompleted ? "default" : "secondary"}>
          {row.original.status}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => <ActionsComponent consultation={row.original} />,
  },
];

export default consultationColumns;
