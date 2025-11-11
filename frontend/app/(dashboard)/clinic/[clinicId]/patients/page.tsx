"use client";

import TableList from "@/components/custom/table/TableList";
import patientColumns from "./column";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

export default function PatientsPage() {
  const router = useRouter();
  const params = useParams();
  const clinicId = params.clinicId as string;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage and view all registered patients
          </p>
        </div>
        <Button onClick={() => router.push(`/clinic/${clinicId}/patients/register`)}>
          <Plus className="mr-2 h-4 w-4" />
          Register Patient
        </Button>
      </div>

      <TableList
        title="All Patients"
        querykey="patients"
        endpoint="/patient"
        columns={patientColumns}
      />
    </div>
  );
}
