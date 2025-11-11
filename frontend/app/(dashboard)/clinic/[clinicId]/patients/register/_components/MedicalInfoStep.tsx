"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useState } from "react";

interface MedicalInfoStepProps {
  data: any;
  onChange: (data: any) => void;
}

export default function MedicalInfoStep({ data, onChange }: MedicalInfoStepProps) {
  const [allergyInput, setAllergyInput] = useState("");
  const [conditionInput, setConditionInput] = useState("");

  const handleChange = (field: string, value: any) => {
    onChange({ [field]: value });
  };

  const addAllergy = () => {
    if (allergyInput.trim()) {
      const allergies = [...(data.allergies || []), allergyInput.trim()];
      handleChange("allergies", allergies);
      setAllergyInput("");
    }
  };

  const removeAllergy = (index: number) => {
    const allergies = data.allergies.filter((_: any, i: number) => i !== index);
    handleChange("allergies", allergies);
  };

  const addCondition = () => {
    if (conditionInput.trim()) {
      const conditions = [...(data.chronicConditions || []), conditionInput.trim()];
      handleChange("chronicConditions", conditions);
      setConditionInput("");
    }
  };

  const removeCondition = (index: number) => {
    const conditions = data.chronicConditions.filter((_: any, i: number) => i !== index);
    handleChange("chronicConditions", conditions);
  };

  return (
    <div className="space-y-6">
      {/* Blood Group */}
      <div className="space-y-2">
        <Label htmlFor="bloodGroup">Blood Group</Label>
        <Select value={data.bloodGroup} onValueChange={(val) => handleChange("bloodGroup", val)}>
          <SelectTrigger>
            <SelectValue placeholder="Select blood group" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A+">A+</SelectItem>
            <SelectItem value="A-">A-</SelectItem>
            <SelectItem value="B+">B+</SelectItem>
            <SelectItem value="B-">B-</SelectItem>
            <SelectItem value="AB+">AB+</SelectItem>
            <SelectItem value="AB-">AB-</SelectItem>
            <SelectItem value="O+">O+</SelectItem>
            <SelectItem value="O-">O-</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Allergies */}
      <div className="space-y-2">
        <Label>Known Allergies</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter allergy (e.g., Penicillin)"
            value={allergyInput}
            onChange={(e) => setAllergyInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAllergy())}
          />
          <Button type="button" onClick={addAllergy}>
            Add
          </Button>
        </div>
        {data.allergies && data.allergies.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.allergies.map((allergy: string, index: number) => (
              <Badge key={index} variant="destructive" className="flex items-center gap-1">
                {allergy}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeAllergy(index)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Chronic Conditions */}
      <div className="space-y-2">
        <Label>Chronic Conditions</Label>
        <div className="flex gap-2">
          <Input
            placeholder="Enter condition (e.g., Hypertension)"
            value={conditionInput}
            onChange={(e) => setConditionInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addCondition())}
          />
          <Button type="button" onClick={addCondition}>
            Add
          </Button>
        </div>
        {data.chronicConditions && data.chronicConditions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {data.chronicConditions.map((condition: string, index: number) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                {condition}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => removeCondition(index)}
                />
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> Allergy and chronic condition information is critical for safe treatment. 
          Please ensure all known allergies and conditions are recorded.
        </p>
      </div>
    </div>
  );
}