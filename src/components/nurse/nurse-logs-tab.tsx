"use client"

import { Card } from '@/components/ui/card'
import { Link2 } from 'lucide-react'

export function NurseLogsTab() {
    return (
        <Card className="border-none shadow-xl border-slate-200/60 bg-white/50 backdrop-blur-xl rounded-3xl overflow-hidden min-h-[400px] flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col items-center gap-4 text-slate-300">
                <Link2 className="w-16 h-16 opacity-20" />
                <span className="font-black text-2xl uppercase tracking-tighter opacity-10">System Logs Pending</span>
            </div>
        </Card>
    )
}
