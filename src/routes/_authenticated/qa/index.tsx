import { createFileRoute, useRouter } from '@tanstack/react-router'
import { Plus, Building2, Calendar, ClipboardList, TrendingUp, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { getQAAssignmentsFn } from '@/server/qa/qa.functions'
import { QAInitializeDialog } from '@/components/qa/qa-initialize-dialog'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_authenticated/qa/')({
    validateSearch: (search: Record<string, unknown>) => ({
        search: (search.search as string) || '',
    }),
    loaderDeps: ({ search }) => ({
        search: search.search,
    }),
    loader: async ({ deps }) => {
        return await getQAAssignmentsFn({ data: { search: deps.search } })
    },
    component: QAPage,
})

function QAPage() {
    const assignments = Route.useLoaderData()
    const navigate = Route.useNavigate()
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState('')
    const [initializeOpen, setInitializeOpen] = useState(false)

    const filteredAssignments = useMemo(() => {
        if (!searchTerm) return assignments
        return assignments.filter(a =>
            a.hospiceName.toLowerCase().includes(searchTerm.toLowerCase())
        )
    }, [assignments, searchTerm])

    const getMonthName = (m: number) => {
        const date = new Date()
        date.setMonth(m - 1)
        return format(date, 'MMMM')
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Flat Header (Default shadcn look) */}
            <div className="border-b bg-card px-4 py-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">QA Progress</h1>
                        <p className="text-sm text-muted-foreground">Clinical documentation oversight and progress tracking.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                            <Input
                                placeholder="Search agencies..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-9 text-xs"
                            />
                        </div>
                        <Button onClick={() => setInitializeOpen(true)} size="sm" className="h-9 font-bold">
                            <Plus className="mr-2 h-4 w-4" /> Initialize New Cycle
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: 'Active Cycles', count: assignments.length, icon: Calendar, color: 'text-primary' },
                        { label: 'Total Patients', count: assignments.reduce((acc, a) => acc + a.totalActivePatients, 0), icon: Building2, color: 'text-primary' },
                        { label: 'Avg Progress', count: assignments.length ? Math.round(assignments.reduce((acc, a) => acc + (a as any).completionRate, 0) / assignments.length) + '%' : '0%', icon: TrendingUp, color: 'text-emerald-600' },
                        { label: 'Hospice Count', count: Array.from(new Set(assignments.map(a => a.hospiceId))).length, icon: ClipboardList, color: 'text-primary' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-muted/30 border rounded-lg p-4 transition-colors hover:bg-muted/50">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{stat.label}</span>
                                <stat.icon className={cn("w-3.5 h-3.5 opacity-50", stat.color)} />
                            </div>
                            <span className="text-xl font-bold tracking-tight">{stat.count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 lg:p-8 overflow-auto">
                <div className="border rounded-lg bg-card overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground px-6 h-10">Agency Name</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground text-center h-10">Cycle</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground text-center h-10">Registry</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground h-10">Audit Progress</TableHead>
                                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground text-right px-6 h-10">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAssignments.length ? (
                                filteredAssignments.map((assignment) => (
                                    <TableRow
                                        key={assignment._id}
                                        className="hover:bg-muted/20 transition-colors cursor-pointer"
                                        onClick={() => {
                                            navigate({ to: '/qa/$assignmentId', params: { assignmentId: assignment._id } })
                                        }}
                                    >
                                        <TableCell className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="h-8 w-8 bg-muted rounded flex items-center justify-center text-muted-foreground">
                                                    <Building2 className="w-4 h-4" />
                                                </div>
                                                <span className="font-bold text-sm tracking-tight capitalize">
                                                    {assignment.hospiceName.toLowerCase()}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                                {getMonthName(assignment.month)} {assignment.year}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className="font-bold text-[10px] lowercase">
                                                {assignment.totalActivePatients} patients
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1.5 min-w-[150px]">
                                                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-500"
                                                        style={{ width: `${(assignment as any).completionRate || 0}%` }}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold">{(assignment as any).completionRate || 0}% done</span>
                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase">{assignment.totalSNs} SNS</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right px-6">
                                            <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-widest border-emerald-200 text-emerald-600 bg-emerald-50/50">
                                                Active
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <ClipboardList className="w-8 h-8 text-muted-foreground/30 mb-2" />
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest italic">No clinical cycles found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <QAInitializeDialog
                open={initializeOpen}
                onOpenChange={setInitializeOpen}
                onSuccess={() => router.invalidate()}
            />
        </div>
    )
}
