"use client"

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Link } from '@tanstack/react-router'
import { Building2, Users, Pencil, Plus, ArrowLeft } from 'lucide-react'

interface HospiceHeaderProps {
    hospice: any
    patientCount: number
    onEdit: () => void
    onAddPatient: () => void
}

export function HospiceHeader({
    hospice,
    patientCount,
    onEdit,
    onAddPatient,
}: HospiceHeaderProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" asChild className="h-8 w-8 rounded-md">
                    <Link to="/hospice" search={{ page: 1, pageSize: 10 }}>
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold tracking-tight">{hospice.name}</h1>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 border text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        <Users className="w-3 h-3" /> {patientCount} Patients
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 rounded-md font-medium" onClick={onEdit}>
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button size="sm" className="h-8 rounded-md font-medium" onClick={onAddPatient}>
                        <Plus className="mr-2 h-3.5 w-3.5" /> Add Patient
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <Card className="p-3 rounded-md border shadow-none bg-white">
                    <div className="flex items-center gap-2.5">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Type</p>
                            <p className="text-xs font-bold truncate leading-tight">Hospice Facility</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-3 rounded-md border shadow-none bg-white">
                    <div className="flex items-center gap-2.5">
                        <Users className="w-4 h-4 text-slate-400" />
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Active Residents</p>
                            <p className="text-xs font-bold truncate leading-tight">{patientCount} Registered</p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}
