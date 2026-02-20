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
  .handler(async ({ data: input }) => {
    const result = await fetchHospices(input)
    return {
      ...result,
      data: result.data.map(h => ({
        ...h,
        _id: h._id.toString()
      }))
    }
  })

export const getHospice = createServerFn({ method: 'GET' })
  .inputValidator(z.string())
  .handler(async ({ data: id }) => {
    const hospice = await getHospiceById(id)
    if (!hospice) return null
    return {
      ...hospice,
      _id: hospice._id.toString()
    }
  })

export const createHospiceFn = createServerFn({ method: 'POST' })
  .inputValidator(HospiceSchema)
  .handler(async ({ data: input }) => {
    const result = await insertHospice(input)
    return { success: true, id: result.insertedId.toString() }
  })

export const updateHospiceFn = createServerFn({ method: 'POST' })
  .inputValidator(UpdateHospiceSchema)
  .handler(async ({ data: input }) => {
    const { id, ...rest } = input
    await updateHospice(id, rest)
    return { success: true }
  })

export const deleteHospiceFn = createServerFn({ method: 'POST' })
  .inputValidator(z.string())
  .handler(async ({ data: id }) => {
    await deleteHospice(id)
    return { success: true }
  })
export const getAllHospicesFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const result = await fetchHospices({ page: 1, pageSize: 100 })
    return result.data.map(h => ({
      ...h,
      _id: h._id.toString()
    }))
  })

export const updateHospiceQAConfigFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    id: z.string(),
    enabledColumns: z.array(z.string())
  }))
  .handler(async ({ data: input }) => {
    await updateHospice(input.id, {
      qaConfig: { enabledColumns: input.enabledColumns }
    })
    return { success: true }
  })
