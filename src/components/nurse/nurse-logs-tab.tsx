"use client"

import { Card } from '@/components/ui/card'
import { History, User, PlusCircle, PencilLine, FileText, ArrowRight } from 'lucide-react'
import { INurse } from '@/server/nurse/nurse.schema'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface NurseLogsTabProps {
    nurse: INurse
}

export function NurseLogsTab({ nurse }: NurseLogsTabProps) {
    const logs = [...(nurse.auditLog || [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    if (logs.length === 0) {
        return (
            <Card className="border-none shadow-xl border-slate-200/60 bg-white/50 backdrop-blur-xl rounded-3xl overflow-hidden min-h-[400px] flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col items-center gap-4 text-slate-300">
                    <History className="w-16 h-16 opacity-20" />
                    <span className="font-black text-2xl uppercase tracking-tighter opacity-10">No activity logged yet</span>
                </div>
            </Card>
        )
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center gap-4 px-2 py-4">
                <div className="p-2.5 rounded-xl bg-slate-100 text-slate-600 shadow-sm border border-slate-200/50">
                    <History className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Audit History</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-0.5">Chronological record of personnel updates</p>
                </div>
            </div>

            <div className="relative space-y-4 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                {logs.map((log, idx) => (
                    <div key={idx} className="relative flex items-start gap-6 group">
                        <div className={cn(
                            "mt-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-4 border-white shadow-sm ring-1 ring-slate-100 transition-all group-hover:scale-110",
                            log.action === 'CREATE' ? "bg-emerald-50 text-emerald-600" : "bg-indigo-50 text-indigo-600"
                        )}>
                            {log.action === 'CREATE' ? <PlusCircle className="h-5 w-5" /> : <PencilLine className="h-5 w-5" />}
                        </div>

                        <Card className="flex-1 p-5 rounded-3xl border-slate-100 bg-white/80 backdrop-blur-sm hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-300">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        <User className="h-3 w-3" />
                                        <span className="text-[10px] font-black uppercase tracking-tight">{log.userName}</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-widest">
                                        {log.action}
                                    </span>
                                </div>
                                <time className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    {format(new Date(log.timestamp), 'MMM dd, yyyy • hh:mm a')}
                                </time>
                            </div>

                            {log.changes && log.changes.length > 0 && (
                                <div className="space-y-3">
                                    {log.changes.map((change, cIdx) => (
                                        <div key={cIdx} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100">
                                            <div className="flex items-center gap-2 mb-2">
                                                <FileText className="h-3 w-3 text-slate-400" />
                                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{change.field}</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] items-center gap-4">
                                                <div className="min-w-0">
                                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Original</p>
                                                    <div className="truncate p-2 rounded-xl bg-white border border-slate-100 text-[11px] font-bold text-slate-500 shadow-sm italic">
                                                        {renderValue(change.oldValue)}
                                                    </div>
                                                </div>
                                                <div className="flex justify-center">
                                                    <ArrowRight className="h-3.5 w-3.5 text-indigo-400 rotate-90 sm:rotate-0" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[8px] font-black text-indigo-400 uppercase tracking-widest mb-1.5 ml-1">Updated</p>
                                                    <div className="truncate p-2 rounded-xl bg-indigo-50/50 border border-indigo-100 text-[11px] font-bold text-indigo-700 shadow-sm">
                                                        {renderValue(change.newValue)}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    )
}

function renderValue(value: any): string {
    if (value === null || value === undefined) return 'None'
    if (typeof value === 'object') {
        if (Array.isArray(value)) {
            if (value.length === 0) return 'Empty List'
            return `${value.length} items`
        }
        return JSON.stringify(value).substring(0, 50) + '...'
    }
    return String(value)
}
