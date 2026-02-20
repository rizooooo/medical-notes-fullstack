import { useState, useEffect } from 'react'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { getAllHospicesFn } from '@/server/hospice/hospice.functions'
import { getHospicePatients } from '@/server/patient/patient.functions'
import { initializeQAMonthFn } from '@/server/qa/qa.functions'
import { toast } from 'sonner'
import { Loader2, Calendar as CalendarIcon } from 'lucide-react'

interface QAInitializeDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess: () => void
}

export function QAInitializeDialog({ open, onOpenChange, onSuccess }: QAInitializeDialogProps) {
    const [hospices, setHospices] = useState<any[]>([])
    const [selectedHospiceId, setSelectedHospiceId] = useState<string>('')
    const [month, setMonth] = useState<string>(new Date().getMonth().toString())
    const [year, setYear] = useState<string>(new Date().getFullYear().toString())
    const [loading, setLoading] = useState(false)
    const [initializing, setInitializing] = useState(false)

    useEffect(() => {
        if (open) { loadHospices() }
    }, [open])

    const loadHospices = async () => {
        setLoading(true)
        try {
            const data = await getAllHospicesFn()
            setHospices(data)
        } catch (error) {
            toast.error('Failed to load agencies')
        } finally {
            setLoading(false)
        }
    }

    const handleInitialize = async () => {
        if (!selectedHospiceId) {
            toast.error('Please select an agency')
            return
        }

        setInitializing(true)
        try {
            const selectedHospice = hospices.find(h => h._id === selectedHospiceId)
            const patients = await getHospicePatients({ data: selectedHospiceId })

            if (patients.length === 0) {
                toast.error('No active patients found')
                setInitializing(false)
                return
            }

            await initializeQAMonthFn({
                data: {
                    hospiceId: selectedHospiceId,
                    hospiceName: selectedHospice.name,
                    month: parseInt(month) + 1,
                    year: parseInt(year),
                    patients: patients.map((p: any) => ({ id: p._id, name: p.name, mrn: p.mrn }))
                }
            })

            toast.success('QA Month initialized')
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            toast.error('Failed to initialize')
        } finally {
            setInitializing(false)
        }
    }

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    const years = Array.from({ length: 5 }, (_, i) => (new Date().getFullYear() - 1 + i).toString())

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-none border-slate-200 shadow-none max-w-md p-6 bg-white">
                <DialogHeader className=" space-y-1">
                    <div className="flex items-center gap-2 text-slate-900">
                        <CalendarIcon className="w-5 h-5" />
                        <DialogTitle className="text-lg font-bold uppercase tracking-tight">Initialize QA Month</DialogTitle>
                    </div>
                    <p className="text-xs text-slate-500 font-medium">Setup a new clinical review period for an agency</p>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Agency</Label>
                        <Select value={selectedHospiceId} onValueChange={setSelectedHospiceId}>
                            <SelectTrigger className="h-9 rounded-none border-slate-200 bg-white shadow-none focus:ring-0">
                                <SelectValue placeholder={loading ? "Loading..." : "Select Agency"} />
                            </SelectTrigger>
                            <SelectContent className="rounded-none border-slate-200 shadow-none">
                                {hospices.map(h => (
                                    <SelectItem key={h._id} value={h._id} className="rounded-none text-xs">
                                        {h.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Month</Label>
                            <Select value={month} onValueChange={setMonth}>
                                <SelectTrigger className="h-9 rounded-none border-slate-200 bg-white shadow-none focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-slate-200 shadow-none">
                                    {months.map((m, i) => (
                                        <SelectItem key={i} value={i.toString()} className="rounded-none text-xs">{m}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Year</Label>
                            <Select value={year} onValueChange={setYear}>
                                <SelectTrigger className="h-9 rounded-none border-slate-200 bg-white shadow-none focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-none border-slate-200 shadow-none">
                                    {years.map(y => (
                                        <SelectItem key={y} value={y} className="rounded-none text-xs">{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-100 italic">
                        <p className="text-[10px] text-slate-600 leading-tight">
                            Note: This will create a fresh tracking matrix for all active patients.
                        </p>
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:justify-start">
                    <Button
                        disabled={initializing || !selectedHospiceId}
                        onClick={handleInitialize}
                        className="rounded-none bg-slate-900 hover:bg-slate-800 text-white font-bold uppercase text-[10px] tracking-widest h-9 px-6 flex-1"
                    >
                        {initializing && <Loader2 className="w-3 h-3 animate-spin mr-2" />}
                        {initializing ? 'Initializing...' : 'Initialize Period'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="rounded-none font-bold uppercase text-[10px] tracking-widest text-slate-500 border-slate-200 h-9 px-6"
                    >
                        Cancel
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
