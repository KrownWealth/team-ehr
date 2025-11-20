"use client";

import TableList from "@/components/custom/table/TableList";
import consultationColumns from "./columns";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

export default function ConsultationsPage() {
  const router = useRouter();
  const params = useParams();
  const clinicId = params.clinicId as string;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Consultations</h1>
          <p className="text-sm text-gray-600 mt-1">
            View and manage patient consultations
          </p>
        </div>
        <button
          className="btn btn-block"
          onClick={() => router.push(`/clinic/${clinicId}/consultations/create`)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Start Consultation
        </button>
      </div>

      <TableList
        querykey="consultations"
        endpoint="/v1/consultation"
        columns={consultationColumns}
      />
    </div>
  );
}
