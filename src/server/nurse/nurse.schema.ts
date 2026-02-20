import type { IBaseEntity } from '@/types/common'
import { EntityStatus } from '@/types/status'
import { z } from 'zod'

export interface INurse extends IBaseEntity<string> {
    name: string
    status?: EntityStatus
}

export const NurseSchema = z.object({
    name: z.string().min(2, 'Name is too short'),
    status: (z.enum(Object.values(EntityStatus) as [string, ...string[]]) as any).optional(),
})

export const UpdateNurseSchema = NurseSchema.partial().extend({
    id: z.string()
})
