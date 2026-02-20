import { createFileRoute, useRouter } from '@tanstack/react-router'
import { z } from 'zod'
import { Plus, Receipt } from 'lucide-react'
import { useState } from 'react'
import { TablePageLayout } from '@/layout/table-page-layout'
import { getInvoices } from '@/server/invoice/invoice.functions'
import { Button } from '@/components/ui/button'
import { TablePageSkeleton } from '@/components/skeletons/TableSkeleton'
import { AddInvoiceModal } from '@/components/modals/AddInvoiceModal'

const invoiceSearchSchema = z.object({
    page: z.number().catch(1),
    pageSize: z.number().catch(10),
    sorting: z
        .array(
            z.object({
                id: z.string(),
                desc: z.boolean(),
            }),
        )
        .optional()
        .catch([]),
})

type InvoiceSearch = z.infer<typeof invoiceSearchSchema>

export const Route = createFileRoute('/invoice/')({
    validateSearch: (search: Record<string, unknown>): InvoiceSearch =>
        invoiceSearchSchema.parse(search),

    loaderDeps: ({ search }) => ({
        page: search.page,
        pageSize: search.pageSize,
        sorting: search.sorting,
    }),
    pendingComponent: TablePageSkeleton,

    loader: async ({ deps }: { deps: InvoiceSearch }) =>
        await getInvoices({
            data: {
                page: deps.page,
                pageSize: deps.pageSize,
                sorting: deps.sorting,
            },
        }),

    component: InvoicePage,
})

function InvoicePage() {
    const [showAdd, setShowAdd] = useState(false)
    const { metadata } = Route.useLoaderData()
    const router = useRouter()

    return (
        <TablePageLayout
            title="Invoices"
            description="Manage billing and financial records for hospice facilities."
            action={
                <Button onClick={() => setShowAdd(true)}>
                    <Plus /> Generate Invoice
                </Button>
            }
        >
            <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-slate-200 rounded-3xl bg-white/50 animate-in fade-in zoom-in-95 duration-500">
                <Receipt className="w-16 h-16 text-slate-200 mb-4" />
                <h3 className="text-xl font-black text-slate-900 mb-2">Invoice Dashboard Ready</h3>
                <p className="text-slate-500 font-medium text-center max-w-sm mb-8">
                    You have {metadata.total} invoices in the system. The dashboard UI is being prepared for the next release.
                </p>
                <div className="flex gap-4">
                    <div className="px-6 py-4 rounded-2xl bg-slate-900 text-white flex flex-col items-center min-w-[140px]">
                        <span className="text-2xl font-black">{metadata.total}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Invoices</span>
                    </div>
                    <div className="px-6 py-4 rounded-2xl bg-indigo-600 text-white flex flex-col items-center min-w-[140px]">
                        <span className="text-2xl font-black">--</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-200">Pending</span>
                    </div>
                </div>
            </div>

            <AddInvoiceModal
                open={showAdd}
                onOpenChange={setShowAdd}
                onSuccess={() => router.invalidate()}
            />
        </TablePageLayout>
    )
}
