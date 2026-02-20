import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Users } from 'lucide-react'
import type { IInvoice } from '@/server/invoice/invoice.schema'
import { PatientSection } from './PatientSection'
import { AddPatientDialog } from './AddPatientDialog'

interface InvoicePatientListProps {
    invoice: IInvoice
}

export function InvoicePatientList({ invoice }: InvoicePatientListProps) {
    const [isAddPatientOpen, setIsAddPatientOpen] = useState(false)

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-1 print:hidden">
                <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <h2 className="text-sm font-bold text-foreground">Assigned Patients</h2>
                    <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-bold uppercase">
                        {invoice.patients.length} Total
                    </span>
                </div>
                <Button
                    size="sm"
                    onClick={() => setIsAddPatientOpen(true)}
                    variant="outline"
                    className="h-8 rounded-md text-xs font-bold"
                >
                    <Plus className="mr-1.5 h-3.5 w-3.5" /> Add Patient
                </Button>
            </div>

            {invoice.patients.length === 0 ? (
                <Card className="p-12 flex flex-col items-center justify-center border border-dashed rounded-lg bg-card print:hidden">
                    <Users className="w-8 h-8 text-muted-foreground/30 mb-2" />
                    <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider">No patients assigned</p>
                    <Button
                        onClick={() => setIsAddPatientOpen(true)}
                        variant="link"
                        className="mt-2 text-primary font-bold text-xs"
                    >
                        Add a patient record
                    </Button>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {invoice.patients.map((patient) => (
                        <PatientSection
                            key={patient.patientId}
                            invoiceId={invoice._id}
                            patient={patient}
                        />
                    ))}
                </div>
            )}

            <AddPatientDialog
                invoiceId={invoice._id}
                hospiceId={invoice.hospiceId}
                open={isAddPatientOpen}
                onOpenChange={setIsAddPatientOpen}
            />
        </div>
    )
}
