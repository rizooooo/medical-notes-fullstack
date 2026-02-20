import { useState, useMemo } from 'react'
import { ALL_QA_COLUMNS } from '@/server/qa/qa.schema'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { updateHospiceQAConfigFn } from '@/server/hospice/hospice.functions'
import { toast } from 'sonner'
import {
    Settings2,
    HelpCircle,
    Save
} from 'lucide-react'

interface HospiceQAConfigTabProps {
    hospice: any
}

export function HospiceQAConfigTab({ hospice }: HospiceQAConfigTabProps) {
    const [enabledColumns, setEnabledColumns] = useState<string[]>(
        hospice.qaConfig?.enabledColumns || ALL_QA_COLUMNS.map(c => c.id)
    )
    const [isSaving, setIsSaving] = useState(false)

    const groups = useMemo(() => {
        const g: Record<string, typeof ALL_QA_COLUMNS[number][]> = {}
        ALL_QA_COLUMNS.forEach(col => {
            if (!g[col.group]) g[col.group] = []
            g[col.group].push(col)
        })
        return g
    }, [])

    const toggleColumn = (id: string) => {
        setEnabledColumns(prev =>
            prev.includes(id)
                ? prev.filter(c => c !== id)
                : [...prev, id]
        )
    }

    const saveConfig = async () => {
        setIsSaving(true)
        try {
            await updateHospiceQAConfigFn({
                data: {
                    id: hospice._id,
                    enabledColumns
                }
            })
            toast.success('QA Configuration updated successfully')
        } catch (error) {
            toast.error('Failed to update QA configuration')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Settings2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">QA Requirement Matrix</h3>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.12em] mt-1">Configure which clinical documentations are required for this hospice during QA review.</p>
                        </div>
                    </div>
                    <Button
                        onClick={saveConfig}
                        disabled={isSaving}
                        className="rounded-xl bg-slate-900 hover:bg-slate-800 font-bold uppercase text-[10px] tracking-widest px-6 h-10 shadow-lg shadow-slate-200 gap-2"
                    >
                        <Save className="w-3.5 h-3.5" />
                        {isSaving ? 'Saving...' : 'Save Configuration'}
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Object.entries(groups).map(([groupName, columns]) => (
                        <div key={groupName} className="space-y-4">
                            <div className="flex items-center justify-between pb-2 border-b border-slate-50">
                                <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{groupName}</span>
                                <Badge variant="outline" className="h-5 px-2 text-[8px] font-black uppercase text-indigo-600 bg-indigo-50 border-indigo-100">
                                    {columns.filter(c => enabledColumns.includes(c.id)).length} / {columns.length} Active
                                </Badge>
                            </div>
                            <div className="space-y-2">
                                {columns.map(col => (
                                    <div
                                        key={col.id}
                                        className={cn(
                                            "flex items-center justify-between p-3 rounded-2xl transition-all border",
                                            enabledColumns.includes(col.id)
                                                ? "bg-white border-slate-100 shadow-sm"
                                                : "bg-slate-50 border-transparent opacity-60"
                                        )}
                                    >
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-tight">{col.label}</span>
                                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Required for Review</span>
                                        </div>
                                        <Switch
                                            size="sm"
                                            checked={enabledColumns.includes(col.id)}
                                            onCheckedChange={() => toggleColumn(col.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="p-6 rounded-[2rem] bg-indigo-50/50 border border-indigo-100 flex gap-4">
                <HelpCircle className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <div className="space-y-1">
                    <p className="text-[11px] font-black text-indigo-900 uppercase tracking-tight">Configuration Tips</p>
                    <p className="text-[12px] font-medium text-indigo-800/70 leading-relaxed">
                        Disabled columns will be automatically hidden from the QA Matrix for this hospice.
                        This ensures your QA team only focuses on the documentation that is relevant to this specific agency's policy.
                    </p>
                </div>
            </div>
        </div>
    )
}
