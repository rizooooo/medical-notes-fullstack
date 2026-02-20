import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export function TablePageSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 w-full max-w-full h-full p-4 md:p-6">
      {/* 1. Header Section Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-2">
          {/* Title Skeleton */}
          <Skeleton className="h-8 w-[200px]" />
          {/* Description Skeleton */}
          <Skeleton className="h-4 w-[300px]" />
        </div>

        {/* Action Button Skeleton */}
        <div className="flex-shrink-0">
          <Skeleton className="h-10 w-[140px]" />
        </div>
      </div>

      <Separator />

      {/* 2. Toolbar/Filter Skeleton (Optional but adds realism) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-1">
        <Skeleton className="h-10 w-full sm:w-[300px]" /> {/* Search Bar */}
        <div className="flex gap-2">
          <Skeleton className="h-10 w-[100px]" /> {/* Filter Btn */}
        </div>
      </div>

      {/* 3. The Table Skeleton Content */}
      <div className="flex-1 rounded-md border bg-white shadow-sm overflow-hidden relative">
        <div className="p-4 space-y-4">
          {/* Table Header Row */}
          <div className="flex items-center justify-between gap-4 border-b pb-4">
            <Skeleton className="h-6 w-[150px]" />
            <Skeleton className="h-6 w-[100px]" />
            <Skeleton className="h-6 w-[100px]" />
            <Skeleton className="h-6 w-[50px]" />
          </div>

          {/* Table Body Rows (Repeated 8 times) */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between gap-4 py-2"
            >
              {/* Column 1: Icon + Name */}
              <div className="flex items-center gap-3 w-[200px]">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-4 w-full" />
              </div>
              {/* Column 2: ID */}
              <Skeleton className="h-4 w-[100px]" />
              {/* Column 3: Status/Date */}
              <Skeleton className="h-4 w-[100px]" />
              {/* Column 4: Actions */}
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* 4. Footer / Pagination Skeleton */}
      <div className="flex items-center justify-end py-2 gap-2">
        <Skeleton className="h-4 w-[150px]" /> {/* "0 of 10 rows selected" */}
        <div className="flex gap-2">
          <Skeleton className="h-9 w-[80px]" /> {/* Previous */}
          <Skeleton className="h-9 w-[80px]" /> {/* Next */}
        </div>
      </div>
    </div>
  )
}
