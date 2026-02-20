import { useEffect, useState, useCallback } from 'react'
import { DialogWrapper } from '@/components/layout/DialogWrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Users, Loader2, CheckCircle2 } from 'lucide-react'
import { getHospicePatients } from '@/server/patient/patient.functions'
import { addInvoicePatientFn, getActivePatientIdsFn } from '@/server/invoice/invoice.functions'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface AddPatientDialogProps {
    invoiceId: string
    hospiceId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddPatientDialog({
    invoiceId,
    hospiceId,
    open,
    onOpenChange,
}: AddPatientDialogProps) {
    const [patients, setPatients] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [search, setSearch] = useState('')
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const loadPatients = useCallback(async () => {
        setIsLoading(true)
        try {
            const [data, activeIds] = await Promise.all([
                getHospicePatients({ data: hospiceId }),
                getActivePatientIdsFn()
            ])
            // Filter out patients that are already in ANY active invoice (including current one)
            setPatients(data.filter((p: any) => !activeIds.includes(p._id)))
        } catch (error) {
            toast.error('Failed to load facility patients')
        } finally {
            setIsLoading(false)
        }
    }, [hospiceId])

    useEffect(() => {
        if (open) {
            loadPatients()
            setSelectedId(null)
            setSearch('')
        }
    }, [open, loadPatients])

    const filteredPatients = patients.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    )

    const handleAdd = async () => {
        if (!selectedId) return
        const patient = patients.find(p => p._id === selectedId)
        if (!patient) return

        setIsSubmitting(true)
        try {
            await addInvoicePatientFn({
                data: {
                    invoiceId,
                    patient: {
                        patientId: patient._id,
                        patientName: patient.name,
                        mrn: patient.mrn || 'N/A',
                        isDischarged: false,
                        visits: []
                    }
                }
            })
            router.invalidate()
            toast.success('Patient added')
            onOpenChange(false)
        } catch (error) {
            toast.error('Failed to add patient')
        } finally {
            setIsSubmitting(false)
        }
    }

    const footer = (
        <div className="flex gap-2 w-full">
            <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-9 font-bold text-xs"
            >
                Cancel
            </Button>
            <Button
                size="sm"
                onClick={handleAdd}
                disabled={!selectedId || isSubmitting}
                className="flex-1 h-9 font-bold text-xs gap-1.5"
            >
                {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                {isSubmitting ? 'Adding...' : 'Add Patient'}
            </Button>
        </div>
    )

    return (
        <DialogWrapper
            open={open}
            onOpenChange={onOpenChange}
            title="Registry Search"
            description="Include a resident in this billing cycle."
            footer={footer}
        >
            <div className="space-y-3">
                <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Search residents..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-8 h-9 rounded-md border-border text-xs font-medium"
                    />
                </div>

                <div className="max-h-[220px] overflow-y-auto pr-1 space-y-1 custom-scrollbar overflow-x-hidden">
                    {isLoading ? (
                        <div className="py-8 flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-5 h-5 text-primary animate-spin" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Searching...</p>
                        </div>
                    ) : filteredPatients.length === 0 ? (
                        <div className="py-8 flex flex-col items-center justify-center gap-2">
                            <Users className="w-6 h-6 text-muted-foreground/30" />
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-center px-4">
                                No records found
                            </p>
                        </div>
                    ) : (
                        filteredPatients.map((patient) => (
                            <div
                                key={patient._id}
                                onClick={() => setSelectedId(patient._id)}
                                className={cn(
                                    "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all border",
                                    selectedId === patient._id
                                        ? "bg-primary border-primary text-primary-foreground"
                                        : "bg-card border-transparent hover:bg-muted hover:border-border"
                                )}
                            >
                                <div className={cn(
                                    "w-3.5 h-3.5 rounded-full border flex items-center justify-center",
                                    selectedId === patient._id ? "bg-primary-foreground border-primary-foreground" : "border-border bg-background"
                                )}>
                                    {selectedId === patient._id && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-xs truncate leading-none">{patient.name}</p>
                                    <p className={cn(
                                        "text-[9px] uppercase tracking-wider mt-1",
                                        selectedId === patient._id ? "text-primary-foreground/70" : "text-muted-foreground"
                                    )}>ID: {patient._id.slice(-6)}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </DialogWrapper>
    )
}
