import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    MoreVertical,
    Plus,
    Trash2,
    LogOut,
    UserCheck,
    History
} from 'lucide-react'
import type { IInvoicePatient } from '@/server/invoice/invoice.schema'
// import { VisitTable } from './VisitTable'
// import { AddVisitDialog } from './AddVisitDialog'
// import { VisitLogDialog } from './VisitLogDialog'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { updateInvoicePatientFn, removeInvoicePatientFn } from '@/server/invoice/invoice.functions'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { VisitTable } from './VisitTable'
import { AddVisitDialog } from './AddVisitDialog'
import { AuditLogDrawer } from './AuditLogDrawer'

interface PatientSectionProps {
    invoiceId: string
    patient: IInvoicePatient
}

export function PatientSection({ invoiceId, patient }: PatientSectionProps) {
    const [isAddVisitOpen, setIsAddVisitOpen] = useState(false)
    const [isLogsOpen, setIsLogsOpen] = useState(false)
    const router = useRouter()

    const handleDischarge = async () => {
        try {
            await updateInvoicePatientFn({
                data: {
                    invoiceId,
                    patientId: patient.patientId,
                    patientData: { isDischarged: !patient.isDischarged }
                }
            })
            router.invalidate()
            toast.success(patient.isDischarged ? 'Record reactivated' : 'Patient discharged successfully')
        } catch (error) {
            toast.error('Failed to update patient status')
        }
    }

    const handleRemovePatient = async () => {
        if (!confirm('Are you sure you want to remove this patient from the invoice?')) return
        try {
            await removeInvoicePatientFn({
                data: { invoiceId, patientId: patient.patientId }
            })
            router.invalidate()
            toast.success('Patient removed from invoice')
        } catch (error) {
            toast.error('Failed to remove patient')
        }
    }

    return (
        <Card className={cn(
            "rounded-md border shadow-none bg-card overflow-hidden print:border-none print:shadow-none print:mb-8",
            patient.isDischarged && "opacity-80"
        )}>
            <div className="px-4 py-3 bg-muted/30 border-b flex items-center justify-between print:bg-white print:px-0 print:py-2">
                <div className="flex items-center gap-3">
                    <UserCheck className="w-4 h-4 text-muted-foreground" />
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-sm font-bold text-foreground">{patient.patientName}</h3>
                        <span className="text-[10px] text-muted-foreground font-medium">MRN: {patient.mrn}</span>
                        {patient.isDischarged && (
                            <Badge variant="secondary" className="rounded-sm bg-muted text-muted-foreground text-[9px] px-1 py-0 h-4 border-border">
                                Discharged
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 print:hidden">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsLogsOpen(true)}
                        className="h-7 text-[10px] font-bold text-muted-foreground hover:bg-muted rounded-sm px-2"
                    >
                        <History className="w-3 h-3 mr-1" /> Logs
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setIsAddVisitOpen(true)}
                        className="h-7 text-[10px] font-bold bg-slate-900 hover:bg-slate-800 rounded-sm px-2 gap-1 bg-primary"
                    >
                        <Plus className="w-3 h-3" /> Visit
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-sm text-muted-foreground">
                                <MoreVertical className="w-3.5 h-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-md">
                            <DropdownMenuItem
                                onClick={handleDischarge}
                                className="text-xs font-semibold focus:bg-slate-100"
                            >
                                <LogOut className="mr-2 h-3.5 w-3.5" />
                                {patient.isDischarged ? 'Reactivate' : 'Discharge'}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleRemovePatient}
                                className="text-xs font-semibold text-rose-600 focus:bg-rose-50"
                            >
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Remove
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="p-0">
                <VisitTable
                    invoiceId={invoiceId}
                    patientId={patient.patientId}
                    visits={patient.visits}
                />
            </div>

            <AddVisitDialog
                invoiceId={invoiceId}
                patientId={patient.patientId}
                open={isAddVisitOpen}
                onOpenChange={setIsAddVisitOpen}
            />

            <AuditLogDrawer
                title="Activity Logs"
                description={`Audit trail and clinical history for ${patient.patientName}`}
                auditLog={patient.visits.flatMap(visit =>
                    (visit.auditLog || []).map(log => ({
                        ...log,
                        visitId: (visit as any)._id,
                        serviceDate: (visit as any).serviceDate,
                        visitType: (visit as any).visitType
                    }))
                ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())}
                open={isLogsOpen}
                onOpenChange={setIsLogsOpen}
            />
        </Card>
    )
}
