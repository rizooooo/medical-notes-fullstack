"use client"

import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { PatientTable } from '@/components/patient/patient-table'

interface HospiceRegistryTabProps {
    patients: any[]
    onEditPatient: (patient: any) => void
}

export function HospiceRegistryTab({
    patients,
    onEditPatient,
}: HospiceRegistryTabProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
                <div>
                    <h2 className="text-sm font-bold text-slate-900">Patient Registry</h2>
                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Manage records</p>
                </div>
                <div className="relative w-full max-w-[240px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <Input
                        placeholder="Search records..."
                        className="pl-8 h-8 rounded-md border text-xs shadow-none"
                    />
                </div>
            </div>

            <div className="rounded-md border bg-white overflow-hidden shadow-none">
                <PatientTable
                    patients={patients}
                    onEdit={onEditPatient}
                />
            </div>
        </div>
    )
}
