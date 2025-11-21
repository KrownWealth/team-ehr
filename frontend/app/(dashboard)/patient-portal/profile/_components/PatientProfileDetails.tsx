import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PatientDashboard } from "@/types";
import { User, Phone, MapPin, Heart, Contact } from "lucide-react";
import {
  formatDate,
  formatPhoneNumber,
  calculateAge,
} from "@/lib/utils/formatters";

interface PatientProfileDetailsProps {
  patient: PatientDashboard["patient_info"] & {
    phone?: string;
    email?: string;
    addressLine?: string;
    city?: string;
    state?: string;
  };
}

export default function PatientProfileDetails({
  patient,
}: PatientProfileDetailsProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-gray-500" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">
              Full Name
            </p>
            <p className="font-medium text-gray-900">
              {patient.firstName} {patient.lastName}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">
              Patient ID
            </p>
            <p className="font-medium text-gray-900 font-mono">
              {patient.patientNumber}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">
              Date of Birth
            </p>
            <p className="font-medium text-gray-900">
              {formatDate(patient.birthDate)} ({calculateAge(patient.birthDate)}{" "}
              yrs)
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase font-medium mb-1">
              Gender
            </p>
            <p className="font-medium text-gray-900 capitalize">
              {patient.gender.toLowerCase()}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Contact className="h-5 w-5 text-gray-500" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Phone Number</p>
              <p className="font-medium text-gray-900">
                {patient.phone ? formatPhoneNumber(patient.phone) : "--"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 pt-2">
            <MapPin className="h-4 w-4 text-gray-400 mt-1" />
            <div>
              <p className="text-xs text-gray-500">Address</p>
              <p className="font-medium text-gray-900">
                {patient.addressLine || "No address recorded"}
              </p>
              {(patient.city || patient.state) && (
                <p className="text-sm text-gray-600">
                  {patient.city}, {patient.state}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Heart className="h-5 w-5 text-gray-500" />
            Medical Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="text-sm text-gray-600 mb-2 font-medium">
              Blood Group
            </p>
            <Badge
              variant="outline"
              className="text-base px-3 py-1 font-mono border-red-200 text-red-700 bg-red-50"
            >
              {patient.bloodGroup || "Unknown"}
            </Badge>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2 font-medium">
              Known Allergies
            </p>
            {patient.allergies && patient.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((allergy, idx) => (
                  <Badge key={idx} variant="destructive" className="text-xs py-1 px-2.5">
                    {allergy}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No known allergies recorded.
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2 font-medium">
              Chronic Conditions
            </p>
            {patient.chronicConditions &&
            patient.chronicConditions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.chronicConditions.map((condition, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs py-1 px-2.5">
                    {condition}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">
                No chronic conditions recorded.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
