"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmergencyContactStepProps {
  data: any;
  onChange: (data: any) => void;
}

export default function EmergencyContactStep({
  data,
  onChange,
}: EmergencyContactStepProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ [field]: value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <p className="text-sm text-green-800">
          Please provide emergency contact information. This person will be
          contacted in case of medical emergencies.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="emergencyContact">
          Emergency Contact Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="emergencyContact"
          placeholder="Full name of emergency contact"
          value={data.emergencyContact}
          onChange={(e) => handleChange("emergencyContact", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="emergencyPhone">
          Emergency Contact Phone <span className="text-red-500">*</span>
        </Label>
        <Input
          id="emergencyPhone"
          type="tel"
          placeholder="08012345678"
          value={data.emergencyPhone}
          onChange={(e) => handleChange("emergencyPhone", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="emergencyRelation">
          Relationship <span className="text-red-500">*</span>
        </Label>
        <Input
          id="emergencyRelation"
          placeholder="e.g., Spouse, Parent, Sibling, Friend"
          value={data.emergencyRelation}
          onChange={(e) => handleChange("emergencyRelation", e.target.value)}
          required
        />
      </div>

      <div className="border-t pt-6 mt-6">
        <h3 className="font-semibold text-lg mb-4">Registration Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Patient Name:</p>
            <p className="font-medium">
              {data.firstName} {data.lastName}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Gender:</p>
            <p className="font-medium">{data.gender || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-600">Phone:</p>
            <p className="font-medium">{data.phone || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-600">Blood Group:</p>
            <p className="font-medium">{data.bloodGroup || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-600">Emergency Contact:</p>
            <p className="font-medium">{data.emergencyContact || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-600">Emergency Phone:</p>
            <p className="font-medium">{data.emergencyPhone || "N/A"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
