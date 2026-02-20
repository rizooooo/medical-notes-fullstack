'use client'

import { MoreHorizontal, Receipt, Eye, Pencil, Trash2, Download, Users } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { IInvoice } from '@/server/invoice/invoice.schema'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'

import { InvoiceStatus } from '@/types/invoice'
import { cn } from '@/lib/utils'

interface ColumnProps {
    onEdit: (invoice: IInvoice) => void
    onDelete: (invoice: IInvoice) => void
    onView: (invoice: IInvoice) => void
}

export const getColumns = ({
    onEdit,
    onDelete,
    onView,
}: ColumnProps): Array<ColumnDef<IInvoice>> => [
        {
            accessorKey: 'invoiceNumber',
            header: 'Invoice #',
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-muted text-muted-foreground group-hover:text-primary transition-colors">
                        <Receipt className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-foreground">{row.original.invoiceNumber}</span>
                </div>
            ),
        },
        {
            accessorKey: 'hospiceName',
            header: 'Facility',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-foreground">{row.original.hospiceName}</span>
                    <span className="text-[10px] font-medium text-muted-foreground">Hospice Facility</span>
                </div>
            ),
        },
        {
            accessorKey: 'nurseName',
            header: 'Medical Staff',
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-bold text-foreground">{row.original.nurseName}</span>
                    <span className="text-[10px] font-medium text-muted-foreground">Assigned Personnel</span>
                </div>
            ),
        },
        {
            id: 'patientCount',
            header: 'Patients',
            cell: ({ row }) => (
                <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center">
                        <Users className="w-2.5 h-2.5 text-slate-500" />
                    </div>
                    <span className="text-[11px] font-black text-slate-900">
                        {row.original.patients?.length ?? 0}
                    </span>
                </div>
            ),
        },
        {
            header: 'Billing Period',
            accessorFn: (data) => `${format(data.periodStart, 'MMM yyyy')}`,
            cell: ({ row }) => (
                <span className="font-bold text-muted-foreground">
                    {format(row.original.periodStart, 'MMMM yyyy')}
                </span>
            ),
        },
        // {
        //     accessorKey: 'totalAmount',
        //     header: () => <div className="text-right">Total Amount</div>,
        //     cell: ({ row }) => {
        //         const amount = parseFloat(row.getValue('totalAmount'))
        //         return (
        //             <div className="text-right font-black text-indigo-600">
        //                 {formatCurrency(amount)}
        //             </div>
        //         )
        //     },
        // },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status
                return (
                    <Badge
                        className={cn(
                            "rounded-lg px-2 py-0.5 border-none font-bold text-[9px] shadow-sm",
                            status === InvoiceStatus.Paid && "bg-emerald-500/10 text-emerald-500",
                            status === InvoiceStatus.Draft && "bg-muted text-muted-foreground",
                            status === InvoiceStatus.Sent && "bg-amber-500/10 text-amber-500",
                            status === InvoiceStatus.Overdue && "bg-destructive/10 text-destructive",
                            status === InvoiceStatus.Void && "bg-muted/50 text-muted-foreground/50",
                        )}
                    >
                        {status}
                    </Badge>
                )
            },
        },
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                const invoice = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 rounded-xl transition-all">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 p-2 rounded-2xl border-border bg-popover shadow-2xl">
                            <DropdownMenuLabel className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-2 py-1.5">
                                Invoice Actions
                            </DropdownMenuLabel>

                            <DropdownMenuItem
                                onClick={() => onView(invoice)}
                                className="rounded-xl h-10 px-2 font-bold text-muted-foreground focus:bg-muted focus:text-primary"
                            >
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => onEdit(invoice)}
                                className="rounded-xl h-10 px-2 font-bold text-muted-foreground focus:bg-muted focus:text-primary"
                            >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit Invoice
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                className="rounded-xl h-10 px-2 font-bold text-muted-foreground focus:bg-muted focus:text-primary"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Download PDF
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-border my-1" />

                            <DropdownMenuItem
                                onClick={() => onDelete(invoice)}
                                className="rounded-xl h-10 px-2 font-bold text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Permanently
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]
