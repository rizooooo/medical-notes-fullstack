import { createFileRoute, useRouter } from '@tanstack/react-router'
import { z } from 'zod'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { TablePageLayout } from '@/layout/table-page-layout'
import { getInvoices } from '@/server/invoice/invoice.functions'
import { Button } from '@/components/ui/button'
import { TablePageSkeleton } from '@/components/skeletons/TableSkeleton'
import { AddInvoiceModal } from '@/components/modals/AddInvoiceModal'
import { DeleteInvoiceModal } from '@/components/modals/DeleteInvoiceModal'
import { DataTable } from '@/components/table/invoice-table/data-table'
import { getColumns } from '@/components/table/invoice-table/columns'
import type { IInvoice } from '@/server/invoice/invoice.schema'

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

export const Route = createFileRoute('/_authenticated/invoice/')({
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
    const [deletingInvoice, setDeletingInvoice] = useState<IInvoice | null>(null)

    const { data, metadata } = Route.useLoaderData()
    const router = useRouter()
    const navigate = Route.useNavigate()
    const search = Route.useSearch()

    const columns = useMemo(
        () =>
            getColumns({
                onEdit: () => { /* Logic hidden */ },
                onDelete: (invoice: IInvoice) => setDeletingInvoice(invoice),
                onView: (invoice: IInvoice) => {
                    navigate({ to: '/invoice/$invoiceId', params: { invoiceId: invoice._id } })
                },
            }),
        [navigate],
    )

    return (
        <TablePageLayout
            title="Invoices"
            description="Manage billing and financial records for hospice facilities."
            action={
                <Button onClick={() => setShowAdd(true)} size="sm" className="h-8 rounded-md font-bold text-xs">
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Generate Invoice
                </Button>
            }
        >
            <DataTable
                columns={columns}
                data={data}
                pageCount={metadata.pageCount}
                rowCount={metadata.total}
                pagination={{
                    pageIndex: search.page - 1,
                    pageSize: search.pageSize,
                }}
                onPaginationChange={(updater) => {
                    const nextState =
                        typeof updater === 'function'
                            ? updater({
                                pageIndex: search.page - 1,
                                pageSize: search.pageSize,
                            })
                            : updater

                    navigate({
                        search: (old: InvoiceSearch) => ({
                            ...old,
                            page: (nextState?.pageIndex ?? 0) + 1,
                            pageSize: nextState?.pageSize ?? 10,
                        }),
                    })
                }}
                sorting={search.sorting}
                onSortingChange={(updater) => {
                    const nextState =
                        typeof updater === 'function'
                            ? updater(search.sorting ?? [])
                            : updater

                    navigate({
                        search: (old: InvoiceSearch) => ({
                            ...old,
                            sorting: nextState,
                            page: 1,
                        }),
                    })
                }}
            />

            <AddInvoiceModal
                open={showAdd}
                onOpenChange={setShowAdd}
                onSuccess={() => router.invalidate()}
            />

            {deletingInvoice && (
                <DeleteInvoiceModal
                    invoice={deletingInvoice}
                    open={!!deletingInvoice}
                    onOpenChange={(open) => !open && setDeletingInvoice(null)}
                    onSuccess={() => router.invalidate()}
                />
            )}
        </TablePageLayout>
    )
}
