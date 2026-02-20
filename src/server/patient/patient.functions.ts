import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'
import { PatientSchema, UpdatePatientSchema } from './patient.schema'
import {
    deletePatient,
    fetchPatientsByHospice,
    fetchPatientsByNurse,
    insertPatient,
    updatePatient,
} from './patient.repo'

export const getHospicePatients = createServerFn({ method: 'GET' })
    .inputValidator((hospiceId: string) => z.string().parse(hospiceId))
    .handler(async ({ data: hospiceId }: { data: string }) => {
        const result = await fetchPatientsByHospice(hospiceId)
        return result.map(p => ({
            ...p,
            _id: p._id.toString(),
            hospiceId: p.hospiceId.toString(),
            nurseId: p.nurseId?.toString(),
        }))
    })

export const getNursePatients = createServerFn({ method: 'GET' })
    .inputValidator((nurseId: string) => z.string().parse(nurseId))
    .handler(async ({ data: nurseId }: { data: string }) => {
        const result = await fetchPatientsByNurse(nurseId)
        return result.map(p => ({
            ...p,
            _id: p._id.toString(),
            hospiceId: p.hospiceId.toString(),
            nurseId: p.nurseId?.toString(),
        }))
    })

export const createPatientFn = createServerFn({ method: 'POST' })
    .inputValidator((data: unknown) => PatientSchema.parse(data))
    .handler(async ({ data }: { data: any }) => {
        const result = await insertPatient(data)
        return { success: true, id: result.insertedId.toString() }
    })

export const updatePatientFn = createServerFn({ method: 'POST' })
    .inputValidator((data: unknown) => UpdatePatientSchema.parse(data))
    .handler(async ({ data }: { data: any }) => {
        const { id, ...rest } = data
        await updatePatient(id, rest as any)
        return { success: true }
    })

export const deletePatientFn = createServerFn({ method: 'POST' })
    .inputValidator((id: string) => z.string().parse(id))
    .handler(async ({ data: id }: { data: string }) => {
        await deletePatient(id)
        return { success: true }
    })
