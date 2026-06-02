"use client";

import { useEffect, useState } from "react";
import { resolveBrand, type Brand } from "@/lib/brand";

/**
 * Resolve the active brand from the current host on the client.
 *
 * Starts from the default brand so server output and the first client render
 * match (no hydration mismatch), then switches to the host-resolved brand once
 * mounted. On white-label domains this means a brief flash of the default
 * branding before it settles, acceptable for the landing pages.
 */
export function useBrand(): Brand {
  const [brand, setBrand] = useState<Brand>(() => resolveBrand());

  useEffect(() => {
    setBrand(resolveBrand(window.location.hostname));
  }, []);

  return brand;
}
