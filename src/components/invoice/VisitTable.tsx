import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    Clock,
    Pencil,
    Trash2
} from 'lucide-react'
import type { IInvoiceVisit } from '@/server/invoice/invoice.schema'
import { NoteStatus } from '@/types/invoice'
import { format } from 'date-fns'
import { formatCurrency } from '@/utils/number'
import { cn } from '@/lib/utils'
import { removeInvoiceVisitFn } from '@/server/invoice/invoice.functions'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useState } from 'react'
import { EditVisitDrawer } from './EditVisitDrawer'
import { formatVisitType, formatNoteStatus } from '@/utils/format'

interface VisitTableProps {
    invoiceId: string
    patientId: string
    visits: IInvoiceVisit[]
}

export function VisitTable({ invoiceId, patientId, visits }: VisitTableProps) {
    const router = useRouter()
    const [editingVisit, setEditingVisit] = useState<IInvoiceVisit | null>(null)

    const handleRemove = async (visitId: string) => {
        if (!confirm('Are you sure you want to delete this visit?')) return
        try {
            await removeInvoiceVisitFn({
                data: { invoiceId, patientId, visitId }
            })
            router.invalidate()
            toast.success('Visit record deleted')
        } catch (error) {
            toast.error('Failed to delete visit')
        }
    }

    if (visits.length === 0) {
        return (
            <div className="py-8 flex flex-col items-center justify-center bg-card border-t border-dashed">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest italic">No clinical visits logged</p>
            </div>
        )
    }

    return (
        <div className="border-t border-border overflow-hidden">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                        <TableHead className="h-10 text-[11px] font-bold text-muted-foreground px-4">Date</TableHead>
                        <TableHead className="h-10 text-[11px] font-bold text-muted-foreground px-4">Plotted By</TableHead>
                        <TableHead className="h-10 text-[11px] font-bold text-muted-foreground px-4">RN Completed By</TableHead>
                        <TableHead className="h-10 text-[11px] font-bold text-muted-foreground px-4">Type</TableHead>
                        <TableHead className="h-10 text-[11px] font-bold text-muted-foreground px-4">Time</TableHead>
                        <TableHead className="h-10 text-[11px] font-bold text-muted-foreground px-4">Status</TableHead>
                        <TableHead className="h-10 text-[11px] font-bold text-muted-foreground px-4 text-right">Rate</TableHead>
                        <TableHead className="h-10 w-16 print:hidden"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {visits.map((visit) => (
                        <TableRow key={visit._id} className="group hover:bg-primary/5 transition-colors border-b border-border last:border-b-0">
                            <TableCell className="px-4 py-2 text-[11px] font-mono text-muted-foreground">
                                {format(visit.serviceDate, 'MM/dd/yy')}
                            </TableCell>
                            <TableCell className="px-4 py-2 text-[10px] font-bold text-muted-foreground italic truncate max-w-[100px]">
                                {visit.plottedBy}
                            </TableCell>
                            <TableCell className="px-4 py-2 text-[10px] font-bold text-muted-foreground italic truncate max-w-[100px]">
                                {visit.rnCompletedBy}
                            </TableCell>
                            <TableCell className="px-4 py-2 text-xs font-bold text-foreground">
                                {formatVisitType(visit.visitType)}
                            </TableCell>
                            <TableCell className="px-4 py-2 text-[10px] text-muted-foreground font-medium">
                                <span className="flex items-center gap-1.5 uppercase tracking-tighter">
                                    <Clock className="w-2.5 h-2.5 opacity-40" />
                                    {visit.timeIn} - {visit.timeOut}
                                </span>
                            </TableCell>
                            <TableCell className="px-4 py-2">
                                <Badge variant="outline" className={cn(
                                    "rounded-md px-1.5 h-5 text-[8px] font-black tracking-wider shadow-none border-border",
                                    visit.noteStatus === NoteStatus.Approved && "border-emerald-500/20 text-emerald-500 bg-emerald-500/10",
                                    visit.noteStatus === NoteStatus.Incomplete && "border-slate-500/20 text-slate-500 bg-slate-500/10",
                                    visit.noteStatus === NoteStatus.NeedsCorrection && "border-rose-500/20 text-rose-500 bg-rose-500/10",
                                )}>
                                    {formatNoteStatus(visit.noteStatus)}
                                </Badge>
                            </TableCell>
                            <TableCell className="px-4 py-2 text-right text-xs font-bold text-foreground">
                                {formatCurrency(visit.rate)}
                            </TableCell>
                            <TableCell className="px-4 py-2 text-right print:hidden">
                                <div className="flex items-center justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setEditingVisit(visit)}
                                        className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemove(visit._id)}
                                        className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all active:scale-95"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {editingVisit && (
                <EditVisitDrawer
                    invoiceId={invoiceId}
                    patientId={patientId}
                    visit={editingVisit}
                    open={!!editingVisit}
                    onOpenChange={(open: boolean) => !open && setEditingVisit(null)}
                />
            )}
        </div>
    )
}
