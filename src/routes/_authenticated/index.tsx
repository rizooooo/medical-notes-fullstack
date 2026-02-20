import { createFileRoute } from '@tanstack/react-router'
import { TablePageLayout } from '@/layout/table-page-layout'
import { getInvoices } from '@/server/invoice/invoice.functions'
import { useMemo } from 'react'
import { IInvoice } from '@/server/invoice/invoice.schema'
import { InvoiceStatus } from '@/types/invoice'
import {
  FileText,
  Users,
  Clock,
  DollarSign,
  Building2,
  Calendar,
  ArrowUpRight,
  TrendingUp
} from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/_authenticated/')({
  loader: async () => await getInvoices({ data: { page: 1, pageSize: 50 } }),
  component: App
})

function App() {
  const { data: invoices } = Route.useLoaderData()

  const stats = useMemo(() => {
    const totalInvoices = invoices.length
    const totalAmount = (invoices as IInvoice[]).reduce((sum, inv) => sum + (inv.totalAmount || 0), 0)
    const activeInvoices = (invoices as IInvoice[]).filter(inv => inv.status === InvoiceStatus.Sent).length

    let totalPatients = 0
    let totalVisits = 0
    invoices.forEach(inv => {
      totalPatients += inv.patients?.length || 0
      inv.patients?.forEach(p => {
        totalVisits += p.visits?.length || 0
      })
    })

    return [
      {
        label: 'Revenue Overview',
        value: `$${totalAmount.toLocaleString()}`,
        icon: DollarSign,
        color: 'indigo',
        desc: 'Accumulated billings'
      },
      {
        label: 'Total Invoices',
        value: totalInvoices.toString(),
        icon: FileText,
        color: 'emerald',
        desc: `${activeInvoices} Ready for processing`
      },
      {
        label: 'Clinical Staff',
        value: totalPatients.toString(),
        icon: Users,
        color: 'amber',
        desc: 'Active patient assignments'
      },
      {
        label: 'Visits Logged',
        value: totalVisits.toString(),
        icon: Clock,
        color: 'rose',
        desc: 'Total charting entries'
      }
    ]
  }, [invoices])

  const recentInvoices = useMemo(() => {
    return [...invoices]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
  }, [invoices])

  return (
    <TablePageLayout
      title="Clinic Overview"
      description="Monitor patient care, billing status, and professional nursing assignments."
    >
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
              <div className={cn(
                "absolute -right-4 -top-4 h-24 w-24 rounded-full opacity-[0.03] transition-transform group-hover:scale-110",
                stat.color === 'indigo' && "bg-indigo-600",
                stat.color === 'emerald' && "bg-emerald-600",
                stat.color === 'amber' && "bg-amber-600",
                stat.color === 'rose' && "bg-rose-600",
              )} />

              <div className="relative flex flex-col gap-4">
                <div className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-2xl",
                  stat.color === 'indigo' && "bg-indigo-50 text-indigo-600",
                  stat.color === 'emerald' && "bg-emerald-50 text-emerald-600",
                  stat.color === 'amber' && "bg-amber-50 text-amber-600",
                  stat.color === 'rose' && "bg-rose-50 text-rose-600",
                )}>
                  <stat.icon className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{stat.label}</p>
                  <h3 className="mt-1 text-2xl font-black tracking-tight text-slate-900">{stat.value}</h3>
                  <p className="mt-1 text-[10px] font-bold text-slate-400">{stat.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Invoices Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Recent Invoices
              </h3>
              <button className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1 group">
                View All <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </button>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white overflow-hidden shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Invoice #</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Facility</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Patients</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap">Amount</th>
                    <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-slate-400 whitespace-nowrap text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentInvoices.map((inv) => (
                    <tr key={inv._id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-slate-900">{inv.invoiceNumber}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">{format(new Date(inv.createdAt), 'MMM dd, yyyy')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3 h-3 text-slate-300" />
                          <span className="text-xs font-bold text-slate-600">{inv.hospiceName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-50 flex items-center justify-center">
                            <Users className="w-2.5 h-2.5 text-slate-400" />
                          </div>
                          <span className="text-xs font-bold text-slate-600">{(inv as IInvoice).patients?.length ?? 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-black text-slate-900">${inv.totalAmount?.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Badge variant="outline" className={cn(
                          "rounded-md text-[9px] font-black tracking-widest h-5 px-2",
                          inv.status === InvoiceStatus.Paid ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            inv.status === InvoiceStatus.Sent ? "bg-amber-50 text-amber-600 border-amber-100" :
                              "bg-slate-50 text-slate-500 border-slate-100"
                        )}>
                          {inv.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Activity/Insights Card */}
          <div className="space-y-4">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Insights
            </h3>
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm space-y-6">
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">Operational Health</p>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full w-[85%]" />
                </div>
                <p className="text-[10px] font-bold text-slate-500 italic">85% Efficiency across charted visits</p>
              </div>

              <div className="pt-2 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-xl bg-indigo-50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Period Ending Soon</p>
                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed mt-0.5">3 active invoices are reaching their period end dates. Prepare for reconciling staff visits.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="h-8 w-8 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">Charting Delays</p>
                    <p className="text-[10px] font-medium text-slate-500 leading-relaxed mt-0.5">Some nurses have incomplete charting statuses. Automated reminders scheduled for 09:00 AM.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TablePageLayout>
  )
}
