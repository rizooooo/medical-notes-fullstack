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
import { cn } from '@/lib/utils'

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

    const { pageIndex, pageSize } = table.getState().pagination
    const startRow = pageIndex * pageSize + 1
    const endRow = Math.min((pageIndex + 1) * pageSize, rowCount)

    const hasData = rowCount > 0

    return (
        <div className="space-y-6 w-full min-w-0 text-foreground">
            <div className="w-full rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all hover:shadow-md">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-muted/50 border-b border-border hover:bg-muted/50">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="h-10 font-bold text-[11px] text-muted-foreground px-4">
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={cn(
                                                        "flex items-center gap-2 transition-colors hover:text-foreground",
                                                        header.column.getCanSort() ? 'cursor-pointer select-none group' : ''
                                                    )}
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext(),
                                                    )}
                                                    {{
                                                        asc: <ArrowUp className="h-3 w-3 text-primary" />,
                                                        desc: (
                                                            <ArrowDown className="h-3 w-3 text-primary" />
                                                        ),
                                                    }[header.column.getIsSorted() as string] ??
                                                        (header.column.getCanSort() ? (
                                                            <ArrowUpDown className="h-3 w-3 text-muted-foreground opacity-30 group-hover:opacity-100 transition-all font-sans" />
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
                                <TableRow key={row.id} className="group border-b border-border hover:bg-primary/5 transition-colors last:border-b-0">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-2.5 px-4 text-[13px] font-medium text-muted-foreground">
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
                                    className="h-40 text-center"
                                >
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="p-4 rounded-full bg-muted mb-2">
                                            <ArrowUpDown className="w-8 h-8 text-muted-foreground/30" />
                                        </div>
                                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest italic">No clinical records found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {hasData && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
                    <div className="flex flex-col sm:flex-row items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                        <span className="whitespace-nowrap">
                            Showing{' '}
                            <span className="text-primary">{startRow}</span> —{' '}
                            <span className="text-primary">{endRow}</span> of{' '}
                            <span className="text-foreground">{rowCount}</span> records
                        </span>

                        <div className="flex items-center gap-3">
                            <span className="hidden sm:inline text-muted-foreground opacity-20">|</span>
                            <span className="hidden sm:inline">Rows:</span>
                            <Select
                                value={`${pageSize}`}
                                onValueChange={(value) => table.setPageSize(Number(value))}
                            >
                                <SelectTrigger className="h-9 w-[70px] rounded-xl border-border bg-card font-black text-primary focus:ring-4 focus:ring-primary/10">
                                    <SelectValue placeholder={pageSize} />
                                </SelectTrigger>
                                <SelectContent side="top" className="rounded-2xl border-none shadow-2xl p-2 bg-popover">
                                    {[10, 20, 30, 40, 50].map((size) => (
                                        <SelectItem key={size} value={`${size}`} className="rounded-xl font-bold h-10 px-3 cursor-pointer focus:bg-muted">
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.previousPage()}
                            disabled={!table.getCanPreviousPage()}
                            className="h-10 px-4 rounded-xl border-border bg-card font-bold text-muted-foreground hover:bg-muted transition-all hover:border-border disabled:opacity-50"
                        >
                            <ChevronLeft className="mr-2 h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => table.nextPage()}
                            disabled={!table.getCanNextPage()}
                            className="h-10 px-4 rounded-xl border-border bg-card font-bold text-muted-foreground hover:bg-muted transition-all hover:border-border disabled:opacity-50"
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
