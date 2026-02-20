import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Plus, Mail, ArrowRight } from 'lucide-react'
import { TablePageLayout } from '@/layout/table-page-layout'
import { Button } from '@/components/ui/button'
import { getEmployeesFn, inviteEmployeeFn } from '@/server/employee/employee.functions'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Link } from '@tanstack/react-router'
import { DialogWrapper } from '@/components/layout/DialogWrapper'
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm } from '@tanstack/react-form'
import { EmployeeRole } from '@/server/employee/employee.schema'
import { toast } from 'sonner'
import { useRouter } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/employee/')({
    loader: async () => await getEmployeesFn(),
    component: EmployeeListPage,
})

function EmployeeListPage() {
    const employees = Route.useLoaderData()
    const [showInvite, setShowInvite] = useState(false)
    const router = useRouter()

    const form = useForm({
        defaultValues: {
            email: '',
            role: EmployeeRole.STANDARD
        },
        onSubmit: async ({ value }) => {
            try {
                await inviteEmployeeFn({ data: value })
                toast.success('Invitation dispatched')
                setShowInvite(false)
                router.invalidate()
            } catch (error: any) {
                toast.error(error.message)
            }
        }
    })

    return (
        <TablePageLayout
            title="System Employees"
            description="Manage administrative access and roles"
            action={
                <Button size="sm" onClick={() => setShowInvite(true)} className="h-8 rounded-md font-bold text-xs gap-1.5">
                    <Plus className="w-3.5 h-3.5" /> Invite User
                </Button>
            }
        >
            <div className="w-full rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-all hover:shadow-md">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 border-b border-border hover:bg-muted/50">
                            <TableHead className="h-10 font-bold text-[11px] text-muted-foreground px-4">Identity</TableHead>
                            <TableHead className="h-10 font-bold text-[11px] text-muted-foreground px-4">Access Level</TableHead>
                            <TableHead className="h-10 font-bold text-[11px] text-muted-foreground px-4">Last Activity</TableHead>
                            <TableHead className="h-10 border-none"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {employees.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-40 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <div className="p-4 rounded-full bg-muted mb-2">
                                            <Mail className="w-8 h-8 text-muted-foreground/30" />
                                        </div>
                                        <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest italic">No personnel records found</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            employees.map((emp) => (
                                <TableRow key={emp._id} className="group border-b border-border hover:bg-primary/5 transition-colors last:border-b-0">
                                    <TableCell className="py-2.5 px-4 text-[13px] font-medium text-muted-foreground">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center font-bold text-muted-foreground text-xs border border-border shadow-sm ring-1 ring-border">
                                                {emp.name?.charAt(0) || <Mail className="w-3.5 h-3.5" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-foreground leading-tight">{emp.name || "Invite Dispatch-..."}</p>
                                                <p className="text-[11px] text-muted-foreground font-bold uppercase tracking-tight">{emp.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-2.5 px-4 text-[13px] font-medium text-muted-foreground">
                                        <Badge variant="outline" className="rounded-lg uppercase text-[10px] font-black px-2 h-6 bg-muted text-muted-foreground border-border tracking-wider shadow-none">
                                            {emp.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="py-2.5 px-4 text-[13px] font-medium text-muted-foreground font-mono text-[11px]">
                                        {emp.lastLogin ? new Date(emp.lastLogin).toLocaleString() : "AUTHENTICATION PENDING"}
                                    </TableCell>
                                    <TableCell className="py-2.5 px-4 text-right">
                                        <Button variant="ghost" size="sm" asChild className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all active:scale-95">
                                            <Link to="/employee/$employeeId" params={{ employeeId: emp._id! }}>
                                                <ArrowRight className="w-4 h-4" />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <DialogWrapper
                open={showInvite}
                onOpenChange={setShowInvite}
                title="Personnel Invitation"
                description="Securely invite a new staff member to the platform."
                footer={
                    <div className="flex gap-2 w-full">
                        <Button variant="outline" size="sm" onClick={() => setShowInvite(false)} className="flex-1 h-9 font-bold text-xs uppercase tracking-wider">Cancel</Button>
                        <Button size="sm" onClick={() => form.handleSubmit()} className="flex-1 h-9 font-bold text-xs uppercase tracking-wider border-none">Dispatch Invite</Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <form.Field name="email">
                        {(field) => (
                            <FormItem>
                                <FormLabel>Professional Email</FormLabel>
                                <Input
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    placeholder="nurse.smith@facility.com"
                                    className="h-9 text-xs font-semibold shadow-none border"
                                />
                                <FormMessage>{field.state.meta.errors}</FormMessage>
                            </FormItem>
                        )}
                    </form.Field>

                    <form.Field name="role">
                        {(field) => (
                            <FormItem>
                                <FormLabel>Access Authority</FormLabel>
                                <Select value={field.state.value} onValueChange={(v) => field.handleChange(v as any)}>
                                    <SelectTrigger className="h-9 text-xs font-semibold shadow-none border">
                                        <SelectValue placeholder="Select level" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={EmployeeRole.STANDARD} className="text-xs">Standard Personnel</SelectItem>
                                        <SelectItem value={EmployeeRole.ADMIN} className="text-xs">Administrative Authority</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage>{field.state.meta.errors}</FormMessage>
                            </FormItem>
                        )}
                    </form.Field>
                </div>
            </DialogWrapper>
        </TablePageLayout>
    )
}
