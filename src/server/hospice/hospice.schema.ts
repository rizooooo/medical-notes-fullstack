
import type { IBaseEntity } from '@/types/common'
import { EntityStatus } from '@/types/status'
import { z } from 'zod'

export interface IHospice extends IBaseEntity<string> {
  name: string
  status?: EntityStatus
}

export const HospiceSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  status: (z.enum(Object.values(EntityStatus) as [string, ...string[]]) as any).optional(),
})

export const UpdateHospiceSchema = HospiceSchema.partial().extend({
  id: z.string()
})
