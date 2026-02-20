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
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between px-2">
                <div className="flex flex-col gap-0.5">
                    <h2 className="text-xl font-black tracking-tight text-slate-800">Patient Registry</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Manage residents</p>
                </div>
                <div className="relative w-full max-w-sm hidden sm:block">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search residents..."
                        className="pl-10 h-10 border-slate-200 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 hover:border-slate-300 transition-all text-sm"
                    />
                </div>
            </div>

            <PatientTable
                patients={patients}
                onEdit={onEditPatient}
            />
        </div>
    )
}
