"use client"

import { Card } from '@/components/ui/card'
import { Settings2 } from 'lucide-react'

export function NurseSettingsTab() {
    return (
        <Card className="border-none shadow-xl border-slate-200/60 bg-white/50 backdrop-blur-xl rounded-3xl overflow-hidden min-h-[400px] flex items-center justify-center animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col items-center gap-4 text-slate-300">
                <Settings2 className="w-16 h-16 opacity-20" />
                <span className="font-black text-2xl uppercase tracking-tighter opacity-10">Access Denied</span>
            </div>
        </Card>
    )
}
