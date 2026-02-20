import { connectToDatabase } from '@/lib/db'
import { ObjectId } from 'mongodb'
import type { IEmployee, IInvite } from './employee.schema'

const COLLECTION_NAME = 'employee'
const INVITE_COLLECTION = 'invite'

export async function getEmployeeByEmail(email: string): Promise<IEmployee | null> {
    const db = await connectToDatabase()
    const employee = await db.collection(COLLECTION_NAME).findOne({ email })
    if (!employee) return null
    return { ...employee, _id: employee._id.toString() } as IEmployee
}

export async function createEmployee(data: Partial<IEmployee>): Promise<string> {
    const db = await connectToDatabase()
    const { _id, ...rest } = data
    const result = await db.collection(COLLECTION_NAME).insertOne({
        ...rest,
        createdAt: new Date(),
        updatedAt: new Date(),
    } as any)
    return result.insertedId.toString()
}

export async function getEmployees(query: any = {}): Promise<IEmployee[]> {
    const db = await connectToDatabase()
    const employees = await db.collection(COLLECTION_NAME).find(query).toArray()
    return employees.map(emp => ({ ...emp, _id: emp._id.toString() })) as IEmployee[]
}

export async function getEmployeeById(id: string): Promise<IEmployee | null> {
    const db = await connectToDatabase()
    const employee = await db.collection(COLLECTION_NAME).findOne({ _id: new ObjectId(id) })
    if (!employee) return null
    return { ...employee, _id: employee._id.toString() } as IEmployee
}

export async function updateEmployee(id: string, data: Partial<IEmployee>): Promise<void> {
    const db = await connectToDatabase()
    const { _id, ...rest } = data
    await db.collection(COLLECTION_NAME).updateOne(
        { _id: new ObjectId(id) },
        { $set: { ...rest, updatedAt: new Date() } }
    )
}

// Invite related
export async function createInvite(data: Partial<IInvite>): Promise<string> {
    const db = await connectToDatabase()
    const { _id, ...rest } = data
    const result = await db.collection(INVITE_COLLECTION).insertOne({
        ...rest,
        createdAt: new Date(),
    } as any)
    return result.insertedId.toString()
}

export async function getInviteByToken(token: string): Promise<IInvite | null> {
    const db = await connectToDatabase()
    const invite = await db.collection(INVITE_COLLECTION).findOne({ token, used: false })
    if (!invite) return null
    return { ...invite, _id: invite._id.toString() } as IInvite
}

export async function markInviteUsed(id: string): Promise<void> {
    const db = await connectToDatabase()
    await db.collection(INVITE_COLLECTION).updateOne(
        { _id: new ObjectId(id) },
        { $set: { used: true } }
    )
}
