import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
    Users,
    Activity,
    Settings,
    Shield,
} from 'lucide-react'
import { getNurse } from '@/server/nurse/nurse.functions'
import { getNursePatients } from '@/server/patient/patient.functions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { NurseEditDrawer } from '@/components/nurse/nurse-edit-drawer'
import { NurseHeader } from '@/components/nurse/nurse-header'
import { NursePatientsTab } from '@/components/nurse/nurse-patients-tab'
import { NurseLogsTab } from '@/components/nurse/nurse-logs-tab'
import { NurseSettingsTab } from '@/components/nurse/nurse-settings-tab'
import { DetailWrapper } from '@/components/layout/DetailWrapper'
import { Card } from '@/components/ui/card'
import { z } from 'zod'

const nurseDetailSearchSchema = z.object({
    tab: z.enum(['patients', 'logs', 'credentials', 'settings']).catch('patients'),
})

export const Route = createFileRoute('/_authenticated/nurse/$nurseId')({
    validateSearch: (search) => nurseDetailSearchSchema.parse(search),
    loader: async ({ params }) => {
        const [nurse, patients] = await Promise.all([
            getNurse({ data: params.nurseId }),
            getNursePatients({ data: params.nurseId }),
        ])
        if (!nurse) throw new Error('Nurse not found')
        return { nurse, patients }
    },
    component: NurseDetailPage,
})

function NurseDetailPage() {
    const { nurse, patients } = Route.useLoaderData()
    const { tab } = Route.useSearch()
    const navigate = Route.useNavigate()

    const [isEditing, setIsEditing] = useState(false)

    return (
        <DetailWrapper className="p-4 lg:p-6">
            <NurseHeader nurse={nurse} onEdit={() => setIsEditing(true)} />

            <Tabs
                value={tab}
                onValueChange={(v) => navigate({ search: (prev: any) => ({ ...prev, tab: v }) })}
                className="w-full mt-4"
            >
                <div className="flex items-center justify-between px-1 mb-4">
                    <TabsList className="bg-slate-100/50 p-1 rounded-md h-9 border">
                        <TabsTrigger
                            value="patients"
                            className="rounded-sm px-4 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all gap-1.5"
                        >
                            <Users className="w-3.5 h-3.5" /> Patients ({patients.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="logs"
                            className="rounded-sm px-4 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all gap-1.5"
                        >
                            <Activity className="w-3.5 h-3.5" /> Activity Logs
                        </TabsTrigger>
                        <TabsTrigger
                            value="credentials"
                            className="rounded-sm px-4 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all gap-1.5"
                        >
                            <Shield className="w-3.5 h-3.5" /> Hospice Credentials
                        </TabsTrigger>
                        <TabsTrigger
                            value="settings"
                            className="rounded-sm px-4 text-xs font-bold data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm transition-all gap-1.5"
                        >
                            <Settings className="w-3.5 h-3.5" /> Personnel Settings
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="patients" className="mt-0 ring-0 focus-visible:ring-0 outline-none">
                    <NursePatientsTab patients={patients} />
                </TabsContent>

                <TabsContent value="logs" className="mt-0 ring-0 focus-visible:ring-0 outline-none">
                    <NurseLogsTab nurse={nurse} />
                </TabsContent>

                <TabsContent value="credentials" className="mt-0 ring-0 focus-visible:ring-0 outline-none">
                    <NurseSettingsTab nurse={nurse} />
                </TabsContent>

                <TabsContent value="settings" className="mt-0 ring-0 focus-visible:ring-0 outline-none">
                    <Card className="border-none shadow-xl border-slate-200/60 bg-white/50 backdrop-blur-xl rounded-3xl overflow-hidden min-h-[400px] flex items-center justify-center">
                        <div className="flex flex-col items-center gap-4 text-slate-300">
                            <Settings className="w-16 h-16 opacity-20" />
                            <span className="font-black text-2xl uppercase tracking-tighter opacity-10">Advanced Settings</span>
                        </div>
                    </Card>
                </TabsContent>
            </Tabs>

            <NurseEditDrawer nurse={nurse} open={isEditing} onOpenChange={setIsEditing} />
        </DetailWrapper>
    )
}
