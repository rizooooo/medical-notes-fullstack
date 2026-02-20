"use client"

import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { EntityStatus } from '@/types/status'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from '@tanstack/react-router'
import React from 'react'
import { cn } from '@/lib/utils'
import { createPatientFn, updatePatientFn } from '@/server/patient/patient.functions'
import { DialogWrapper } from '@/components/layout/DialogWrapper'
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const patientFormSchema = z.object({
    name: z.string().min(2, 'Name is too short'),
    age: z.coerce.number().int().positive('Age must be a positive number'),
    diagnosis: z.string().min(2, 'Diagnosis is required'),
    status: z.enum(Object.values(EntityStatus) as [string, ...string[]]) as z.ZodType<EntityStatus>,
})

interface PatientDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    hospiceId: string
    editingPatient?: any
    onSuccess?: () => void
}

export function PatientDialog({
    open,
    onOpenChange,
    hospiceId,
    editingPatient,
    onSuccess,
}: PatientDialogProps) {
    const router = useRouter()

    const form = useForm({
        defaultValues: {
            name: editingPatient?.name ?? '',
            age: editingPatient?.age ?? 0,
            diagnosis: editingPatient?.diagnosis ?? '',
            status: (editingPatient?.status as EntityStatus) ?? EntityStatus.ACTIVE,
        },
        validators: {
            onChange: patientFormSchema as any,
        },
        onSubmit: async ({ value }) => {
            try {
                if (editingPatient) {
                    await updatePatientFn({
                        data: {
                            id: editingPatient._id,
                            ...value,
                            hospiceId,
                        },
                    })
                } else {
                    await createPatientFn({
                        data: {
                            ...value,
                            hospiceId,
                        },
                    })
                }
                onOpenChange(false)
                onSuccess?.()
                router.invalidate()
            } catch (error) {
                console.error('Failed to save patient:', error)
            }
        },
    })

    React.useEffect(() => {
        if (editingPatient) {
            form.setFieldValue('name', editingPatient.name)
            form.setFieldValue('age', editingPatient.age)
            form.setFieldValue('diagnosis', editingPatient.diagnosis)
            form.setFieldValue('status', editingPatient.status)
        } else if (open) {
            form.reset()
        }
    }, [editingPatient, open])

    const footer = (
        <div className="flex gap-3 w-full">
            <Button
                type="button"
                variant="ghost"
                className="flex-1 rounded-xl h-11 font-bold text-slate-500 hover:bg-slate-50 transition-all font-sans"
                onClick={() => onOpenChange(false)}
            >
                Cancel
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                    <Button
                        type="button"
                        onClick={() => form.handleSubmit()}
                        disabled={!canSubmit || isSubmitting}
                        className="flex-[1.5] rounded-xl h-11 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 text-white transition-all active:scale-95 disabled:opacity-50 border-none font-sans"
                    >
                        {isSubmitting ? 'Syncing...' : editingPatient ? 'Update Record' : 'Confirm Admission'}
                    </Button>
                )}
            </form.Subscribe>
        </div>
    )

    return (
        <DialogWrapper
            open={open}
            onOpenChange={onOpenChange}
            title={editingPatient ? 'Edit Patient Information' : 'New Patient Admission'}
            description={editingPatient ? 'Update clinical records for this resident.' : 'Complete the admission details for the new patient.'}
            footer={footer}
        >
            <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                <div className="col-span-2">
                    <form.Field name="name">
                        {(field) => (
                            <FormItem>
                                <FormLabel htmlFor={field.name}>Full Name</FormLabel>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="e.g. Jonathan Doe"
                                    className={cn(
                                        'rounded-xl border-slate-200 h-11 text-sm font-bold text-slate-700 transition-all focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500',
                                        field.state.meta.errors.length > 0 && 'border-rose-500 ring-rose-500/10'
                                    )}
                                />
                                <FormMessage>{field.state.meta.errors[0] as any}</FormMessage>
                            </FormItem>
                        )}
                    </form.Field>
                </div>

                <form.Field name="age">
                    {(field) => (
                        <FormItem>
                            <FormLabel htmlFor={field.name}>Age</FormLabel>
                            <Input
                                id={field.name}
                                name={field.name}
                                type="number"
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(Number(e.target.value))}
                                placeholder="0"
                                className={cn(
                                    'rounded-xl border-slate-200 h-11 text-sm font-bold text-slate-700 transition-all focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500',
                                    field.state.meta.errors.length > 0 && 'border-rose-500 ring-rose-500/10'
                                )}
                            />
                            <FormMessage>{field.state.meta.errors[0]?.toString()}</FormMessage>
                        </FormItem>
                    )}
                </form.Field>

                <form.Field name="status">
                    {(field) => (
                        <FormItem>
                            <FormLabel htmlFor={field.name}>Status</FormLabel>
                            <select
                                id={field.name}
                                name={field.name}
                                value={field.state.value}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(e.target.value as EntityStatus)}
                                className="w-full rounded-xl border border-slate-200 h-11 px-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 bg-white transition-all shadow-sm"
                            >
                                <option value={EntityStatus.ACTIVE}>Active</option>
                                <option value={EntityStatus.DISCHARGED}>Discharged</option>
                                <option value={EntityStatus.CRITICAL}>Critical</option>
                            </select>
                            <FormMessage>{field.state.meta.errors[0]?.toString()}</FormMessage>
                        </FormItem>
                    )}
                </form.Field>

                <div className="col-span-2">
                    <form.Field name="diagnosis">
                        {(field) => (
                            <FormItem>
                                <FormLabel htmlFor={field.name}>Clinical Diagnosis</FormLabel>
                                <Input
                                    id={field.name}
                                    name={field.name}
                                    value={field.state.value}
                                    onBlur={field.handleBlur}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="e.g. End Stage Chronic Illness"
                                    className={cn(
                                        'rounded-xl border-slate-200 h-11 text-sm font-bold text-slate-700 transition-all focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500',
                                        field.state.meta.errors.length > 0 && 'border-rose-500 ring-rose-500/10'
                                    )}
                                />
                                <FormMessage>{field.state.meta.errors[0] as any}</FormMessage>
                            </FormItem>
                        )}
                    </form.Field>
                </div>
            </div>
        </DialogWrapper>
    )
}
