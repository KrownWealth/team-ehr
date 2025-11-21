import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VitalRecord } from "../page";
import { Activity, Scale } from "lucide-react";
import { formatDateTime } from "@/lib/utils/formatters";

interface VitalsTrendOverviewProps {
  vitals: VitalRecord[];
}

export default function VitalsTrendOverview({
  vitals,
}: VitalsTrendOverviewProps) {
  if (vitals.length < 2) {
    return null;
  }

  const chartData = [...vitals].reverse().slice(-7);

  const getSystolic = (bp: string | undefined) => {
    if (!bp) return 0;
    const parts = bp.split("/");
    return parseInt(parts[0]) || 0;
  };

  const calculateHeight = (val: number, max: number) => {
    if (max === 0) return "0%";
    return `${(val / max) * 100}%`;
  };

  const maxSystolic = Math.max(
    ...chartData.map((v) => getSystolic(v.bloodPressure))
  );
  const maxWeight = Math.max(...chartData.map((v) => v.weight || 0));

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-green-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
            <Activity className="h-5 w-5 text-green-600" />
            BP Trend (Systolic)
          </CardTitle>
          <p className="text-xs text-gray-500">Last 7 entries</p>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end justify-between gap-2 pt-6">
            {chartData.map((vital, i) => {
              const val = getSystolic(vital.bloodPressure);
              const height = calculateHeight(val, maxSystolic || 160); // Default max 160 if data is low

              if (val === 0) return null;

              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1 flex-1 group"
                >
                  <div
                    className="w-full bg-green-100 rounded-t-md relative hover:bg-green-200 transition-all"
                    style={{ height: height }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-green-800 opacity-0 group-hover:opacity-100 transition-opacity">
                      {val}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {new Date(vital.recordedAt || vital.createdAt).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2 text-gray-800">
            <Scale className="h-5 w-5 text-blue-600" />
            Weight Trend (kg)
          </CardTitle>
          <p className="text-xs text-gray-500">Last 7 entries</p>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end justify-between gap-2 pt-6">
            {chartData.map((vital, i) => {
              const val = vital.weight || 0;
              const height = calculateHeight(val, maxWeight || 100);

              if (val === 0) return null;

              return (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1 flex-1 group"
                >
                  <div
                    className="w-full bg-blue-100 rounded-t-md relative hover:bg-blue-200 transition-all"
                    style={{ height: height }}
                  >
                    <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity">
                      {val}
                    </span>
                  </div>
                  <span className="text-[10px] text-gray-400">
                    {new Date(vital.recordedAt || vital.createdAt).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
