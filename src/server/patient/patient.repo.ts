import { ObjectId } from 'mongodb'
import { connectToDatabase } from '@/lib/db'
import type { IPatient } from './patient.schema'

export async function fetchPatientsByHospice(hospiceId: string) {
    const db = await connectToDatabase()
    return await db.collection<IPatient>('patient')
        .find({ hospiceId: new ObjectId(hospiceId) } as any)
        .sort({ createdAt: -1 })
        .toArray()
}

export async function fetchPatientsByNurse(nurseId: string) {
    const db = await connectToDatabase()
    return await db.collection<IPatient>('patient')
        .find({ nurseId: new ObjectId(nurseId) } as any)
        .sort({ createdAt: -1 })
        .toArray()
}

export async function insertPatient(patient: Omit<IPatient, '_id' | 'createdAt' | 'updatedAt'>) {
    const db = await connectToDatabase()
    const now = new Date()
    return await db.collection('patient').insertOne({
        ...patient,
        hospiceId: new ObjectId(patient.hospiceId as string),
        nurseId: patient.nurseId ? new ObjectId(patient.nurseId as string) : undefined,
        createdAt: now,
        updatedAt: now,
    })
}

export async function updatePatient(id: string, patient: Partial<IPatient>) {
    const db = await connectToDatabase()
    const { _id, ...rest } = patient

    const updateData: any = { ...rest, updatedAt: new Date() }
    if (rest.hospiceId) updateData.hospiceId = new ObjectId(rest.hospiceId as string)
    if (rest.nurseId) updateData.nurseId = new ObjectId(rest.nurseId as string)

    return await db.collection('patient').updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
    )
}

export async function deletePatient(id: string) {
    const db = await connectToDatabase()
    return await db.collection('patient').deleteOne({ _id: new ObjectId(id) })
}
