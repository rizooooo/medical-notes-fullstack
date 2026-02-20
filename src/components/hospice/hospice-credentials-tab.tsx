"use client"

import { useState, useMemo } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { User, Copy, Check, Eye, EyeOff, ShieldCheck } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { INurse } from '@/server/nurse/nurse.schema'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'

interface HospiceCredentialsTabProps {
    nurses: INurse[]
    hospiceId: string
}

export function HospiceCredentialsTab({ nurses, hospiceId }: HospiceCredentialsTabProps) {
    const [copiedField, setCopiedField] = useState<string | null>(null)
    const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set())

    const copyToClipboard = (text: string, fieldId: string) => {
        navigator.clipboard.writeText(text)
        setCopiedField(fieldId)
        toast.success('Copied to clipboard')
        setTimeout(() => setCopiedField(null), 2000)
    }

    const togglePasswordVisibility = (nurseId: string) => {
        const next = new Set(visiblePasswords)
        if (next.has(nurseId)) {
            next.delete(nurseId)
        } else {
            next.add(nurseId)
        }
        setVisiblePasswords(next)
    }

    const columns = useMemo<ColumnDef<INurse>[]>(() => [
        {
            accessorKey: 'name',
            header: 'Staff Member',
            cell: ({ row }) => (
                <Link
                    to="/nurse/$nurseId"
                    params={{ nurseId: row.original._id }}
                    search={{ tab: 'patients' }}
                    className="flex items-center gap-3"
                >
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        <User className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-slate-900 uppercase tracking-tight text-[11px] border-b border-transparent group-hover:border-indigo-200 transition-all">{row.original.name}</span>
                </Link>
            )
        },
        {
            id: 'email',
            header: 'System Email',
            cell: ({ row }) => {
                const cred = row.original.credentials?.find(c => c.hospiceId === hospiceId)
                const email = cred?.email || 'N/A'
                return (
                    <div className="flex items-center gap-2 max-w-[200px]">
                        <span className="text-xs font-bold text-slate-600 truncate">{email}</span>
                        {cred?.email && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyToClipboard(email, `email-${row.original._id}`)}
                                className="h-7 w-7 text-slate-300 hover:text-indigo-600 hover:bg-white border-transparent"
                            >
                                {copiedField === `email-${row.original._id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                            </Button>
                        )}
                    </div>
                )
            }
        },
        {
            id: 'password',
            header: 'Access Password',
            cell: ({ row }) => {
                const cred = row.original.credentials?.find(c => c.hospiceId === hospiceId)
                const isPasswordVisible = visiblePasswords.has(row.original._id)
                const password = cred?.password
                return (
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "text-xs font-bold font-mono tracking-widest transition-all",
                            isPasswordVisible ? "text-slate-700" : "text-slate-300"
                        )}>
                            {isPasswordVisible ? password : (password ? '••••••••' : 'N/A')}
                        </span>
                        {password && (
                            <div className="flex items-center gap-0.5 ml-1">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => togglePasswordVisibility(row.original._id)}
                                    className="h-7 w-7 text-slate-300 hover:text-indigo-600 hover:bg-white border-transparent"
                                >
                                    {isPasswordVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => copyToClipboard(password!, `pass-${row.original._id}`)}
                                    className="h-7 w-7 text-slate-300 hover:text-indigo-600 hover:bg-white border-transparent"
                                >
                                    {copiedField === `pass-${row.original._id}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                </Button>
                            </div>
                        )}
                    </div>
                )
            }
        },
        {
            id: 'status',
            header: () => <div className="text-right">Status</div>,
            cell: () => (
                <div className="text-right">
                    <Badge variant="outline" className="rounded-md border-emerald-100 bg-emerald-50 text-emerald-600 text-[9px] font-black tracking-widest h-5 px-2">
                        ACTIVE
                    </Badge>
                </div>
            )
        }
    ], [hospiceId, copiedField, visiblePasswords])

    const table = useReactTable({
        data: nurses,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    if (nurses.length === 0) {
        return (
            <div className="h-[400px] flex items-center justify-center border border-dashed border-slate-200 rounded-3xl bg-slate-50/30 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col items-center gap-3 opacity-20">
                    <ShieldCheck className="w-12 h-12 text-slate-300" />
                    <p className="font-black text-slate-400 uppercase tracking-[0.2em] text-[10px]">No linked staff credentials</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="border border-slate-100 bg-white shadow-sm overflow-hidden rounded-2xl">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent border-slate-100/60 bg-slate-50/50">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="h-10 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] px-6">
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id} className="group border-slate-50 hover:bg-indigo-50/20 transition-all">
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id} className="py-5 px-6">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
