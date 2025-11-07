"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const countries = [
  { name: "Nigeria", code: "+234" },
  { name: "India", code: "+91" },
  { name: "USA", code: "+1" },
  { name: "UK", code: "+44" },
];

export default function ClinicRegisterForm() {
  const [activeTab, setActiveTab] = useState("clinic");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [clinicName, setClinicName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [password, setPassword] = useState("");
  const [logo, setLogo] = useState<File | null>(null);

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-background rounded-lg shadow-md">
      <h2 className="text-3xl font-extrabold mb-4 text-gray-900">
        Register Your Clinic
      </h2>
      <p className="text-gray-600 mb-6">
        Set up your clinic account to manage staff, patients, and appointments.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-1 rounded-lg border bg-background p-1 h-14">
          <TabsTrigger
            value="clinic"
            className="flex items-center justify-center h-full text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
          >
            Clinic Details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="clinic" className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label>Clinic Name</Label>
            <Input
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              placeholder="Enter clinic name"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@clinic.com"
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label>Phone Number</Label>
            <div className="flex gap-2 items-center">
              <Select
                value={selectedCountry.code}
                onValueChange={(value) =>
                  setSelectedCountry(countries.find((c) => c.code === value)!)
                }
              >
                <SelectTrigger className="h-12 w-24 border rounded-sm flex items-center justify-center px-2">
                  <SelectValue className="text-sm font-medium">
                    {selectedCountry.code}
                  </SelectValue>
                </SelectTrigger>

                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.name} ({c.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex-1 h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Address Line</Label>
            <Input
              type="text"
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              placeholder="Street, building, etc."
              className="h-12"
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1 space-y-2">
              <Label>City</Label>
              <Input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="h-12"
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label>State</Label>
              <Input
                type="text"
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="State"
                className="h-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Clinic Logo</Label>
            <Input
              type="file"
              onChange={(e) => e.target.files && setLogo(e.target.files[0])}
              className="h-12"
            />
          </div>

          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12">
            Register Clinic
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
