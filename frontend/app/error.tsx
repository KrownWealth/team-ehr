"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Error Illustration */}
        <div className="relative">
          <div className="mx-auto w-32 h-32 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-16 w-16 text-red-600" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3">
          <h2 className="text-3xl font-bold text-gray-900">
            Something Went Wrong
          </h2>
          <p className="text-gray-600">
            We encountered an unexpected error. Don't worry, we're working on
            fixing it.
          </p>

          {/* Error Details (Only in development) */}
          {process.env.NODE_ENV === "development" && error.message && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
              <p className="text-xs font-mono text-gray-700 break-all">
                {error.message}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={reset} variant="outline" className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </Button>
          <Link href="/auth/login">
            <Button className="gap-2 w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>
          </Link>
        </div>

        {/* Help Text */}
        <div className="pt-6 border-t">
          <p className="text-sm text-gray-500">
            If this problem persists, please contact support with error code:{" "}
            <span className="font-mono">{error.digest || "UNKNOWN"}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
