"use client";

import * as React from "react";
import { flexRender, Table as ReactTable } from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getErrorMessage } from "@/lib/helper";
import { PaginationMeta } from "@/types";
import CustomPagination from "./Pagination";

interface DataTableProps<TData> {
  table: ReactTable<TData>;
  meta: PaginationMeta;
  isLoading?: boolean;
  error?: Error | null;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export function DataTable<TData>({
  table,
  meta,
  isLoading = false,
  error,
  onPageChange,
  onLimitChange,
}: DataTableProps<TData>) {
  const columns = table.getVisibleLeafColumns();
  
  // Helper to determine if the current page has a previous or next page
  const hasPrev = meta.page > 1;
  const hasNext = meta.page < meta.pages;

  return (
    <div className="w-full">
      <div className="rounded-t-md border max-w-full overflow-x-auto">
        <Table className="w-full min-w-max">
          <TableHeader className="bg-neutral-100">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className="px-6 py-4 text-left text-sm font-medium"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {isLoading ? (
              Array.from({ length: meta.limit }).map((_, idx) => (
                <TableRow key={`skeleton-${idx}`}>
                  {columns.map((col) => (
                    <TableCell key={`skeleton-cell-${idx}-${col.id}`}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : !!error ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center py-6"
                >
                  <p className="text-error-500 max-w-sm mx-auto text-wrap">
                    {getErrorMessage(error)}
                  </p>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className="px-6 py-3 text-sm text-neutral-800"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-64 text-center"
                >
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <svg
                        className="h-8 w-8 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No data found
                    </h3>
                    <p className="text-sm text-gray-600">
                      {error
                        ? "Failed to load data. Please try again."
                        : "No records to display yet."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap gap-2 items-center justify-between bg-neutral-100 p-4.5 py-5 rounded-b-sm">
        <p className="text-sm">
          Total:{" "}
          <span className="font-semibold">
            {meta.total}
          </span>{" "}
          records
        </p>

        <div className="flex items-center gap-4 flex-wrap">
          <Select
            value={String(meta.limit)}
            onValueChange={(val) => onLimitChange(Number(val))}
          >
            <SelectTrigger className="w-[110px] rounded-sm bg-white text-black">
              <SelectValue placeholder="Limit" />
            </SelectTrigger>
            <SelectContent className="p-0 rounded-sm">
              {[10, 20, 50, 100].map((size) => (
                <SelectItem
                  key={size}
                  value={String(size)}
                  className="custom-select-item"
                >
                  {size} / page
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center gap-1 sm:justify-start justify-center">
            <Button
              variant="outline"
              size="sm"
              className="border-none bg-transparent text-black shadow-none"
              onClick={() => hasPrev && onPageChange(meta.page - 1)}
              disabled={!hasPrev}
            >
              Previous
            </Button>
            {/* CustomPagination component should handle its own logic using the meta object */}
            <CustomPagination meta={meta} onPageChange={onPageChange} />
            <Button
              className="border-none bg-transparent text-black shadow-none"
              variant="outline"
              size="sm"
              onClick={() => hasNext && onPageChange(meta.page + 1)}
              disabled={!hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}