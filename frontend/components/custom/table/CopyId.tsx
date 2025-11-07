"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CopyIdProps {
  id: string;
  label?: string;
}

export default function CopyId({ id, label = "ID" }: CopyIdProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      toast.success(`${label} copied to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const displayId = id.length > 8 ? `${id.slice(0, 8)}...` : id;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 font-mono">{displayId}</span>
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-600" />
        ) : (
          <Copy className="h-3 w-3" />
        )}
      </Button>
    </div>
  );
}
