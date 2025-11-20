"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Edit,
  XCircle,
  CheckCircle,
  Mail,
  Phone,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Staff } from "@/types";
import { formatRelativeTime } from "@/lib/utils/formatters";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/helper";

const RoleBadge = ({ role }: { role: Staff["role"] }) => {
  const colors: Record<string, string> = {
    ADMIN: "bg-purple-100 text-purple-700",
    DOCTOR: "bg-blue-100 text-blue-700",
    NURSE: "bg-green-100 text-green-700",
    CLERK: "bg-yellow-100 text-yellow-700",
    CASHIER: "bg-indigo-100 text-indigo-700",
    PATIENT: "bg-gray-100 text-gray-700",
  };

  return (
    <Badge className={colors[role] || "bg-gray-100 text-gray-700"}>
      {role}
    </Badge>
  );
};

const ActionsComponent = ({ staff }: { staff: Staff }) => {
  const queryClient = useQueryClient();

  const toggleStatusMutation = useMutation({
    mutationFn: async () => {
      const newStatus = !staff.isActive;
      await apiClient.patch(`/v1/staff/${staff.id}`, { isActive: newStatus });
    },
    onSuccess: () => {
      toast.success(
        `Staff member ${
          !staff.isActive ? "activated" : "deactivated"
        } successfully!`
      );
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, "Failed to update status"));
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
        <DropdownMenuItem>
          <Edit className="mr-2 h-4 w-4" />
          Edit Details
        </DropdownMenuItem>

        {staff.isActive ? (
          <DropdownMenuItem
            onClick={() => toggleStatusMutation.mutate()}
            className="text-red-600"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Deactivate
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => toggleStatusMutation.mutate()}
            className="text-green-600"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Activate
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const staffColumns: ColumnDef<Staff>[] = [
  {
    id: "fullname",
    header: "Name",
    accessorKey: "firstName",
    cell: ({ row }) => {
      const fullName = `${row.original.firstName} ${row.original.lastName}`;
      const initials = `${row.original.firstName[0]}${row.original.lastName[0]}`;

      return (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-sm font-semibold text-green-700">
              {initials}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900">{fullName}</p>
            <p className="text-xs text-gray-500">
              ID: {row.original.id.slice(0, 8)}...
            </p>
          </div>
        </div>
      );
    },
  },
  {
    id: "email",
    header: "Email",
    accessorKey: "email",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-gray-400" />
        <span className="text-sm">{row.original.email}</span>
      </div>
    ),
  },
  {
    id: "phone",
    header: "Phone",
    accessorKey: "phone",
    cell: ({ row }) =>
      row.original.phone ? (
        <div className="flex items-center gap-2">
          <Phone className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-mono">{row.original.phone}</span>
        </div>
      ) : (
        <span className="text-sm text-gray-400">N/A</span>
      ),
  },
  {
    id: "role",
    header: "Role",
    accessorKey: "role",
    cell: ({ row }) => <RoleBadge role={row.original.role} />,
  },
  {
    id: "lastLogin",
    header: "Last Login",
    accessorKey: "lastLogin",
    cell: ({ row }) =>
      row.original.lastLogin ? (
        <span className="text-sm text-gray-600">
          {formatRelativeTime(row.original.lastLogin)}
        </span>
      ) : (
        <span className="text-sm text-gray-400">Never</span>
      ),
  },
  {
    id: "isActive",
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
    cell: ({ row }) => <ActionsComponent staff={row.original} />,
  },
];

export default staffColumns;
