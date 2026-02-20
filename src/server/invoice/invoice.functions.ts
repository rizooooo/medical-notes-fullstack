import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'
import {
    deleteInvoice,
    fetchInvoices,
    getInvoiceById,
    insertInvoice,
    updateInvoice,
    addPatientToInvoice,
    removePatientFromInvoice,
    updatePatientInInvoice,
    addVisitToPatient,
    updateVisitInPatient,
    removeVisitFromPatient,
    fetchActivePatientIds,
} from './invoice.repo'
import { InvoiceSchema, UpdateInvoiceSchema, InvoicePatientSchema, InvoiceVisitSchema } from './invoice.schema'
import { IAuditTrail } from '@/types/common'
import { authMiddleware } from '../employee/employee.functions'

export const getInvoices = createServerFn({ method: 'GET' })
    .inputValidator(
        z.object({
            page: z.number().catch(1),
            pageSize: z.number().catch(10),
            sorting: z.array(z.object({
                id: z.string(),
                desc: z.boolean(),
            })).optional().catch([]),
        })
    )
    .handler(async ({ data: input }) => {
        const result = await fetchInvoices(input)
        return {
            ...result,
            data: result.data.map(inv => ({
                ...inv,
                _id: inv._id.toString()
            }))
        }
    })

export const getInvoice = createServerFn({ method: 'GET' })
    .inputValidator(z.string())
    .handler(async ({ data: id }) => {
        const invoice = await getInvoiceById(id)
        if (!invoice) return null
        return {
            ...invoice,
            _id: invoice._id.toString()
        }
    })

export const createInvoiceFn = createServerFn({ method: 'POST' })
    .inputValidator(InvoiceSchema)
    .middleware([authMiddleware])
    .handler(async ({ data: input, context }) => {
        const user = context.user as any
        const now = new Date()

        const auditLog: IAuditTrail[] = [{
            timestamp: now,
            userId: user.id || user.sub,
            userName: user.name || user.email || 'Unknown User',
            action: 'CREATE'
        }]

        const result = await insertInvoice({
            ...input,
            auditLog
        } as any)
        return { success: true, id: result.insertedId.toString() }
    })

export const updateInvoiceFn = createServerFn({ method: 'POST' })
    .inputValidator(UpdateInvoiceSchema)
    .middleware([authMiddleware])
    .handler(async ({ data: input, context }) => {
        const user = context.user as any
        const now = new Date()
        const { id, ...rest } = input

        const existing = await getInvoiceById(id)
        if (!existing) throw new Error('Invoice not found')

        const changes: any[] = []
        const relevantFields = ['invoiceNumber', 'status', 'periodStart', 'periodEnd', 'totalAmount']

        for (const field of relevantFields) {
            const oldValue = (existing as any)[field]
            const newValue = (rest as any)[field]

            if (newValue !== undefined && JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                changes.push({ field, oldValue, newValue })
            }
        }

        const newAuditEntry: IAuditTrail = {
            timestamp: now,
            userId: user.id || user.sub,
            userName: user.name || user.email || 'Unknown User',
            action: 'UPDATE',
            changes: changes.length > 0 ? changes : undefined
        }

        const updatedAuditLog = [...(existing.auditLog || []), newAuditEntry]

        await updateInvoice(id, {
            ...rest,
            auditLog: updatedAuditLog
        } as any)
        return { success: true }
    })

export const deleteInvoiceFn = createServerFn({ method: 'POST' })
    .inputValidator(z.string())
    .middleware([authMiddleware])
    .handler(async ({ data: id }) => {
        await deleteInvoice(id)
        return { success: true }
    })

export const addInvoicePatientFn = createServerFn({ method: 'POST' })
    .inputValidator(z.object({
        invoiceId: z.string(),
        patient: InvoicePatientSchema
    }))
    .middleware([authMiddleware])
    .handler(async ({ data: input, context }) => {
        const user = context.user as any
        const now = new Date()

        const existing = await getInvoiceById(input.invoiceId)
        if (!existing) throw new Error('Invoice not found')

        const newAuditEntry: IAuditTrail = {
            timestamp: now,
            userId: user.id || user.sub,
            userName: user.name || user.email || 'Unknown User',
            action: 'UPDATE',
            changes: [{
                field: 'patients',
                oldValue: null,
                newValue: `Added patient: ${input.patient.patientName} (MRN: ${input.patient.mrn})`
            }]
        }

        const updatedAuditLog = [...(existing.auditLog || []), newAuditEntry]

        await addPatientToInvoice(input.invoiceId, input.patient)
        await updateInvoice(input.invoiceId, { auditLog: updatedAuditLog } as any)
        return { success: true }
    })

export const removeInvoicePatientFn = createServerFn({ method: 'POST' })
    .inputValidator(z.object({
        invoiceId: z.string(),
        patientId: z.string()
    }))
    .middleware([authMiddleware])
    .handler(async ({ data: input, context }) => {
        const user = context.user as any
        const now = new Date()

        const existing = await getInvoiceById(input.invoiceId)
        if (!existing) throw new Error('Invoice not found')

        const patientToRemove = existing.patients.find(p => p.patientId === input.patientId)

        const newAuditEntry: IAuditTrail = {
            timestamp: now,
            userId: user.id || user.sub,
            userName: user.name || user.email || 'Unknown User',
            action: 'UPDATE',
            changes: [{
                field: 'patients',
                oldValue: patientToRemove?.patientName || input.patientId,
                newValue: 'REMOVED_FROM_INVOICE'
            }]
        }

        const updatedAuditLog = [...(existing.auditLog || []), newAuditEntry]

        await removePatientFromInvoice(input.invoiceId, input.patientId)
        await updateInvoice(input.invoiceId, { auditLog: updatedAuditLog } as any)
        return { success: true }
    })

