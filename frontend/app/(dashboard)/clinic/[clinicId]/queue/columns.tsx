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
import { QueueItem, QueueStatus } from "@/types";
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
    mutationFn: async (status: QueueStatus) => {
      await apiClient.patch(`/v1/queue/${queue.id}/status`, { status });
    },
    onSuccess: () => {
      toast.success("Queue status updated");
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update status");
    },
  });

  const removeMutation = useMutation({
    mutationFn: async () => {
      await apiClient.delete(`/v1/queue/${queue.id}`);
    },
    onSuccess: () => {
      toast.success("Patient removed from queue");
      queryClient.invalidateQueries({ queryKey: ["queue"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to remove patient");
    },
  });

  const isNurse = user?.role === "NURSE";
  const isDoctor = user?.role === "DOCTOR";

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

        {/* NURSE: Move from WAITING to IN_CONSULTATION (implying vitals taken) */}
        {isNurse && queue.status === "WAITING" && (
          <DropdownMenuItem
            onClick={() => updateStatusMutation.mutate("IN_CONSULTATION")}
          >
            <Heart className="mr-2 h-4 w-4" />
            Process Patient
          </DropdownMenuItem>
        )}

        {/* DOCTOR: Move from IN_CONSULTATION to COMPLETED */}
        {isDoctor && queue.status === "IN_CONSULTATION" && (
          <DropdownMenuItem
            onClick={() => updateStatusMutation.mutate("COMPLETED")}
          >
            <Stethoscope className="mr-2 h-4 w-4" />
            Complete Consultation
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
    id: "position",
    header: "Queue #",
    accessorKey: "position",
    cell: ({ row }) => (
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-green-600 text-white font-bold">
        {row.original.position}
      </div>
    ),
  },
  {
    id: "patient",
    header: "Patient",
    accessorKey: "patientName", // Use patientName directly from QueueItem
    cell: ({ row }) => {
      // No full patient object available, using patientName and patientId
      return (
        <div>
          <p className="font-medium text-gray-900">
            {row.original.patientName}
          </p>
          <p className="text-xs text-gray-500">
            Patient ID: {row.original.patientId.slice(0, 8).toUpperCase()}...
          </p>
        </div>
      );
    },
  },
  {
    id: "priority",
    header: "Priority",
    accessorKey: "priority",
    cell: ({ row }) => {
      const priority = row.original.priority;
      const priorityMap: Record<number, { label: string; className: string }> =
        {
          5: { label: "EMERGENCY (5)", className: "bg-red-100 text-red-700" },
          4: {
            label: "Urgent (4)",
            className: "bg-orange-100 text-orange-700",
          },
          3: {
            label: "Normal (3)",
            className: "bg-yellow-100 text-yellow-700",
          },
          2: { label: "Low (2)", className: "bg-green-100 text-green-700" },
          1: { label: "Routine (1)", className: "bg-blue-100 text-blue-700" },
          0: { label: "Least (0)", className: "bg-gray-100 text-gray-700" },
        };
      const { label, className } = priorityMap[priority] || priorityMap[3];
      return <Badge className={className}>{label}</Badge>;
    },
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const status = row.original.status;
      const colors: Record<QueueStatus, string> = {
        WAITING: "bg-yellow-100 text-yellow-700",
        IN_CONSULTATION: "bg-purple-100 text-purple-700",
        COMPLETED: "bg-green-100 text-green-700",
      };
      return (
        <Badge className={colors[status] || "bg-gray-100 text-gray-700"}>
          {status.replace("_", " ")}
        </Badge>
      );
    },
  },
  {
    id: "createdAt",
    header: "Added",
    accessorKey: "createdAt",
    cell: ({ row }) => (
      <span className="text-sm text-gray-600">
        {formatRelativeTime(row.original.createdAt)}
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
