"use client"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EntityStatus } from '@/types/status'
import { deletePatientFn } from '@/server/patient/patient.functions'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'

interface PatientTableProps {
    patients: any[]
    onEdit: (patient: any) => void
}

export function PatientTable({ patients, onEdit }: PatientTableProps) {
    const router = useRouter()

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to remove this patient?')) {
            try {
                await deletePatientFn({ data: id })
                toast.success('Patient record removed')
                router.invalidate()
            } catch (error) {
                toast.error('Failed to remove record')
            }
        }
    }

    if (patients.length === 0) {
        return (
            <div className="text-center py-12 text-slate-400 bg-white rounded-md border shadow-none">
                <p className="text-[11px] font-bold uppercase tracking-widest leading-none">No patient records found</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-md border shadow-none overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 h-9 px-4">Registry Identification</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 h-9 px-4">Clinical Data (Age/DX)</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 h-9 px-4">Admission</TableHead>
                        <TableHead className="text-[10px] font-bold uppercase tracking-wider text-slate-500 h-9 px-4">Status</TableHead>
                        <TableHead className="text-right text-[10px] font-bold uppercase tracking-wider text-slate-500 h-9 px-4"></TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {patients.map((patient) => (
                        <TableRow key={patient._id} className="hover:bg-slate-50/30 transition-colors border-slate-100 group">
                            <TableCell className="py-2.5 px-4">
                                <div className="flex items-center gap-2.5">
                                    <Avatar className="w-7 h-7 rounded-sm border">
                                        <AvatarFallback className="bg-slate-50 text-slate-500 text-[9px] font-bold uppercase rounded-sm">
                                            {patient.name.split(' ').map((n: string) => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="text-xs font-bold text-slate-900">{patient.name}</span>
                                </div>
                            </TableCell>
                            <TableCell className="py-2.5 px-4">
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-xs font-bold text-slate-700">{patient.age}Y</span>
                                    <span className="text-[10px] font-medium text-slate-500 italic truncate max-w-[180px]">{patient.diagnosis}</span>
                                </div>
                            </TableCell>
                            <TableCell className="py-2.5 px-4 text-[11px] font-medium text-slate-500">
                                {new Date(patient.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </TableCell>
                            <TableCell className="py-2.5 px-4">
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "rounded-sm px-1.5 h-4.5 font-bold text-[9px] uppercase",
                                        patient.status === EntityStatus.ACTIVE ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-slate-50 text-slate-600 border-slate-200"
                                    )}
                                >
                                    {patient.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="py-2.5 px-4 text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-6 w-6 p-0 rounded-md hover:bg-slate-100 transition-colors">
                                            <MoreHorizontal className="h-3.5 w-3.5 text-slate-400 group-hover:text-slate-900" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-36 rounded-md shadow-lg border-slate-200 p-1">
                                        <DropdownMenuItem onClick={() => onEdit(patient)} className="text-[10px] font-bold uppercase tracking-wider gap-2 cursor-pointer rounded-sm">
                                            <Pencil className="w-3 h-3 text-slate-400" /> Modify File
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleDelete(patient._id)}
                                            className="text-rose-600 focus:text-rose-600 text-[10px] font-bold uppercase tracking-wider gap-2 cursor-pointer rounded-sm"
                                        >
                                            <Trash2 className="w-3 h-3 text-rose-400" /> Remove record
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
