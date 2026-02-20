import { useMemo, useState } from 'react'
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getFilteredRowModel,
    ColumnFiltersState,
} from '@tanstack/react-table'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Building2, User, Eye, EyeOff, Check, Copy, Calendar as CalendarIcon, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { INurseCredential } from '@/server/nurse/nurse.schema'

export interface ICalendarRow extends Partial<INurseCredential> {
    nurseId: string
    nurseName: string
}

interface CalendarTableProps {
    data: ICalendarRow[]
    isLoading?: boolean
}

export function CalendarTable({ data, isLoading }: CalendarTableProps) {
    const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())
    const [copiedField, setCopiedField] = useState<string | null>(null)
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = useState('')

    const copyToClipboard = (text: string, fieldId: string) => {
        navigator.clipboard.writeText(text)
        setCopiedField(fieldId)
        toast.success('Copied')
        setTimeout(() => setCopiedField(null), 2000)
    }

    const togglePassword = (id: string) => {
        const next = new Set(visiblePasswords)
        if (next.has(id)) next.delete(id)
        else next.add(id)
        setVisiblePasswords(next)
    }

    const columns = useMemo<ColumnDef<ICalendarRow>[]>(() => [
        {
            accessorKey: 'nurseName',
            header: 'Staff Member',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        <User className="w-3.5 h-3.5" />
                    </div>
                    <span className="font-bold text-slate-900 uppercase tracking-tight text-[11px]">{row.original.nurseName}</span>
                </div>
            )
        },
        {
            accessorKey: 'hospiceName',
            header: 'Facility',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-300" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-tight">{row.original.hospiceName}</span>
                </div>
            )
        },
        {
            accessorKey: 'frequency',
            header: 'FOV',
            cell: ({ row }) => (
                <span className={cn(
                    "text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider",
                    row.original.frequency === 'Check Invoice' ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-slate-100 text-slate-500"
                )}>
                    {row.original.frequency || 'MANUAL'}
                </span>
            )
        },
        {
            accessorKey: 'nextPlottingDate',
            header: 'Next Plotting',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-3.5 h-3.5 text-slate-300" />
                    <span className={cn(
                        "text-[10px] font-bold uppercase",
                        row.original.nextPlottingDate ? "text-slate-900" : "text-slate-300 italic"
                    )}>
                        {row.original.nextPlottingDate ? format(new Date(row.original.nextPlottingDate), 'dd-MMM-yyyy') : 'Pending'}
                    </span>
                </div>
            )
        },
        {
            accessorKey: 'incompleteNotes',
            header: () => <div className="text-center">Incomplete</div>,
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <span className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black",
                        (row.original.incompleteNotes || 0) > 5 ? "bg-rose-50 text-rose-600 border border-rose-100" : "bg-slate-50 text-slate-400"
                    )}>
                        {row.original.incompleteNotes || 0}
                    </span>
                </div>
            )
        },
        {
            accessorKey: 'needsCorrection',
            header: () => <div className="text-center">Correction</div>,
            cell: ({ row }) => (
                <div className="flex justify-center">
                    <span className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-black",
                        (row.original.needsCorrection || 0) > 0 ? "bg-amber-50 text-amber-500 border border-amber-100" : "bg-slate-50 text-slate-400"
                    )}>
                        {row.original.needsCorrection || 0}
                    </span>
                </div>
            )
        },
        {
            id: 'credentials',
            header: 'Login Details',
            cell: ({ row }) => {
                const rowKey = `${row.original.nurseId}-${row.original.hospiceId || row.index}`
                const isPassVisible = visiblePasswords.has(rowKey)
                const email = row.original.email
                const password = row.original.password

                return (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-slate-500 truncate max-w-[120px]">{email}</span>
                            {email && email !== 'N/A' && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => copyToClipboard(email || '', `email-${rowKey}`)}
                                    className="h-5 w-5 text-slate-300 hover:text-indigo-600"
                                >
                                    {copiedField === `email-${rowKey}` ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                                </Button>
                            )}
                        </div>
                        {password && (
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono tracking-widest text-slate-300">
                                    {isPassVisible ? password : '••••••••'}
                                </span>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => togglePassword(rowKey)}
                                    className="h-5 w-5 text-slate-300 hover:text-indigo-600"
                                >
                                    {isPassVisible ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                                </Button>
                            </div>
                        )}
                    </div>
                )
            }
        }
    ], [visiblePasswords, copiedField])

    const table = useReactTable({
        data,
        columns,
        state: {
            columnFilters,
            globalFilter,
        },
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    })

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search for nurse or facility..."
                        value={globalFilter ?? ''}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="pl-10 h-10 bg-white border-slate-200 focus:ring-indigo-500 rounded-xl font-medium text-xs"
                    />
                </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden overflow-x-auto">
                <Table className="min-w-[1000px]">
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-b border-slate-100 bg-slate-50/50">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="h-10 text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 whitespace-nowrap">
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
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-40 text-center text-xs font-bold text-slate-400 animate-pulse uppercase tracking-widest">Compiling Data...</TableCell>
                            </TableRow>
                        ) : table.getRowModel().rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-40 text-center text-xs font-bold text-slate-400">
                                    {globalFilter ? "No matches found for your search" : "No active nurses found"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="group border-slate-50 hover:bg-slate-50/50 transition-colors">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-3 px-3">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
