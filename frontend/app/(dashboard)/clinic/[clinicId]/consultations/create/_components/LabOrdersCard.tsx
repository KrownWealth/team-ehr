import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface LabOrder {
  test: string;
  instructions?: string;
}

interface LabOrdersCardProps {
  labOrders: LabOrder[];
  currentLab: {
    test: string;
    instructions: string;
  };
  onCurrentLabChange: (field: string, value: string) => void;
  onAddLabOrder: () => void;
  onRemoveLabOrder: (index: number) => void;
}

export default function LabOrdersCard({
  labOrders,
  currentLab,
  onCurrentLabChange,
  onAddLabOrder,
  onRemoveLabOrder,
}: LabOrdersCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lab Orders (Optional)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Test Name</Label>
          <Input
            placeholder="e.g., Complete Blood Count (CBC)"
            value={currentLab.test}
            onChange={(e) => onCurrentLabChange("test", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label>Instructions (Optional)</Label>
          <Input
            placeholder="e.g., Fasting required"
            value={currentLab.instructions}
            onChange={(e) => onCurrentLabChange("instructions", e.target.value)}
          />
        </div>

        <button
          type="button"
          onClick={onAddLabOrder}
          className="w-full btn btn-outline"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Lab Order
        </button>

        {labOrders.length > 0 && (
          <div className="space-y-3 mt-4">
            <p className="font-medium text-sm">
              Added Lab Orders ({labOrders.length})
            </p>
            {labOrders.map((lab, index) => (
              <div
                key={index}
                className="flex justify-between items-start p-4 border rounded-lg bg-gray-50"
              >
                <div className="flex-1">
                  <p className="font-semibold">{lab.test}</p>
                  {lab.instructions && (
                    <p className="text-sm text-gray-600">{lab.instructions}</p>
                  )}
                </div>
                <button
                  onClick={() => onRemoveLabOrder(index)}
                  className="text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
