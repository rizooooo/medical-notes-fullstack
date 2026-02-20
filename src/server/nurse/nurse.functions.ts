import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'
import {
    deleteNurse,
    fetchNurses,
    getNurseById,
    insertNurse,
    updateNurse,
    getNursesByHospiceCredential
} from './nurse.repo'
import { NurseSchema, UpdateNurseSchema } from './nurse.schema'
import { authMiddleware } from '../employee/employee.functions'
import { IAuditTrail } from '@/types/common'

export const getNurses = createServerFn({ method: 'GET' })
    .inputValidator(
        z.object({
            page: z.number().catch(1),
            pageSize: z.number().catch(10),
            sorting: z
                .array(
                    z.object({
                        id: z.string(),
                        desc: z.boolean(),
                    }),
                )
                .optional(),
        }),
    )
    .handler(async ({ data: input }) => {
        const result = await fetchNurses(input)
        return {
            ...result,
            data: result.data.map(n => ({
                ...n,
                _id: n._id.toString()
            }))
        }
    })

export const getNurse = createServerFn({ method: 'GET' })
    .inputValidator(z.string())
    .handler(async ({ data: id }) => {
        const nurse = await getNurseById(id)
        if (!nurse) return null
        return {
            ...nurse,
            _id: nurse._id.toString()
        }
    })

export const createNurseFn = createServerFn({ method: 'POST' })
    .inputValidator(NurseSchema)
    .handler(async ({ data: input }) => {
        const result = await insertNurse(input)
        return { success: true, id: result.insertedId.toString() }
    })

export const updateNurseFn = createServerFn({ method: 'POST' })
    .middleware([authMiddleware])
    .inputValidator(UpdateNurseSchema)
    .handler(async ({ data: input, context }) => {
        const user = context.user
        const { id, ...rest } = input

        const oldNurse = await getNurseById(id)
        if (!oldNurse) throw new Error('Nurse not found')

        const auditTrail: IAuditTrail = {
            timestamp: new Date(),
            userId: (user as any).id,
            userName: (user as any).name,
            action: 'UPDATE',
            changes: []
        }

        const relevantFields = ['name', 'status', 'credentials']
        relevantFields.forEach(field => {
            const oldValue = (oldNurse as any)[field]
            const newValue = (rest as any)[field]

            if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
                auditTrail.changes?.push({
                    field: field === 'credentials' ? 'Hospice Access' : field,
                    oldValue: oldValue,
                    newValue: newValue
                })
            }
        })

        const updateData: any = { ...rest }
        if (auditTrail.changes && auditTrail.changes.length > 0) {
            updateData.auditLog = auditTrail
        }

        await updateNurse(id, updateData)
        return { success: true }
    })

export const deleteNurseFn = createServerFn({ method: 'POST' })
    .inputValidator(z.string())
    .handler(async ({ data: id }) => {
        await deleteNurse(id)
        return { success: true }
    })
export const getHospiceCredentialsFn = createServerFn({ method: 'GET' })
    .inputValidator(z.string())
    .handler(async ({ data: hospiceId }) => {
        const nurses = await getNursesByHospiceCredential(hospiceId)
        return nurses.map(n => ({
            ...n,
            _id: n._id.toString()
        }))
    })
