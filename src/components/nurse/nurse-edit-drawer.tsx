"use client"

import { Button } from '@/components/ui/button'
import { updateNurseFn } from '@/server/nurse/nurse.functions'
import { useRouter } from '@tanstack/react-router'
import { useForm } from '@tanstack/react-form'
import { cn } from '@/lib/utils'
import { User, ShieldCheck } from 'lucide-react'
import { z } from 'zod'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { SheetWrapper } from '@/components/layout/SheetWrapper'
import { SheetFooter } from '@/components/ui/sheet'
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form'

const nurseFormSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
})

interface NurseEditDrawerProps {
    nurse: any
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function NurseEditDrawer({ nurse, open, onOpenChange }: NurseEditDrawerProps) {
    const router = useRouter()

    const form = useForm({
        defaultValues: {
            name: nurse.name,
        },
        validators: {
            onChange: nurseFormSchema,
        },
        onSubmit: async ({ value }) => {
            try {
                await updateNurseFn({ data: { id: nurse._id, name: value.name } })
                onOpenChange(false)
                router.invalidate()
            } catch (error) {
                console.error('Failed to update nurse:', error)
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
                        {isSubmitting ? 'Saving...' : 'Save Changes'}
                    </Button>
                )}
            </form.Subscribe>
        </SheetFooter>
    )

    return (
        <SheetWrapper
            open={open}
            onOpenChange={onOpenChange}
            title="Edit Nurse Profile"
            description="Update the personnel information for this nurse."
            footer={footer}
        >
            <form.Field name="name">
                {(field) => (
                    <FormItem className="space-y-3">
                        <FormLabel htmlFor={field.name}>Full Name</FormLabel>
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
                            placeholder="Enter nurse full name"
                        />
                        <FormMessage>{field.state.meta.errors[0]?.toString()}</FormMessage>
                    </FormItem>
                )}
            </form.Field>

            <div className="space-y-3">
                <Label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Role & Permissions</Label>
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 px-4 h-12 rounded-xl border border-slate-200 bg-slate-50 opacity-50 font-bold text-sm text-slate-600">
                        <User className="w-4 h-4 text-indigo-500" /> Nurse
                    </div>
                    <div className="flex items-center gap-2 px-4 h-12 rounded-xl border border-slate-200 bg-slate-50 opacity-50 font-bold text-sm text-slate-600">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Admin
                    </div>
                </div>
            </div>
        </SheetWrapper>
    )
}
