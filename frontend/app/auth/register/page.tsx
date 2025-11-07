"use client";

import React, { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

const countries = [
  { name: "Nigeria", code: "+234" },
  { name: "India", code: "+91" },
  { name: "USA", code: "+1" },
  { name: "UK", code: "+44" },
];

const fullSchema = z
  .object({
    clinicName: z.string().min(1, "Clinic name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(4, "Phone is required"),
    addressLine: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    logo: z
      .any()
      .refine((file) => file instanceof File, "Logo file is required"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof fullSchema>;

export default function ClinicRegisterForm() {
  const [step, setStep] = useState(1);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    mode: "onChange",
  });

  const stepFields: Record<number, (keyof FormData)[]> = {
    1: ["clinicName", "email", "phone"],
    2: ["addressLine", "city", "state", "logo"],
    3: ["password", "confirmPassword"],
  };

  const nextStep = async () => {
    const valid = await trigger(stepFields[step]);
    if (valid) setStep((prev) => Math.min(prev + 1, 3));
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1));

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    const formData = new FormData();
    formData.append("clinicName", data.clinicName);
    formData.append("email", data.email);
    formData.append("phone", selectedCountry.code + data.phone);
    formData.append("addressLine", data.addressLine);
    formData.append("city", data.city);
    formData.append("state", data.state);
    formData.append("password", data.password);
    if (data.logo) formData.append("logo", data.logo);

    try {
      const res = await fetch("/api/v1/clinic/register", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Registration failed");
      toast.success("Clinic registered successfully!");
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md">
      {step !== 1 && (
        <div className="flex justify-center mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-gray-400 text-xl">
            {logoPreview || getValues("logo") ? (
              <img
                src={
                  logoPreview || URL.createObjectURL(getValues("logo") as File)
                }
                alt="Clinic Logo"
                className="w-full h-full object-cover"
              />
            ) : (
              "Logo"
            )}
          </div>
        </div>
      )}

      <h2 className="text-3xl font-extrabold mb-2 text-gray-900">
        Register Your Clinic
      </h2>

      <div className="mb-6">
        <div className="flex justify-between text-sm font-medium text-gray-600 mb-1">
          <span className={step >= 1 ? "text-gray-900" : ""}>Step 1</span>
          <span className={step >= 2 ? "text-gray-900" : ""}>Step 2</span>
          <span className={step >= 3 ? "text-gray-900" : ""}>Step 3</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-2 bg-primary transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {step === 1 && (
          <>
            <div className="space-y-1">
              <Label>Clinic Name</Label>
              <Input
                {...register("clinicName")}
                placeholder="Enter clinic name"
                className="h-12"
              />
              {errors.clinicName && (
                <p className="text-red-500 text-sm">
                  {errors.clinicName.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                {...register("email")}
                placeholder="admin@clinic.com"
                className="h-12"
              />
              {errors.email && (
                <p className="text-red-500 text-sm">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Phone Number</Label>
              <div className="flex gap-2 items-center">
                <Select
                  value={selectedCountry.code}
                  onValueChange={(value) =>
                    setSelectedCountry(countries.find((c) => c.code === value)!)
                  }
                >
                  <SelectTrigger className="h-12 w-24 flex items-center justify-center px-2 border rounded-sm">
                    <SelectValue>{selectedCountry.code}</SelectValue>
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
                  {...register("phone")}
                  type="tel"
                  placeholder="Enter phone number"
                  className="flex-1 h-12"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm">{errors.phone.message}</p>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <Button
                className="bg-primary text-primary-foreground h-12"
                onClick={nextStep}
              >
                Next
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <div className="space-y-1">
              <Label>Address Line</Label>
              <Input
                {...register("addressLine")}
                placeholder="Street, building, etc."
                className="h-12"
              />
              {errors.addressLine && (
                <p className="text-red-500 text-sm">
                  {errors.addressLine.message}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              <div className="flex-1 space-y-1">
                <Label>City</Label>
                <Input
                  {...register("city")}
                  placeholder="City"
                  className="h-12"
                />
                {errors.city && (
                  <p className="text-red-500 text-sm">{errors.city.message}</p>
                )}
              </div>
              <div className="flex-1 space-y-1">
                <Label>State</Label>
                <Input
                  {...register("state")}
                  placeholder="State"
                  className="h-12"
                />
                {errors.state && (
                  <p className="text-red-500 text-sm">{errors.state.message}</p>
                )}
              </div>
            </div>
            <div className="space-y-1">
              <Label>Clinic Logo</Label>
              <Input
                type="file"
                accept="image/*"
                className="h-12"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setValue("logo", file);
                    setLogoPreview(URL.createObjectURL(file));
                  }
                }}
              />
              {errors.logo && (
                <p className="text-red-500 text-sm">
                  {errors.logo.message?.toString()}
                </p>
              )}
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="outline" className="h-12" onClick={prevStep}>
                Back
              </Button>
              <Button
                className="bg-primary text-primary-foreground h-12"
                onClick={nextStep}
              >
                Next
              </Button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div className="space-y-1">
              <Label>Password</Label>
              <div className="relative">
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
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
              {errors.password && (
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label>Confirm Password</Label>
              <div className="relative">
                <Input
                  {...register("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm password"
                  className="h-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="outline" className="h-12" onClick={prevStep}>
                Back
              </Button>
              <Button
                type="submit"
                className="bg-primary text-primary-foreground h-12"
              >
                Register Clinic
              </Button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
