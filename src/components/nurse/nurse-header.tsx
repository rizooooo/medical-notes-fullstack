"use client"

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { Users, Pencil, Plus } from 'lucide-react'

interface NurseHeaderProps {
    nurse: any
    onEdit: () => void
}

export function NurseHeader({ nurse, onEdit }: NurseHeaderProps) {
    return (
        <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                <Link to="/nurse" search={{ page: 1, pageSize: 10 }} className="hover:text-foreground transition-colors flex items-center gap-1 group">
                    <Users className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" /> Nurses
                </Link>
                <span className="opacity-40">/</span>
                <span className="text-foreground font-bold">{nurse.name}</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                    <Avatar className="w-20 h-20 border-[3px] border-indigo-50 shadow-lg ring-1 ring-white transition-transform hover:scale-105">
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-2xl font-black uppercase shadow-inner">
                            {nurse.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-0.5">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 leading-tight">
                            {nurse.name}
                        </h1>
                        <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="bg-indigo-50 text-indigo-700 border-indigo-100 font-bold px-2.5 py-0.5 rounded-full uppercase text-[9px] tracking-widest">
                                Registered Nurse
                            </Badge>
                            <div className="flex items-center gap-1 text-emerald-600 font-bold text-[10px] uppercase tracking-wider">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Active
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        size="lg"
                        onClick={onEdit}
                        className="rounded-xl h-10 px-5 shadow-sm hover:bg-slate-50 border-slate-200 font-bold transition-all active:scale-95 text-sm"
                    >
                        <Pencil className="w-3.5 h-3.5 mr-2" /> Edit Profile
                    </Button>
                    <Button
                        size="lg"
                        className="rounded-xl h-10 px-5 shadow-lg shadow-indigo-100 bg-indigo-600 hover:bg-indigo-700 text-white font-bold border-none transition-all active:scale-95 text-sm"
                    >
                        <Plus className="w-3.5 h-3.5 mr-2" /> Assign Patient
                    </Button>
                </div>
            </div>
        </div>
    )
}
