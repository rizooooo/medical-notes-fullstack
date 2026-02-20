import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'
import {
    deleteNurse,
    fetchNurses,
    getNurseById,
    insertNurse,
    updateNurse,
} from './nurse.repo'
import { NurseSchema, UpdateNurseSchema } from './nurse.schema'

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
    .handler(async ({ data }: { data: any }) => {
        const result = await fetchNurses(data)
        return {
            ...result,
            data: result.data.map(n => ({
                ...n,
                _id: n._id.toString()
            }))
        }
    })

export const getNurse = createServerFn({ method: 'GET' })
    .inputValidator((id: string) => z.string().parse(id))
    .handler(async ({ data: id }: { data: string }) => {
        const nurse = await getNurseById(id)
        if (!nurse) return null
        return {
            ...nurse,
            _id: nurse._id.toString()
        }
    })

export const createNurseFn = createServerFn({ method: 'POST' })
    .inputValidator((data: unknown) => NurseSchema.parse(data))
    .handler(async ({ data }: { data: any }) => {
        const result = await insertNurse(data)
        return { success: true, id: result.insertedId.toString() }
    })

export const updateNurseFn = createServerFn({ method: 'POST' })
    .inputValidator((data: unknown) => UpdateNurseSchema.parse(data))
    .handler(async ({ data }: { data: any }) => {
        const { id, ...rest } = data
        await updateNurse(id, rest)
        return { success: true }
    })

export const deleteNurseFn = createServerFn({ method: 'POST' })
    .inputValidator((id: string) => z.string().parse(id))
    .handler(async ({ data: id }: { data: string }) => {
        await deleteNurse(id)
        return { success: true }
    })
