"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

import { cn } from '@/lib/utils'
import { EntityStatus } from '@/types/status'

interface PatientCardProps {
    patient: any
}

export function PatientCard({ patient }: PatientCardProps) {
    return (
        <Card className="rounded-md border shadow-none bg-white overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between p-3 space-y-0 pb-2">
                <div className="flex items-center gap-2.5">
                    <Avatar className="w-8 h-8 rounded-md border">
                        <AvatarFallback className="bg-slate-50 text-slate-600 text-[10px] font-bold uppercase rounded-md">
                            {patient.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <CardTitle className="text-xs font-bold text-slate-900 truncate leading-none mb-1">{patient.name}</CardTitle>
                        <CardDescription className="text-[10px] flex items-center gap-1 font-medium text-slate-500">
                            Admitted {new Date(patient.createdAt).toLocaleDateString()}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
                <div className="flex justify-between items-end mt-2">
                    <div className="min-w-0">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Primary DX</p>
                        <p className="text-[10px] font-bold text-slate-700 truncate max-w-[120px]">
                            {patient.diagnosis || "No Diagnosis"}
                        </p>
                    </div>
                    <Badge
                        variant="outline"
                        className={cn(
                            "font-bold text-[9px] uppercase px-1.5 h-4.5 rounded-sm",
                            patient.status === EntityStatus.STABLE && "bg-slate-50 text-slate-600 border-slate-200",
                            patient.status === EntityStatus.ACTIVE && "bg-indigo-50 text-indigo-700 border-indigo-100"
                        )}
                    >
                        {patient.status}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    )
}
