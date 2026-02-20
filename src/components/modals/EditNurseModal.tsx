import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

import { DialogWrapper } from '@/components/layout/DialogWrapper'
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { updateNurseFn } from '@/server/nurse/nurse.functions'
import type { INurse } from '@/server/nurse/nurse.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const nurseSchema = z.object({
    name: z.string().min(2, 'Nurse name must be at least 2 characters'),
})

interface EditNurseDialogProps {
    nurse: INurse
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function EditNurseDialog({
    nurse,
    open,
    onOpenChange,
    onSuccess,
}: EditNurseDialogProps) {
    const form = useForm({
        defaultValues: {
            name: nurse.name,
        },
        validators: {
            onChange: nurseSchema,
        },
        onSubmit: async ({ value }) => {
            try {
                await updateNurseFn({
                    data: { id: nurse._id.toString(), name: value.name },
                })

                onOpenChange(false)

                if (onSuccess) {
                    onSuccess()
                }
            } catch (error) {
                console.error('Failed to update nurse:', error)
            }
        },
    })

    const footer = (
        <div className="flex gap-3 w-full">
            <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="flex-1 rounded-xl h-11 font-bold text-slate-500 hover:bg-slate-50 transition-all"
            >
                Cancel
            </Button>
            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                    <Button
                        type="button"
                        onClick={() => form.handleSubmit()}
                        disabled={!canSubmit || isSubmitting}
                        className="flex-[1.5] rounded-xl h-11 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-100 text-white transition-all active:scale-95 disabled:opacity-50 border-none"
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
            title="Edit Personnel"
            description="Update the clinical profile for this medical staff."
            footer={footer}
        >
            <form.Field name="name">
                {(field) => (
                    <FormItem className="space-y-3">
                        <FormLabel htmlFor={field.name}>Nurse Name</FormLabel>
                        <Input
                            id={field.name}
                            name={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(e) => field.handleChange(e.target.value)}
                            placeholder="e.g. Jane Doe"
                            className={cn(
                                'rounded-xl border-slate-200 h-11 text-sm font-bold text-slate-700 transition-all focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm',
                                field.state.meta.errors.length > 0 && 'border-rose-500 ring-rose-500/10'
                            )}
                        />
                        <FormMessage>{field.state.meta.errors[0] as any}</FormMessage>
                    </FormItem>
                )}
            </form.Field>
        </DialogWrapper>
    )
}
