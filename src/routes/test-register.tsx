import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { registerEmployeeFn, inviteEmployeeFn } from '@/server/employee/employee.functions'
import { EmployeeRole } from '@/server/employee/employee.schema'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card } from '@/components/ui/card'
import { Loader2, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

export const Route = createFileRoute('/test-register')({
    component: TestRegisterPage,
})

function TestRegisterPage() {
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm({
        defaultValues: {
            email: '',
            name: '',
            password: '',
        },
        validators: {
            onChange: z.object({
                email: z.string().email('Invalid email format'),
                name: z.string().min(2, 'Name must be at least 2 characters'),
                password: z.string().min(6, 'Password must be at least 6 characters'),
            }) as any
        },
        onSubmit: async ({ value }) => {
            setIsSubmitting(true)
            try {
                // 1. Create invite first (since system is invite-driven)
                const invite = await inviteEmployeeFn({ data: { email: value.email, role: EmployeeRole.ADMIN } })

                // 2. Immediately register using that token
                await registerEmployeeFn({
                    data: {
                        token: invite.token!,
                        name: value.name,
                        password: value.password
                    }
                })

                toast.success('Test User Registered. You can now login.')
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
                    <div className="w-10 h-10 rounded-md bg-amber-500 flex items-center justify-center mb-3">
                        <Zap className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Rapid Onboarding</h1>
                    <p className="text-xs text-slate-500 font-medium mt-1">Testing: Skip multi-step invite process</p>
                </div>

                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit()
                    }}
                    className="space-y-4"
                >
                    <form.Field name="email">
                        {(field) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <Input
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="test@example.com"
                                    className="h-9 text-xs font-medium border"
                                />
                                <FormMessage>{field.state.meta.errors[0] as any}</FormMessage>
                            </FormItem>
                        )}
                    </form.Field>

                    <form.Field name="name">
                        {(field) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <Input
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="John Tester"
                                    className="h-9 text-xs font-medium border"
                                />
                                <FormMessage>{field.state.meta.errors[0] as any}</FormMessage>
                            </FormItem>
                        )}
                    </form.Field>

                    <form.Field name="password">
                        {(field) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <Input
                                    type="password"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-9 text-xs font-medium border"
                                />
                                <FormMessage>{field.state.meta.errors.length > 0 ? field.state.meta.errors.map(err => err?.message || String(err)).join(', ') : null}</FormMessage>
                            </FormItem>
                        )}
                    </form.Field>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-9 rounded-md font-bold text-xs gap-2 bg-amber-600 hover:bg-amber-700"
                    >
                        {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Express Register"}
                    </Button>
                </form>
            </Card>
        </div>
    )
}
