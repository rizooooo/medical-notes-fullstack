import { connectToDatabase } from '../src/lib/db'
import { EntityStatus } from '../src/types/status'

const firstNames = [
    'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William',
    'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander',
    'Abigail', 'Michael', 'Emily', 'Daniel', 'Elizabeth', 'Jacob', 'Sofia', 'Logan', 'Avery', 'Jackson'
]

const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
    'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
]

const statuses = [EntityStatus.ACTIVE, EntityStatus.INACTIVE, EntityStatus.IN_REVIEW]

function generateNurses(count: number) {
    const nurses = []
    for (let i = 0; i < count; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
        const status = statuses[Math.floor(Math.random() * statuses.length)]

        const date = new Date()
        date.setDate(date.getDate() - Math.floor(Math.random() * 730))

        nurses.push({
            name: `${firstName} ${lastName}`,
            status,
            createdAt: date,
            updatedAt: date,
        })
    }
    return nurses
}

async function main() {
    console.log('🌱 Seeding nurses database...')
    const db = await connectToDatabase()

    const data = generateNurses(50)
    const result = await db.collection('nurse').insertMany(data)

    console.log(`✅ Successfully inserted ${result.insertedCount} nurses!`)
    process.exit(0)
}

main().catch(console.error)
