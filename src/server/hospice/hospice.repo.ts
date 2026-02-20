import { ObjectId, type SortDirection } from 'mongodb'
import type { IHospice } from './hospice.schema'
import type { PaginationParams } from '@/types/pagination'
import { connectToDatabase } from '@/lib/db'

interface IHospiceDocument extends Omit<IHospice, '_id'> {
  _id: ObjectId
}

export async function fetchHospices({
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
      .collection<IHospiceDocument>('hospice')
      .find({})
      .sort(mongoSort)
      .skip(skip)
      .limit(pageSize)
      .toArray(),
    db.collection('hospice').countDocuments({}),
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

export async function insertHospice(hospice: { name: string }) {
  const db = await connectToDatabase()
  return await db.collection('hospice').insertOne({
    ...hospice,
    createdAt: new Date(),
    updatedAt: new Date(),
  })
}

export async function updateHospice(id: string, hospice: Partial<IHospice>) {
  const db = await connectToDatabase()
  const { _id, ...rest } = hospice
  return await db.collection('hospice').updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        ...rest,
        updatedAt: new Date(),
      },
    },
  )
}

export async function deleteHospice(id: string) {
  const db = await connectToDatabase()
  return await db.collection('hospice').deleteOne({ _id: new ObjectId(id) })
}

export async function getHospiceById(id: string) {
  const db = await connectToDatabase()
  return await db.collection<IHospiceDocument>('hospice').findOne({ _id: new ObjectId(id) })
}
