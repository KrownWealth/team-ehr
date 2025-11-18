"use client";

import TableList from "@/components/custom/table/TableList";
import prescriptionColumns from "./columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

export default function PrescriptionsPage() {
  const router = useRouter();
  const params = useParams();
  const clinicId = params.clinicId as string;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescriptions</h1>
          <p className="text-sm text-gray-600 mt-1">
            View and manage patient prescriptions
          </p>
        </div>
        <Button
          onClick={() =>
            router.push(`/clinic/${clinicId}/prescriptions/create`)
          }
        >
          <Plus className="mr-2 h-4 w-4" />
          New Prescription
        </Button>
      </div>

      <TableList
        querykey="prescriptions"
        endpoint="/v1/prescription"
        columns={prescriptionColumns}
      />
    </div>
  );
}