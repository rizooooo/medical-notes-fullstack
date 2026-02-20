import { connectToDatabase } from '../src/lib/db'
import { EntityStatus } from '../src/types/status'

const prefixes = [
  'Sunny', 'Green', 'River', 'Golden', 'Silver', 'Crystal', 'Peaceful', 'Comfort', 'Loving', 'Saint',
  'Holy', 'Angel', 'Harmony', 'Serenity', 'Tranquil', 'Gentle', 'Hope', 'Grace', 'Faith', 'Mercy',
]
const suffixes = [
  'Vale', 'View', 'Side', 'Meadow', 'Hill', 'Garden', 'Path', 'Way', 'Stream', 'Brook',
  'Wood', 'Forest', 'Grove', 'Spring', 'Lake', 'Bay', 'Shore', 'Haven', 'Rest', 'Home',
]
const types = [
  'Hospice', 'Care Center', 'Palliative Care', 'Nursing Home', 'Senior Living', 'Retreat', 'Residence',
]

const statuses = [EntityStatus.ACTIVE, EntityStatus.INACTIVE]

function generateHospices(count: number) {
  const hospices = []
  for (let i = 0; i < count; i++) {
    const p = prefixes[Math.floor(Math.random() * prefixes.length)]
    const s = suffixes[Math.floor(Math.random() * suffixes.length)]
    const t = types[Math.floor(Math.random() * types.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]

    const date = new Date()
    date.setDate(date.getDate() - Math.floor(Math.random() * 730))

    hospices.push({
      name: `${p}${s} ${t}`,
      status,
      createdAt: date,
      updatedAt: date,
    })
  }
  return hospices
}

async function main() {
  console.log('🌱 Seeding database...')
  const db = await connectToDatabase()

  const data = generateHospices(200)
  const result = await db.collection('hospice').insertMany(data)

  console.log(`✅ Successfully inserted ${result.insertedCount} hospices!`)
  process.exit(0)
}

main().catch(console.error)
