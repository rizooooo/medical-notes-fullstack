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
    Pencil,
    Trash2,
    CalendarDays
} from 'lucide-react'
import type { IInvoice, IInvoiceVisit } from '@/server/invoice/invoice.schema'
import { NoteStatus } from '@/types/invoice'
import { format } from 'date-fns'
import { formatCurrency } from '@/utils/number'
import { cn } from '@/lib/utils'
import { removeInvoiceVisitFn } from '@/server/invoice/invoice.functions'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { useState, useMemo } from 'react'
import { EditVisitDrawer } from './EditVisitDrawer'
import { formatVisitType, formatNoteStatus } from '@/utils/format'

interface VisitListTableProps {
    invoice: IInvoice
}

interface VisitWithPatient extends IInvoiceVisit {
    patientId: string
    patientName: string
}

export function VisitListTable({ invoice }: VisitListTableProps) {
    const router = useRouter()
    const [editingVisit, setEditingVisit] = useState<{ visit: IInvoiceVisit, patientId: string } | null>(null)

    const allVisits = useMemo(() => {
        const visits: VisitWithPatient[] = []
        invoice.patients.forEach(patient => {
            patient.visits.forEach(visit => {
                visits.push({
                    ...visit,
                    patientId: patient.patientId,
                    patientName: patient.patientName
                })
            })
        })
        return visits.sort((a, b) => new Date(a.serviceDate).getTime() - new Date(b.serviceDate).getTime())
    }, [invoice.patients])

    const handleRemove = async (patientId: string, visitId: string) => {
        if (!confirm('Are you sure you want to delete this visit?')) return
        try {
            await removeInvoiceVisitFn({
                data: { invoiceId: invoice._id, patientId, visitId }
            })
            router.invalidate()
            toast.success('Visit record deleted')
        } catch (error) {
            toast.error('Failed to delete visit')
        }
    }

    if (allVisits.length === 0) {
        return (
            <div className="py-12 flex flex-col items-center justify-center border border-dashed rounded-xl bg-muted/20">
                <CalendarDays className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-[10px]">No clinical visits logged</p>
            </div>
        )
    }

    return (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all hover:shadow-md">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50 border-b border-border hover:bg-muted/50">
                        <TableHead className="h-10 text-[11px] font-bold text-muted-foreground px-4">Patient</TableHead>
                        <TableHead className="h-10 text-[11px] font-bold text-muted-foreground px-4">Date</TableHead>
                        <TableHead className="h-10 text-[11px] font-bold text-muted-foreground px-4">Plotted By</TableHead>
                        <TableHead className="h-10 text-[11px] font-bold text-muted-foreground px-4">RN Completed By</TableHead>
                        <TableHead className="h-10 text-[11px] font-bold text-muted-foreground px-4">Type</TableHead>
                        <TableHead className="h-10 text-[11px] font-bold text-muted-foreground px-4">Status</TableHead>
                        <TableHead className="h-10 text-[11px] font-bold text-muted-foreground px-4 text-right">Rate</TableHead>
                        <TableHead className="h-10 w-16 print:hidden"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {allVisits.map((visit) => (
                        <TableRow key={visit._id} className="group border-b border-border hover:bg-primary/5 transition-colors last:border-b-0">
                            <TableCell className="py-2.5 px-4 text-[13px] font-medium text-muted-foreground">
                                <span className="font-bold text-foreground block truncate max-w-[120px]">{visit.patientName}</span>
                            </TableCell>
                            <TableCell className="py-2.5 px-4 text-[13px] font-medium text-muted-foreground font-mono text-[11px]">
                                {format(visit.serviceDate, 'MM/dd/yy')}
                            </TableCell>
                            <TableCell className="py-2.5 px-4 text-[11px] font-bold text-muted-foreground italic truncate max-w-[100px]">
                                {visit.plottedBy}
                            </TableCell>
                            <TableCell className="py-2.5 px-4 text-[11px] font-bold text-muted-foreground italic truncate max-w-[100px]">
                                {visit.rnCompletedBy}
                            </TableCell>
                            <TableCell className="py-2.5 px-4 text-[13px] font-medium text-muted-foreground">
                                <Badge variant="secondary" className="bg-muted text-muted-foreground border-none rounded-md text-[10px] font-bold px-1.5 h-5 tracking-tighter">
                                    {formatVisitType(visit.visitType)}
                                </Badge>
                            </TableCell>
                            <TableCell className="py-2.5 px-4 text-[13px] font-medium text-muted-foreground">
                                <Badge variant="outline" className={cn(
                                    "rounded-md px-1.5 h-5 text-[9px] font-black tracking-wider border-border dark:border-border",
                                    visit.noteStatus === NoteStatus.Approved && "border-emerald-500/20 text-emerald-500 bg-emerald-500/10 shadow-none",
                                    visit.noteStatus === NoteStatus.Incomplete && "border-slate-500/20 text-slate-500 shadow-none",
                                    visit.noteStatus === NoteStatus.NeedsCorrection && "border-rose-500/20 text-rose-500 bg-rose-500/10 shadow-none",
                                )}>
                                    {formatNoteStatus(visit.noteStatus)}
                                </Badge>
                            </TableCell>
                            <TableCell className="py-2.5 px-4 text-right font-bold text-foreground">
                                {formatCurrency(visit.rate)}
                            </TableCell>
                            <TableCell className="py-2.5 px-4 text-right print:hidden">
                                <div className="flex items-center justify-end gap-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setEditingVisit({ visit, patientId: visit.patientId })}
                                        className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all active:scale-95"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleRemove(visit.patientId, visit._id)}
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
                    invoiceId={invoice._id}
                    patientId={editingVisit.patientId}
                    visit={editingVisit.visit}
                    open={!!editingVisit}
                    onOpenChange={(open: boolean) => !open && setEditingVisit(null)}
                />
            )}
        </div>
    )
}
