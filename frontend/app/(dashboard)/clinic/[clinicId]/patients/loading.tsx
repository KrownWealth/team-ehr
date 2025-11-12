import { TableSkeleton } from "@/components/shared/loading/TableSkeleton";

export default function PatientsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-gray-200 animate-pulse rounded" />
          <div className="h-4 w-64 bg-gray-200 animate-pulse rounded" />
        </div>
        <div className="h-10 w-40 bg-gray-200 animate-pulse rounded" />
      </div>
      <TableSkeleton rows={10} />
    </div>
  );
}
