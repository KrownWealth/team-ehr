"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Edit, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Patient } from "@/types";
import { calculateAge, formatDate } from "@/lib/utils/formatters";
import { useAuth } from "@/lib/hooks/use-auth";

const ActionsComponent = ({ patient }: { patient: Patient }) => {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
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
            router.push(`/clinic/${clinicId}/patients/${patient.id}`)
          }
        >
          <Eye className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            router.push(`/clinic/${clinicId}/patients/${patient.id}?edit=true`)
          }
        >
          <Edit className="mr-2 h-4 w-4" />
          Edit Patient
        </DropdownMenuItem>

        {["CLERK", "NURSE"].includes(user?.role!) && (
          <DropdownMenuItem
            onClick={() =>
              router.push(`/clinic/${clinicId}/queue?add=${patient.id}`)
            }
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add to Queue
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const patientColumns: ColumnDef<Patient>[] = [
  {
    id: "patientNumber",
    header: "Patient ID",
    accessorKey: "patientNumber",
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">
        {row.original.patientNumber}
      </span>
    ),
  },
  {
    id: "fullname",
    header: "Full Name",
    accessorKey: "firstName",
    cell: ({ row }) => {
      const fullName = `${row.original.firstName} ${row.original.lastName}`;
      const initials = `${row.original.firstName[0]}${row.original.lastName[0]}`;

      return (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
            <span className="text-sm font-semibold text-green-600">
              {initials}
            </span>
          </div>
          <span className="font-medium text-gray-900">{fullName}</span>
        </div>
      );
    },
  },
  {
    id: "gender",
    header: "Gender",
    accessorKey: "gender",
    cell: ({ row }) => <span className="text-sm">{row.original.gender}</span>,
  },
  {
    id: "age",
    header: "Age",
    accessorKey: "birthDate",
    cell: ({ row }) => {
      const age = calculateAge(row.original.birthDate);
      return <span className="text-sm">{age} years</span>;
    },
  },
  {
    id: "phone",
    header: "Phone",
    accessorKey: "phone",
    cell: ({ row }) => (
      <span className="text-sm font-mono">{row.original.phone}</span>
    ),
  },
  {
    id: "bloodGroup",
    header: "Blood Group",
    accessorKey: "bloodGroup",
    cell: ({ row }) => (
      <Badge variant="outline" className="font-mono">
        {row.original.bloodGroup || "N/A"}
      </Badge>
    ),
  },
  {
    id: "createdAt",
    header: "Registered",
    accessorKey: "createdAt",
    cell: ({ row }) => {
      return (
        <div className="text-sm">
          <div>{formatDate(row.original.createdAt)}</div>
        </div>
      );
    },
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "isActive",
    cell: ({ row }) => {
      const isActive = row.original.isActive;
      return (
        <Badge variant={isActive ? "default" : "secondary"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => <ActionsComponent patient={row.original} />,
  },
];

export default patientColumns;
