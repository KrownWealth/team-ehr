"use client";

import { Card, CardContent } from "@/components/ui/card";

export default function PatientPrescriptions({ patientId }: { patientId: string }) {
  return (
    <Card className="mt-6">
      <CardContent className="py-8">
        <p className="text-center text-gray-600">Prescriptions history coming soon</p>
      </CardContent>
    </Card>
  );
}