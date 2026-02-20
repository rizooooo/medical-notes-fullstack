import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"
import { Badge } from '@/components/ui/badge'
import { History, User, PlusCircle, PencilLine, FileText, ArrowRight } from 'lucide-react'
import { IAuditTrail } from '@/types/common'
import { format } from 'date-fns'
import { formatVisitType, formatNoteStatus } from '@/utils/format'
import { cn } from '@/lib/utils'

interface AuditLogDrawerProps {
    title: string
    description: string
    auditLog: (IAuditTrail & { visitType?: string; serviceDate?: Date })[]
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AuditLogDrawer({ title, description, auditLog, open, onOpenChange }: AuditLogDrawerProps) {
    const renderFieldName = (field: string) => {
        if (field.startsWith('patient:') && field.endsWith(':isDischarged')) {
            const name = field.split(':')[1]
            return `Discharge Status: ${name}`
        }
        const mapping: Record<string, string> = {
            serviceDate: 'Service Date',
            visitType: 'Visit Type',
            actionsDone: 'Actions Done',
            remarks: 'Remarks',
            customRemark: 'Custom Remark',
            timeIn: 'Time In',
            timeOut: 'Time Out',
            noteStatus: 'Note Status',
            rate: 'Billing Rate',
            status: 'Invoice Status',
            invoiceNumber: 'Invoice #',
            periodStart: 'Period Start',
            periodEnd: 'Period End',
            totalAmount: 'Total Amount',
            patients: 'Patient Management'
        }
        return mapping[field] || field
    }

    const renderValue = (field: string, value: any) => {
        if (value === null || value === undefined) return <span className="text-slate-300 italic">empty</span>
        if (field === 'serviceDate' || field === 'periodStart' || field === 'periodEnd') return format(new Date(value), 'MM/dd/yyyy')
        if (field === 'visitType') return formatVisitType(value)
        if (field === 'noteStatus') return formatNoteStatus(value)
        if (field === 'rate' || field === 'totalAmount') return `$${value}`
        if (field.includes('isDischarged')) return value ? 'Discharged' : 'Active'
        if (typeof value === 'boolean') return value ? 'Yes' : 'No'
        return String(value)
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="sm:max-w-xl w-full p-0 flex flex-col h-full border-l border-border shadow-2xl bg-background">
                <SheetHeader className="p-6 border-b border-border bg-card sticky top-0 z-20">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary-foreground/10">
                            <History className="w-5 h-5" />
                        </div>
                        <SheetTitle className="text-xl font-black tracking-tight text-foreground">{title}</SheetTitle>
                    </div>
                    <SheetDescription className="text-sm font-medium text-muted-foreground">
                        {description}
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 bg-muted/20">
                    {auditLog.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center opacity-30 py-20">
                            <FileText className="w-12 h-12 mb-4" />
                            <p className="text-xs font-bold uppercase tracking-widest italic text-center">
                                No activity logs found.<br />Audit tracking began recently.
                            </p>
                        </div>
                    ) : (
                        auditLog.map((log, index) => (
                            <div key={`${index}-${log.timestamp.toString()}`} className="relative pl-8">
                                {/* Timeline Line */}
                                {index !== auditLog.length - 1 && (
                                    <div className="absolute left-[15px] top-8 bottom-[-24px] w-[2px] bg-border" />
                                )}

                                {/* Status Icon */}
                                <div className={cn(
                                    "absolute left-0 top-1 w-8 h-8 rounded-full border-4 border-background flex items-center justify-center z-10 shadow-sm",
                                    log.action === 'CREATE' ? "bg-emerald-500 text-white" : "bg-blue-500 text-white"
                                )}>
                                    {log.action === 'CREATE' ? (
                                        <PlusCircle className="w-4 h-4" />
                                    ) : (
                                        <PencilLine className="w-4 h-4" />
                                    )}
                                </div>

                                <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden transition-all hover:shadow-md">
                                    {/* Entry Header */}
                                    <div className="px-5 py-3 border-b border-border bg-muted/30 flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                                                {log.action === 'CREATE' ? 'Entry Created' : 'Update Logged'}
                                            </span>
                                            {log.visitType && (
                                                <Badge variant="outline" className="text-[9px] font-bold bg-muted text-muted-foreground rounded-md border-border">
                                                    {formatVisitType(log.visitType as any)}
                                                </Badge>
                                            )}
                                        </div>
                                        {log.serviceDate && (
                                            <span className="text-[10px] font-bold text-muted-foreground font-mono">
                                                Visit Date: {format(new Date(log.serviceDate), 'MM/dd/yy')}
                                            </span>
                                        )}
                                    </div>

                                    <div className="p-5 space-y-4">
                                        {/* User Identity */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center">
                                                <User className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[12px] font-bold text-foreground leading-none">
                                                    {log.userName}
                                                </span>
                                                <span className="text-[10px] font-medium text-muted-foreground mt-1">
                                                    {format(new Date(log.timestamp), 'MMM dd, yyyy • hh:mm:ss a')}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Changes Display */}
                                        {log.changes && log.changes.length > 0 && (
                                            <div className="space-y-2 mt-2">
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-wider mb-1 px-1">Modified Fields</p>
                                                <div className="grid gap-2">
                                                    {log.changes.map((change, cIdx) => (
                                                        <div key={cIdx} className="bg-muted/30 border border-border rounded-lg p-2.5 text-[11px]">
                                                            <div className="flex items-center justify-between mb-1.5">
                                                                <span className="font-bold text-foreground opacity-80">{renderFieldName(change.field)}</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 text-muted-foreground">
                                                                <div className="flex-1 bg-red-500/10 text-red-500 p-1 rounded border border-red-500/20 line-through truncate">
                                                                    {renderValue(change.field, change.oldValue)}
                                                                </div>
                                                                <ArrowRight className="w-3 h-3 text-muted-foreground opacity-30 flex-shrink-0" />
                                                                <div className="flex-1 bg-emerald-500/10 text-emerald-500 p-1 rounded border border-emerald-500/20 font-bold truncate">
                                                                    {renderValue(change.field, change.newValue)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {log.action === 'CREATE' && (
                                            <div className="flex items-center gap-2 text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                                                <PlusCircle className="w-4 h-4" />
                                                <span className="text-xs font-bold font-sans italic">Initial record created</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </SheetContent>
        </Sheet>
    )
}
