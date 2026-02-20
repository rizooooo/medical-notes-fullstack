import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
    MessageSquare,
    Info,
    ArrowLeft,
    Download,
    Search,
    CheckCircle2,
    Clock,
    AlertCircle,
    Minus,
    CheckCircle,
    History,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Users,
    ClipboardList,
    Check,
    Plus
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { QAAuditDrawer } from '@/components/qa/qa-audit-drawer'
import { Input } from '@/components/ui/input'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { ALL_QA_COLUMNS, QAStatus } from '@/server/qa/qa.schema'
import { getQAAssignmentFn, updateQADocStatusFn, updateQARemarkFn, getAdjacentAssignmentFn, updateQAMetadataFn } from '@/server/qa/qa.functions'
import { getHospice } from '@/server/hospice/hospice.functions'
import { getEmployeesFn } from '@/server/employee/employee.functions'
import { toast } from 'sonner'
import { format } from 'date-fns'

const STATUS_CONFIG: Record<string, { label: string, color: string, icon: any, variant: "secondary" | "outline" | "default" | "destructive" }> = {
    [QAStatus.Completed]: { label: 'Completed', color: 'text-emerald-600', icon: CheckCircle2, variant: 'secondary' },
    [QAStatus.InProgress]: { label: 'In Progress', color: 'text-amber-600', icon: Clock, variant: 'secondary' },
    [QAStatus.Incomplete]: { label: 'Incomplete', color: 'text-rose-600', icon: AlertCircle, variant: 'secondary' },
    [QAStatus.Concern]: { label: 'Concern', color: 'text-indigo-600', icon: Info, variant: 'secondary' },
    [QAStatus.Empty]: { label: 'Empty', color: 'text-muted-foreground', icon: Minus, variant: 'outline' }
}

const GROUP_CONFIG: Record<string, { color: string, bg: string, subBg: string, text: string, subText: string, dot: string }> = {
    'Clinical': { color: 'text-primary', bg: 'bg-primary', subBg: 'bg-primary/[0.03]', text: 'text-primary-foreground', subText: 'text-primary', dot: 'bg-primary' },
    'Admin': { color: 'text-slate-700', bg: 'bg-slate-100', subBg: 'bg-slate-50', text: 'text-slate-900', subText: 'text-slate-600', dot: 'bg-slate-400' },
    'Home Aide': { color: 'text-emerald-700', bg: 'bg-emerald-100/80', subBg: 'bg-emerald-50/40', text: 'text-emerald-950', subText: 'text-emerald-700', dot: 'bg-emerald-500' },
    'Other': { color: 'text-indigo-700', bg: 'bg-indigo-100/80', subBg: 'bg-indigo-50/40', text: 'text-indigo-950', subText: 'text-indigo-700', dot: 'bg-indigo-500' }
}

export const Route = createFileRoute('/_authenticated/qa/$assignmentId')({
    loader: async ({ params }) => {
        const [assignment, employees] = await Promise.all([
            getQAAssignmentFn({ data: params.assignmentId }),
            getEmployeesFn()
        ])
        if (!assignment) throw new Error('Assignment not found')
        const hospice = await getHospice({ data: (assignment as any).hospiceId })
        return { assignment, hospice, employees }
    },
    component: QAAssignmentDetail,
})

