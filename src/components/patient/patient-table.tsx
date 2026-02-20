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
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EntityStatus } from '@/types/status'
import { deletePatientFn } from '@/server/patient/patient.functions'
import { useRouter } from '@tanstack/react-router'

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
                router.invalidate()
            } catch (error) {
                console.error('Failed to delete patient:', error)
            }
        }
    }

    if (patients.length === 0) {
        return (
            <div className="text-center py-20 text-muted-foreground bg-white rounded-xl border border-slate-100 shadow-sm">
                <p>No patients registered yet.</p>
            </div>
        )
    }

    return (
        <div className="bg-white rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
            <Table>
                <TableHeader className="bg-slate-50/50">
                    <TableRow className="hover:bg-transparent border-slate-100">
                        <TableHead className="w-[300px] font-bold text-slate-700">Patient Name</TableHead>
                        <TableHead className="font-bold text-slate-700">Age</TableHead>
                        <TableHead className="w-[250px] font-bold text-slate-700">Diagnosis</TableHead>
                        <TableHead className="font-bold text-slate-700">Admission Date</TableHead>
                        <TableHead className="font-bold text-slate-700">Status</TableHead>
                        <TableHead className="text-right font-bold text-slate-700 pr-6">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {patients.map((patient) => (
                        <TableRow key={patient._id} className="hover:bg-slate-50/30 transition-colors border-slate-100 group">
                            <TableCell className="font-semibold text-slate-900 py-4">
                                <div className="flex items-center gap-3">
                                    <Avatar className="w-8 h-8 rounded-lg">
                                        <AvatarFallback className="bg-slate-100 text-slate-600 text-[10px] font-bold uppercase">
                                            {patient.name.split(' ').map((n: string) => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    {patient.name}
                                </div>
                            </TableCell>
                            <TableCell className="text-slate-600">{patient.age}</TableCell>
                            <TableCell className="text-slate-600 font-medium italic truncate max-w-[200px]">{patient.diagnosis}</TableCell>
                            <TableCell className="text-slate-500">
                                {new Date(patient.createdAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric',
                                })}
                            </TableCell>
                            <TableCell>
                                <Badge
                                    variant="outline"
                                    className={cn(
                                        "rounded-full px-3 py-0.5 font-semibold text-[11px]",
                                        patient.status === EntityStatus.ACTIVE ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-slate-100 text-slate-600 border-slate-200"
                                    )}
                                >
                                    {patient.status}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-slate-100">
                                            <MoreVertical className="h-4 w-4 text-slate-500" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-slate-100">
                                        <DropdownMenuItem onClick={() => onEdit(patient)} className="rounded-lg gap-2 cursor-pointer py-2 font-medium">
                                            <Pencil className="w-4 h-4 text-slate-500" /> Edit Patient
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            onClick={() => handleDelete(patient._id)}
                                            className="text-rose-600 focus:text-rose-600 rounded-lg gap-2 cursor-pointer py-2 font-medium"
                                        >
                                            <Trash2 className="w-4 h-4" /> Remove
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
