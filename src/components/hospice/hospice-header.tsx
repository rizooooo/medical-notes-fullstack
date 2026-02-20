"use client"

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Link } from '@tanstack/react-router'
import { Building2, Users, Calendar, Pencil, Plus } from 'lucide-react'

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
        <div className="flex flex-col gap-4">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground animate-in fade-in slide-in-from-top-4 duration-500">
                <Link
                    to="/hospice"
                    search={{ page: 1, pageSize: 10 }}
                    className="hover:text-foreground transition-all flex items-center gap-1 font-medium group"
                >
                    <Building2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Hospices
                </Link>
                <span className="opacity-40">/</span>
                <span className="text-foreground font-bold tracking-tight">{hospice.name}</span>
            </div>

            {/* Header Info Card */}
            <Card className="border-slate-200/60 shadow-lg border-none bg-white relative overflow-hidden group animate-in zoom-in-95 duration-500">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/50 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-indigo-100/50" />
                <CardContent className="p-6 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div className="flex items-center gap-6">
                            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-4 rounded-2xl shadow-xl shadow-indigo-100 group-hover:scale-105 transition-transform">
                                <Building2 className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 leading-none">
                                    {hospice.name}
                                </h1>
                                <div className="flex items-center gap-4 mt-1">
                                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                                        <Users className="w-3 h-3 text-indigo-500" /> {patientCount} Registered
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 font-bold bg-slate-50 px-2 py-0.5 rounded-full border border-slate-100">
                                        <Calendar className="w-3 h-3 text-violet-500" /> Est. 2023
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto self-stretch md:self-center">
                            <Button
                                variant="outline"
                                className="flex-1 md:flex-none h-11 px-6 rounded-xl border-slate-200 text-slate-700 font-bold shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95 text-sm"
                                onClick={onEdit}
                            >
                                <Pencil className="w-4 h-4 mr-2" /> Edit Hospice
                            </Button>
                            <Button
                                className="flex-1 md:flex-none h-11 px-6 rounded-xl shadow-lg shadow-indigo-100 bg-indigo-600 hover:bg-indigo-700 text-white font-bold border-none transition-all active:scale-95 text-sm"
                                onClick={onAddPatient}
                            >
                                <Plus className="w-4 h-4 mr-2" /> Add Patient
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
