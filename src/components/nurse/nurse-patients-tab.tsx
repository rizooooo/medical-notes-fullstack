"use client"

import { Card } from '@/components/ui/card'
import { PatientCard } from '@/components/patient/patient-card'
import { Plus } from 'lucide-react'

interface NursePatientsTabProps {
    patients: any[]
}

export function NursePatientsTab({ patients }: NursePatientsTabProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {patients.map((patient) => (
                <PatientCard key={patient._id} patient={patient} />
            ))}
            <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-400 cursor-pointer transition-all hover:scale-[1.02] flex items-center justify-center p-6 group min-h-[140px] rounded-2xl">
                <div className="flex flex-col items-center gap-2">
                    <div className="p-3 rounded-xl bg-white shadow-xl shadow-slate-200 text-slate-400 group-hover:text-indigo-600 transition-colors">
                        <Plus className="w-6 h-6" />
                    </div>
                    <span className="font-bold text-slate-400 group-hover:text-indigo-600 uppercase text-[10px] tracking-widest">Enroll New Patient</span>
                </div>
            </Card>
        </div>
    )
}
