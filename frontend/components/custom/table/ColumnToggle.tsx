"use client";

import * as React from "react";
import { Table } from "@tanstack/react-table";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

interface ColumnToggleProps<TData> {
  table: Table<TData>;
}

export function ColumnToggle<TData>({ table }: ColumnToggleProps<TData>) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="py-5">
          <span className="">
            <svg
              width="18"
              height="14"
              viewBox="0 0 18 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.99902 0.5H15.9746C16.3907 0.5 16.7352 0.642479 17.0342 0.941406C17.3331 1.24037 17.475 1.58404 17.4746 1.99902V12C17.4746 12.4162 17.3323 12.7605 17.0332 13.0596C16.7341 13.3586 16.3908 13.5005 15.9766 13.5H2C1.58379 13.5 1.2395 13.3577 0.94043 13.0586C0.641466 12.7596 0.49958 12.416 0.5 12.001V2C0.5 1.5838 0.642345 1.2395 0.941406 0.94043C1.24037 0.641467 1.58404 0.499581 1.99902 0.5ZM1.5 12.5H5.8252V1.5H1.5V12.5ZM6.8252 12.5H11.1504V1.5H6.8252V12.5ZM12.1504 12.5H16.4746V1.5H12.1504V12.5Z"
                fill="#565560"
                stroke="#565560"
              />
            </svg>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 max-h-64 overflow-y-auto"
      >
        {table
          .getAllLeafColumns()
          .filter((col) => col.getCanHide())
          .map((col) => (
            <DropdownMenuCheckboxItem
              key={col.id}
              checked={col.getIsVisible()}
              onCheckedChange={(val) => col.toggleVisibility(!!val)}
              className="capitalize py-2.5 not-last:border-b rounded-none"
            >
              {col.columnDef.header as string}
            </DropdownMenuCheckboxItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
