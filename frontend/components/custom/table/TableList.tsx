"use client";

import { SearchSvg } from "@/components/svgs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { RefreshCcw } from "lucide-react";
import { ColumnToggle } from "./ColumnToggle";
import { DataTable } from "@/components/custom/table/DataTable";
import { useColumnVisibility } from "@/lib/hooks/useColumnVisibility";
import { ReactNode, useState } from "react";
import { Meta, ResponseSuccess } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { useApiQuery } from "@/lib/hooks/use-api";

type ApiStatsType<TData> =
  | { data: TData[]; meta: Meta; exportButtonLabel: string }
  | TData[];

function TableList<TData, TValue>({
  querykey,
  endpoint,
  columns,
  filter,
  extraUi,
  tabs,
  noSearch,
}: {
  querykey: string;
  filter?: {
    value: string;
    component: ReactNode;
  };
  tabs?: {
    value: string;
    component: ReactNode;
  };
  extraUi?: {
    value?: string;
    component: ReactNode;
  };
  endpoint: string;
  columns: ColumnDef<TData, TValue>[];
  noSearch?: boolean;
}) {
  const queryClient = useQueryClient();

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const queryKeys = [
    querykey,
    search,
    filter?.value,
    tabs?.value,
    extraUi?.value,
    page,
    limit,
  ];
  const queryUrl = `${endpoint}?search=${search}${
    filter?.value ? `&${filter.value}` : ""
  }${extraUi?.value ? `&${extraUi.value}` : ""}${
    tabs?.value ? `&${tabs.value}` : ""
  }&page=${page}&limit=${limit}`;

  const {
    data: res,
    error,
    isLoading,
    refetch,
  } = useApiQuery<ResponseSuccess<ApiStatsType<TData>>>(queryKeys, queryUrl);

  const [columnVisibility, setColumnVisibility] = useColumnVisibility(querykey);

  const normalizedData: TData[] = Array.isArray(res?.data)
    ? res.data
    : res?.data?.data || [];

  const meta: Meta | undefined = Array.isArray(res?.data)
    ? {
        size: normalizedData.length,
        limit: normalizedData.length,
        hasNext: false,
        hasPrev: false,
        totalPages: 1,
        currentPage: 1,
        offset: 0,
        totalItems: normalizedData.length,
        nextPage: null,
        previousPage: null,
      }
    : res?.data?.meta;

  const table = useReactTable({
    data: normalizedData,
    columns,
    state: { columnVisibility },
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    pageCount: meta?.totalPages || 1,
  });

  const handleHardReload = () => {
    queryClient.removeQueries({ queryKey: queryKeys });
    refetch();
  };

  return (
    <div className="sheet space-y-6">
      <div className="space-y-4">
        <div className="flex gap-4 justify-between items-center flex-wrap">
          <div className="w-fit">{tabs?.component}</div>

          <div className="flex gap-3">
            {!noSearch && (
              <div className="search-input h-12 relative w-xs">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <SearchSvg />
                </div>
                <Input
                  className="size-full pl-12 border-neutral-300 rounded-[6px]"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.currentTarget.value)}
                />
              </div>
            )}
            {/* {!!res?.data &&
              !Array.isArray(res?.data) &&
              res.data.exportButtonLabel && (
                <ExportDialogButton
                  label={res.data.exportButtonLabel}
                  endpoint={`${endpoint}/export`}
                />
              )} */}
            {extraUi?.component}
            <div className="flex gap-3 items-center justify-end">
              {filter?.component}
              <Button
                variant={"outline"}
                onClick={handleHardReload}
                className="rounded-sm h-12 w-12 border-neutral-300"
              >
                <RefreshCcw />
              </Button>

              <ColumnToggle table={table} />
            </div>
          </div>
        </div>
      </div>

      <DataTable
        table={table}
        meta={
          meta || {
            size: limit,
            limit: limit,
            hasNext: false,
            hasPrev: false,
            totalPages: 1,
            currentPage: page,
            offset: 0,
            totalItems: limit,
            nextPage: null,
            previousPage: null,
          }
        }
        isLoading={isLoading}
        onPageChange={(e) => setPage(e)}
        onLimitChange={(e) => setLimit(e)}
        error={error}
      />
    </div>
  );
}

export default TableList;
