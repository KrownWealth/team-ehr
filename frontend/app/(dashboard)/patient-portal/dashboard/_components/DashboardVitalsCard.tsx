import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Heart, Scale, Thermometer } from "lucide-react";
import { formatDateTime } from "@/lib/utils/formatters";
import { Vitals } from "@/types"; // Importing from your types file

interface DashboardVitalsCardProps {
  latestVitals: Vitals | null;
}

export default function DashboardVitalsCard({
  latestVitals,
}: DashboardVitalsCardProps) {
  if (!latestVitals) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Activity className="h-5 w-5" />
            Latest Vitals
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500 mb-4">No vitals recorded yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-green-100 bg-green-50/30">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Activity className="h-5 w-5" />
            Latest Vitals
          </CardTitle>
          <span className="text-xs text-gray-500">
            {/* Vitals type uses createdAt */}
            {formatDateTime(latestVitals.createdAt)}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Activity className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">
                Blood Pressure
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {latestVitals.bloodPressure || "--/--"}
            </p>
            <span className="text-xs text-gray-500">mmHg</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Scale className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Weight</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {latestVitals.weight || "--"}
            </p>
            <span className="text-xs text-gray-500">kg</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Heart className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Pulse</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {/* Note: Type is 'pulse' not 'heartRate' */}
              {latestVitals.pulse || "--"}
            </p>
            <span className="text-xs text-gray-500">bpm</span>
          </div>

          <div className="bg-white p-4 rounded-lg border border-green-100">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Thermometer className="h-4 w-4" />
              <span className="text-xs font-medium uppercase">Temp</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {latestVitals.temperature || "--"}
            </p>
            <span className="text-xs text-gray-500">°C</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
