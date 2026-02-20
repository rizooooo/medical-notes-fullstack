import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
    Users,
    Building2,
} from 'lucide-react'
import { getHospice } from '@/server/hospice/hospice.functions'
import { getHospicePatients } from '@/server/patient/patient.functions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PatientDialog } from '@/components/patient/patient-dialog'
import { HospiceEditDrawer } from '@/components/hospice/hospice-edit-drawer'
import { HospiceHeader } from '@/components/hospice/hospice-header'
import { HospiceRegistryTab } from '@/components/hospice/hospice-registry-tab'
import { DetailWrapper } from '@/components/layout/DetailWrapper'
import { z } from 'zod'

const hospiceDetailSearchSchema = z.object({
    tab: z.enum(['registry', 'facility']).catch('registry'),
})

export const Route = createFileRoute('/hospice/$hospiceId')({
    validateSearch: (search) => hospiceDetailSearchSchema.parse(search),
    loader: async ({ params }) => {
        const [hospice, patients] = await Promise.all([
            getHospice({ data: params.hospiceId }),
            getHospicePatients({ data: params.hospiceId }),
        ])
        if (!hospice) throw new Error('Hospice not found')
        return { hospice, patients }
    },
    component: HospiceDetailPage,
})

function HospiceDetailPage() {
    const { hospice, patients } = Route.useLoaderData()
    const { tab } = Route.useSearch()
    const navigate = Route.useNavigate()

    const [isEditingHospice, setIsEditingHospice] = useState(false)
    const [isAddingPatient, setIsAddingPatient] = useState(false)
    const [editingPatient, setEditingPatient] = useState<any>(null)

    const tabs = [
        {
            value: 'registry',
            label: 'Patient Registry',
            icon: Users,
            count: patients.length,
            content: (
                <HospiceRegistryTab
                    patients={patients}
                    onEditPatient={(patient) => setEditingPatient(patient)}
                />
            ),
        },
        {
            value: 'facility',
            label: 'Facility Details',
            icon: Building2,
            content: (
                <div className="p-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <Building2 className="w-16 h-16 text-slate-200 mb-4" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Administrative Content Coming Soon</p>
                </div>
            ),
        },
    ]

    return (
        <DetailWrapper>
            <HospiceHeader
                hospice={hospice}
                patientCount={patients.length}
                onEdit={() => setIsEditingHospice(true)}
                onAddPatient={() => setIsAddingPatient(true)}
            />

            <Tabs
                value={tab}
                onValueChange={(v) => navigate({ search: (prev: any) => ({ ...prev, tab: v }) })}
                className="w-full space-y-8"
            >
                <div className="flex items-center justify-between border-b border-slate-200">
                    <TabsList className="h-14 bg-transparent p-0 gap-8 justify-start w-full sm:w-auto">
                        {tabs.map((tabItem) => (
                            <TabsTrigger
                                key={tabItem.value}
                                value={tabItem.value}
                                className="h-14 bg-transparent border-b-2 border-transparent data-[state=active]:border-indigo-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none rounded-none px-2 font-bold text-slate-500 data-[state=active]:text-indigo-600 transition-all gap-2 group whitespace-nowrap"
                            >
                                <tabItem.icon className="w-4 h-4 group-data-[state=active]:scale-110 transition-transform" />
                                {tabItem.label}
                                {tabItem.count !== undefined && (
                                    <span className="ml-1 bg-slate-100 group-data-[state=active]:bg-indigo-50 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-widest font-black transition-colors">
                                        {tabItem.count}
                                    </span>
                                )}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </div>

                {tabs.map((tabItem) => (
                    <TabsContent key={tabItem.value} value={tabItem.value} className="mt-0 outline-none focus-visible:ring-0">
                        {tabItem.content}
                    </TabsContent>
                ))}
            </Tabs>

            <HospiceEditDrawer
                hospice={hospice}
                open={isEditingHospice}
                onOpenChange={setIsEditingHospice}
            />

            <PatientDialog
                open={isAddingPatient || !!editingPatient}
                onOpenChange={(open) => {
                    if (!open) {
                        setIsAddingPatient(false)
                        setEditingPatient(null)
                    }
                }}
                hospiceId={hospice._id}
                editingPatient={editingPatient}
            />
        </DetailWrapper>
    )
}
