"use client";

import TableList from "@/components/custom/table/TableList";
import queueColumns from "./columns";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AddToQueueDialog from "./_components/AddToQueueDialog";
import QueueStatusTabs from "./_components/QueueStatusTabs";
import { useAuth } from "@/lib/hooks/use-auth";

export default function QueuePage() {
  const [addOpen, setAddOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["queue"] });
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Patient Queue</h1>
          <p className="text-base text-gray-600 mt-1">
            Real-time patient queue management
          </p>
        </div>
        {["CLERK", "NURSE"].includes(user?.role!) && (
          <div className="flex gap-2 sm:flex-shrink-0">
            <button
              className="btn btn-outline w-full sm:w-auto flex items-center justify-center"
              onClick={() => setAddOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add to Queue
            </button>
          </div>
        )}
      </div>
      <TableList
        querykey="queue"
        endpoint="/v1/queue"
        columns={queueColumns}
        tabs={{
          value: statusFilter !== "all" ? `status=${statusFilter}` : "",
          component: (
            <QueueStatusTabs value={statusFilter} onChange={setStatusFilter} />
          ),
        }}
        noSearch={false}
      />


      <AddToQueueDialog open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
