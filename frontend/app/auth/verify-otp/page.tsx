import { Suspense } from "react";
import OTPVerificationPage from "./VerifyOtp";

function page() {
  return (
    <Suspense>
      <OTPVerificationPage />
    </Suspense>
  );
}

export default page;
