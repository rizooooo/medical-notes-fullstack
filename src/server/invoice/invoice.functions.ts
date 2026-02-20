import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'
import {
    deleteInvoice,
    fetchInvoices,
    getInvoiceById,
    insertInvoice,
    updateInvoice,
} from './invoice.repo'
import { InvoiceSchema, UpdateInvoiceSchema } from './invoice.schema'

export const getInvoices = createServerFn({ method: 'GET' })
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
        const result = await fetchInvoices(data)
        return {
            ...result,
            data: result.data.map(inv => ({
                ...inv,
                _id: inv._id.toString()
            }))
        }
    })

export const getInvoice = createServerFn({ method: 'GET' })
    .inputValidator((id: string) => z.string().parse(id))
    .handler(async ({ data: id }: { data: string }) => {
        const invoice = await getInvoiceById(id)
        if (!invoice) return null
        return {
            ...invoice,
            _id: invoice._id.toString()
        }
    })

export const createInvoiceFn = createServerFn({ method: 'POST' })
    .inputValidator((data: unknown) => InvoiceSchema.parse(data))
    .handler(async ({ data }: { data: any }) => {
        const result = await insertInvoice(data)
        return { success: true, id: result.insertedId.toString() }
    })

export const updateInvoiceFn = createServerFn({ method: 'POST' })
    .inputValidator((data: unknown) => UpdateInvoiceSchema.parse(data))
    .handler(async ({ data }: { data: any }) => {
        const { id, ...rest } = data
        await updateInvoice(id, rest)
        return { success: true }
    })

export const deleteInvoiceFn = createServerFn({ method: 'POST' })
    .inputValidator((id: string) => z.string().parse(id))
    .handler(async ({ data: id }: { data: string }) => {
        await deleteInvoice(id)
        return { success: true }
    })
