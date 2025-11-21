import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, AlertTriangle, Info, ShieldAlert } from "lucide-react";

interface AIInsight {
  type: "diagnosis" | "interaction" | "risk";
  severity?: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  recommendations?: string[];
}

interface AIInsightsCardProps {
  insights: AIInsight[];
}

export default function AIInsightsCard({ insights }: AIInsightsCardProps) {
  if (insights.length === 0) return null;

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 border-red-500 text-red-900";
      case "high":
        return "bg-orange-100 border-orange-500 text-orange-900";
      case "medium":
        return "bg-yellow-100 border-yellow-500 text-yellow-900";
      case "low":
        return "bg-blue-100 border-blue-500 text-blue-900";
      default:
        return "bg-purple-100 border-purple-500 text-purple-900";
    }
  };

  const getIcon = (type: string, severity?: string) => {
    if (severity === "critical" || severity === "high") {
      return <AlertTriangle className="h-5 w-5" />;
    }
    if (type === "interaction") {
      return <ShieldAlert className="h-5 w-5" />;
    }
    if (type === "diagnosis") {
      return <Sparkles className="h-5 w-5" />;
    }
    return <Info className="h-5 w-5" />;
  };

  return (
    <Card className="border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-900">
          <Sparkles className="h-5 w-5" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 ${getSeverityColor(
              insight.severity
            )}`}
          >
            <div className="flex items-start gap-3">
              {getIcon(insight.type, insight.severity)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">{insight.title}</p>
                  {insight.severity && (
                    <Badge
                      variant={
                        insight.severity === "critical" ||
                        insight.severity === "high"
                          ? "destructive"
                          : "secondary"
                      }
                      className="text-xs"
                    >
                      {insight.severity.toUpperCase()}
                    </Badge>
                  )}
                </div>
                <p className="text-sm mb-2">{insight.description}</p>
                {insight.recommendations &&
                  insight.recommendations.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium mb-1">
                        Recommendations:
                      </p>
                      <ul className="text-xs space-y-1 list-disc list-inside">
                        {insight.recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
