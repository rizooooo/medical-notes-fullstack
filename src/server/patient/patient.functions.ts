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
    .inputValidator(z.string())
    .handler(async ({ data: hospiceId }) => {
        const result = await fetchPatientsByHospice(hospiceId)
        return result.map(p => ({
            ...p,
            _id: p._id.toString(),
            hospiceId: p.hospiceId.toString(),
            nurseId: p.nurseId?.toString(),
        }))
    })

export const getNursePatients = createServerFn({ method: 'GET' })
    .inputValidator(z.string())
    .handler(async ({ data: nurseId }) => {
        const result = await fetchPatientsByNurse(nurseId)
        return result.map(p => ({
            ...p,
            _id: p._id.toString(),
            hospiceId: p.hospiceId.toString(),
            nurseId: p.nurseId?.toString(),
        }))
    })

export const createPatientFn = createServerFn({ method: 'POST' })
    .inputValidator(PatientSchema)
    .handler(async ({ data: input }) => {
        const result = await insertPatient(input)
        return { success: true, id: result.insertedId.toString() }
    })

export const updatePatientFn = createServerFn({ method: 'POST' })
    .inputValidator(UpdatePatientSchema)
    .handler(async ({ data: input }) => {
        const { id, ...rest } = input
        await updatePatient(id, rest as any)
        return { success: true }
    })

export const deletePatientFn = createServerFn({ method: 'POST' })
    .inputValidator(z.string())
    .handler(async ({ data: id }) => {
        await deletePatient(id)
        return { success: true }
    })
