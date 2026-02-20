"use client"

import { Card } from '@/components/ui/card'
import { PatientCard } from '@/components/patient/patient-card'
import { Plus } from 'lucide-react'

interface NursePatientsTabProps {
    patients: any[]
}

export function NursePatientsTab({ patients }: NursePatientsTabProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {patients.map((patient) => (
                <PatientCard key={patient._id} patient={patient} />
            ))}
            <Card className="border border-dashed border-slate-200 bg-slate-50/30 hover:bg-white hover:border-slate-300 cursor-pointer transition-all flex flex-col items-center justify-center p-6 gap-2 min-h-[120px] rounded-md shadow-none">
                <Plus className="w-5 h-5 text-slate-400" />
                <span className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Enroll Patient</span>
            </Card>
        </div>
    )
}
