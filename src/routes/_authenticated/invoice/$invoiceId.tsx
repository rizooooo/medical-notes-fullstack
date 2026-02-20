import { createFileRoute } from '@tanstack/react-router'
import { getInvoice } from '@/server/invoice/invoice.functions'
import { DetailWrapper } from '@/components/layout/DetailWrapper'
import { InvoiceDetailHeader } from '@/components/invoice/InvoiceDetailHeader'
import { InvoicePatientList } from '@/components/invoice/InvoicePatientList'
import type { IInvoice } from '@/server/invoice/invoice.schema'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VisitListTable } from '@/components/invoice/VisitListTable'
import { Users, LayoutList } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/invoice/$invoiceId')({
    loader: async ({ params }) => {
        const invoice = await getInvoice({ data: params.invoiceId })
        if (!invoice) throw new Error('Invoice not found')
        return { invoice: invoice as IInvoice }
    },
    component: InvoiceDetailPage,
})

function InvoiceDetailPage() {
    const { invoice } = Route.useLoaderData()

    return (
        <DetailWrapper className="p-4 lg:p-6 print:p-0">
            <InvoiceDetailHeader invoice={invoice} />

            <Tabs defaultValue="patients" className="w-full mt-2 print:mt-4">
                <div className="flex items-center justify-between px-1 mb-4 print:hidden">
                    <TabsList className="bg-muted/50 p-1 rounded-md h-9 border border-border">
                        <TabsTrigger
                            value="patients"
                            className="rounded-sm px-4 text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all gap-1.5"
                        >
                            <Users className="w-3.5 h-3.5" /> Patient View
                        </TabsTrigger>
                        <TabsTrigger
                            value="all-visits"
                            className="rounded-sm px-4 text-xs font-bold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all gap-1.5"
                        >
                            <LayoutList className="w-3.5 h-3.5" /> Spreadsheet View
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="patients" className="mt-0 ring-0 focus-visible:ring-0 outline-none">
                    <InvoicePatientList invoice={invoice} />
                </TabsContent>

                <TabsContent value="all-visits" className="mt-0 ring-0 focus-visible:ring-0 outline-none">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1 print:hidden">
                            <LayoutList className="w-4 h-4 text-muted-foreground" />
                            <h2 className="text-sm font-bold text-foreground">Consolidated Visit Registry</h2>
                        </div>
                        <VisitListTable invoice={invoice} />
                    </div>
                </TabsContent>
            </Tabs>

            {/* Print Footer */}
            <div className="hidden print:block mt-20 pt-8 border-t border-border">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End of Invoice</p>
                        <p className="text-xs font-medium text-slate-500 mt-1">Generated via MedicalNotes Cloud</p>
                    </div>
                    <div className="text-right">
                        <p className="text-lg font-bold">Total: {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(invoice.totalAmount)}</p>
                    </div>
                </div>
            </div>
        </DetailWrapper>
    )
}
