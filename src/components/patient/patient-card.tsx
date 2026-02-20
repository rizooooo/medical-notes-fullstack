"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utils'
import { EntityStatus } from '@/types/status'

interface PatientCardProps {
    patient: any
}

export function PatientCard({ patient }: PatientCardProps) {
    return (
        <Card className="hover:shadow-md transition-all duration-300 border-slate-200/60 overflow-hidden group">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 group-hover:scale-110 transition-transform">
                        <AvatarFallback className="bg-indigo-50 text-indigo-700 font-medium font-sans">
                            {patient.name.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-lg font-bold text-slate-800">{patient.name}</CardTitle>
                        <CardDescription className="text-xs flex items-center gap-1 font-medium">
                            <Calendar className="w-3 h-3" /> Admitted {new Date(patient.createdAt).toLocaleDateString()}
                        </CardDescription>
                    </div>
                </div>
                <Badge
                    variant="outline"
                    className={cn(
                        "font-semibold text-[10px] rounded-full px-2.5",
                        patient.status === EntityStatus.STABLE && "bg-emerald-50 text-emerald-700 border-emerald-100",
                        patient.status === EntityStatus.IN_REVIEW && "bg-amber-50 text-amber-700 border-amber-100",
                        patient.status === EntityStatus.CRITICAL && "bg-rose-50 text-rose-700 border-rose-100",
                        patient.status === EntityStatus.ACTIVE && "bg-blue-50 text-blue-700 border-blue-100"
                    )}
                >
                    {patient.status}
                </Badge>
            </CardHeader>
            <CardContent>
                <div className="flex justify-between items-center mt-4">
                    <span className="text-sm font-semibold text-slate-500 truncate max-w-[180px]">
                        {patient.diagnosis}
                    </span>
                    <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 font-bold h-8 rounded-lg">
                        View
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}
