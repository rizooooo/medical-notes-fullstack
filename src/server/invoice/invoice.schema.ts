import { z } from 'zod'
import type { IBaseEntity, IAuditTrail } from '@/types/common'
import {
    VisitType,
    ActionDone,
    RemarkCategory,
    NoteStatus,
    InvoiceStatus,
} from '@/types/invoice'

export interface IInvoiceVisit {
    _id: string
    serviceDate: Date
    visitType: VisitType
    actionsDone: ActionDone
    remarks: RemarkCategory
    customRemark?: string
    plottedBy: string
    rnCompletedBy: string
    timeIn: string
    timeOut: string
    noteStatus: NoteStatus
    rate: number
    // Audit fields
    createdBy?: string
    createdWithName?: string
    updatedBy?: string
    updatedWithName?: string
    createdAt?: Date
    updatedAt?: Date
    auditLog?: IAuditTrail[]
}

export interface IInvoicePatient {
    patientId: string
    patientName: string
    mrn: string
    isDischarged: boolean
    visits: IInvoiceVisit[]
}

export interface IInvoice extends IBaseEntity<string> {
    invoiceNumber: string
    hospiceId: string
    hospiceName: string
    nurseId: string
    nurseName: string
    periodStart: Date
    periodEnd: Date
    totalAmount: number
    status: InvoiceStatus
    patients: IInvoicePatient[]
    auditLog?: IAuditTrail[]
    createdAt: Date
    updatedAt: Date
}

export const InvoiceVisitSchema = z.object({
    _id: z.string(),
    serviceDate: z.coerce.date(),
    visitType: z.enum(Object.values(VisitType) as [string, ...string[]]) as z.ZodType<VisitType>,
    actionsDone: z.enum(Object.values(ActionDone) as [string, ...string[]]) as z.ZodType<ActionDone>,
    remarks: z.enum(Object.values(RemarkCategory) as [string, ...string[]]) as z.ZodType<RemarkCategory>,
    customRemark: z.string().optional(),
    plottedBy: z.string().catch('Already Plotted'),
    rnCompletedBy: z.string(),
    timeIn: z.string(),
    timeOut: z.string(),
    noteStatus: z.enum(Object.values(NoteStatus) as [string, ...string[]]) as z.ZodType<NoteStatus>,
    rate: z.coerce.number(),
    createdBy: z.string().optional(),
    createdWithName: z.string().optional(),
    updatedBy: z.string().optional(),
    updatedWithName: z.string().optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
    auditLog: z.array(z.object({
        timestamp: z.coerce.date(),
        userId: z.string(),
        userName: z.string(),
        action: z.enum(['CREATE', 'UPDATE']),
        changes: z.array(z.object({
            field: z.string(),
            oldValue: z.any(),
            newValue: z.any(),
        })).optional(),
    })).optional(),
})

export const InvoicePatientSchema = z.object({
    patientId: z.string(),
    patientName: z.string(),
    mrn: z.string().catch('Unknown'),
    isDischarged: z.boolean().catch(false),
    visits: z.array(InvoiceVisitSchema).catch([]),
})

export const InvoiceSchema = z.object({
    invoiceNumber: z.string(),
    hospiceId: z.string(),
    hospiceName: z.string(),
    nurseId: z.string(),
    nurseName: z.string(),
    periodStart: z.coerce.date(),
    periodEnd: z.coerce.date(),
    totalAmount: z.coerce.number(),
    status: z.enum(Object.values(InvoiceStatus) as [string, ...string[]]) as z.ZodType<InvoiceStatus>,
    patients: z.array(InvoicePatientSchema).catch([]),
    auditLog: z.array(z.object({
        timestamp: z.coerce.date(),
        userId: z.string(),
        userName: z.string(),
        action: z.enum(['CREATE', 'UPDATE']),
        changes: z.array(z.object({
            field: z.string(),
            oldValue: z.any(),
            newValue: z.any(),
        })).optional(),
    })).optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
})

export const UpdateInvoiceSchema = InvoiceSchema.partial().extend({
    id: z.string(),
})
