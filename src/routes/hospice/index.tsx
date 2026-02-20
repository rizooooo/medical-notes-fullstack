import { createFileRoute, useRouter } from '@tanstack/react-router'
import { z } from 'zod'
import { Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { TablePageLayout } from '@/layout/table-page-layout'
import { getHospices } from '@/server/hospice/hospice.functions'
import { DataTable } from '@/components/table/hospice-table/data-table'
import { getColumns } from '@/components/table/hospice-table/columns'
import { Button } from '@/components/ui/button'
import { AddHospiceDialog } from '@/components/modals/AddHospiceModal'
import { EditHospiceDialog } from '@/components/modals/EditHospiceModal'
import { DeleteHospiceDialog } from '@/components/modals/DeleteHospiceModal'
import { TablePageSkeleton } from '@/components/skeletons/TableSkeleton'
import type { IHospice } from '@/server/hospice/hospice.schema'

// 1. Define URL Search Params Schema
const hospiceSearchSchema = z.object({
  page: z.number().catch(1), // Default to 1 if missing/invalid
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

type HospiceSearch = z.infer<typeof hospiceSearchSchema>

export const Route = createFileRoute('/hospice/')({
  // 2. Validate URL Params
  validateSearch: (search: Record<string, unknown>): HospiceSearch =>
    hospiceSearchSchema.parse(search),

  // 3. Reload loader when params change
  loaderDeps: ({ search }) => ({
    page: search.page,
    pageSize: search.pageSize,
    sorting: search.sorting,
  }),
  pendingComponent: TablePageSkeleton,

  // 4. Pass params to Server Function
  loader: async ({ deps }: { deps: HospiceSearch }) =>
    await getHospices({
      data: {
        page: deps.page,
        pageSize: deps.pageSize,
        sorting: deps.sorting,
      },
    }),

  component: HospicePage,
})

function HospicePage() {
  const [showAdd, setShowAdd] = useState(false)
  const [editingHospice, setEditingHospice] = useState<IHospice | null>(null)
  const [deletingHospice, setDeletingHospice] = useState<IHospice | null>(null)

  const { data, metadata } = Route.useLoaderData()
  const navigate = Route.useNavigate()
  const search = Route.useSearch()
  const router = useRouter()

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: (hospice: IHospice) => setEditingHospice(hospice),
        onDelete: (hospice: IHospice) => setDeletingHospice(hospice),
      }),
    [],
  )

  return (
    <TablePageLayout
      title="Hospices"
      action={
        <Button onClick={() => setShowAdd(true)}>
          <Plus /> Add hospice
        </Button>
      }
    >
      <DataTable
        columns={columns}
        data={data}
        // Pass Server-Side Metadata
        pageCount={metadata.pageCount}
        rowCount={metadata.total}
        pagination={{
          pageIndex: search.page - 1, // TanStack is 0-indexed, URL is 1-indexed
          pageSize: search.pageSize,
        }}
        onPaginationChange={(updater) => {
          // Calculate next page (TanStack handles updater logic)
          const nextState =
            typeof updater === 'function'
              ? updater({
                pageIndex: search.page - 1,
                pageSize: search.pageSize,
              })
              : updater

          // Update URL to trigger reload
          navigate({
            search: (old: HospiceSearch) => ({
              ...old,
              page: (nextState?.pageIndex ?? 0) + 1, // Convert back to 1-indexed
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
            search: (old: HospiceSearch) => ({
              ...old,
              sorting: nextState,
              page: 1, // Reset to first page on sort change
            }),
          })
        }}
      />
      {showAdd && (
        <AddHospiceDialog
          onOpenChange={(open: boolean) => setShowAdd(open)}
          open
          onSuccess={() => router.invalidate()}
        />
      )}
      {editingHospice && (
        <EditHospiceDialog
          hospice={editingHospice}
          open={!!editingHospice}
          onOpenChange={(open: boolean) => !open && setEditingHospice(null)}
          onSuccess={() => router.invalidate()}
        />
      )}
      {deletingHospice && (
        <DeleteHospiceDialog
          hospice={deletingHospice}
          open={!!deletingHospice}
          onOpenChange={(open: boolean) => !open && setDeletingHospice(null)}
          onSuccess={() => router.invalidate()}
        />
      )}
    </TablePageLayout>
  )
}
