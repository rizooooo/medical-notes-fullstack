import { Building2, ClipboardList, Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ISummaryRow {
    nurseName: string
    type: 'CALENDAR' | 'Flowsheet'
    facility: string
    status: string
}

interface SummaryVisitsTableProps {
    data: ISummaryRow[]
}

export function SummaryVisitsTable({ data }: SummaryVisitsTableProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4" />
                    Visit Summary Registry
                </h3>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead>
                        <tr className="bg-slate-50/50 border-b border-slate-100">
                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Staff Member</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">System Type</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Facility Name</th>
                            <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap text-right">Status / Count</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {data.map((row, idx) => (
                            <tr key={`${row.nurseName}-${row.facility}-${idx}`} className="group hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{row.nurseName}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className={cn(
                                        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm",
                                        row.type === 'CALENDAR'
                                            ? "bg-amber-100 text-amber-700 border border-amber-200"
                                            : "bg-cyan-100 text-cyan-700 border border-cyan-200"
                                    )}>
                                        {row.type === 'CALENDAR' ? <Calendar className="w-2.5 h-2.5" /> : <ClipboardList className="w-2.5 h-2.5" />}
                                        {row.type}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="w-3 h-3 text-slate-300" />
                                        <span className="text-[11px] font-bold text-slate-600">{row.facility}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                    <span className={cn(
                                        "text-[11px] font-black px-2.5 py-1 rounded-lg",
                                        row.status === 'No Active Pt' || row.status === 'No Access'
                                            ? "text-slate-400 bg-slate-100"
                                            : "text-indigo-600 bg-indigo-50"
                                    )}>
                                        {row.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
