import { useForm } from '@tanstack/react-form'
import { SheetWrapper } from '@/components/layout/SheetWrapper'
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
import { SheetFooter } from '@/components/ui/sheet'
import { VisitType, NoteStatus } from '@/types/invoice'
import { VISIT_TYPE_LABELS, NOTE_STATUS_LABELS } from '@/utils/format'
import { updateInvoiceVisitFn } from '@/server/invoice/invoice.functions'
import { useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import { Loader2, Save } from 'lucide-react'
import type { IInvoiceVisit } from '@/server/invoice/invoice.schema'
import { InvoiceVisitSchema } from '@/server/invoice/invoice.schema'
import { useEffect, useState } from 'react'
import { getEmployeesFn } from '@/server/employee/employee.functions'
import type { IEmployee } from '@/server/employee/employee.schema'

interface EditVisitDrawerProps {
    invoiceId: string
    patientId: string
    visit: IInvoiceVisit
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function EditVisitDrawer({
    invoiceId,
    patientId,
    visit,
    open,
    onOpenChange
}: EditVisitDrawerProps) {
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
            serviceDate: visit.serviceDate,
            visitType: visit.visitType,
            actionsDone: visit.actionsDone,
            remarks: visit.remarks,
            customRemark: visit.customRemark || '',
            plottedBy: visit.plottedBy,
            rnCompletedBy: visit.rnCompletedBy,
            timeIn: visit.timeIn,
            timeOut: visit.timeOut,
            noteStatus: visit.noteStatus,
            rate: visit.rate,
        },
        validators: {
            onChange: InvoiceVisitSchema.omit({ _id: true }) as any,
        },
        onSubmit: async ({ value }) => {
            try {
                await updateInvoiceVisitFn({
                    data: {
                        invoiceId,
                        patientId,
                        visitId: visit._id,
                        visitData: value
                    }
                })
                router.invalidate()
                toast.success('Record synchronized')
                onOpenChange(false)
            } catch (error) {
                toast.error('Failed to sync record')
            }
        },
    })

    useEffect(() => {
        if (open) {
            form.setFieldValue('serviceDate', visit.serviceDate)
            form.setFieldValue('visitType', visit.visitType)
            form.setFieldValue('actionsDone', visit.actionsDone)
            form.setFieldValue('remarks', visit.remarks)
            form.setFieldValue('customRemark', visit.customRemark || '')
            form.setFieldValue('plottedBy', visit.plottedBy)
            form.setFieldValue('rnCompletedBy', visit.rnCompletedBy)
            form.setFieldValue('timeIn', visit.timeIn)
            form.setFieldValue('timeOut', visit.timeOut)
            form.setFieldValue('noteStatus', visit.noteStatus)
            form.setFieldValue('rate', visit.rate)
        }
    }, [open, visit])

    const footer = (
        <SheetFooter className="gap-2 sm:flex-row flex-col w-full mt-auto">
            <Button
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
                        size="sm"
                        onClick={() => form.handleSubmit()}
                        disabled={!canSubmit || isSubmitting}
                        className="flex-1 h-9 font-bold text-xs gap-1.5"
                    >
                        {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        {isSubmitting ? 'Syncing...' : 'Sync Changes'}
                    </Button>
                )}
            </form.Subscribe>
        </SheetFooter>
    )

    return (
        <SheetWrapper
            open={open}
            onOpenChange={onOpenChange}
            title="Update Registry"
            description="Clinical metadata synchronization."
            footer={footer}
        >
            <div className="space-y-4 pb-10">
                <form.Field name="serviceDate">
                    {(field) => (
                        <FormItem>
                            <FormLabel>Service Date</FormLabel>
                            <DatePicker
                                date={field.state.value}
                                onChange={(date) => field.handleChange(date || new Date())}
                                className="h-8 shadow-none"
                            />
                            <FormMessage>{field.state.meta.errors}</FormMessage>
                        </FormItem>
                    )}
                </form.Field>

                <form.Field name="plottedBy">
                    {(field) => (
                        <FormItem>
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
                        <FormItem>
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

                <div className="grid grid-cols-2 gap-3">
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
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                </div>

                <form.Field name="rate">
                    {(field) => (
                        <FormItem>
                            <FormLabel>Rate</FormLabel>
                            <Input
                                type="number"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(Number(e.target.value))}
                                className="h-8 text-xs font-bold bg-muted/50 shadow-none"
                            />
                            <FormMessage>{field.state.meta.errors}</FormMessage>
                        </FormItem>
                    )}
                </form.Field>

                <form.Field name="customRemark">
                    {(field) => (
                        <FormItem>
                            <FormLabel>Remarks</FormLabel>
                            <Input
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                className="h-8 text-xs shadow-none"
                            />
                            <FormMessage>{field.state.meta.errors}</FormMessage>
                        </FormItem>
                    )}
                </form.Field>
            </div>
        </SheetWrapper>
    )
}
