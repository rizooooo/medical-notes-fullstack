import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { registerEmployeeFn } from '@/server/employee/employee.functions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card } from '@/components/ui/card'
import { Loader2, UserPlus, ShieldCheck, User } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

export const Route = createFileRoute('/register')({
    validateSearch: z.object({
        token: z.string()
    }),
    component: RegisterPage,
})

function RegisterPage() {
    const { token } = Route.useSearch()
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm({
        defaultValues: {
            name: '',
            password: '',
            confirmPassword: '',
        },
        validators: {
            onChange: z.object({
                name: z.string().min(2, 'Name must be at least 2 characters'),
                password: z.string().min(6, 'Password must be at least 6 characters'),
                confirmPassword: z.string()
            }).refine((data) => data.password === data.confirmPassword, {
                message: "Passwords don't match",
                path: ["confirmPassword"],
            }) as any
        },
        onSubmit: async ({ value }) => {
            setIsSubmitting(true)
            try {
                await registerEmployeeFn({
                    data: {
                        token,
                        name: value.name,
                        password: value.password
                    }
                })
                toast.success('Registration Complete')
                navigate({ to: '/login' })
            } catch (error: any) {
                toast.error(error.message || 'Registration Failed')
            } finally {
                setIsSubmitting(false)
            }
        },
    })

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4">
            <Card className="w-full max-w-[360px] p-6 rounded-md border shadow-none bg-white">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-10 h-10 rounded-md bg-indigo-600 flex items-center justify-center mb-3">
                        <UserPlus className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Onboarding</h1>
                    <p className="text-xs text-slate-500 font-medium mt-1">Complete your professional profile</p>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit()
                    }}
                    className="space-y-3"
                >
                    <form.Field name="name">
                        {(field) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <div className="relative">
                                    <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <Input
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="Jane Doe"
                                        className="h-8 pl-8 text-xs font-medium bg-slate-50/30 shadow-none border"
                                    />
                                </div>
                                <FormMessage>{field.state.meta.errors[0] as any}</FormMessage>
                            </FormItem>
                        )}
                    </form.Field>

                    <form.Field name="password">
                        {(field) => (
                            <FormItem>
                                <FormLabel>Initialize Password</FormLabel>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <Input
                                        type="password"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-8 pl-8 text-xs font-medium bg-slate-50/30 shadow-none border"
                                    />
                                </div>
                                <FormMessage>{field.state.meta.errors[0] as any}</FormMessage>
                            </FormItem>
                        )}
                    </form.Field>

                    <form.Field name="confirmPassword">
                        {(field) => (
                            <FormItem>
                                <FormLabel>Verify Password</FormLabel>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <Input
                                        type="password"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-8 pl-8 text-xs font-medium bg-slate-50/30 shadow-none border"
                                    />
                                </div>
                                <FormMessage>{field.state.meta.errors.length > 0 ? field.state.meta.errors.map(err => err?.message || String(err)).join(', ') : null}</FormMessage>
                            </FormItem>
                        )}
                    </form.Field>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-9 mt-2 rounded-md font-bold text-xs gap-2"
                    >
                        {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Finalize Profile"}
                    </Button>
                </form>

                <p className="mt-6 text-[9px] text-center text-slate-400 leading-relaxed font-medium">
                    By finalizing your profile, you agree to comply with HIPPA regulatory standards and institutional security protocols.
                </p>
            </Card>
        </div>
    )
}
