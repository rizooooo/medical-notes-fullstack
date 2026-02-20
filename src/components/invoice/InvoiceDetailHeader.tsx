import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import type { IInvoice } from '@/server/invoice/invoice.schema'
import { InvoiceStatus } from '@/types/invoice'
import { formatCurrency } from '@/utils/number'
import { format } from 'date-fns'
import { ArrowLeft, Building2, Calendar, Download, User, ChevronDown, History } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { AuditLogDrawer } from './AuditLogDrawer'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { updateInvoiceFn } from '@/server/invoice/invoice.functions'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'

interface InvoiceDetailHeaderProps {
    invoice: IInvoice
}

export function InvoiceDetailHeader({ invoice }: InvoiceDetailHeaderProps) {
    const router = useRouter()
    const [isAuditOpen, setIsAuditOpen] = useState(false)

    const handleStatusUpdate = async (status: InvoiceStatus) => {
        try {
            await updateInvoiceFn({
                data: { id: invoice._id, status }
            })
            router.invalidate()
            toast.success(`Invoice status updated to ${status}`)
        } catch (error) {
            toast.error('Failed to update invoice status')
        }
    }

    const handleExportPDF = () => {
        window.print()
    }

    return (
        <div className="space-y-4 print:space-y-2">
            <div className="flex items-center gap-3 print:hidden">
                <Button variant="outline" size="icon" asChild className="h-8 w-8 rounded-md">
                    <Link to="/invoice" search={{ page: 1, pageSize: 10, sorting: [] }}>
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold tracking-tight">{invoice.invoiceNumber}</h1>
                    <Badge variant="outline" className="rounded-md uppercase text-[10px] font-semibold">
                        {invoice.status}
                    </Badge>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsAuditOpen(true)}
                        className="h-8 text-[11px] font-bold text-muted-foreground hover:bg-muted rounded-md px-2 gap-1.5"
                    >
                        <History className="w-3.5 h-3.5" /> Audit Trail
                    </Button>

                    <Button variant="outline" size="sm" onClick={handleExportPDF} className="h-8 rounded-md font-medium">
                        <Download className="mr-2 h-3.5 w-3.5" /> Export
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="sm" className="h-8 rounded-md font-medium gap-1">
                                Status <ChevronDown className="w-3.5 h-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            {Object.values(InvoiceStatus).map((status) => (
                                <DropdownMenuItem
                                    key={status}
                                    onClick={() => handleStatusUpdate(status)}
                                    className={cn(
                                        "text-xs font-medium cursor-pointer",
                                        invoice.status === status && "bg-muted font-bold"
                                    )}
                                >
                                    {status}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="hidden print:block mb-6">
                <h1 className="text-2xl font-bold uppercase tracking-tight">Invoice: {invoice.invoiceNumber}</h1>
                <p className="text-sm text-muted-foreground font-medium">Status: {invoice.status}</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 print:grid-cols-4">
                <Card className="p-3 rounded-md border shadow-none">
                    <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-muted-foreground" />
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Facility</p>
                            <Link
                                to={`/hospice/$hospiceId`}
                                params={{ hospiceId: invoice.hospiceId }}
                                search={{ tab: 'registry' }}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-bold truncate leading-tight hover:text-indigo-600 transition-colors block"
                            >
                                {invoice.hospiceName}
                            </Link>
                        </div>
                    </div>
                </Card>

                <Card className="p-3 rounded-md border shadow-none">
                    <div className="flex items-center gap-2.5">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div className="min-w-0 flex-1">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Staff Member</p>
                            <div className="text-xs font-bold leading-tight flex flex-wrap gap-1 mt-0.5">
                                {(() => {
                                    const allStaff = invoice.patients.flatMap(p =>
                                        p.visits.flatMap(v => [v.rnCompletedBy, v.plottedBy])
                                    );
                                    const names = Array.from(new Set(allStaff))
                                        .filter(n => n && !['Standard RN', 'Already Plotted', 'Multiple Nurses', 'None'].includes(n));

                                    if (names.length > 0) return names.map((name, i) => (
                                        <Badge key={i} variant="secondary" className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-none px-1.5 py-0 h-4 text-[9px] font-black uppercase tracking-tight">
                                            {name}
                                        </Badge>
                                    ));

                                    const fallback = invoice.nurseName && !['Standard RN', 'Multiple Nurses'].includes(invoice.nurseName)
                                        ? invoice.nurseName
                                        : 'No Staff Assigned';

                                    return <span className="text-muted-foreground italic font-medium">{fallback}</span>;
                                })()}
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-3 rounded-md border shadow-none">
                    <div className="flex items-center gap-2.5">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Billing Period</p>
                            <p className="text-xs font-bold leading-tight">{format(invoice.periodStart, 'MMM yyyy')}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-3 rounded-md border shadow-none bg-foreground text-background print:bg-white print:text-black">
                    <div className="flex flex-col">
                        <p className="text-[10px] font-semibold opacity-70 uppercase tracking-wider">Total Amount</p>
                        <p className="text-sm font-bold leading-tight">{formatCurrency(invoice.totalAmount)}</p>
                    </div>
                </Card>
            </div>

            <AuditLogDrawer
                title="Invoice Audit Trail"
                description={`Tracking history for Invoice ${invoice.invoiceNumber}`}
                auditLog={[...(invoice.auditLog || [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())}
                open={isAuditOpen}
                onOpenChange={setIsAuditOpen}
            />
        </div>
    )
}
