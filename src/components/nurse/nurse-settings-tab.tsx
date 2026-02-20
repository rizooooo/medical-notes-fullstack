"use client"

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Trash2, Building2, Copy, Check, Eye, EyeOff, Calendar as CalendarIcon, MessageSquare } from 'lucide-react'
import { INurse, INurseCredential } from '@/server/nurse/nurse.schema'
import { updateNurseFn } from '@/server/nurse/nurse.functions'
import { getAllHospicesFn } from '@/server/hospice/hospice.functions'
import { DialogWrapper } from '@/components/layout/DialogWrapper'
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/date-picker'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { useForm } from '@tanstack/react-form'
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table'
import { toast } from 'sonner'
import { useRouter } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface NurseSettingsTabProps {
    nurse: INurse
}

export function NurseSettingsTab({ nurse }: NurseSettingsTabProps) {
    const router = useRouter()
    const [showAddCredential, setShowAddCredential] = useState(false)
    const [hospices, setHospices] = useState<any[]>([])
    const [copiedField, setCopiedField] = useState<string | null>(null)
    const [visiblePasswords, setVisiblePasswords] = useState<Set<number>>(new Set())

    useEffect(() => {
        const fetchHospices = async () => {
            const data = await getAllHospicesFn()
            setHospices(data)
        }
        fetchHospices()
    }, [])

    const copyToClipboard = (text: string, fieldId: string) => {
        navigator.clipboard.writeText(text)
        setCopiedField(fieldId)
        toast.success('Copied to clipboard')
        setTimeout(() => setCopiedField(null), 2000)
    }

    const togglePasswordVisibility = (index: number) => {
        const next = new Set(visiblePasswords)
        if (next.has(index)) {
            next.delete(index)
        } else {
            next.add(index)
        }
        setVisiblePasswords(next)
    }

    const handleRemoveCredential = useCallback(async (hospiceId: string) => {
        if (!confirm('Are you sure you want to remove this credential?')) return
        try {
            const updatedCredentials = (nurse.credentials || []).filter(c => c.hospiceId !== hospiceId)
            await updateNurseFn({ data: { id: nurse._id, credentials: updatedCredentials } })
            toast.success('Credential removed')
            router.invalidate()
        } catch (error: any) {
            toast.error(error.message)
        }
    }, [nurse._id, nurse.credentials, router])

    const data = useMemo(() => nurse.credentials || [], [nurse.credentials])

    const columns = useMemo<ColumnDef<INurseCredential>[]>(() => [
        {
            accessorKey: 'hospiceName',
            header: 'Facility',
            cell: ({ row }) => (
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center group-hover:bg-indigo-100 group-hover:text-indigo-600 transition-colors">
                        <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="font-bold text-slate-900 uppercase tracking-tight text-[11px] block">{row.original.hospiceName}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{row.original.frequency || 'Manual'}</span>
                    </div>
                </div>
            )
        },
        {
            accessorKey: 'email',
            header: 'Access',
            cell: ({ row }) => {
                const idx = row.index
                const cred = row.original
                return (
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 max-w-[200px]">
                            <span className="text-[10px] font-bold text-slate-600 truncate">{cred.email}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => copyToClipboard(cred.email, `email-${idx}`)}
                                className="h-5 w-5 text-slate-300 hover:text-indigo-600 hover:bg-white"
                            >
                                {copiedField === `email-${idx}` ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={cn(
                                "text-[10px] font-bold font-mono tracking-widest transition-all",
                                visiblePasswords.has(idx) ? "text-slate-700" : "text-slate-300"
                            )}>
                                {visiblePasswords.has(idx) ? cred.password : '••••••••'}
                            </span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => togglePasswordVisibility(idx)}
                                className="h-5 w-5 text-slate-300 hover:text-indigo-600 hover:bg-white"
                            >
                                {visiblePasswords.has(idx) ? <EyeOff className="w-2.5 h-2.5" /> : <Eye className="w-2.5 h-2.5" />}
                            </Button>
                            {cred.password && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => copyToClipboard(cred.password!, `pass-${idx}`)}
                                    className="h-5 w-5 text-slate-300 hover:text-indigo-600 hover:bg-white"
                                >
                                    {copiedField === `pass-${idx}` ? <Check className="w-2.5 h-2.5 text-emerald-500" /> : <Copy className="w-2.5 h-2.5" />}
                                </Button>
                            )}
                        </div>
                    </div>
                )
            }
        },
        {
            accessorKey: 'nextPlottingDate',
            header: 'Plotting Info',
            cell: ({ row }) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                        <CalendarIcon className="w-3 h-3 text-slate-300" />
                        Next: {row.original.nextPlottingDate ? format(new Date(row.original.nextPlottingDate), 'MMM dd, yyyy') : 'N/A'}
                    </div>
                    {row.original.remarks && (
                        <div className="flex items-center gap-1.5 text-[9px] font-medium text-slate-400 italic">
                            <MessageSquare className="w-2.5 h-2.5 opacity-50" />
                            {row.original.remarks}
                        </div>
                    )}
                </div>
            )
        },
        {
            id: 'notes',
            header: 'Notes',
            cell: ({ row }) => (
                <div className="flex gap-4">
                    <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Incomplete</p>
                        <p className="text-xs font-bold text-rose-500">{row.original.incompleteNotes || 0}</p>
                    </div>
                    <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Needs Correction</p>
                        <p className="text-xs font-bold text-amber-500">{row.original.needsCorrection || 0}</p>
                    </div>
                </div>
            )
        },
        {
            id: 'actions',
            header: () => <div className="text-right">Actions</div>,
            cell: ({ row }) => (
                <div className="text-right">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveCredential(row.original.hospiceId)}
                        className="h-8 w-8 rounded-xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover:opacity-100"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                </div>
            )
        }
    ], [visiblePasswords, copiedField, handleRemoveCredential])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    })

    const form = useForm({
        defaultValues: {
            hospiceId: '',
            email: '',
            password: '',
            frequency: 'Every 14 days',
            nextPlottingDate: new Date(),
            remarks: '',
            incompleteNotes: 0,
            needsCorrection: 0,
            previousMonthPending: 0
        },
        onSubmit: async ({ value }) => {
            try {
                const selectedHospice = hospices.find(h => h._id === value.hospiceId)
                if (!selectedHospice) throw new Error('Invalid hospice')

                const newCredential: INurseCredential = {
                    ...value,
                    hospiceName: selectedHospice.name,
                }

                const existingCredentials = nurse.credentials || []
                const alreadyExists = existingCredentials.findIndex(c => c.hospiceId === value.hospiceId)

                let updatedCredentials;
                if (alreadyExists !== -1) {
                    updatedCredentials = [...existingCredentials]
                    updatedCredentials[alreadyExists] = newCredential
                } else {
                    updatedCredentials = [...existingCredentials, newCredential]
                }

                await updateNurseFn({ data: { id: nurse._id, credentials: updatedCredentials } })

                toast.success('Hospice account linked')
                setShowAddCredential(false)
                router.invalidate()
                form.reset()
            } catch (error: any) {
                toast.error(error.message)
            }
        }
    })

    return (
        <div className="space-y-0.5">
            <div className="flex items-center justify-between px-2 py-6">
                <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Hospice Access</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none mt-1">Credentials & Plotting Tracker</p>
                </div>
                <Button
                    size="sm"
                    onClick={() => setShowAddCredential(true)}
                    className="h-9 px-5 rounded-xl font-bold text-[11px] uppercase tracking-widest gap-2 bg-indigo-600 hover:bg-indigo-700 text-white border-none transition-all shadow-lg shadow-indigo-100"
                >
                    <Plus className="w-4 h-4" /> Link Account
                </Button>
            </div>

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
                        {table.getRowModel().rows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-[300px] text-center">
                                    <div className="flex flex-col items-center gap-3 opacity-20">
                                        <Building2 className="w-12 h-12 text-slate-300" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">No facilities linked</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="group border-slate-50 hover:bg-indigo-50/20 transition-all">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="py-5 px-6">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <DialogWrapper
                open={showAddCredential}
                onOpenChange={setShowAddCredential}
                title="Link Facility Access"
                description="Manage credentials and charting status for this facility."
                footer={
                    <div className="flex gap-3 w-full">
                        <Button
                            variant="outline"
                            className="flex-1 rounded-xl h-10 font-bold text-[11px] uppercase tracking-widest shadow-none"
                            onClick={() => setShowAddCredential(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            className="flex-1 rounded-xl h-10 font-bold text-[11px] uppercase tracking-widest bg-indigo-600 text-white shadow-none"
                            onClick={() => form.handleSubmit()}
                        >
                            Establish Link
                        </Button>
                    </div>
                }
            >
                <div className="grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-2">
                    <form.Field name="hospiceId">
                        {(field) => (
                            <FormItem className="col-span-2">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Facility</FormLabel>
                                <Select value={field.state.value} onValueChange={field.handleChange}>
                                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50 shadow-none font-bold text-xs ring-offset-white focus:ring-2 focus:ring-indigo-500 transition-all">
                                        <SelectValue placeholder="Select hospice" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl border-slate-200 shadow-2xl">
                                        {hospices.map(h => (
                                            <SelectItem key={h._id} value={h._id} className="text-xs font-bold py-2.5 rounded-lg">{h.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    </form.Field>

                    <form.Field name="email">
                        {(field) => (
                            <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Username / Email</FormLabel>
                                <Input
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="nurse@hospice.com"
                                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 shadow-none font-bold text-xs ring-offset-white focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    </form.Field>

                    <form.Field name="password">
                        {(field) => (
                            <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Password</FormLabel>
                                <Input
                                    type="password"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 shadow-none font-bold text-xs ring-offset-white focus:ring-2 focus:ring-indigo-500 transition-all"
                                />
                                <FormMessage />
                            </FormItem>
                        )}
                    </form.Field>

                    <form.Field name="frequency">
                        {(field) => (
                            <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">FOV (Frequency)</FormLabel>
                                <Select value={field.state.value} onValueChange={field.handleChange}>
                                    <SelectTrigger className="h-11 rounded-xl border-slate-200 bg-slate-50/50 shadow-none font-bold text-xs ring-offset-white focus:ring-2 focus:ring-indigo-500 transition-all">
                                        <SelectValue placeholder="Select frequency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Every 14 days" className="text-xs">Every 14 days</SelectItem>
                                        <SelectItem value="1 per week" className="text-xs">1 per week</SelectItem>
                                        <SelectItem value="Every Day" className="text-xs">Every Day</SelectItem>
                                        <SelectItem value="Check Invoice" className="text-xs">Check Invoice</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormItem>
                        )}
                    </form.Field>

                    <form.Field name="nextPlottingDate">
                        {(field) => (
                            <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Next Plotting Date</FormLabel>
                                <DatePicker
                                    date={field.state.value}
                                    onChange={(date) => field.handleChange(date || new Date())}
                                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 shadow-none"
                                />
                            </FormItem>
                        )}
                    </form.Field>

                    <form.Field name="incompleteNotes">
                        {(field) => (
                            <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Incomplete Notes</FormLabel>
                                <Input
                                    type="number"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(Number(e.target.value))}
                                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 shadow-none font-bold text-xs"
                                />
                            </FormItem>
                        )}
                    </form.Field>

                    <form.Field name="needsCorrection">
                        {(field) => (
                            <FormItem>
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Needs Correction</FormLabel>
                                <Input
                                    type="number"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(Number(e.target.value))}
                                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 shadow-none font-bold text-xs"
                                />
                            </FormItem>
                        )}
                    </form.Field>

                    <form.Field name="remarks">
                        {(field) => (
                            <FormItem className="col-span-2">
                                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-slate-400">Remarks</FormLabel>
                                <Input
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="e.g. On-going survey"
                                    className="h-11 rounded-xl border-slate-200 bg-slate-50/50 shadow-none font-bold text-xs"
                                />
                            </FormItem>
                        )}
                    </form.Field>
                </div>
            </DialogWrapper>
        </div>
    )
}
