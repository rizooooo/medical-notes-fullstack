import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { getEmployeeFn, resetPasswordFn } from '@/server/employee/employee.functions'
import { DetailWrapper } from '@/components/layout/DetailWrapper'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Clock, Shield, KeyRound, Monitor } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { toast } from 'sonner'
import { DialogWrapper } from '@/components/layout/DialogWrapper'
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'

export const Route = createFileRoute('/_authenticated/employee/$employeeId')({
    loader: async ({ params }) => {
        const employee = await getEmployeeFn({ data: params.employeeId })
        if (!employee) throw new Error('Employee record missing')
        return { employee }
    },
    component: EmployeeDetailPage,
})

function EmployeeDetailPage() {
    const { employee } = Route.useLoaderData()
    const [showReset, setShowReset] = useState(false)

    const resetForm = useForm({
        defaultValues: {
            password: '',
            confirm: ''
        },
        validators: {
            onChange: z.object({
                password: z.string().min(6),
                confirm: z.string()
            }).refine(d => d.password === d.confirm, {
                message: "Mismatch",
                path: ["confirm"]
            }) as any
        },
        onSubmit: async ({ value }) => {
            try {
                await resetPasswordFn({ data: { id: employee._id!, newPassword: value.password } })
                toast.success('Credentials updated')
                setShowReset(false)
            } catch (error: any) {
                toast.error(error.message)
            }
        }
    })

    return (
        <DetailWrapper className="p-4 lg:p-6">
            <div className="flex items-center gap-3 mb-6">
                <Button variant="outline" size="icon" asChild className="h-8 w-8 rounded-md">
                    <Link to="/employee">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <div className="flex items-center gap-3">
                    <h1 className="text-xl font-bold tracking-tight text-foreground">{employee.name}</h1>
                    <Badge variant="outline" className="rounded-md uppercase text-[9px] font-bold bg-muted text-muted-foreground border-border">
                        {employee.role} Authority
                    </Badge>
                </div>
                <div className="ml-auto">
                    <Button variant="outline" size="sm" onClick={() => setShowReset(true)} className="h-8 rounded-md font-medium text-xs gap-1.5">
                        <KeyRound className="w-3.5 h-3.5" /> Reset Credentials
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <Card className="p-4 rounded-md border shadow-none bg-card">
                        <div className="flex items-center gap-2 mb-3 border-b border-border pb-2">
                            <Shield className="w-3.5 h-3.5 text-muted-foreground" />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Personnel Identity</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Email Address</p>
                                <p className="text-xs font-bold text-foreground">{employee.email}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Internal UUID</p>
                                <p className="text-[10px] font-medium text-muted-foreground font-mono">#{employee._id}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-2 space-y-4">
                    <Tabs defaultValue="logs" className="w-full">
                        <TabsList className="bg-muted p-1 rounded-md h-9 border border-border">
                            <TabsTrigger value="logs" className="rounded-sm px-4 text-xs font-bold transition-all gap-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                                <Clock className="w-3.5 h-3.5" /> Access Logs
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="logs" className="mt-4 ring-0 focus-visible:ring-0">
                            <div className="rounded-md border border-border bg-card overflow-hidden shadow-none">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-muted/50 border-border">
                                            <TableHead className="text-[10px] font-bold uppercase py-2 h-9 text-muted-foreground">Timestamp</TableHead>
                                            <TableHead className="text-[10px] font-bold uppercase py-2 h-9 text-muted-foreground">IP Origin</TableHead>
                                            <TableHead className="text-[10px] font-bold uppercase py-2 h-9 text-muted-foreground">Terminal/Device</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {employee.loginLogs?.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={3} className="h-32 text-center text-muted-foreground font-medium italic text-xs">
                                                    No login activity recorded
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            employee.loginLogs?.map((log: any, i: number) => (
                                                <TableRow key={i} className="border-border">
                                                    <TableCell className="py-2 text-xs font-medium text-foreground">
                                                        {new Date(log.timestamp).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell className="py-2 text-xs font-medium text-muted-foreground">
                                                        {log.ip || "Unknown"}
                                                    </TableCell>
                                                    <TableCell className="py-2">
                                                        <div className="flex items-center gap-2">
                                                            <Monitor className="w-3 h-3 text-muted-foreground/60" />
                                                            <span className="text-xs font-medium text-muted-foreground">{log.device || "Web Interface"}</span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            <DialogWrapper
                open={showReset}
                onOpenChange={setShowReset}
                title="Credential Override"
                description="Manually reset password for this personnel member."
                footer={
                    <div className="flex gap-2 w-full">
                        <Button variant="outline" size="sm" onClick={() => setShowReset(false)} className="flex-1 h-9 font-bold text-xs uppercase tracking-wider">Cancel</Button>
                        <Button size="sm" onClick={() => resetForm.handleSubmit()} className="flex-1 h-9 font-bold text-xs uppercase tracking-wider border-none">Update Credentials</Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <resetForm.Field name="password">
                        {(field) => (
                            <FormItem>
                                <FormLabel>New Secure Password</FormLabel>
                                <Input
                                    type="password"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-9 text-xs font-semibold shadow-none border"
                                />
                                <FormMessage>{field.state.meta.errors}</FormMessage>
                            </FormItem>
                        )}
                    </resetForm.Field>
                    <resetForm.Field name="confirm">
                        {(field) => (
                            <FormItem>
                                <FormLabel>Verify Password</FormLabel>
                                <Input
                                    type="password"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="••••••••"
                                    className="h-9 text-xs font-semibold shadow-none border"
                                />
                                <FormMessage>{field.state.meta.errors}</FormMessage>
                            </FormItem>
                        )}
                    </resetForm.Field>
                </div>
            </DialogWrapper>
        </DetailWrapper>
    )
}
