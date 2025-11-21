import { Card, CardContent } from "@/components/ui/card";
import { VitalRecord } from "../page";
import { Activity, Calendar, Thermometer, Heart, Scale } from "lucide-react";
import { formatDateTime } from "@/lib/utils/formatters";

interface VitalsHistoryProps {
  vitals: VitalRecord[];
}

export default function VitalsHistory({ vitals }: VitalsHistoryProps) {
  if (vitals.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12 text-center">
          <p className="text-gray-500">
            No vital records found. Start logging today!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {vitals.map((vital) => (
        <Card
          key={vital.id}
          className="hover:border-green-200 transition-colors"
        >
          <CardContent className="p-5">
            <div className="flex justify-between items-center mb-4 border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="bg-green-50 p-2 rounded-full">
                  <Activity className="h-4 w-4 text-green-600" />
                </div>
                <span className="font-medium text-gray-900">
                  {formatDateTime(vital.recordedAt || vital.createdAt)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* BP */}
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1">
                  Blood Pressure
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-xl font-bold text-gray-900">
                    {vital.bloodPressure || "--/--"}
                  </span>
                  <span className="text-xs text-gray-400 mb-1">mmHg</span>
                </div>
              </div>

              {/* Weight */}
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                  <Scale className="h-3 w-3" /> Weight
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-xl font-bold text-gray-900">
                    {vital.weight || "--"}
                  </span>
                  <span className="text-xs text-gray-400 mb-1">kg</span>
                </div>
              </div>

              {/* Temp */}
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                  <Thermometer className="h-3 w-3" /> Temp
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-xl font-bold text-gray-900">
                    {vital.temperature || "--"}
                  </span>
                  <span className="text-xs text-gray-400 mb-1">°C</span>
                </div>
              </div>

              {/* Heart Rate */}
              <div>
                <p className="text-xs text-gray-500 uppercase font-medium mb-1 flex items-center gap-1">
                  <Heart className="h-3 w-3" /> Pulse
                </p>
                <div className="flex items-end gap-1">
                  <span className="text-xl font-bold text-gray-900">
                    {vital.heartRate || "--"}
                  </span>
                  <span className="text-xs text-gray-400 mb-1">bpm</span>
                </div>
              </div>
            </div>

            {vital.notes && (
              <div className="mt-4 bg-gray-50 p-3 rounded-lg text-sm text-gray-600">
                <span className="font-medium text-gray-900">Notes: </span>
                {vital.notes}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
