import { createServerFn } from '@tanstack/react-start'
import type { IHospice } from '@/types/hospice'
import { connectToDatabase } from '@/lib/db'

export const getAllHospices = createServerFn({ method: 'GET' }).handler(
  async () => {
    const db = await connectToDatabase()
    const restaurants = await db
      .collection<IHospice>('hospice')
      .find({})
      .limit(100)
      .toArray()
    return restaurants.map((restaurant) => ({
      ...restaurant,
      _id: restaurant._id.toString(),
    }))
  },
)
