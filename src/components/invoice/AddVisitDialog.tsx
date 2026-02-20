import { useForm } from '@tanstack/react-form'
import { DialogWrapper } from '@/components/layout/DialogWrapper'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { DatePicker } from '@/components/ui/date-picker'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import { VisitType, NoteStatus, ActionDone, RemarkCategory } from '@/types/invoice'
import { VISIT_TYPE_LABELS, NOTE_STATUS_LABELS } from '@/utils/format'
import { addInvoiceVisitFn } from '@/server/invoice/invoice.functions'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { InvoiceVisitSchema } from '@/server/invoice/invoice.schema'
import { useEffect, useState } from 'react'
import { getEmployeesFn } from '@/server/employee/employee.functions'
import type { IEmployee } from '@/server/employee/employee.schema'
import { addDays } from 'date-fns'

interface AddVisitDialogProps {
    invoiceId: string
    patientId: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AddVisitDialog({
    invoiceId,
    patientId,
    open,
    onOpenChange
}: AddVisitDialogProps) {
    const router = useRouter()
    const [employees, setEmployees] = useState<IEmployee[]>([])

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const data = await getEmployeesFn()
                setEmployees(data)
            } catch (error) {
                console.error('Failed to fetch employees', error)
            }
        }
        if (open) fetchEmployees()
    }, [open])

    const form = useForm({
        defaultValues: {
            serviceDate: new Date(),
            visitType: VisitType.FollowUp,
            actionsDone: ActionDone.CompletedAndSubmitted,
            remarks: RemarkCategory.Tallied,
            customRemark: '',
            plottedBy: '',
            rnCompletedBy: '',
            timeIn: '09:00 AM',
            timeOut: '10:00 AM',
            noteStatus: NoteStatus.Approved,
            rate: 0,
        },
        validators: {
            onChange: InvoiceVisitSchema.omit({ _id: true }) as any,
        },
        onSubmit: async ({ value }) => {
            try {
                await addInvoiceVisitFn({
                    data: {
                        invoiceId,
                        patientId,
                        visit: {
                            ...value,
                            _id: `v-${Date.now()}`
                        }
                    }
                })
                router.invalidate()
                toast.success('Visit logged')
                onOpenChange(false)
                form.reset()
            } catch (error) {
                toast.error('Failed to save visit')
            }
        },
    })

    const footer = (
        <div className="flex gap-2 w-full">
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="flex-1 h-9 font-bold text-xs"
            >
                Cancel
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                    <Button
                        type="button"
                        size="sm"
                        onClick={() => form.handleSubmit()}
                        disabled={!canSubmit || isSubmitting}
                        className="flex-1 h-9 font-bold text-xs"
                    >
                        {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                        {isSubmitting ? 'Saving...' : 'Log Visit'}
                    </Button>
                )}
            </form.Subscribe>
        </div>
    )

    return (
        <DialogWrapper
            open={open}
            onOpenChange={onOpenChange}
            title="Log Visit"
            description="Enter clinical visit details."
            footer={footer}
        >
            <div className="grid grid-cols-2 gap-x-3 gap-y-3">
                <form.Field name="serviceDate">
                    {(field) => (
                        <FormItem className="col-span-2">
                            <FormLabel>Service Date</FormLabel>
                            <div className="space-y-2">
                                <DatePicker
                                    date={field.state.value}
                                    onChange={(date) => field.handleChange(date || new Date())}
                                    className="h-8 shadow-none"
                                />
                                <div className="flex flex-wrap gap-1.5">
                                    {[
                                        { label: 'Today', days: 0 },
                                        { label: '+1 D', days: 1 },
                                        { label: '+7 D', days: 7 },
                                        { label: '+1 W', days: 7, isWeek: true },
                                        { label: '+14 D', days: 14 }
                                    ].map((s) => (
                                        <Button
                                            key={s.label}
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={() => field.handleChange(addDays(new Date(), s.days))}
                                            className="h-6 px-2 text-[9px] font-black uppercase tracking-widest border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-100 transition-all rounded-md"
                                        >
                                            {s.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                            <FormMessage>{field.state.meta.errors}</FormMessage>
                        </FormItem>
                    )}
                </form.Field>

                <form.Field name="plottedBy">
                    {(field) => (
                        <FormItem className="col-span-2">
                            <div className="flex items-center justify-between">
                                <FormLabel>Plotted By</FormLabel>
                                {field.state.value && (
                                    <button
                                        type="button"
                                        onClick={() => field.handleChange('')}
                                        className="text-[10px] font-bold text-muted-foreground hover:text-destructive transition-colors uppercase tracking-widest"
                                    >
                                        [ Clear ]
                                    </button>
                                )}
                            </div>
                            <Select
                                value={field.state.value}
                                onValueChange={(val) => field.handleChange(val)}
                            >
                                <SelectTrigger className="h-8 text-xs shadow-none w-full">
                                    <SelectValue placeholder="Select staff" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(emp => (
                                        <SelectItem key={emp._id} value={emp.name || ''} className="text-xs">{emp.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage>{field.state.meta.errors}</FormMessage>
                        </FormItem>
                    )}
                </form.Field>

                <form.Field name="rnCompletedBy">
                    {(field) => (
                        <FormItem className="col-span-2">
                            <div className="flex items-center justify-between">
                                <FormLabel>RN Completed By</FormLabel>
                                {field.state.value && (
                                    <button
                                        type="button"
                                        onClick={() => field.handleChange('')}
                                        className="text-[10px] font-bold text-muted-foreground hover:text-destructive transition-colors uppercase tracking-widest"
                                    >
                                        [ Clear ]
                                    </button>
                                )}
                            </div>
                            <Select
                                value={field.state.value}
                                onValueChange={(val) => field.handleChange(val)}
                            >
                                <SelectTrigger className="h-8 text-xs shadow-none w-full">
                                    <SelectValue placeholder="Select RN" />
                                </SelectTrigger>
                                <SelectContent>
                                    {employees.map(emp => (
                                        <SelectItem key={emp._id} value={emp.name || ''} className="text-xs">{emp.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage>{field.state.meta.errors}</FormMessage>
                        </FormItem>
                    )}
                </form.Field>

                <form.Field name="visitType">
                    {(field) => (
                        <FormItem>
                            <FormLabel>Type</FormLabel>
                            <Select
                                value={field.state.value}
                                onValueChange={(val) => field.handleChange(val as VisitType)}
                            >
                                <SelectTrigger className="h-8 text-xs shadow-none w-full">
                                    <SelectValue>
                                        {field.state.value ? VISIT_TYPE_LABELS[field.state.value] : "Type"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(VisitType).map(type => (
                                        <SelectItem key={type} value={type} className="text-xs">{VISIT_TYPE_LABELS[type]}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage>{field.state.meta.errors}</FormMessage>
                        </FormItem>
                    )}
                </form.Field>

                <form.Field name="noteStatus">
                    {(field) => (
                        <FormItem>
                            <FormLabel>Status</FormLabel>
                            <Select
                                value={field.state.value}
                                onValueChange={(val) => field.handleChange(val as NoteStatus)}
                            >
                                <SelectTrigger className="h-8 text-xs shadow-none w-full">
                                    <SelectValue>
                                        {field.state.value ? NOTE_STATUS_LABELS[field.state.value] : "Status"}
                                    </SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.values(NoteStatus).map(status => (
                                        <SelectItem key={status} value={status} className="text-xs">{NOTE_STATUS_LABELS[status]}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage>{field.state.meta.errors}</FormMessage>
                        </FormItem>
                    )}
                </form.Field>

                <form.Field name="timeIn">
                    {(field) => (
                        <FormItem>
                            <FormLabel>Time In</FormLabel>
                            <Input
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                className="h-8 text-xs shadow-none"
                            />
                            <FormMessage>{field.state.meta.errors}</FormMessage>
                        </FormItem>
                    )}
                </form.Field>

                <form.Field name="timeOut">
                    {(field) => (
                        <FormItem>
                            <FormLabel>Time Out</FormLabel>
                            <Input
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                className="h-8 text-xs shadow-none"
                            />
                            <FormMessage>{field.state.meta.errors}</FormMessage>
                        </FormItem>
                    )}
                </form.Field>

                <form.Field name="rate">
                    {(field) => (
                        <FormItem className="col-span-2">
                            <FormLabel>Rate ($)</FormLabel>
                            <Input
                                type="number"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(Number(e.target.value))}
                                className="h-8 text-xs font-bold bg-slate-50/50 shadow-none"
                            />
                            <FormMessage>{field.state.meta.errors}</FormMessage>
                        </FormItem>
                    )}
                </form.Field>
            </div>
        </DialogWrapper>
    )
}
