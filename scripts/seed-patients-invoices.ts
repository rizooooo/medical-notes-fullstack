import { connectToDatabase } from '../src/lib/db'
import { EntityStatus } from '../src/types/status'
import { ActionDone, InvoiceStatus, NoteStatus, RemarkCategory, VisitType } from '../src/types/invoice'

const firstNames = [
    'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William',
    'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia', 'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander'
]

const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
    'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson'
]

const diagnoses = [
    'Congestive Heart Failure', 'End Stage Renal Disease', 'Alzheimers Disease',
    'Generalized Debility', 'failure to Thrive', 'Lung Cancer', 'COPD',
    'Parkinsons Disease', 'Dementia', 'Senile Degeneration'
]

function getRandom<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)]
}

async function main() {
    console.log('🌱 Starting patient and invoice seeding...')
    const db = await connectToDatabase()

    // 1. Get some hospices and nurses
    const hospices = await db.collection('hospice').find({ status: EntityStatus.ACTIVE }).limit(5).toArray()
    const nurses = await db.collection('nurse').find({ status: EntityStatus.ACTIVE }).limit(5).toArray()

    if (hospices.length === 0 || nurses.length === 0) {
        console.error('❌ Error: Need at least one active hospice and nurse in the DB. Run seed-hospices.ts and seed-nurses.ts first.')
        process.exit(1)
    }

    // 2. Clear existing patients and invoices to avoid confusion (optional, but cleaner for a demo)
    // await db.collection('patient').deleteMany({})
    // await db.collection('invoice').deleteMany({})

    const patientRecords: any[] = []

    // 3. Generate Patients for each hospice
    for (const hospice of hospices) {
        const patientCount = 10 + Math.floor(Math.random() * 10)
        for (let i = 0; i < patientCount; i++) {
            const firstName = getRandom(firstNames)
            const lastName = getRandom(lastNames)
            const date = new Date()
            date.setDate(date.getDate() - Math.floor(Math.random() * 365))

            patientRecords.push({
                name: `${firstName} ${lastName}`,
                age: 65 + Math.floor(Math.random() * 30),
                diagnosis: getRandom(diagnoses),
                status: EntityStatus.ACTIVE,
                hospiceId: hospice._id.toString(),
                nurseId: getRandom(nurses)._id.toString(),
                createdAt: date,
                updatedAt: date,
            })
        }
    }

    const patientResult = await db.collection('patient').insertMany(patientRecords)
    const insertedPatients = await db.collection('patient').find({ _id: { $in: Object.values(patientResult.insertedIds) } }).toArray()
    console.log(`✅ Inserted ${insertedPatients.length} patients.`)

    // 4. Generate Invoices
    const invoiceRecords: any[] = []
    const statuses = [InvoiceStatus.Draft, InvoiceStatus.Sent, InvoiceStatus.Paid, InvoiceStatus.Overdue]

    for (const hospice of hospices) {
        for (const nurse of nurses) {
            // Generate 2 invoices per hospice/nurse pair for different months
            for (let m = 1; m <= 2; m++) {
                const monthDate = new Date()
                monthDate.setMonth(monthDate.getMonth() - m)
                monthDate.setDate(1)

                const periodStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
                const periodEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

                const hospicePatients = insertedPatients.filter(p => p.hospiceId === hospice._id.toString())
                const assignedPatients = hospicePatients.slice(0, 3 + Math.floor(Math.random() * 5))

                const patientsForInvoice = assignedPatients.map(p => {
                    const visits = []
                    const visitCount = 2 + Math.floor(Math.random() * 4)
                    let totalPatientRate = 0

                    for (let v = 0; v < visitCount; v++) {
                        const serviceDate = new Date(periodStart)
                        serviceDate.setDate(serviceDate.getDate() + Math.floor(Math.random() * 28))

                        const rate = 120 + (Math.floor(Math.random() * 5) * 10)
                        totalPatientRate += rate

                        visits.push({
                            _id: `v-${Math.random().toString(36).substr(2, 9)}`,
                            serviceDate,
                            visitType: getRandom(Object.values(VisitType)),
                            actionsDone: getRandom(Object.values(ActionDone)),
                            remarks: getRandom(Object.values(RemarkCategory)),
                            customRemark: Math.random() > 0.7 ? 'Patient was stable during visit.' : '',
                            plottedBy: 'Nikko (System)',
                            rnCompletedBy: nurse.name,
                            timeIn: '09:00 AM',
                            timeOut: '10:30 AM',
                            noteStatus: getRandom(Object.values(NoteStatus)),
                            rate: rate,
                        })
                    }

                    return {
                        patientId: p._id.toString(),
                        patientName: p.name,
                        mrn: `MRN-${Math.floor(Math.random() * 90000) + 10000}`,
                        isDischarged: false,
                        visits: visits
                    }
                })

                const totalAmount = patientsForInvoice.reduce((sum, p) => sum + p.visits.reduce((vSum, v) => vSum + v.rate, 0), 0)

                invoiceRecords.push({
                    invoiceNumber: `INV-${monthDate.getFullYear()}${String(monthDate.getMonth() + 1).padStart(2, '0')}-${Math.floor(Math.random() * 9000) + 1000}`,
                    hospiceId: hospice._id.toString(),
                    hospiceName: hospice.name,
                    nurseId: nurse._id.toString(),
                    nurseName: nurse.name,
                    periodStart,
                    periodEnd,
                    totalAmount,
                    status: getRandom(statuses),
                    patients: patientsForInvoice,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                })
            }
        }
    }

    const invoiceResult = await db.collection('invoice').insertMany(invoiceRecords)
    console.log(`✅ Inserted ${invoiceResult.insertedCount} invoices.`)

    process.exit(0)
}

main().catch(error => {
    console.error('❌ Seeding failed:', error)
    process.exit(1)
})
