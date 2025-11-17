"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PatientConsultations({ patientId }: { patientId: string }) {
  return (
    <Card className="mt-6">
      <CardContent className="py-8">
        <p className="text-center text-gray-600">Consultations history coming soon</p>
      </CardContent>
    </Card>
  );
}
