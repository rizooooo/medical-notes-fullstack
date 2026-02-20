import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'
import * as repo from './qa.repo'
import { authMiddleware } from '../employee/employee.functions'
import { ALL_QA_COLUMNS } from './qa.schema'

export const getQAAssignmentsFn = createServerFn({ method: 'GET' })
    .inputValidator(z.object({ search: z.string().optional() }))
    .handler(async ({ data: { search } }) => {
        const results = await repo.fetchQAAssignments(search)
        return results.map(r => ({
            ...r,
            _id: r._id.toString()
        }))
    })

export const getQAAssignmentFn = createServerFn({ method: 'GET' })
    .inputValidator(z.string())
    .handler(async ({ data: id }) => {
        return await repo.getQAAssignmentById(id)
    })

export const updateQADocStatusFn = createServerFn({ method: 'POST' })
    .middleware([authMiddleware])
    .inputValidator(z.object({
        assignmentId: z.string(),
        patientId: z.string(),
        columnId: z.string(),
        colLabel: z.string(),
        status: z.string(),
        oldStatus: z.string(),
        comment: z.string().optional()
    }))
    .handler(async ({ data: input, context }) => {
        const user = context.user as any
        const auditTrail = {
            timestamp: new Date(),
            userId: user.id,
            userName: user.name,
            action: 'UPDATE',
            changes: [{
                field: input.colLabel,
                oldValue: input.oldStatus,
                newValue: input.status,
                comment: input.comment
            }]
        }

        await repo.updateQADocumentStatus(
            input.assignmentId,
            input.patientId,
            input.columnId,
            input.status,
            auditTrail
        )
        return { success: true, auditTrail }
    })

export const updateQARemarkFn = createServerFn({ method: 'POST' })
    .middleware([authMiddleware])
    .inputValidator(z.object({
        assignmentId: z.string(),
        patientId: z.string(),
        remark: z.string()
    }))
    .handler(async ({ data: input, context }) => {
        const user = context.user as any
        const auditTrail = {
            timestamp: new Date(),
            userId: user.id,
            userName: user.name,
            action: 'UPDATE',
            changes: [{
                field: 'Observations',
                oldValue: 'Previous Note',
                newValue: input.remark
            }]
        }
        await repo.updateQARemark(input.assignmentId, input.patientId, input.remark, auditTrail)
        return { success: true, auditTrail }
    })

export const initializeQAMonthFn = createServerFn({ method: 'POST' })
    .middleware([authMiddleware])
    .inputValidator(z.object({
        hospiceId: z.string(),
        hospiceName: z.string(),
        month: z.number(),
        year: z.number(),
        patients: z.array(z.object({
            id: z.string(),
            name: z.string(),
            mrn: z.string().optional()
        }))
    }))
    .handler(async ({ data: input }) => {
        // Build initial review structure for all patients
        const reviews = input.patients.map(p => ({
            patientId: p.id,
            patientName: p.name,
            mrn: p.mrn,
            overallStatus: 'InProgress',
            documents: ALL_QA_COLUMNS.reduce((acc, col) => {
                acc[col.id] = { id: col.id, name: col.label, status: 'Empty' }
                return acc
            }, {} as any)
        }))

        const result = await repo.insertQAAssignment({
            hospiceId: input.hospiceId,
            hospiceName: input.hospiceName,
            month: input.month,
            year: input.year,
            assignedQA: [],
            reviews: reviews as any,
            totalActivePatients: input.patients.length,
            totalDischargedPatients: 0,
            totalSNs: 0
        })

        return { success: true, id: result.insertedId.toString() }
    })
export const updateQAMetadataFn = createServerFn({ method: 'POST' })
    .middleware([authMiddleware])
    .inputValidator(z.object({
        assignmentId: z.string(),
        metadata: z.record(z.string(), z.any())
    }))
    .handler(async ({ data: input, context }) => {
        const user = context.user as any
        const auditTrail = {
            timestamp: new Date(),
            userId: user.id,
            userName: user.name,
            action: 'UPDATE',
            changes: Object.entries(input.metadata).map(([field, value]) => ({
                field: field === 'assignedQA' ? 'Assigned QA' :
                    field === 'assignedMD' ? 'Assigned MD' :
                        field === 'assignedIDG' ? 'MD / IDG Role' :
                            field === 'assignedNonClinical' ? 'Assigned Non-Clinical' : field,
                oldValue: 'Previous Setting',
                newValue: Array.isArray(value) ? value.join(', ') : value
            }))
        }
        await repo.updateQAAssignmentMetadata(input.assignmentId, input.metadata, auditTrail)
        return { success: true, auditTrail }
    })
export const getAdjacentAssignmentFn = createServerFn({ method: 'GET' })
    .inputValidator(z.object({
        hospiceId: z.string(),
        month: z.number(),
        year: z.number()
    }))
    .handler(async ({ data: input }) => {
        return await repo.findQAAssignment(input.hospiceId, input.month, input.year)
    })
