'use client'

import * as React from "react";
import { VisibilityState } from "@tanstack/react-table";

export function useColumnVisibility(
  tableId: string,
  defaultState: VisibilityState = {}
) {
  const storageKey = `table:${tableId}:columnVisibility`;

  const [state, setState] = React.useState<VisibilityState>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    }
    return defaultState;
  });

  React.useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state, storageKey]);

  return [state, setState] as const;
}
