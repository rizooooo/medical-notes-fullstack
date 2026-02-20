'use client'

import { Copy, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { ColumnDef } from '@tanstack/react-table'
import type { INurse } from '@/server/nurse/nurse.schema'
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
    onEdit: (nurse: INurse) => void
    onDelete: (nurse: INurse) => void
}

export const getColumns = ({
    onEdit,
    onDelete,
}: ColumnProps): Array<ColumnDef<INurse>> => [
        {
            accessorKey: 'name',
            header: 'Name',
            cell: ({ row }) => (
                <Link
                    to="/nurse/$nurseId"
                    params={{ nurseId: row.original._id.toString() }}
                    search={{ tab: 'patients' }}
                    className="font-medium hover:text-primary transition-colors hover:underline"
                >
                    {row.original.name}
                </Link>
            ),
        },
        {
            header: 'Created',
            accessorFn: (data) => formatDateTime(data.createdAt),
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
        {
            id: 'actions',
            enableHiding: false,
            cell: ({ row }) => {
                const nurse = row.original

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
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(String(nurse._id))}
                            >
                                <Copy className="mr-2 h-4 w-4" />
                                Copy ID
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => onEdit(nurse)}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={() => onDelete(nurse)}
                                className="text-red-600 focus:text-red-600"
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
