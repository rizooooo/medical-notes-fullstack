import type { IBaseEntity, IAuditTrail } from '@/types/common'
import { EntityStatus } from '@/types/status'
import { z } from 'zod'

export interface INurseCredential {
    hospiceId: string
    hospiceName: string
    email: string
    password?: string
    frequency?: string // e.g. "Every 14 days", "1 per week"
    nextPlottingDate?: Date
    remarks?: string
    incompleteNotes?: number
    needsCorrection?: number
    previousMonthPending?: number
}

export interface INurse extends IBaseEntity<string> {
    name: string
    status?: EntityStatus
    credentials?: INurseCredential[]
    auditLog?: IAuditTrail[]
}

export const NurseSchema = z.object({
    name: z.string().min(2, 'Name is too short'),
    status: (z.enum(Object.values(EntityStatus) as [string, ...string[]]) as any).optional(),
    credentials: z.array(z.object({
        hospiceId: z.string(),
        hospiceName: z.string(),
        email: z.string().email(),
        password: z.string().optional(),
        frequency: z.string().optional(),
        nextPlottingDate: z.date().optional(),
        remarks: z.string().optional(),
        incompleteNotes: z.number().optional(),
        needsCorrection: z.number().optional(),
        previousMonthPending: z.number().optional(),
    })).optional()
})

export const UpdateNurseSchema = NurseSchema.partial().extend({
    id: z.string()
})