function QAAssignmentDetail() {
    const { assignment: initialAssignment, hospice, employees } = Route.useLoaderData()
    const navigate = useNavigate()

    const [assignment, setAssignment] = useState(initialAssignment)
    const [patientSearch, setPatientSearch] = useState('')
    const [statusComment, setStatusComment] = useState('')

    const handleUpdateMetadata = async (field: string, value: any) => {
        try {
            const result = await updateQAMetadataFn({
                data: {
                    assignmentId: (assignment as any)._id,
                    metadata: { [field]: value }
                }
            })
            if (result.success) {
                setAssignment(prev => ({
                    ...prev,
                    [field]: value
                }))
                toast.success(`Updated ${field}`)
            }
        } catch (error) {
            toast.error("Failed to update clinical metadata")
        }
    }

    const handleUpdateStatus = async (patientId: string, columnId: string, colLabel: string, newStatus: string, docComment?: string) => {
        const patient = (assignment as any).reviews.find((p: any) => p.patientId === patientId)
        const oldStatus = patient.documents[columnId].status

        try {
            const result = await updateQADocStatusFn({
                data: {
                    assignmentId: (assignment as any)._id,
                    patientId,
                    columnId,
                    colLabel,
                    status: newStatus,
                    oldStatus,
                    comment: docComment
                }
            })

            if (result.success) {
                setAssignment((prev: any) => ({
                    ...prev,
                    reviews: prev.reviews.map((p: any) => {
                        if (p.patientId === patientId) {
                            return {
                                ...p,
                                documents: {
                                    ...p.documents,
                                    [columnId]: {
                                        ...p.documents[columnId],
                                        status: newStatus,
                                        comment: docComment
                                    }
                                }
                            }
                        }
                        return p
                    })
                }))
                toast.success(`Updated ${colLabel}`)
                setStatusComment('')
            }
        } catch (error) {
            toast.error("Failed to update status")
        }
    }

    const saveRemark = async () => {
        if (!editingRemark) return
        try {
            const result = await updateQARemarkFn({
                data: {
                    assignmentId: (assignment as any)._id,
                    patientId: editingRemark.id,
                    remark: editingRemark.remark
                }
            })

            if (result.success) {
                setAssignment((prev: any) => ({
                    ...prev,
                    reviews: prev.reviews.map((p: any) =>
                        p.patientId === editingRemark.id ? {
                            ...p,
                            remarks: editingRemark.remark,
                            auditLog: [...(p.auditLog || []), (result as any).auditTrail]
                        } : p
                    )
                }))
                toast.success("Remark updated")
                setRemarkDialogOpen(false)
            }
        } catch (error) {
            toast.error("Failed to update remark")
        }
    }

    const handleNavigateMonth = async (targetDate: Date) => {
        const m = targetDate.getMonth() + 1
        const y = targetDate.getFullYear()

        try {
            const adjacent = await getAdjacentAssignmentFn({
                data: { hospiceId: (assignment as any).hospiceId, month: m, year: y }
            })

            if (adjacent) {
                navigate({
                    to: '/qa/$assignmentId',
                    params: { assignmentId: adjacent._id },
                    from: '/qa/$assignmentId'
                } as any)
            } else {
                toast.error(`No record found for ${format(targetDate, 'MMMM yyyy')}`, {
                    description: "Initialize this cycle from the QA Progress list."
                })
            }
        } catch (error) {
            toast.error("Audit navigation failed.")
        }
    }
    const [auditDrawerOpen, setAuditDrawerOpen] = useState(false)
    const [selectedAuditPatientId, setSelectedAuditPatientId] = useState<string | null>(null)
    const [remarkDialogOpen, setRemarkDialogOpen] = useState(false)
    const [editingRemark, setEditingRemark] = useState<{ id: string, name: string, remark: string } | null>(null)

    const enabledCols = (hospice as any)?.qaConfig?.enabledColumns || ALL_QA_COLUMNS.map(c => c.id)
    const activeColumns = ALL_QA_COLUMNS.filter(c => enabledCols.includes(c.id))

    const COLUMN_GROUPS = useMemo(() => {
        const groups: Record<string, { label: string, columns: any[] }> = {}
        activeColumns.forEach(col => {
            if (!groups[col.group]) {
                groups[col.group] = { label: col.group, columns: [] }
            }
            groups[col.group].columns.push(col)
        })
        return Object.values(groups)
    }, [activeColumns])

    const filteredData = useMemo(() => {
        if (!assignment || !(assignment as any).reviews) return []
        return ((assignment as any).reviews as any[]).filter(p =>
            p.patientName.toLowerCase().includes(patientSearch.toLowerCase()) ||
            (p.mrn || '').toLowerCase().includes(patientSearch.toLowerCase())
        )
    }, [assignment, patientSearch])

    const completionStats = useMemo(() => {
        if (!assignment || !(assignment as any).reviews) return { rate: 0, completed: 0, total: 0 }
        const reviews = (assignment as any).reviews as any[]
        let completedDocs = 0
        let totalDocs = 0

        reviews.forEach(p => {
            Object.keys(p.documents).forEach(colId => {
                if (enabledCols.includes(colId)) {
                    totalDocs++
                    if (p.documents[colId].status === QAStatus.Completed) {
                        completedDocs++
                    }
                }
            })
        })

        return {
            rate: totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0,
            completed: completedDocs,
            total: totalDocs
        }
    }, [assignment, enabledCols])

    const activeAuditPatient = useMemo(() => {
        if (!selectedAuditPatientId) return null
        return (assignment as any).reviews.find((p: any) => p.patientId === selectedAuditPatientId)
    }, [assignment, selectedAuditPatientId])

    const AssignmentPicker = ({
        label,
        value,
        field,
        isMulti = false
    }: {
        label: string,
        value: string | string[],
        field: string,
        isMulti?: boolean
    }) => {
        const [open, setOpen] = useState(false)
        const [customValue, setCustomValue] = useState('')

        const displayValue = isMulti
            ? ((value as string[])?.length > 0 ? (value as string[]).join(', ') : 'None')
            : (value || 'None')

        const handleSelect = (val: string) => {
            if (isMulti) {
                const current = (value as string[]) || []
                const next = current.includes(val)
                    ? current.filter(v => v !== val)
                    : [...current, val]
                handleUpdateMetadata(field, next)
            } else {
                handleUpdateMetadata(field, val)
                setOpen(false)
            }
        }

        return (
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <button className="flex flex-col gap-1 p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors text-left group min-w-0">
                        <div className="flex items-center justify-between w-full">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">{label}</span>
                            <Plus className="h-2.5 w-2.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-sm font-bold truncate w-full">{displayValue}</span>
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0" align="start">
                    <Command>
                        <CommandInput placeholder={`Search ${label}...`} />
                        <CommandList>
                            <CommandEmpty>No employee found.</CommandEmpty>
                            <CommandGroup heading="Employees">
                                {employees.map((emp: any) => (
                                    <CommandItem
                                        key={emp._id}
                                        value={emp.name}
                                        onSelect={() => handleSelect(emp.name)}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                (isMulti ? (value as string[])?.includes(emp.name) : value === emp.name)
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                        {emp.name}
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                            <div className="border-t p-2">
                                <div className="flex items-center gap-2">
                                    <Input
                                        placeholder="Add Custom..."
                                        className="h-8 text-xs"
                                        value={customValue}
                                        onChange={(e) => setCustomValue(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && customValue) {
                                                handleSelect(customValue)
                                                setCustomValue('')
                                            }
                                        }}
                                    />
                                    <Button
                                        size="sm"
                                        variant="secondary"
                                        className="h-8 w-8 p-0 shrink-0"
                                        onClick={() => {
                                            if (customValue) {
                                                handleSelect(customValue)
                                                setCustomValue('')
                                            }
                                        }}
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CommandList>
                    </Command>
                </PopoverContent>
            </Popover>
        )
    }

    const openAudit = (patientId: string) => {
        setSelectedAuditPatientId(patientId)
        setAuditDrawerOpen(true)
    }

    if (!assignment) return null

    const cycleDate = new Date()
    cycleDate.setMonth((assignment as any).month - 1)
    cycleDate.setFullYear((assignment as any).year)

    const prevMonthDate = new Date(cycleDate)
    prevMonthDate.setMonth(prevMonthDate.getMonth() - 1)
    const nextMonthDate = new Date(cycleDate)
    nextMonthDate.setMonth(nextMonthDate.getMonth() + 1)

    // Split patients by status (Discharged if the 'discharge' doc is completed or marked)
    const { activePatients, dischargedPatients } = useMemo(() => {
        const active: any[] = []
        const discharged: any[] = []

        filteredData.forEach(p => {
            const dischargeStatus = p.documents['discharge']?.status
            if (dischargeStatus && dischargeStatus !== QAStatus.Empty) {
                discharged.push(p)
            } else {
                active.push(p)
            }
        })

        return { activePatients: active, dischargedPatients: discharged }
    }, [filteredData])

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Flat Header (Maximize space, shadcn defaults) */}
            <div className="border-b bg-card px-4 py-4 lg:px-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" asChild className="h-8 w-8">
                            <Link to="/qa" search={{ search: '' }}>
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                        </Button>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold tracking-tight">{(assignment as any).hospiceName}</h1>
                                <Badge variant="outline" className="font-semibold uppercase text-[10px]">
                                    Active Cycle
                                </Badge>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                                <Calendar className="h-3 w-3" />
                                {format(cycleDate, 'MMMM yyyy')}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center border rounded-md p-1 bg-muted/30">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[10px] font-bold uppercase tracking-tighter"
                                onClick={() => handleNavigateMonth(prevMonthDate)}
                            >
                                <ChevronLeft className="mr-1 h-3 w-3" /> {format(prevMonthDate, 'MMM')}
                            </Button>
                            <div className="w-px h-4 bg-border mx-1" />
                            <span className="text-[10px] font-black uppercase px-2">{format(cycleDate, 'MMM')}</span>
                            <div className="w-px h-4 bg-border mx-1" />
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 text-[10px] font-bold uppercase tracking-tighter"
                                onClick={() => handleNavigateMonth(nextMonthDate)}
                            >
                                {format(nextMonthDate, 'MMM')} <ChevronRight className="ml-1 h-3 w-3" />
                            </Button>
                        </div>
                        <div className="w-px h-8 bg-border mx-2" />
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setSelectedAuditPatientId(null)
                                    setAuditDrawerOpen(true)
                                }}
                                className="h-8 text-xs font-medium"
                            >
                                <History className="mr-2 h-4 w-4 text-muted-foreground" /> Audit Trail
                            </Button>
                            <Button variant="outline" size="sm" className="h-8 text-xs font-medium">
                                <Download className="mr-2 h-4 w-4 text-muted-foreground" /> Export
                            </Button>
                            <Button size="sm" className="h-8 text-xs font-medium uppercase font-bold">
                                Complete Audit
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-7 gap-3">
                    <AssignmentPicker
                        label="Assigned QA"
                        value={(assignment as any).assignedQA}
                        field="assignedQA"
                        isMulti={true}
                    />
                    <AssignmentPicker
                        label="MD / IDG Role"
                        value={(assignment as any).assignedIDG}
                        field="assignedIDG"
                    />
                    <AssignmentPicker
                        label="Non-Clinical / Admin"
                        value={(assignment as any).assignedNonClinical}
                        field="assignedNonClinical"
                    />
                    <div className="flex flex-col gap-1 p-3 border rounded-lg bg-muted/30">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Registry Count</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-bold">{activePatients.length} Active</span>
                            <span className="text-[10px] text-muted-foreground font-medium uppercase">/ {dischargedPatients.length} DC</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1 p-3 border rounded-lg bg-muted/30">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Volume Tracker</span>
                        <div className="flex items-baseline gap-1.5">
                            <span className="text-sm font-bold">{(assignment as any).totalSNs || 0}</span>
                            <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-tighter">Clinical SNS</span>
                        </div>
                    </div>
                    <AssignmentPicker
                        label="Assigned MD"
                        value={(assignment as any).assignedMD}
                        field="assignedMD"
                    />
                    <div className="flex flex-col gap-1 p-3 border rounded-lg bg-primary text-primary-foreground text-center">
                        <span className="text-[9px] font-bold opacity-70 uppercase tracking-widest leading-none">Compliance Rate</span>
                        <span className="text-lg font-black leading-none">{completionStats.rate}%</span>
                    </div>
                </div>
            </div>

            {/* Matrix Container - Pure Max Space */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Search & Legend Area */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
                    <div className="flex items-center gap-6">
                        <div className="relative w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                            <Input
                                placeholder="Universal Patient Search..."
                                value={patientSearch}
                                onChange={(e) => setPatientSearch(e.target.value)}
                                className="pl-10 h-8 bg-card text-xs"
                            />
                        </div>
                        <div className="flex items-center gap-4">
                            {Object.entries(GROUP_CONFIG).map(([label, config]) => (
                                <div key={label} className="flex items-center gap-2">
                                    <div className={cn("h-1.5 w-1.5 rounded-full", config.dot)} />
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* The Matrix */}
                <div className="flex-1 overflow-auto">
                    <table className="w-full border-collapse border-spacing-0 text-xs">
                        <thead className="sticky top-0 z-40 bg-muted/50">
                            <tr className="border-b border-border">
                                <th rowSpan={2} className="sticky left-0 z-50 transition-colors bg-white border-r border-border p-4 text-left min-w-[200px]">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Patient Registry</span>
                                </th>
                                {COLUMN_GROUPS.map((group) => {
                                    const config = GROUP_CONFIG[group.label] || GROUP_CONFIG['Other']
                                    return (
                                        <th
                                            key={group.label}
                                            colSpan={group.columns.length}
                                            className={cn(
                                                "h-10 border-r border-background/20 border-b border-border/50 px-2 text-center text-[10px] font-black uppercase tracking-widest transition-colors",
                                                config.bg,
                                                config.text
                                            )}
                                        >
                                            {group.label}
                                        </th>
                                    )
                                })}
                                <th rowSpan={2} className="min-w-[400px] border-b border-border bg-muted/50 p-4 text-center">
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Observations</span>
                                </th>
                            </tr>
                            <tr className="bg-white">
                                {COLUMN_GROUPS.flatMap(g => {
                                    const config = GROUP_CONFIG[g.label] || GROUP_CONFIG['Other']
                                    return g.columns.map((col, idx) => (
                                        <th
                                            key={col.id}
                                            className={cn(
                                                "min-w-[115px] h-12 border-b border-border p-2 text-center align-middle transition-colors",
                                                config.subBg,
                                                idx === g.columns.length - 1 ? "border-r border-border" : "border-r border-border/30"
                                            )}
                                        >
                                            <TooltipProvider>
                                                <Tooltip delayDuration={0}>
                                                    <TooltipTrigger className="w-full">
                                                        <span className={cn(
                                                            "text-[9px] font-black uppercase leading-tight line-clamp-2 px-1",
                                                            config.subText
                                                        )}>
                                                            {col.label}
                                                        </span>
                                                    </TooltipTrigger>
                                                    <TooltipContent className="text-[10px] font-bold py-1 px-2 uppercase tracking-widest">
                                                        {col.label}
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        </th>
                                    ))
                                })}
                            </tr>
                        </thead>
                        <tbody className="bg-background">
                            {/* Active Patients Section */}
                            <tr className="bg-slate-900 border-y border-slate-800">
                                <td className="sticky left-0 z-20 bg-slate-900 px-4 py-2" colSpan={1}>
                                    <div className="flex items-center gap-2">
                                        <Users className="h-3 w-3 text-white" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Active Patient Registry</span>
                                    </div>
                                </td>
                                <td colSpan={activeColumns.length + 1} className="bg-slate-900 px-4 py-2">
                                    <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                </td>
                            </tr>
                            {activePatients.length > 0 ? activePatients.map((patient: any) => (
                                <tr key={patient.patientId} className="border-b hover:bg-muted/20 transition-colors group">
                                    <td className="sticky left-0 z-20 bg-white group-hover:bg-slate-50 transition-colors border-r border-border p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm">{patient.patientName}</span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-medium text-muted-foreground">MRN: {patient.mrn || '---'}</span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openAudit(patient.patientId)}
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                            >
                                                <History className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </td>
                                    {COLUMN_GROUPS.flatMap(g =>
                                        g.columns.map((col, idx) => {
                                            const status = (patient.documents as any)[col.id]?.status || QAStatus.Empty;
                                            const config = STATUS_CONFIG[status] || STATUS_CONFIG[QAStatus.Empty];
                                            const Icon = config.icon;

                                            return (
                                                <td
                                                    key={`${patient.patientId}-${col.id}`}
                                                    className={cn(
                                                        "p-0 text-center align-middle border-b border-border/30",
                                                        idx === g.columns.length - 1 ? "border-r border-border" : "border-r border-border/30"
                                                    )}
                                                >
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <button className="w-full h-16 flex flex-col items-center justify-center hover:bg-muted/50 transition-colors">
                                                                <Icon className={cn("h-4 w-4", config.color)} />
                                                                {status !== QAStatus.Empty && (
                                                                    <span className={cn("text-[8px] font-bold uppercase mt-1", config.color)}>
                                                                        {config.label.substring(0, 3)}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-56 p-2" align="center" side="right">
                                                            <div className="space-y-3">
                                                                <div className="px-2 py-1.5 mb-1 bg-muted rounded text-[10px] font-bold uppercase tracking-widest flex items-center justify-between">
                                                                    <span>{col.label}</span>
                                                                    {patient.documents[col.id]?.comment && (
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger>
                                                                                    <Info className="h-3 w-3 text-indigo-500" />
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    {patient.documents[col.id].comment}
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    )}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    {Object.entries(STATUS_CONFIG).map(([val, sc]) => (
                                                                        <Button
                                                                            key={val}
                                                                            variant={status === val ? "secondary" : "ghost"}
                                                                            onClick={() => handleUpdateStatus(patient.patientId, col.id, col.label, val, statusComment)}
                                                                            className="w-full justify-start h-8 text-[11px] font-medium uppercase tracking-widest px-2"
                                                                        >
                                                                            <div className={cn("mr-2 h-2 w-2 rounded-full", sc.color.replace('text-', 'bg-'))} />
                                                                            {sc.label}
                                                                            {status === val && <CheckCircle className="ml-auto h-3 w-3" />}
                                                                        </Button>
                                                                    ))}
                                                                </div>
                                                                <div className="border-t pt-2 space-y-1.5">
                                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase px-1">Documentation Note</span>
                                                                    <Textarea
                                                                        placeholder="Optional info..."
                                                                        className="text-xs min-h-[60px] resize-none"
                                                                        defaultValue={patient.documents[col.id]?.comment || ''}
                                                                        onChange={(e) => setStatusComment(e.target.value)}
                                                                    />
                                                                    <Button
                                                                        size="sm"
                                                                        className="w-full h-7 text-[10px] font-bold uppercase tracking-widest mt-1"
                                                                        onClick={() => handleUpdateStatus(patient.patientId, col.id, col.label, status || 'Empty', statusComment)}
                                                                    >
                                                                        Update Audit Status
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </td>
                                            );
                                        })
                                    )}
                                    <td className="p-4 bg-muted/5">
                                        <div className="flex items-center gap-3">
                                            <p className="flex-1 text-xs text-muted-foreground italic line-clamp-2">
                                                {patient.remarks || 'No observations recorded.'}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setEditingRemark({ id: patient.patientId, name: patient.patientName, remark: patient.remarks || '' })
                                                    setRemarkDialogOpen(true)
                                                }}
                                                className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={activeColumns.length + 2} className="h-20 text-center bg-muted/5 text-[10px] font-bold text-muted-foreground uppercase italic tracking-widest">
                                        No active patients found in this census cycle.
                                    </td>
                                </tr>
                            )}

                            {/* Discharged Patients Section */}
                            <tr className="bg-slate-100 border-y border-slate-200">
                                <td className="sticky left-0 z-20 bg-slate-100 px-4 py-2" colSpan={1}>
                                    <div className="flex items-center gap-2">
                                        <ClipboardList className="h-3 w-3 text-slate-500" />
                                        <span className="text-[10px] font-black text-slate-700 uppercase tracking-[0.2em]">Discharged Patient (30 Days)</span>
                                    </div>
                                </td>
                                <td colSpan={activeColumns.length + 1} className="bg-slate-100 px-4 py-2" />
                            </tr>
                            {dischargedPatients.length > 0 ? dischargedPatients.map((patient: any) => (
                                <tr key={patient.patientId} className="border-b hover:bg-muted/20 transition-colors group opacity-80">
                                    <td className="sticky left-0 z-20 bg-white group-hover:bg-slate-50 transition-colors border-r border-border p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-sm">{patient.patientName}</span>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-medium text-muted-foreground">MRN: {patient.mrn || '---'}</span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => openAudit(patient.patientId)}
                                                className="h-6 w-6 opacity-0 group-hover:opacity-100"
                                            >
                                                <History className="h-3 w-3" />
                                            </Button>
                                        </div>
                                    </td>
                                    {COLUMN_GROUPS.flatMap(g =>
                                        g.columns.map((col, idx) => {
                                            const status = (patient.documents as any)[col.id]?.status || QAStatus.Empty;
                                            const config = STATUS_CONFIG[status] || STATUS_CONFIG[QAStatus.Empty];
                                            const Icon = config.icon;

                                            return (
                                                <td
                                                    key={`${patient.patientId}-${col.id}`}
                                                    className={cn(
                                                        "p-0 text-center align-middle border-b border-border/30",
                                                        idx === g.columns.length - 1 ? "border-r border-border" : "border-r border-border/30"
                                                    )}
                                                >
                                                    <Popover>
                                                        <PopoverTrigger asChild>
                                                            <button className="w-full h-16 flex flex-col items-center justify-center hover:bg-muted/50 transition-colors">
                                                                <Icon className={cn("h-4 w-4", config.color)} />
                                                                {status !== QAStatus.Empty && (
                                                                    <span className={cn("text-[8px] font-bold uppercase mt-1", config.color)}>
                                                                        {config.label.substring(0, 3)}
                                                                    </span>
                                                                )}
                                                            </button>
                                                        </PopoverTrigger>
                                                        <PopoverContent className="w-56 p-2" align="center" side="right">
                                                            <div className="space-y-3">
                                                                <div className="px-2 py-1.5 mb-1 bg-muted rounded text-[10px] font-bold uppercase tracking-widest flex items-center justify-between">
                                                                    <span>{col.label}</span>
                                                                    {patient.documents[col.id]?.comment && (
                                                                        <TooltipProvider>
                                                                            <Tooltip>
                                                                                <TooltipTrigger>
                                                                                    <Info className="h-3 w-3 text-indigo-500" />
                                                                                </TooltipTrigger>
                                                                                <TooltipContent>
                                                                                    {patient.documents[col.id].comment}
                                                                                </TooltipContent>
                                                                            </Tooltip>
                                                                        </TooltipProvider>
                                                                    )}
                                                                </div>
                                                                <div className="space-y-1">
                                                                    {Object.entries(STATUS_CONFIG).map(([val, sc]) => (
                                                                        <Button
                                                                            key={val}
                                                                            variant={status === val ? "secondary" : "ghost"}
                                                                            onClick={() => handleUpdateStatus(patient.patientId, col.id, col.label, val, statusComment)}
                                                                            className="w-full justify-start h-8 text-[11px] font-medium uppercase tracking-widest px-2"
                                                                        >
                                                                            <div className={cn("mr-2 h-2 w-2 rounded-full", sc.color.replace('text-', 'bg-'))} />
                                                                            {sc.label}
                                                                            {status === val && <CheckCircle className="ml-auto h-3 w-3" />}
                                                                        </Button>
                                                                    ))}
                                                                </div>
                                                                <div className="border-t pt-2 space-y-1.5">
                                                                    <span className="text-[9px] font-bold text-muted-foreground uppercase px-1">Documentation Note</span>
                                                                    <Textarea
                                                                        placeholder="Optional info..."
                                                                        className="text-xs min-h-[60px] resize-none"
                                                                        defaultValue={patient.documents[col.id]?.comment || ''}
                                                                        onChange={(e) => setStatusComment(e.target.value)}
                                                                    />
                                                                    <Button
                                                                        size="sm"
                                                                        className="w-full h-7 text-[10px] font-bold uppercase tracking-widest mt-1"
                                                                        onClick={() => handleUpdateStatus(patient.patientId, col.id, col.label, status || 'Empty', statusComment)}
                                                                    >
                                                                        Update Audit Status
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        </PopoverContent>
                                                    </Popover>
                                                </td>
                                            );
                                        })
                                    )}
                                    <td className="p-4 bg-muted/5">
                                        <div className="flex items-center gap-3">
                                            <p className="flex-1 text-xs text-muted-foreground italic line-clamp-2">
                                                {patient.remarks || 'No observations recorded.'}
                                            </p>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => {
                                                    setEditingRemark({ id: patient.patientId, name: patient.patientName, remark: patient.remarks || '' })
                                                    setRemarkDialogOpen(true)
                                                }}
                                                className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                            >
                                                <MessageSquare className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={activeColumns.length + 2} className="h-20 text-center bg-muted/5 text-[10px] font-bold text-muted-foreground uppercase italic tracking-widest">
                                        No discharged patients recorded in this period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <QAAuditDrawer
                open={auditDrawerOpen}
                onOpenChange={setAuditDrawerOpen}
                entityName={selectedAuditPatientId ? (activeAuditPatient?.patientName || '') : ((assignment as any).hospiceName || 'Global')}
                auditLog={selectedAuditPatientId ? activeAuditPatient?.auditLog : (assignment as any).auditLog}
            />

            <Dialog open={remarkDialogOpen} onOpenChange={setRemarkDialogOpen}>
                <DialogContent className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <MessageSquare className="h-5 w-5" />
                            Observations: {editingRemark?.name}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Type documentation notes..."
                            className="min-h-[200px]"
                            value={editingRemark?.remark}
                            onChange={(e) => setEditingRemark(prev => prev ? { ...prev, remark: e.target.value } : null)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setRemarkDialogOpen(false)}>Cancel</Button>
                        <Button onClick={saveRemark}>Save Observations</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
