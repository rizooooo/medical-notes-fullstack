'use client'


import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type {
  ColumnDef,
  OnChangeFn,
  PaginationState,
  SortingState,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface DataTableProps<TData, TValue> {
  columns: Array<ColumnDef<TData, TValue>>
  data: Array<TData>
  pageCount?: number
  rowCount?: number
  pagination?: PaginationState
  onPaginationChange?: OnChangeFn<PaginationState>
  sorting?: SortingState
  onSortingChange?: OnChangeFn<SortingState>
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  rowCount = 0,
  pagination,
  onPaginationChange,
  sorting,
  onSortingChange,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    pageCount: pageCount ?? -1,
    rowCount: rowCount,
    state: { sorting, pagination },
    onPaginationChange: onPaginationChange,
    onSortingChange: onSortingChange,
    getSortedRowModel: getSortedRowModel(),
  })

  // --- LOGIC: Calculate "Showing X-Y of Z" ---
  const { pageIndex, pageSize } = table.getState().pagination

  // 1. Calculate Start Item (e.g., Page 2 (index 1) * 10 + 1 = 11)
  const startRow = pageIndex * pageSize + 1

  // 2. Calculate End Item (e.g., Min(20, 15 total) = 15)
  const endRow = Math.min((pageIndex + 1) * pageSize, rowCount)

  // 3. Logic checks
  const hasData = rowCount > 0
  const showPageSizeSelector = rowCount > 10
  const showPaginationButtons = (pageCount ?? 0) > 1

  return (
    <div className="space-y-4">
      <div className="rounded-md border bg-white overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-gray-50/50">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? 'flex items-center cursor-pointer select-none gap-2'
                              : ''
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {{
                            asc: <ArrowUp className="h-4 w-4 text-gray-900" />,
                            desc: (
                              <ArrowDown className="h-4 w-4 text-gray-900" />
                            ),
                          }[header.column.getIsSorted() as string] ??
                            (header.column.getCanSort() ? (
                              <ArrowUpDown className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 hover:opacity-100 transition-opacity" />
                            ) : null)}
                        </div>
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="hover:bg-gray-50/50">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-3">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* FOOTER */}
      {hasData && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-1">
          {/* LEFT: Info & Size Selector */}
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
            {/* The "Showing X-Y of Z" Text */}
            <span className="whitespace-nowrap">
              Showing{' '}
              <span className="font-medium text-foreground">{startRow}</span> to{' '}
              <span className="font-medium text-foreground">{endRow}</span> of{' '}
              <span className="font-medium text-foreground">{rowCount}</span>{' '}
              results
            </span>

            {/* Selector */}
            {showPageSizeSelector && (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline">| Rows per page:</span>
                <Select
                  value={`${pageSize}`}
                  onValueChange={(value) => table.setPageSize(Number(value))}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={pageSize} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[10, 20, 30, 40, 50].map((size) => (
                      <SelectItem key={size} value={`${size}`}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* RIGHT: Buttons */}
          <div
            className={`flex items-center space-x-2 ${!showPaginationButtons ? 'invisible' : ''}`}
          >
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
