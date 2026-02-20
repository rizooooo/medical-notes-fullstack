import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

import { DialogWrapper } from '@/components/layout/DialogWrapper'
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createNurseFn } from '@/server/nurse/nurse.functions'
import { cn } from '@/lib/utils'

const nurseSchema = z.object({
    name: z.string().min(2, 'Nurse name must be at least 2 characters'),
})

interface AddNurseDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function AddNurseDialog({
    open,
    onOpenChange,
    onSuccess,
}: AddNurseDialogProps) {
    const form = useForm({
        defaultValues: {
            name: '',
        },
        validators: {
            onChange: nurseSchema,
        },
        onSubmit: async ({ value }) => {
            try {
                await createNurseFn({ data: { name: value.name } })
                form.reset()
                onOpenChange(false)
                if (onSuccess) {
                    onSuccess()
                }
            } catch (error) {
                console.error('Failed to create nurse:', error)
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
                        {isSubmitting ? 'Registering...' : 'Add medical staff'}
                    </Button>
                )}
            </form.Subscribe>
        </div>
    )

    return (
        <DialogWrapper
            open={open}
            onOpenChange={onOpenChange}
            title="Register New Nurse"
            description="Create a new profile for a medical staff member."
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
                        <FormMessage>{field.state.meta.errors[0]?.toString()}</FormMessage>
                    </FormItem>
                )}
            </form.Field>
        </DialogWrapper>
    )
}
