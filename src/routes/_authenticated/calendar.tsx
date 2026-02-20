import { createFileRoute } from '@tanstack/react-router'
import { TablePageLayout } from '@/layout/table-page-layout'
import { getNurses } from '@/server/nurse/nurse.functions'
import { useState, useMemo } from 'react'
import { INurse, INurseCredential } from '@/server/nurse/nurse.schema'
import { cn } from '@/lib/utils'
import { getInvoices } from '@/server/invoice/invoice.functions'
import { IInvoice } from '@/server/invoice/invoice.schema'
import { InvoiceStatus } from '@/types/invoice'
import { CalendarTable, ICalendarRow } from '@/components/calendar/calendar-table'
import { Filter, Users, FileText } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/calendar')({
    loader: async () => {
        const [nursesResult, invoicesResult] = await Promise.all([
            getNurses({ data: { page: 1, pageSize: 100 } }),
            getInvoices({ data: { page: 1, pageSize: 100 } })
        ])
        return {
            nurses: nursesResult.data,
            invoices: invoicesResult.data as IInvoice[]
        }
    },
    component: CalendarPage,
})

function CalendarPage() {
    const { nurses, invoices } = Route.useLoaderData()
    const [filter, setFilter] = useState<'all' | 'active'>('all')

    const data: ICalendarRow[] = useMemo(() => {
        const allRows = (nurses as INurse[]).flatMap((nurse: INurse) => {
            if (!nurse.credentials || nurse.credentials.length === 0) {
                return [{
                    nurseId: nurse._id,
                    nurseName: nurse.name,
                    hospiceId: 'unlinked',
                    hospiceName: 'No Active Hospice',
                    email: 'N/A',
                    remarks: 'Account pending hospice link',
                    incompleteNotes: 0,
                    needsCorrection: 0,
                    previousMonthPending: 0
                }]
            }
            return nurse.credentials.map((cred: INurseCredential) => ({
                ...cred,
                nurseId: nurse._id,
                nurseName: nurse.name
            }))
        })

        if (filter === 'active' && invoices) {
            const activeNurseIds = new Set(
                (invoices as IInvoice[])
                    .filter(inv => inv.status !== InvoiceStatus.Paid && inv.status !== InvoiceStatus.Void)
                    .map(inv => inv.nurseId)
            )
            return allRows.filter(row => activeNurseIds.has(row.nurseId))
        }

        return allRows
    }, [nurses, invoices, filter])

    return (
        <TablePageLayout
            title="Plotting Calendar"
            description="High-level operational overview of nursing charting and credentials."
            className="lg:p-4"
        >
            <div className="mb-8 flex flex-wrap items-center gap-3">
                <button
                    onClick={() => setFilter('all')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                        filter === 'all'
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                            : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                    )}
                >
                    <Users className="w-3.5 h-3.5" />
                    All Staff
                </button>
                <button
                    onClick={() => setFilter('active')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border",
                        filter === 'active'
                            ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100"
                            : "bg-white text-slate-400 border-slate-100 hover:border-slate-200"
                    )}
                >
                    <FileText className="w-3.5 h-3.5" />
                    Ongoing Invoices
                </button>
                <div className="ml-auto flex items-center gap-2 text-[10px] font-bold text-slate-400 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
                    <Filter className="w-3 h-3" />
                    Showing {data.length} results
                </div>
            </div>

            <CalendarTable data={data} />
        </TablePageLayout>
    )
}
