import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
    Users,
    Building2,
    Settings2
} from 'lucide-react'
import { getHospice } from '@/server/hospice/hospice.functions'
import { getHospicePatients } from '@/server/patient/patient.functions'
import { getHospiceCredentialsFn } from '@/server/nurse/nurse.functions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PatientDialog } from '@/components/patient/patient-dialog'
import { HospiceEditDrawer } from '@/components/hospice/hospice-edit-drawer'
import { HospiceHeader } from '@/components/hospice/hospice-header'
import { HospiceRegistryTab } from '@/components/hospice/hospice-registry-tab'
import { HospiceCredentialsTab } from '@/components/hospice/hospice-credentials-tab'
import { HospiceQAConfigTab } from '@/components/hospice/hospice-qa-config-tab'
import { DetailWrapper } from '@/components/layout/DetailWrapper'
import { z } from 'zod'

const hospiceDetailSearchSchema = z.object({
    tab: z.enum(['registry', 'facility', 'credentials', 'qa']).catch('registry'),
})

export const Route = createFileRoute('/_authenticated/hospice/$hospiceId')({
    validateSearch: (search: any) => hospiceDetailSearchSchema.parse(search),
    loader: async ({ params }) => {
        const [hospice, patients, nurses] = await Promise.all([
            getHospice({ data: params.hospiceId }),
            getHospicePatients({ data: params.hospiceId }),
            getHospiceCredentialsFn({ data: params.hospiceId })
        ])
        if (!hospice) throw new Error('Hospice not found')
        return { hospice, patients, nurses }
    },
    component: HospiceDetailPage,
})

function HospiceDetailPage() {
    const { hospice, patients, nurses } = Route.useLoaderData()
    const { tab } = Route.useSearch()
    const navigate = Route.useNavigate()

    const [isEditingHospice, setIsEditingHospice] = useState(false)
    const [isAddingPatient, setIsAddingPatient] = useState(false)
    const [editingPatient, setEditingPatient] = useState<any>(null)

    return (
        <DetailWrapper className="p-4 lg:p-6">
            <HospiceHeader
                hospice={hospice}
                patientCount={patients.length}
                onEdit={() => setIsEditingHospice(true)}
                onAddPatient={() => setIsAddingPatient(true)}
            />

            <Tabs
                value={tab}
                onValueChange={(v) => navigate({ search: (prev: any) => ({ ...prev, tab: v }) })}
                className="w-full mt-4"
            >
                <div className="flex items-center justify-between px-1 mb-4">
                    <TabsList className="bg-slate-100/50 p-1 rounded-md h-9 border">
                        <TabsTrigger
                            value="registry"
                            className="rounded-sm px-4 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all gap-1.5"
                        >
                            <Users className="w-3.5 h-3.5" /> Patient Registry ({patients.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="credentials"
                            className="rounded-sm px-4 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all gap-1.5"
                        >
                            <Building2 className="w-3.5 h-3.5" /> Staff Credentials ({nurses.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="facility"
                            className="rounded-sm px-4 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all gap-1.5"
                        >
                            <Building2 className="w-3.5 h-3.5" /> Facility Details
                        </TabsTrigger>
                        <TabsTrigger
                            value="qa"
                            className="rounded-sm px-4 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all gap-1.5"
                        >
                            <Settings2 className="w-3.5 h-3.5 text-indigo-500" /> QA Configuration
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="registry" className="mt-0 ring-0 focus-visible:ring-0 outline-none">
                    <HospiceRegistryTab
                        patients={patients}
                        onEditPatient={(patient) => setEditingPatient(patient)}
                    />
                </TabsContent>

                <TabsContent value="credentials" className="mt-0 ring-0 focus-visible:ring-0 outline-none">
                    <HospiceCredentialsTab nurses={nurses} hospiceId={hospice._id} />
                </TabsContent>

                <TabsContent value="facility" className="mt-0 ring-0 focus-visible:ring-0 outline-none">
                    <div className="p-12 flex flex-col items-center justify-center border border-dashed rounded-md bg-white">
                        <Building2 className="w-8 h-8 text-slate-200 mb-2" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Administrative Content Coming Soon</p>
                    </div>
                </TabsContent>

                <TabsContent value="qa" className="mt-0 ring-0 focus-visible:ring-0 outline-none">
                    <HospiceQAConfigTab hospice={hospice} />
                </TabsContent>
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
