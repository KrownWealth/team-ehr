import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  Pill,
  Activity,
  Calendar,
  User,
  FileText,
} from "lucide-react";
import { formatDateTime } from "@/lib/utils/formatters";

interface MedicalHistoryListProps {
  records: any[];
  type: string;
}

export default function MedicalHistoryList({
  records,
  type,
}: MedicalHistoryListProps) {
  if (records.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-lg text-gray-900">
            No records found
          </h3>
          <p className="text-gray-500 max-w-sm mt-1">
            We couldn't find any {type} history in your file.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <div key={record.id}>{renderCard(record, type)}</div>
      ))}
    </div>
  );
}

function renderCard(record: any, type: string) {
  switch (type) {
    case "consultations":
      return <ConsultationCard consultation={record} />;
    case "prescriptions":
      return <PrescriptionCard prescription={record} />;
    case "vitals":
      return <VitalsCard vital={record} />;
    default:
      return null;
  }
}

function ConsultationCard({ consultation }: { consultation: any }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-700 border-purple-200"
            >
              Consultation
            </Badge>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDateTime(consultation.createdAt)}
            </span>
          </div>
          {consultation.doctor && (
            <span className="text-sm font-medium flex items-center gap-1 text-gray-700">
              <User className="h-3 w-3" />
              Dr. {consultation.doctor.lastName}
            </span>
          )}
        </div>
        <div className="space-y-2">
          <h4 className="font-bold text-gray-900 text-lg">
            {consultation.assessment || "General Checkup"}
          </h4>
          <p className="text-gray-600 text-sm line-clamp-2">
            <span className="font-semibold">Plan:</span> {consultation.plan}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function PrescriptionCard({ prescription }: { prescription: any }) {
  // Supports both direct prescription objects or grouped by consultation
  const meds = prescription.prescriptions || [prescription];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              Rx Prescription
            </Badge>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDateTime(prescription.createdAt)}
            </span>
          </div>
          {prescription.doctor && (
            <span className="text-sm font-medium flex items-center gap-1 text-gray-700">
              <User className="h-3 w-3" />
              Dr. {prescription.doctor.lastName}
            </span>
          )}
        </div>

        <div className="space-y-3">
          {meds.map((med: any, idx: number) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-2 rounded bg-gray-50"
            >
              <Pill className="h-4 w-4 text-blue-500 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">{med.drug}</p>
                <p className="text-xs text-gray-600">
                  {med.dosage} • {med.frequency} • {med.duration}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function VitalsCard({ vital }: { vital: any }) {
  return (
    <Card className="hover:shadow-md transition-shadow border-l-4 border-l-green-500">
      <CardContent className="p-5">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-green-600" />
            <span className="font-semibold text-gray-900">Vitals Log</span>
          </div>
          <span className="text-sm text-gray-500">
            {formatDateTime(vital.createdAt || vital.recordedAt)}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          {vital.bloodPressure && (
            <div>
              <p className="text-xs text-gray-500 uppercase">Blood Pressure</p>
              <p className="font-bold text-gray-900">{vital.bloodPressure}</p>
            </div>
          )}
          {vital.weight && (
            <div>
              <p className="text-xs text-gray-500 uppercase">Weight</p>
              <p className="font-bold text-gray-900">{vital.weight} kg</p>
            </div>
          )}
          {vital.temperature && (
            <div>
              <p className="text-xs text-gray-500 uppercase">Temp</p>
              <p className="font-bold text-gray-900">{vital.temperature} °C</p>
            </div>
          )}
          {vital.heartRate && (
            <div>
              <p className="text-xs text-gray-500 uppercase">Pulse</p>
              <p className="font-bold text-gray-900">{vital.heartRate} bpm</p>
            </div>
          )}
        </div>

        {vital.notes && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-gray-500">Notes:</p>
            <p className="text-sm text-gray-700">{vital.notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
