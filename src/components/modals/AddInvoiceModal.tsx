"use client"

import * as React from 'react'
import { useForm } from '@tanstack/react-form'
import { useRouter } from '@tanstack/react-router'
import { startOfMonth, endOfMonth } from 'date-fns'
import { Button } from '@/components/ui/button'
import { DialogWrapper } from '@/components/layout/DialogWrapper'
import { Combobox } from '@/components/ui/combobox'
import { MultiSelect } from '@/components/ui/multi-select'
import { DatePicker } from '@/components/ui/date-picker'
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { getHospices } from '@/server/hospice/hospice.functions'
import { getNurses } from '@/server/nurse/nurse.functions'
import { createInvoiceFn } from '@/server/invoice/invoice.functions'
import { InvoiceStatus } from '@/types/invoice'
import { Loader2 } from 'lucide-react'
import { z } from 'zod'

const addInvoiceSchema = z.object({
    date: z.date(),
    hospiceId: z.string().min(1, 'Please select a hospice'),
    nurseIds: z.array(z.string()).min(1, 'Please select at least one nurse'),
})

interface AddInvoiceModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function AddInvoiceModal({ open, onOpenChange, onSuccess }: AddInvoiceModalProps) {
    const router = useRouter()
    const [hospiceOptions, setHospiceOptions] = React.useState<{ label: string; value: string }[]>([])
    const [nurseOptions, setNurseOptions] = React.useState<{ label: string; value: string; subLabel?: string }[]>([])
    const [isLoadingOptions, setIsLoadingOptions] = React.useState(false)

    const loadOptions = React.useCallback(async () => {
        if (isLoadingOptions || (hospiceOptions.length > 0 && nurseOptions.length > 0)) return
        setIsLoadingOptions(true)
        try {
            const [hospicesRes, nursesRes] = await Promise.all([
                getHospices({ data: { page: 1, pageSize: 100 } }),
                getNurses({ data: { page: 1, pageSize: 100 } }),
            ])

            setHospiceOptions(hospicesRes.data.map((h: any) => ({
                label: h.name,
                value: h._id,
            })))

            setNurseOptions(nursesRes.data.map((n: any) => ({
                label: n.name,
                value: n._id,
                subLabel: 'Registered Nurse',
            })))
        } catch (error) {
            console.error('Failed to load options:', error)
        } finally {
            setIsLoadingOptions(false)
        }
    }, [isLoadingOptions, hospiceOptions.length, nurseOptions.length])

    const form = useForm({
        defaultValues: {
            date: new Date(),
            hospiceId: '',
            nurseIds: [] as string[],
        },
        validators: {
            onChange: addInvoiceSchema as any,
        },
        onSubmit: async ({ value }) => {
            const periodStart = startOfMonth(value.date)
            const periodEnd = endOfMonth(value.date)

            const selectedHospice = hospiceOptions.find(h => h.value === value.hospiceId)

            try {
                // Create separate invoices for each selected nurse
                await Promise.all(value.nurseIds.map(async (nurseId, index) => {
                    const selectedNurse = nurseOptions.find(n => n.value === nurseId)
                    return createInvoiceFn({
                        data: {
                            invoiceNumber: `INV-${Date.now()}-${index + 1}`,
                            hospiceId: value.hospiceId,
                            hospiceName: selectedHospice?.label ?? 'Unknown',
                            nurseId: nurseId,
                            nurseName: selectedNurse?.label ?? 'Unknown Nurse',
                            periodStart,
                            periodEnd,
                            totalAmount: 0,
                            status: InvoiceStatus.Draft,
                            patients: [],
                        }
                    })
                }))

                onOpenChange(false)
                onSuccess?.()
                router.invalidate()
            } catch (error) {
                console.error('Failed to create invoice:', error)
            }
        },
    })

    const footer = (
        <div className="flex gap-3 w-full">
            <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-xl h-12 font-bold text-slate-500 hover:bg-slate-50"
            >
                Cancel
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                    <Button
                        type="button"
                        onClick={() => form.handleSubmit()}
                        disabled={!canSubmit || isSubmitting}
                        className="flex-[1.5] rounded-xl h-12 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 text-white transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                            </>
                        ) : (
                            'Generate Draft Invoice'
                        )}
                    </Button>
                )}
            </form.Subscribe>
        </div>
    )

    return (
        <DialogWrapper
            open={open}
            onOpenChange={onOpenChange}
            title="Create New Invoice"
            description="Select the period, facility, and medical staff to initialize a billing record."
            footer={footer}
        >
            <div className="space-y-6">
                <form.Field name="date">
                    {(field) => (
                        <FormItem>
                            <FormLabel>Billing Period (Month)</FormLabel>
                            <DatePicker
                                date={field.state.value}
                                onChange={(date) => field.handleChange(date ?? new Date())}
                                formatStr="MMMM yyyy"
                                placeholder="Pick a month"
                            />
                            <FormMessage>{field.state.meta.errors[0]}</FormMessage>
                        </FormItem>
                    )}
                </form.Field>

                <form.Field name="hospiceId">
                    {(field) => (
                        <FormItem>
                            <FormLabel>Hospice Facility</FormLabel>
                            <Combobox
                                options={hospiceOptions}
                                value={field.state.value}
                                onChange={(val) => field.handleChange(val)}
                                onOpenChange={(open) => open && loadOptions()}
                                placeholder={isLoadingOptions ? "Loading hospices..." : "Select Facility"}
                                className={field.state.meta.errors.length > 0 ? 'border-rose-500' : ''}
                            />
                            <FormMessage>{field.state.meta.errors[0]}</FormMessage>
                        </FormItem>
                    )}
                </form.Field>

                <form.Field name="nurseIds">
                    {(field) => (
                        <FormItem>
                            <FormLabel>Assigned Nurses</FormLabel>
                            <MultiSelect
                                options={nurseOptions}
                                selected={field.state.value}
                                onChange={(vals) => field.handleChange(vals)}
                                onOpenChange={(open) => open && loadOptions()}
                                placeholder={isLoadingOptions ? "Loading personnel..." : "Select nurses involved"}
                                className={field.state.meta.errors.length > 0 ? 'border-rose-500' : ''}
                            />
                            <FormMessage>{field.state.meta.errors[0]}</FormMessage>
                        </FormItem>
                    )}
                </form.Field>
            </div>
        </DialogWrapper>
    )
}
