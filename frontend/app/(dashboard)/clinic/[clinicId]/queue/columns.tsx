"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Heart, Stethoscope, XCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { QueueItem } from "@/types";
import { formatRelativeTime, calculateAge } from "@/lib/utils/formatters";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { toast } from "sonner";
import { useAuth } from "@/lib/hooks/use-auth";

const ActionsComponent = ({ queue }: { queue: QueueItem }) => {
  const router = useRouter();
  const params = useParams();
  const clinicId = params.clinicId as string;
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: async (status: string) => {
      await apiClient.patch(`/queue/${queue.id}/status`, { status });
    },
    onSuccess: () => {
      toast.success("Queue status updated");
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
  });

  const removeMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/queue/${queue.id}`);
    },
    onSuccess: () => {
      toast.success("Patient removed from queue");
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
  });

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
            router.push(`/clinic/${clinicId}/patients/${queue.patientId}`)
          }
        >
          <Eye className="mr-2 h-4 w-4" />
          View Patient
        </DropdownMenuItem>

        {user?.role === "NURSE" && queue.status === "Waiting" && (
          <DropdownMenuItem
            onClick={() => updateStatusMutation.mutate("Vitals")}
          >
            <Heart className="mr-2 h-4 w-4" />
            Record Vitals
          </DropdownMenuItem>
        )}

        {user?.role === "DOCTOR" && queue.status === "Vitals" && (
          <DropdownMenuItem
            onClick={() => updateStatusMutation.mutate("Consultation")}
          >
            <Stethoscope className="mr-2 h-4 w-4" />
            Start Consultation
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          onClick={() => removeMutation.mutate()}
          className="text-red-600"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Remove from Queue
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const queueColumns: ColumnDef<QueueItem>[] = [
  {
    id: "queueNumber",
    header: "Queue #",
    accessorKey: "queueNumber",
    cell: ({ row }) => (
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-600 text-white font-bold">
        {row.original.queueNumber}
      </div>
    ),
  },
  {
    id: "patient",
    header: "Patient",
    accessorKey: "patient",
    cell: ({ row }) => {
      const patient = row.original.patient;
      const fullName = `${patient.firstName} ${patient.lastName}`;
      const age = calculateAge(patient.birthDate);

      return (
        <div>
          <p className="font-medium text-gray-900">{fullName}</p>
          <p className="text-xs text-gray-500">
            {patient.gender} · {age} years · {patient.upi}
          </p>
        </div>
      );
    },
  },
  {
    id: "visitType",
    header: "Visit Type",
    accessorKey: "visitType",
    cell: ({ row }) => {
      const colors: Record<string, string> = {
        New: "bg-green-100 text-green-700",
        "Follow-up": "bg-green-100 text-green-700",
        Emergency: "bg-red-100 text-red-700",
      };
      return (
        <Badge className={colors[row.original.visitType]}>
          {row.original.visitType}
        </Badge>
      );
    },
  },
  {
    id: "priority",
    header: "Priority",
    accessorKey: "priority",
    cell: ({ row }) => {
      const colors: Record<string, string> = {
        Normal: "bg-gray-100 text-gray-700",
        Urgent: "bg-orange-100 text-orange-700",
        Emergency: "bg-red-100 text-red-700",
      };
      return (
        <Badge className={colors[row.original.priority]}>
          {row.original.priority}
        </Badge>
      );
    },
  },
  {
    id: "chiefComplaint",
    header: "Chief Complaint",
    accessorKey: "chiefComplaint",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.chiefComplaint || "N/A"}</span>
    ),
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const colors: Record<string, string> = {
        Waiting: "bg-yellow-100 text-yellow-700",
        Vitals: "bg-green-100 text-green-700",
        Consultation: "bg-purple-100 text-purple-700",
        Completed: "bg-green-100 text-green-700",
        Cancelled: "bg-gray-100 text-gray-700",
      };
      return (
        <Badge className={colors[row.original.status]}>
          {row.original.status}
        </Badge>
      );
    },
  },
  {
    id: "addedAt",
    header: "Added",
    accessorKey: "addedAt",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        {formatRelativeTime(row.original.addedAt)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Action",
    cell: ({ row }) => <ActionsComponent queue={row.original} />,
  },
];

export default queueColumns;
