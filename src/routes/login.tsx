import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { loginFn } from '@/server/employee/employee.functions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Card } from '@/components/ui/card'
import { Loader2, KeyRound, Mail } from 'lucide-react'
import { toast } from 'sonner'
import { z } from 'zod'

export const Route = createFileRoute('/login')({
    component: LoginPage,
})

function LoginPage() {
    const navigate = useNavigate()
    const [isSubmitting, setIsSubmitting] = useState(false)

    const form = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
        validators: {
            onChange: z.object({
                email: z.string().email('Invalid email address'),
                password: z.string().min(1, 'Password is required'),
            }) as any
        },
        onSubmit: async ({ value }) => {
            setIsSubmitting(true)
            try {
                const res = await loginFn({ data: value })
                if (res.success) {
                    localStorage.setItem('mn-token', res.token)
                    localStorage.setItem('mn-user', JSON.stringify(res.employee))
                    toast.success('Access Granted')
                    navigate({ to: '/' })
                }
            } catch (error: any) {
                toast.error(error.message || 'Access Denied')
            } finally {
                setIsSubmitting(false)
            }
        },
    })

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50/50 p-4">
            <Card className="w-full max-w-[360px] p-6 rounded-md border shadow-none bg-white">
                <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-10 h-10 rounded-md bg-slate-900 flex items-center justify-center mb-3">
                        <KeyRound className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">MedicalNotes Portal</h1>
                    <p className="text-xs text-slate-500 font-medium mt-1">Authenticate to access clinical registry</p>
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
                                <FormLabel>Email Address</FormLabel>
                                <div className="relative">
                                    <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <Input
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="name@facility.com"
                                        className="h-9 pl-8 text-xs font-medium bg-slate-50/30 shadow-none border"
                                    />
                                </div>
                                <FormMessage>{field.state.meta.errors[0] as any}</FormMessage>
                            </FormItem>
                        )}
                    </form.Field>

                    <form.Field name="password">
                        {(field) => (
                            <FormItem>
                                <FormLabel>Secure Password</FormLabel>
                                <div className="relative">
                                    <KeyRound className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                    <Input
                                        type="password"
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        placeholder="••••••••"
                                        className="h-9 pl-8 text-xs font-medium bg-slate-50/30 shadow-none border"
                                    />
                                </div>
                                <FormMessage>{field.state.meta.errors[0] as any}</FormMessage>
                            </FormItem>
                        )}
                    </form.Field>

                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-9 rounded-md font-bold text-xs gap-2"
                    >
                        {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Authenticate"}
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t text-center">
                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                        Confidential Medical Record System
                    </p>
                </div>
            </Card>
        </div>
    )
}
