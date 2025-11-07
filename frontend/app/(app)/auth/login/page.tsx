"use client";

import React, { useState } from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState("patient");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [username, setUsername] = useState("b.fadamitan2019@gmail.com");
  const [password, setPassword] = useState("");

  return (
    <div className="w-full max-w-md">
      <h2 className="text-3xl font-extrabold mb-2 text-gray-900">
        Welcome back!
      </h2>
      <p className="text-gray-600 mb-8">Choose your login method to continue</p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2 rounded-lg border bg-background p-1 h-14">
          <TabsTrigger
            value="staff"
            className="flex items-center justify-center h-full text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
          >
            Log in as Staff
          </TabsTrigger>
          <TabsTrigger
            value="patient"
            className="flex items-center justify-center h-full text-base font-medium data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-lg"
          >
            Log in as Patient
          </TabsTrigger>
        </TabsList>

        <TabsContent value="patient" className="space-y-6 mt-4">
          <div className="space-y-1">
            <label className="text-sm block font-medium">Phone Number</label>
            <div className="flex gap-2 items-center">
              <Select
                value={selectedCountry.code}
                onValueChange={(value) =>
                  setSelectedCountry(countries.find((c) => c.code === value)!)
                }
              >
                <SelectTrigger className="h-12! w-20 border rounded-sm text-muted-foreground flex items-center justify-center px-2">
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
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="flex-1 h-12"
              />
            </div>
          </div>

          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12">
            Send OTP
          </Button>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6 mt-4">
          <div className="space-y-1">
            <label className="text-sm block font-medium">Username</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="h-12"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm block font-medium">Password</label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12"
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

          <div className="text-right">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              Forgot password?
            </a>
          </div>

          <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-12">
            Login
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
