"use client"

import { Button } from '@/components/ui/button'
import { updateHospiceFn } from '@/server/hospice/hospice.functions'
import { useRouter } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { cn } from '@/lib/utils'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { SheetWrapper } from '@/components/layout/SheetWrapper'
import { SheetFooter } from '@/components/ui/sheet'
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const hospiceFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
})

interface HospiceEditDrawerProps {
    hospice: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function HospiceEditDrawer({ hospice, open, onOpenChange }: HospiceEditDrawerProps) {
    const router = useRouter()

    const form = useForm({
        defaultValues: {
            name: hospice.name,
        },
        validators: {
            onChange: hospiceFormSchema,
        },
        onSubmit: async ({ value }) => {
            try {
                await updateHospiceFn({ data: { id: hospice._id, name: value.name } })
                onOpenChange(false)
                router.invalidate()
            } catch (error) {
                console.error('Failed to update hospice:', error)
            }
        },
    })

    const footer = (
        <SheetFooter className="gap-3 sm:flex-row flex-col w-full">
            <Button
                variant="outline"
                type="button"
                className="flex-1 rounded-xl h-11 font-bold border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all active:scale-95"
                onClick={() => onOpenChange(false)}
            >
                Cancel
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                    <Button
                        onClick={() => form.handleSubmit()}
                        disabled={!canSubmit || isSubmitting}
                        className="flex-[1.5] rounded-xl h-11 font-bold shadow-xl shadow-indigo-200 bg-indigo-600 hover:bg-indigo-700 text-white transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : 'Update Facility'}
                    </Button>
                )}
            </form.Subscribe>
        </SheetFooter>
    )

    return (
        <SheetWrapper
            open={open}
            onOpenChange={onOpenChange}
            title="Edit Hospice Profile"
            description="Update the primary information for this facility."
            footer={footer}
        >
            <form.Field name="name">
                {(field) => (
                    <FormItem className="space-y-3">
                        <FormLabel htmlFor={field.name}>Facility Name</FormLabel>
                        <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            className={cn(
                                'h-12 border-slate-200 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 rounded-xl transition-all text-lg font-bold text-slate-700 bg-white placeholder:text-slate-300',
                                field.state.meta.errors.length > 0 && 'border-rose-500 ring-rose-500/10'
                            )}
                            placeholder="e.g. Hope Springs Hospice"
                        />
                        <FormMessage>{field.state.meta.errors[0]?.toString()}</FormMessage>
                    </FormItem>
                )}
            </form.Field>
        </SheetWrapper>
    )
}
