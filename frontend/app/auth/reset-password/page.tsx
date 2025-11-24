import React, { Suspense } from "react";
import ResetPasswordPage from "./ResetPassword";

function page() {
  return (
    <Suspense>
      <ResetPasswordPage />
    </Suspense>
  );
}

export default page;
