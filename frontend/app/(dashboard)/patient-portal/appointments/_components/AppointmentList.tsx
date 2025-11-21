import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, FileText, AlertCircle } from "lucide-react";
import { formatDateTime } from "@/lib/utils/formatters";
import { PortalAppointment } from "../page";

interface AppointmentListProps {
  appointments: PortalAppointment[];
  type: "upcoming" | "history";
}

export default function AppointmentList({
  appointments,
  type,
}: AppointmentListProps) {
  if (appointments.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-gray-50 p-4 rounded-full mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-lg text-gray-900">
            No appointments found
          </h3>
          <p className="text-gray-500 max-w-sm mt-1">
            {type === "upcoming"
              ? "You don't have any scheduled visits. Book one to get started."
              : "You don't have any past appointment records."}
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-700 border-green-200 hover:bg-green-100";
      case "PENDING":
        return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100";
      case "COMPLETED":
        return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100";
      case "CANCELLED":
        return "bg-red-100 text-red-700 border-red-200 hover:bg-red-100";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="grid gap-4">
      {appointments?.map((apt) => (
        <Card
          key={apt.id}
          className="hover:border-green-200 transition-colors group"
        >
          <CardContent className="p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className={`
                  flex flex-col items-center justify-center w-16 h-16 rounded-lg border
                  ${
                    type === "upcoming"
                      ? "bg-green-50 border-green-100 text-green-700"
                      : "bg-gray-50 border-gray-200 text-gray-600"
                  }
                `}
                >
                  <span className="text-xs font-bold uppercase">
                    {new Date(apt.appointmentDate).toLocaleString("default", {
                      month: "short",
                    })}
                  </span>
                  <span className="text-xl font-bold">
                    {new Date(apt.appointmentDate).getDate()}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {apt.reason}
                    </h3>
                    <Badge
                      className={getStatusColor(apt.status)}
                      variant="outline"
                    >
                      {apt.status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-gray-400" />
                      {formatDateTime(apt.appointmentDate)}
                    </div>

                    {(apt.doctorName || type === "history") && (
                      <div className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-gray-400" />
                        {apt.doctorName || "Doctor Unassigned"}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {apt.notes && (
                <div className="md:text-right md:max-w-xs">
                  <div className="flex items-start md:justify-end gap-1.5 text-xs text-gray-500 bg-gray-50 p-2 rounded border">
                    <FileText className="h-3 w-3 mt-0.5 shrink-0" />
                    <p className="line-clamp-2">{apt.notes}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Status Message for Pending */}
            {apt.status === "PENDING" && (
              <div className="mt-4 flex items-center gap-2 text-xs text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-100">
                <AlertCircle className="h-4 w-4" />
                <span>
                  Your request is awaiting confirmation from the clinic staff.
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
