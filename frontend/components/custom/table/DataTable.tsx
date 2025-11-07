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
import { Meta } from "@/types";
import CustomPagination from "./Pagination";

interface DataTableProps<TData> {
  table: ReactTable<TData>;
  meta: Meta;
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
                  className="h-24 text-center"
                >
                  No results.
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
            {meta.totalItems.toLocaleString()}
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
              onClick={() => meta.hasPrev && onPageChange(meta.currentPage - 1)}
              disabled={!meta.hasPrev}
            >
              Previous
            </Button>
            <CustomPagination meta={meta} onPageChange={onPageChange} />
            <Button
              className="border-none bg-transparent text-black shadow-none"
              variant="outline"
              size="sm"
              onClick={() => meta.hasNext && onPageChange(meta.currentPage + 1)}
              disabled={!meta.hasNext}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
