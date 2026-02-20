import { createFileRoute, useRouter } from '@tanstack/react-router'
import { z } from 'zod'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { TablePageLayout } from '@/layout/table-page-layout'
import { getNurses } from '@/server/nurse/nurse.functions'
import { DataTable } from '@/components/table/nurse-table/data-table'
import { getColumns } from '@/components/table/nurse-table/columns'
import { Button } from '@/components/ui/button'
import { AddNurseDialog } from '@/components/modals/AddNurseModal'
import { EditNurseDialog } from '@/components/modals/EditNurseModal'
import { DeleteNurseDialog } from '@/components/modals/DeleteNurseModal'
import { TablePageSkeleton } from '@/components/skeletons/TableSkeleton'
import type { INurse } from '@/server/nurse/nurse.schema'

const nurseSearchSchema = z.object({
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

type NurseSearch = z.infer<typeof nurseSearchSchema>

export const Route = createFileRoute('/_authenticated/nurse/')({
    validateSearch: (search: Record<string, unknown>): NurseSearch =>
        nurseSearchSchema.parse(search),

    loaderDeps: ({ search }) => ({
        page: search.page,
        pageSize: search.pageSize,
        sorting: search.sorting,
    }),
    pendingComponent: TablePageSkeleton,

    loader: async ({ deps }: { deps: NurseSearch }) =>
        await getNurses({
            data: {
                page: deps.page,
                pageSize: deps.pageSize,
                sorting: deps.sorting,
            },
        }),

    component: NursePage,
})

function NursePage() {
    const [showAdd, setShowAdd] = useState(false)
    const [editingNurse, setEditingNurse] = useState<INurse | null>(null)
    const [deletingNurse, setDeletingNurse] = useState<INurse | null>(null)

    const { data, metadata } = Route.useLoaderData()
    const navigate = Route.useNavigate()
    const search = Route.useSearch()
    const router = useRouter()

    const columns = useMemo(
        () =>
            getColumns({
                onEdit: (nurse: INurse) => setEditingNurse(nurse),
                onDelete: (nurse: INurse) => setDeletingNurse(nurse),
            }),
        [],
    )

    return (
        <TablePageLayout
            title="Medical Staff"
            description="Manage and monitor professional clinical personnel across facilities."
            action={
                <Button onClick={() => setShowAdd(true)}>
                    <Plus /> Add nurse
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
                        search: (old: NurseSearch) => ({
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
                        search: (old: NurseSearch) => ({
                            ...old,
                            sorting: nextState,
                            page: 1,
                        }),
                    })
                }}
            />
            {showAdd && (
                <AddNurseDialog
                    onOpenChange={(open: boolean) => setShowAdd(open)}
                    open
                    onSuccess={() => router.invalidate()}
                />
            )}
            {editingNurse && (
                <EditNurseDialog
                    nurse={editingNurse}
                    open={!!editingNurse}
                    onOpenChange={(open: boolean) => !open && setEditingNurse(null)}
                    onSuccess={() => router.invalidate()}
                />
            )}
            {deletingNurse && (
                <DeleteNurseDialog
                    nurse={deletingNurse}
                    open={!!deletingNurse}
                    onOpenChange={(open: boolean) => !open && setDeletingNurse(null)}
                    onSuccess={() => router.invalidate()}
                />
            )}
        </TablePageLayout>
    )
}
