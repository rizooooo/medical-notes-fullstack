import type { IBaseEntity } from '@/types/common'
import { EntityStatus } from '@/types/status'
import { z } from 'zod'

export interface IPatient extends IBaseEntity<string> {
    name: string
    age: number
    diagnosis: string
    status: EntityStatus
    hospiceId: string
    nurseId?: string
}

export const PatientSchema = z.object({
    name: z.string().min(2, 'Name is too short'),
    age: z.coerce.number().int().positive('Age must be a positive number'),
    diagnosis: z.string().min(2, 'Diagnosis is required'),
    status: z.enum(Object.values(EntityStatus) as [string, ...string[]]) as any,
    hospiceId: z.string(),
    nurseId: z.string().optional(),
})

export const UpdatePatientSchema = PatientSchema.partial().extend({
    id: z.string()
})
