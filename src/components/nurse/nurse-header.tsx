"use client"

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { Pencil, Plus, ArrowLeft } from 'lucide-react'

interface NurseHeaderProps {
    nurse: any
    onEdit: () => void
}

export function NurseHeader({ nurse, onEdit }: NurseHeaderProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" asChild className="h-8 w-8 rounded-md">
                    <Link to="/nurse" search={{ page: 1, pageSize: 10 }}>
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <div className="flex items-center gap-3">
                    <Avatar className="w-8 h-8 rounded-md border">
                        <AvatarFallback className="bg-slate-100 text-slate-900 text-[10px] font-bold uppercase rounded-md">
                            {nurse.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold tracking-tight">{nurse.name}</h1>
                        <Badge variant="outline" className="rounded-md uppercase text-[9px] font-semibold bg-slate-50">
                            Registered Nurse
                        </Badge>
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-8 rounded-md font-medium" onClick={onEdit}>
                        <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
                    </Button>
                    <Button size="sm" className="h-8 rounded-md font-medium">
                        <Plus className="mr-2 h-3.5 w-3.5" /> Assign Patient
                    </Button>
                </div>
            </div>
        </div>
    )
}
