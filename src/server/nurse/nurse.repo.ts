import { ObjectId, type SortDirection } from 'mongodb'
import type { INurse } from './nurse.schema'
import type { PaginationParams } from '@/types/pagination'
import { connectToDatabase } from '@/lib/db'

// Internal document interface for DB operations
interface INurseDocument extends Omit<INurse, '_id'> {
    _id: ObjectId
}

export async function fetchNurses({
    page = 1,
    pageSize = 10,
    sorting = [],
}: PaginationParams) {
    const db = await connectToDatabase()
    const skip = (page - 1) * pageSize

    const mongoSort: Record<string, SortDirection> = {}

    if (sorting.length > 0) {
        sorting.forEach((sort) => {
            if (['name', 'createdAt', 'updatedAt'].includes(sort.id)) {
                mongoSort[sort.id] = sort.desc ? -1 : 1
            }
        })
    } else {
        mongoSort.createdAt = -1
    }

    const [data, total] = await Promise.all([
        db
            .collection<INurseDocument>('nurse')
            .find({})
            .sort(mongoSort)
            .skip(skip)
            .limit(pageSize)
            .toArray(),
        db.collection('nurse').countDocuments({}),
    ])

    return {
        data,
        metadata: {
            total,
            page,
            pageSize,
            pageCount: Math.ceil(total / pageSize),
        },
    }
}

export async function insertNurse(nurse: { name: string }) {
    const db = await connectToDatabase()
    return await db.collection('nurse').insertOne({
        ...nurse,
        createdAt: new Date(),
        updatedAt: new Date(),
    })
}

export async function updateNurse(id: string, nurse: Partial<INurse>) {
    const db = await connectToDatabase()
    const { _id, auditLog, ...rest } = nurse as any

    const updateQuery: any = {
        $set: {
            ...rest,
            updatedAt: new Date(),
        }
    }

    if (auditLog) {
        updateQuery.$push = { auditLog }
    }

    return await db.collection('nurse').updateOne(
        { _id: new ObjectId(id) },
        updateQuery
    )
}

export async function deleteNurse(id: string) {
    const db = await connectToDatabase()
    return await db.collection('nurse').deleteOne({ _id: new ObjectId(id) })
}

export async function getNurseById(id: string) {
    const db = await connectToDatabase()
    return await db.collection<INurseDocument>('nurse').findOne({ _id: new ObjectId(id) })
}
export async function getNursesByHospiceCredential(hospiceId: string) {
    const db = await connectToDatabase()
    return await db.collection<INurseDocument>('nurse').find({
        'credentials.hospiceId': hospiceId
    }).toArray()
}
