import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

import { DialogWrapper } from '@/components/layout/DialogWrapper'
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { updateHospiceFn } from '@/server/hospice/hospice.functions'
import type { IHospice } from '@/server/hospice/hospice.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const hospiceSchema = z.object({
    name: z.string().min(2, 'Hospice name must be at least 2 characters'),
})

interface EditHospiceDialogProps {
    hospice: IHospice
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function EditHospiceDialog({
    hospice,
    open,
    onOpenChange,
    onSuccess,
}: EditHospiceDialogProps) {
    const form = useForm({
        defaultValues: {
            name: hospice.name,
        },
        validators: {
            onChange: hospiceSchema,
        },
        onSubmit: async ({ value }) => {
            try {
                await updateHospiceFn({
                    data: { id: hospice._id.toString(), name: value.name },
                })

                onOpenChange(false)

                if (onSuccess) {
                    onSuccess()
                }
            } catch (error) {
                console.error('Failed to update hospice:', error)
            }
        },
    })

    const footer = (
        <div className="flex gap-3 w-full">
            <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-xl h-11 font-bold text-slate-500 hover:bg-slate-50 transition-all font-sans"
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
                        {isSubmitting && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isSubmitting ? 'Syncing...' : 'Save Changes'}
                    </Button>
                )}
            </form.Subscribe>
        </div>
    )

    return (
        <DialogWrapper
            open={open}
            onOpenChange={onOpenChange}
            title="Edit Hospice"
            description="Update the primary record for this facility."
            footer={footer}
        >
            <form.Field name="name">
                {(field) => (
                    <FormItem className="space-y-3">
                        <FormLabel htmlFor={field.name}>Hospice Name</FormLabel>
                        <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="e.g. Sunnyvale Care Center"
                            className={cn(
                                'rounded-xl border-slate-200 h-11 text-sm font-bold text-slate-700 transition-all focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm',
                                field.state.meta.errors.length > 0 && 'border-rose-500 ring-rose-500/10'
                            )}
                        />
                        <FormMessage>{field.state.meta.errors[0]?.toString()}</FormMessage>
                    </FormItem>
                )}
            </form.Field>
        </DialogWrapper>
    )
}
