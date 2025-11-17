"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Critical Error
              </h2>
              <p className="text-gray-600">
                A critical error has occurred. Please refresh the page or
                contact support.
              </p>
            </div>

            <Button onClick={reset} size="lg">
              Refresh Page
            </Button>

            {process.env.NODE_ENV === "development" && error.message && (
              <div className="mt-4 p-4 bg-gray-200 rounded text-left">
                <p className="text-xs font-mono text-gray-700 break-all">
                  {error.message}
                </p>
              </div>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
