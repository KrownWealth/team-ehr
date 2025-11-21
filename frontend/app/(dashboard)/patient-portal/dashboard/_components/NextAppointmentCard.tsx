import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, UserIcon, Clock, MapPin } from "lucide-react";
import { formatDateTime } from "@/lib/utils/formatters";
import { Badge } from "@/components/ui/badge";
import { Appointment } from "@/types";

interface NextAppointmentCardProps {
  appointment: Appointment | null;
}

export default function NextAppointmentCard({
  appointment,
}: NextAppointmentCardProps) {
  if (!appointment) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Calendar className="h-5 w-5" />
            Next Appointment
          </CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500 mb-4">No upcoming appointments.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full border-green-100 bg-green-50/30">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-green-800">
            <Calendar className="h-5 w-5" />
            Up Next
          </CardTitle>
          <Badge
            variant={
              appointment.status === "CONFIRMED" ? "default" : "secondary"
            }
          >
            {appointment.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white p-5 rounded-xl border border-green-100 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500 font-medium">Date & Time</p>
              <p className="text-lg font-bold text-gray-900">
                {formatDateTime(appointment.appointmentDate)}
              </p>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <UserIcon className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Doctor</p>
                <p className="text-sm font-medium text-gray-900">
                  {appointment?.doctor?.id || "Assigned Doctor"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Reason</p>
                <p className="text-sm font-medium text-gray-900 truncate">
                  {appointment.reason}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
