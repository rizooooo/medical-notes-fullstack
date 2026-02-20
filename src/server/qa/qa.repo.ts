import { ObjectId } from 'mongodb'
import { connectToDatabase } from '@/lib/db'
import type { IQAAssignment } from './qa.schema'

export async function fetchQAAssignments(hospiceName?: string) {
    const db = await connectToDatabase()
    const query = hospiceName ? { hospiceName: { $regex: hospiceName, $options: 'i' } } : {}
    return await db.collection<IQAAssignment>('qa_assignments').find(query).sort({ month: -1, year: -1 }).toArray()
}

export async function getQAAssignmentById(id: string) {
    const db = await connectToDatabase()
    const result = await db.collection<IQAAssignment>('qa_assignments').findOne({ _id: new ObjectId(id) } as any)
    if (result) {
        return {
            ...result,
            _id: result._id.toString()
        }
    }
    return null
}

export async function updateQADocumentStatus(
    assignmentId: string,
    patientId: string,
    columnId: string,
    status: string,
    auditTrail: any
) {
    const db = await connectToDatabase()
    const key = `reviews.$.documents.${columnId}.status`

    return await db.collection('qa_assignments').updateOne(
        {
            _id: new ObjectId(assignmentId) as any,
            'reviews.patientId': patientId
        },
        {
            $set: {
                [key]: status,
                [`reviews.$.documents.${columnId}.comment`]: auditTrail.changes[0].comment || '',
                updatedAt: new Date()
            },
            $push: {
                [`reviews.$.documents.${columnId}.auditLog`]: auditTrail,
                [`reviews.$.auditLog`]: auditTrail,
                auditLog: auditTrail
            }
        }
    )
}

export async function updateQARemark(
    assignmentId: string,
    patientId: string,
    remark: string,
    auditTrail: any
) {
    const db = await connectToDatabase()
    return await db.collection('qa_assignments').updateOne(
        {
            _id: new ObjectId(assignmentId) as any,
            'reviews.patientId': patientId
        },
        {
            $set: {
                'reviews.$.remarks': remark,
                updatedAt: new Date()
            },
            $push: {
                [`reviews.$.auditLog`]: auditTrail,
                auditLog: auditTrail
            }
        }
    )
}

export async function insertQAAssignment(assignment: Omit<IQAAssignment, '_id' | 'createdAt' | 'updatedAt'>) {
    const db = await connectToDatabase()
    return await db.collection('qa_assignments').insertOne({
        ...assignment,
        createdAt: new Date(),
        updatedAt: new Date()
    } as any)
}

export async function findQAAssignment(hospiceId: string, month: number, year: number) {
    const db = await connectToDatabase()
    const result = await db.collection<IQAAssignment>('qa_assignments').findOne({
        hospiceId,
        month,
        year
    })
    if (result) {
        return {
            ...result,
            _id: result._id.toString()
        }
    }
    return null
}

export async function updateQAAssignmentMetadata(assignmentId: string, metadata: Partial<IQAAssignment>, auditTrail: any) {
    const db = await connectToDatabase()
    return await db.collection('qa_assignments').updateOne(
        { _id: new ObjectId(assignmentId) as any },
        {
            $set: {
                ...metadata,
                updatedAt: new Date()
            },
            $push: {
                auditLog: auditTrail
            }
        }
    )
}
