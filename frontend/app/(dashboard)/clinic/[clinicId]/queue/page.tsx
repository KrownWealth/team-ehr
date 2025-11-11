"use client";

import TableList from "@/components/custom/table/TableList";
import queueColumns from "./columns";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from "lucide-react";
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
          <h1 className="text-2xl font-bold text-gray-900">Patient Queue</h1>
          <p className="text-sm text-gray-600 mt-1">
            Real-time patient queue management
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add to Queue
          </Button>
        </div>
      </div>

      <TableList
        title="Current Queue"
        querykey="queue"
        endpoint="/queue"
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
