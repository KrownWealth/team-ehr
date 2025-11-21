import { redirect } from "next/navigation";
import React from "react";

function page() {
  return redirect("/patient-portal/dashboard");
}

export default page;
