"use client";

import { useEffect } from "react";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api/axios-instance";
import { toast } from "sonner";
import { ResponseSuccess, Clinic } from "@/types";
import {
  Save,
  Building2,
  Clock,
  DollarSign,
  Palette,
  CheckCircle2,
} from "lucide-react";
import { useParams } from "next/navigation";

export default function SettingsPage() {
  const params = useParams();
  const clinicId = params.clinicId as string;
  const queryClient = useQueryClient();

  const [clinicData, setClinicData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    logoUrl: "",
  });

  const [operatingHours, setOperatingHours] = useState({
    monday: { open: "08:00", close: "17:00", closed: false },
    tuesday: { open: "08:00", close: "17:00", closed: false },
    wednesday: { open: "08:00", close: "17:00", closed: false },
    thursday: { open: "08:00", close: "17:00", closed: false },
    friday: { open: "08:00", close: "17:00", closed: false },
    saturday: { open: "09:00", close: "13:00", closed: false },
    sunday: { open: "09:00", close: "13:00", closed: true },
  });

  const { isLoading, data } = useQuery<ResponseSuccess<Clinic>>({
    queryKey: ["clinic", clinicId],
    queryFn: async () => {
      const response = await apiClient.get("/clinic/profile");
      return response.data;
    },
  });

  useEffect(() => {
    if (data?.data) {
      const clinic = data.data;
      setClinicData({
        name: clinic.name,
        email: clinic.email,
        phone: clinic.phone,
        address: clinic.address || "",
        city: clinic.city || "",
        state: clinic.state || "",
        logoUrl: clinic.logoUrl || "",
      });
    }
  }, [data]);

  const updateClinicMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiClient.put("/clinic", data);
    },
    onSuccess: () => {
      toast.success("Settings updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["clinic"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update settings");
    },
  });

  const handleClinicSubmit = () => {
    if (!clinicData.name || !clinicData.email || !clinicData.phone) {
      toast.error("Please fill all required fields");
      return;
    }

    updateClinicMutation.mutate(clinicData);
  };

  const handleHoursSubmit = () => {
    updateClinicMutation.mutate({ operatingHours });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80svh] w-full">
        <div className="text-center">
          <div className="h-12 w-12 border-3 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2 text-base">
          Manage your clinic profile and preferences
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-0">
        <TabsList className="inline-flex h-12 items-center justify-center rounded-xl bg-gray-100 p-1">
          <TabsTrigger
            value="profile"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Building2 className="h-4 w-4" />
            <span className="block">Clinic Profile</span>
          </TabsTrigger>
          <TabsTrigger
            value="hours"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Clock className="h-4 w-4" />
            <span className="block">Operating Hours</span>
          </TabsTrigger>
          <TabsTrigger
            value="pricing"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <DollarSign className="h-4 w-4" />
            <span className="block">Pricing</span>
          </TabsTrigger>
          <TabsTrigger
            value="branding"
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Palette className="h-4 w-4" />
            <span className="block">Branding</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-3">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-xl">Clinic Information</CardTitle>
              <CardDescription className="text-[15px]">
                Update your clinic's basic information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-900">
                  Clinic Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g., City General Hospital"
                  value={clinicData.name}
                  onChange={(e) =>
                    setClinicData({ ...clinicData, name: e.target.value })
                  }
                  className="h-11 text-[15px]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="email"
                    placeholder="info@clinic.com"
                    value={clinicData.email}
                    onChange={(e) =>
                      setClinicData({ ...clinicData, email: e.target.value })
                    }
                    className="h-11 text-[15px]"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">
                    Phone <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="tel"
                    placeholder="08012345678"
                    value={clinicData.phone}
                    onChange={(e) =>
                      setClinicData({ ...clinicData, phone: e.target.value })
                    }
                    className="h-11 text-[15px]"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-900">
                  Address
                </Label>
                <Textarea
                  placeholder="Street address"
                  value={clinicData.address}
                  onChange={(e) =>
                    setClinicData({ ...clinicData, address: e.target.value })
                  }
                  rows={3}
                  className="text-[15px] resize-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">
                    City
                  </Label>
                  <Input
                    placeholder="Lagos"
                    value={clinicData.city}
                    onChange={(e) =>
                      setClinicData({ ...clinicData, city: e.target.value })
                    }
                    className="h-11 text-[15px]"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-900">
                    State
                  </Label>
                  <Input
                    placeholder="Lagos"
                    value={clinicData.state}
                    onChange={(e) =>
                      setClinicData({ ...clinicData, state: e.target.value })
                    }
                    className="h-11 text-[15px]"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button
                  onClick={handleClinicSubmit}
                  disabled={updateClinicMutation.isPending}
                  className="h-11 px-6 bg-green-600 hover:bg-green-700"
                >
                  {updateClinicMutation.isPending ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours" className="mt-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-xl">Operating Hours</CardTitle>
              <CardDescription className="text-[15px]">
                Set your clinic's working hours for each day
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(operatingHours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-6 py-3">
                  <div className="w-28">
                    <p className="font-medium capitalize text-gray-900">
                      {day}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 flex-1">
                    <Input
                      type="time"
                      value={hours.open}
                      onChange={(e) =>
                        setOperatingHours({
                          ...operatingHours,
                          [day]: { ...hours, open: e.target.value },
                        })
                      }
                      disabled={hours.closed}
                      className="w-32 h-10"
                    />
                    <span className="text-gray-400 font-medium">—</span>
                    <Input
                      type="time"
                      value={hours.close}
                      onChange={(e) =>
                        setOperatingHours({
                          ...operatingHours,
                          [day]: { ...hours, close: e.target.value },
                        })
                      }
                      disabled={hours.closed}
                      className="w-32 h-10"
                    />

                    <Button
                      variant={hours.closed ? "outline" : "secondary"}
                      size="sm"
                      onClick={() =>
                        setOperatingHours({
                          ...operatingHours,
                          [day]: { ...hours, closed: !hours.closed },
                        })
                      }
                      className="h-10 px-4"
                    >
                      {hours.closed ? "Closed" : "Open"}
                    </Button>
                  </div>
                </div>
              ))}

              <div className="flex justify-end pt-6 border-t border-gray-100">
                <Button
                  onClick={handleHoursSubmit}
                  disabled={updateClinicMutation.isPending}
                  className="h-11 px-6 bg-green-600 hover:bg-green-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Hours
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pricing" className="mt-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-xl">Service Pricing</CardTitle>
              <CardDescription className="text-[15px]">
                Configure pricing for common services
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-[15px]">
                  Service pricing configuration coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="mt-6">
          <Card className="border-gray-200 shadow-sm">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-xl">
                Branding & Customization
              </CardTitle>
              <CardDescription className="text-[15px]">
                Customize your clinic's appearance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-900">
                  Logo URL
                </Label>
                <Input
                  placeholder="https://example.com/logo.png"
                  value={clinicData.logoUrl}
                  onChange={(e) =>
                    setClinicData({ ...clinicData, logoUrl: e.target.value })
                  }
                  className="h-11 text-[15px]"
                />
              </div>

              {clinicData.logoUrl && (
                <div className="border border-gray-200 rounded-xl p-6 bg-gray-50">
                  <p className="text-sm font-medium text-gray-900 mb-4">
                    Logo Preview
                  </p>
                  <img
                    src={clinicData.logoUrl}
                    alt="Clinic Logo"
                    className="h-20 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="flex justify-end pt-4 border-t border-gray-100">
                <Button
                  onClick={handleClinicSubmit}
                  disabled={updateClinicMutation.isPending}
                  className="h-11 px-6 bg-green-600 hover:bg-green-700"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save Branding
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
