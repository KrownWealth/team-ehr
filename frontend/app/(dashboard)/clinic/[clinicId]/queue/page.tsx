"use client";

import TableList from "@/components/custom/table/TableList";
import queueColumns from "./columns";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AddToQueueDialog from "./_components/AddToQueueDialog";
import QueueStatusTabs from "./_components/QueueStatusTabs";

export default function QueuePage() {
  const [addOpen, setAddOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ["queue"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patient Queue</h1>
          <p className="text-base text-gray-600 mt-1">
            Real-time patient queue management
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline" onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add to Queue
          </button>
        </div>
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
