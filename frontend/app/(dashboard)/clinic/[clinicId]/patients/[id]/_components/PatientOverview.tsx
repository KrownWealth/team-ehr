"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Patient } from "@/types";
import { calculateAge, formatDate, formatPhoneNumber } from "@/lib/utils/formatters";
import { User, Phone, Mail, MapPin, Heart, Activity, Calendar } from "lucide-react";

interface PatientOverviewProps {
  patient: Patient;
}

export default function PatientOverview({ patient }: PatientOverviewProps) {
  const age = calculateAge(patient.birthDate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-medium">
                {patient.firstName} {patient.otherNames} {patient.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Patient ID</p>
              <p className="font-mono font-medium">{patient.upi}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Gender</p>
              <p className="font-medium">{patient.gender}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Age</p>
              <p className="font-medium">{age} years</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date of Birth</p>
              <p className="font-medium">{formatDate(patient.birthDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Blood Group</p>
              <Badge variant="outline" className="font-mono">
                {patient.bloodGroup || "N/A"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{formatPhoneNumber(patient.phone)}</p>
              </div>
            </div>

            {patient.email && (
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{patient.email}</p>
                </div>
              </div>
            )}

            {patient.addressLine && (
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Address</p>
                  <p className="font-medium">
                    {patient.addressLine}
                    {patient.city && `, ${patient.city}`}
                    {patient.state && `, ${patient.state}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medical Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Medical Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Known Allergies</p>
            {patient.allergies && patient.allergies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((allergy, index) => (
                  <Badge key={index} variant="destructive">
                    {allergy}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No known allergies</p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Chronic Conditions</p>
            {patient.chronicConditions && patient.chronicConditions.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {patient.chronicConditions.map((condition, index) => (
                  <Badge key={index} variant="secondary">
                    {condition}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No chronic conditions</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Emergency Contact
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {patient.emergencyContact ? (
            <>
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{patient.emergencyContact}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">
                  {patient.emergencyPhone ? formatPhoneNumber(patient.emergencyPhone) : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Relationship</p>
                <p className="font-medium">{patient.emergencyRelation || "N/A"}</p>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">No emergency contact on file</p>
          )}
        </CardContent>
      </Card>

      {/* Registration Info */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Registration Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Registration Date</p>
              <p className="font-medium">{formatDate(patient.registrationDate)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <Badge variant={patient.status === "active" ? "default" : "secondary"}>
                {patient.status}
              </Badge>
            </div>
            {patient.nationalId && (
              <div>
                <p className="text-sm text-gray-600">National ID</p>
                <p className="font-mono font-medium">{patient.nationalId}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}