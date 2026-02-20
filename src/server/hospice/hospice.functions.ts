import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'
import {
  deleteHospice,
  fetchHospices,
  getHospiceById,
  insertHospice,
  updateHospice,
} from './hospice.repo'
import { HospiceSchema, UpdateHospiceSchema } from './hospice.schema'

export const getHospices = createServerFn({ method: 'GET' })
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
  .handler(async ({ data }: { data: any }) => {
    const result = await fetchHospices(data)
    return {
      ...result,
      data: result.data.map(h => ({
        ...h,
        _id: h._id.toString()
      }))
    }
  })

export const getHospice = createServerFn({ method: 'GET' })
  .inputValidator((id: string) => z.string().parse(id))
  .handler(async ({ data: id }: { data: string }) => {
    const hospice = await getHospiceById(id)
    if (!hospice) return null
    return {
      ...hospice,
      _id: hospice._id.toString()
    }
  })

export const createHospiceFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => HospiceSchema.parse(data))
  .handler(async ({ data }: { data: any }) => {
    const result = await insertHospice(data)
    return { success: true, id: result.insertedId.toString() }
  })

export const updateHospiceFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => UpdateHospiceSchema.parse(data))
  .handler(async ({ data }: { data: any }) => {
    const { id, ...rest } = data
    await updateHospice(id, rest)
    return { success: true }
  })

export const deleteHospiceFn = createServerFn({ method: 'POST' })
  .inputValidator((id: string) => z.string().parse(id))
  .handler(async ({ data: id }: { data: string }) => {
    await deleteHospice(id)
    return { success: true }
  })
