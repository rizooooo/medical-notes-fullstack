'use client'

import { Copy, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import type { IHospice } from '@/server/hospice/hospice.schema'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import { formatDateTime } from '@/utils/date'

interface ColumnProps {
  onEdit: (hospice: IHospice) => void
  onDelete: (hospice: IHospice) => void
}

export const getColumns = ({
  onEdit,
  onDelete,
}: ColumnProps): Array<ColumnDef<IHospice>> => [
    {
      accessorKey: 'name',
      header: 'Name',
      // UI Tip: Make the name bold or a link to details
      cell: ({ row }) => (
        <Link
          to="/hospice/$hospiceId"
          params={{ hospiceId: row.original._id.toString() }}
          search={{ tab: 'registry' }}
          className="font-medium hover:text-primary transition-colors hover:underline"
        >
          {row.original.name}
        </Link>
      ),
    },
    {
      header: 'Created',
      accessorFn: (data) => formatDateTime(data.createdAt),
      // UI Tip: Use a lighter text color for metadata
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">{getValue() as string}</span>
      ),
    },
    {
      header: 'Updated',
      accessorFn: (data) => formatDateTime(data.updatedAt),
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">{getValue() as string}</span>
      ),
    },

    // --- THE ACTIONS COLUMN ---
    {
      id: 'actions',
      enableHiding: false, // Prevent users from accidentally hiding this column
      cell: ({ row }) => {
        const hospice = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>

              {/* Action 1: Copy ID (Standard handy feature) */}
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(String(hospice._id))}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy ID
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {/* Action 2: Edit */}
              <DropdownMenuItem onClick={() => onEdit(hospice)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit details
              </DropdownMenuItem>

              {/* Action 3: Delete (Red/Destructive) */}
              <DropdownMenuItem
                onClick={() => onDelete(hospice)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete record
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
