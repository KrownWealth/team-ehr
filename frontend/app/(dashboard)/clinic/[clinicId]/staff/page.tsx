"use client";

import TableList from "@/components/custom/table/TableList";
import staffColumns from "./columns";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import InviteStaffDialog from "./_components/InviteStaffDialog";

export default function StaffPage() {
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Staff Management</h1>
          <p className="text-base text-gray-600 mt-1">
            Manage clinic staff members and their roles
          </p>
        </div>
        <button className="btn btn-outline" onClick={() => setInviteOpen(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Staff
        </button>
      </div>

      <TableList
        querykey="staff"
        endpoint="/staff"
        columns={staffColumns}
      />

      <InviteStaffDialog open={inviteOpen} onClose={() => setInviteOpen(false)} />
    </div>
  );
}