
import type { IBaseEntity } from '@/types/common'
import { EntityStatus } from '@/types/status'
import { z } from 'zod'

export interface IHospice extends IBaseEntity<string> {
  name: string
  status?: EntityStatus
  qaConfig?: {
    enabledColumns: string[] // List of column IDs from ALL_QA_COLUMNS
  }
}

export const HospiceSchema = z.object({
  name: z.string().min(2, 'Name is too short'),
  status: (z.enum(Object.values(EntityStatus) as [string, ...string[]]) as any).optional(),
  qaConfig: z.object({
    enabledColumns: z.array(z.string())
  }).optional(),
})

export const UpdateHospiceSchema = HospiceSchema.partial().extend({
  id: z.string()
})