export const updateInvoicePatientFn = createServerFn({ method: 'POST' })
    .inputValidator(z.object({
        invoiceId: z.string(),
        patientId: z.string(),
        patientData: InvoicePatientSchema.partial()
    }))
    .middleware([authMiddleware])
    .handler(async ({ data: input, context }) => {
        const user = context.user as any
        const now = new Date()

        const existing = await getInvoiceById(input.invoiceId)
        if (!existing) throw new Error('Invoice not found')

        const patient = existing.patients.find(p => p.patientId === input.patientId)

        const changes: any[] = []
        if (input.patientData.isDischarged !== undefined && input.patientData.isDischarged !== patient?.isDischarged) {
            changes.push({
                field: `patient:${patient?.patientName}:isDischarged`,
                oldValue: patient?.isDischarged,
                newValue: input.patientData.isDischarged
            })
        }

        if (changes.length > 0) {
            const newAuditEntry: IAuditTrail = {
                timestamp: now,
                userId: user.id || user.sub,
                userName: user.name || user.email || 'Unknown User',
                action: 'UPDATE',
                changes
            }
            const updatedAuditLog = [...(existing.auditLog || []), newAuditEntry]
            await updateInvoice(input.invoiceId, { auditLog: updatedAuditLog } as any)
        }

        await updatePatientInInvoice(input.invoiceId, input.patientId, input.patientData)
        return { success: true }
    })

export const addInvoiceVisitFn = createServerFn({ method: 'POST' })
    .inputValidator(z.object({
        invoiceId: z.string(),
        patientId: z.string(),
        visit: InvoiceVisitSchema
    }))
    .middleware([authMiddleware])
    .handler(async ({ data: input, context }) => {
        const user = context.user as any
        const now = new Date()

        const auditLog: IAuditTrail[] = [{
            timestamp: now,
            userId: user.id || user.sub,
            userName: user.name || user.email || 'Unknown User',
            action: 'CREATE'
        }]

        const visitWithAudit = {
            ...input.visit,
            createdBy: user.id || user.sub,
            createdWithName: user.name || user.email,
            updatedBy: user.id || user.sub,
            updatedWithName: user.name || user.email,
            createdAt: now,
            updatedAt: now,
            auditLog
        }
        await addVisitToPatient(input.invoiceId, input.patientId, visitWithAudit)
        return { success: true }
    })

export const updateInvoiceVisitFn = createServerFn({ method: 'POST' })
    .inputValidator(z.object({
        invoiceId: z.string(),
        patientId: z.string(),
        visitId: z.string(),
        visitData: InvoiceVisitSchema.partial()
    }))
    .middleware([authMiddleware])
    .handler(async ({ data: input, context }) => {
        const user = context.user as any
        const now = new Date()

        // Fetch current invoice to get existing visit data for diff
        const invoice = await getInvoiceById(input.invoiceId)
        if (!invoice) throw new Error('Invoice not found')

        const patient = invoice.patients.find(p => p.patientId === input.patientId)
        const existingVisit = patient?.visits.find(v => v._id === input.visitId)

        if (!existingVisit) throw new Error('Visit not found')

        // Calculate changes
        const changes: any[] = []
        const relevantFields = [
            'serviceDate', 'visitType', 'actionsDone', 'remarks',
            'customRemark', 'timeIn', 'timeOut', 'noteStatus', 'rate',
            'plottedBy', 'rnCompletedBy'
        ]

        for (const field of relevantFields) {
            const oldValue = (existingVisit as any)[field]
            const newValue = (input.visitData as any)[field]

            if (newValue !== undefined && JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                changes.push({
                    field,
                    oldValue,
                    newValue
                })
            }
        }

        const newAuditEntry: IAuditTrail = {
            timestamp: now,
            userId: user.id || user.sub,
            userName: user.name || user.email || 'Unknown User',
            action: 'UPDATE',
            changes: changes.length > 0 ? changes : undefined
        }

        const updatedAuditLog = [...(existingVisit.auditLog || []), newAuditEntry]

        const visitDataWithAudit = {
            ...input.visitData,
            updatedBy: user.id || user.sub,
            updatedWithName: user.name || user.email,
            updatedAt: now,
            auditLog: updatedAuditLog
        }
        await updateVisitInPatient(input.invoiceId, input.patientId, input.visitId, visitDataWithAudit)
        return { success: true }
    })

export const removeInvoiceVisitFn = createServerFn({ method: 'POST' })
    .inputValidator(z.object({
        invoiceId: z.string(),
        patientId: z.string(),
        visitId: z.string()
    }))
    .middleware([authMiddleware])
    .handler(async ({ data: input }) => {
        await removeVisitFromPatient(input.invoiceId, input.patientId, input.visitId)
        return { success: true }
    })

export const getActivePatientIdsFn = createServerFn({ method: 'GET' })
    .handler(async () => {
        return await fetchActivePatientIds()
    })
