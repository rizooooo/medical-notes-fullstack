import {
    History,
    User,
    Clock,
    ArrowRight,
    CheckCircle2,
    Info,
    MessageSquare
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import type { IAuditTrail } from '@/types/common'
import { Badge } from '@/components/ui/badge'
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
} from "@/components/ui/sheet"

interface QAAuditDrawerProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    entityName: string
    auditLog?: IAuditTrail[]
}

const statusColors: any = {
    'Completed': 'text-emerald-600 bg-emerald-50 border-emerald-100',
    'InProgress': 'text-amber-600 bg-amber-50 border-amber-100',
    'Incomplete': 'text-rose-600 bg-rose-50 border-rose-100',
    'Concern': 'text-indigo-600 bg-indigo-50 border-indigo-100',
    'Empty': 'text-muted-foreground bg-muted/50 border-transparent'
}

export function QAAuditDrawer({ open, onOpenChange, entityName, auditLog = [] }: QAAuditDrawerProps) {
    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
                <SheetHeader className="p-6 border-b">
                    <div className="flex items-center gap-2">
                        <History className="h-5 w-5 text-muted-foreground" />
                        <SheetTitle>Audit History</SheetTitle>
                    </div>
                    <SheetDescription className="text-xs uppercase font-medium tracking-wider">
                        Activity log for <span className="text-foreground font-bold">{entityName}</span>
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    {auditLog.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-3 opacity-50">
                            <Clock className="h-8 w-8" />
                            <div className="space-y-1">
                                <p className="text-sm font-bold uppercase tracking-tight">No History Found</p>
                                <p className="text-xs">No modifications recorded for this item.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px before:h-full before:w-0.5 before:bg-border">
                            {auditLog
                                .slice()
                                .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                                .map((log, idx) => (
                                    <div key={idx} className="relative flex items-start gap-4">
                                        <div className="mt-1 h-8 w-8 rounded-full border bg-background flex items-center justify-center text-muted-foreground shadow-sm z-10 shrink-0">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs font-bold">{log.userName}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                                                    {format(new Date(log.timestamp), 'MMM dd, HH:mm')}
                                                </p>
                                            </div>

                                            <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
                                                {log.changes?.map((change, cIdx) => (
                                                    <div key={cIdx} className="space-y-2">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{change.field}</span>
                                                            <Badge variant="outline" className="h-4 px-1 text-[9px] uppercase font-bold tracking-tight">Changed</Badge>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <div className={cn("px-2 py-0.5 rounded border text-[10px] font-bold opacity-50 truncate", statusColors[change.oldValue] || 'bg-muted')}>
                                                                {change.oldValue}
                                                            </div>
                                                            <ArrowRight className="h-3 w-3 text-muted-foreground" />
                                                            <div className={cn("px-2 py-0.5 rounded border text-[10px] font-bold truncate shadow-sm", statusColors[change.newValue] || 'bg-background border-border')}>
                                                                {change.newValue}
                                                            </div>
                                                        </div>
                                                        {(change as any).comment && (
                                                            <div className="mt-2 p-2 rounded bg-indigo-50/50 border border-indigo-100/50 flex gap-2">
                                                                <MessageSquare className="h-3 w-3 text-indigo-400 shrink-0 mt-0.5" />
                                                                <p className="text-[10px] text-indigo-900 leading-normal italic font-medium">
                                                                    {(change as any).comment}
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                                {log.action === 'CREATE' && (
                                                    <div className="flex items-center gap-2 text-emerald-600">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        <span className="text-[10px] font-bold uppercase tracking-tight">Cycle Initiated</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>

                <div className="p-6 border-t bg-muted/10">
                    <div className="flex gap-3 text-xs text-muted-foreground leading-relaxed">
                        <Info className="h-4 w-4 shrink-0 mt-0.5" />
                        <p>
                            Audit logs are strictly read-only and recorded automatically to ensure clinical oversight integrity.
                        </p>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    )
}
