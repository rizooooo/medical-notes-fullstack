import { InvoiceStatus } from '@/types/invoice'
import { ObjectId } from 'mongodb'
import { connectToDatabase } from '@/lib/db'
import type { IInvoice } from './invoice.schema'

export async function fetchInvoices(params: {
    page: number
    pageSize: number
    sorting?: Array<{ id: string; desc: boolean }>
}) {
    const db = await connectToDatabase()
    const skip = (params.page - 1) * params.pageSize

    const sort: any = {}
    if (params.sorting?.length) {
        params.sorting.forEach((s) => {
            sort[s.id] = s.desc ? -1 : 1
        })
    } else {
        sort.createdAt = -1
    }

    const [data, total] = await Promise.all([
        db.collection<IInvoice>('invoice')
            .find()
            .sort(sort)
            .skip(skip)
            .limit(params.pageSize)
            .toArray(),
        db.collection('invoice').countDocuments(),
    ])

    return {
        data,
        metadata: {
            total,
            pageCount: Math.ceil(total / params.pageSize),
        },
    }
}

export async function getInvoiceById(id: string) {
    const db = await connectToDatabase()
    return await db.collection<IInvoice>('invoice').findOne({ _id: new ObjectId(id) } as any)
}

export async function insertInvoice(invoice: Omit<IInvoice, '_id' | 'createdAt' | 'updatedAt'>) {
    const db = await connectToDatabase()
    const now = new Date()
    return await db.collection('invoice').insertOne({
        ...invoice,
        createdAt: now,
        updatedAt: now,
    } as any)
}

export async function updateInvoice(id: string, invoice: Partial<IInvoice>) {
    const db = await connectToDatabase()
    const { _id, ...rest } = invoice

    return await db.collection('invoice').updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...rest, updatedAt: new Date() } }
    )
}

export async function deleteInvoice(id: string) {
    const db = await connectToDatabase()
    return await db.collection('invoice').deleteOne({ _id: new ObjectId(id) })
}

export async function addPatientToInvoice(invoiceId: string, patient: any) {
    const db = await connectToDatabase()
    return await db.collection('invoice').updateOne(
        { _id: new ObjectId(invoiceId) },
        {
            $push: { patients: patient } as any,
            $set: { updatedAt: new Date() }
        }
    )
}

export async function removePatientFromInvoice(invoiceId: string, patientId: string) {
    const db = await connectToDatabase()
    return await db.collection('invoice').updateOne(
        { _id: new ObjectId(invoiceId) },
        {
            $pull: { patients: { patientId } } as any,
            $set: { updatedAt: new Date() }
        }
    )
}

export async function updatePatientInInvoice(invoiceId: string, patientId: string, patientData: any) {
    const db = await connectToDatabase()
    const updateObj: any = {}
    for (const key in patientData) {
        updateObj[`patients.$.${key}`] = patientData[key]
    }
    return await db.collection('invoice').updateOne(
        { _id: new ObjectId(invoiceId), 'patients.patientId': patientId },
        {
            $set: { ...updateObj, updatedAt: new Date() }
        }
    )
}

export async function addVisitToPatient(invoiceId: string, patientId: string, visit: any) {
    const db = await connectToDatabase()
    return await db.collection('invoice').updateOne(
        { _id: new ObjectId(invoiceId), 'patients.patientId': patientId },
        {
            $push: { 'patients.$.visits': visit } as any,
            $set: { updatedAt: new Date() }
        }
    )
}

export async function updateVisitInPatient(invoiceId: string, patientId: string, visitId: string, visitData: any) {
    const db = await connectToDatabase()
    const updateObj: any = {}
    for (const key in visitData) {
        updateObj[`patients.$[p].visits.$[v].${key}`] = visitData[key]
    }
    return await db.collection('invoice').updateOne(
        { _id: new ObjectId(invoiceId) },
        {
            $set: { ...updateObj, updatedAt: new Date() }
        },
        {
            arrayFilters: [
                { 'p.patientId': patientId },
                { 'v._id': visitId }
            ]
        } as any
    )
}

export async function removeVisitFromPatient(invoiceId: string, patientId: string, visitId: string) {
    const db = await connectToDatabase()
    return await db.collection('invoice').updateOne(
        { _id: new ObjectId(invoiceId), 'patients.patientId': patientId },
        {
            $pull: { 'patients.$.visits': { _id: visitId } } as any,
            $set: { updatedAt: new Date() }
        }
    )
}
export async function fetchActivePatientIds() {
    const db = await connectToDatabase()
    const activeInvoices = await db.collection<IInvoice>('invoice').find({
        status: { $nin: [InvoiceStatus.Paid, InvoiceStatus.Void] }
    }).toArray()

    const patientIds = new Set<string>()
    activeInvoices.forEach(inv => {
        inv.patients?.forEach(p => {
            patientIds.add(p.patientId)
        })
    })

    return Array.from(patientIds)
}
