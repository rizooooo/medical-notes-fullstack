import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
    Users,
    Activity,
    Settings,
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
import { z } from 'zod'

const nurseDetailSearchSchema = z.object({
    tab: z.enum(['patients', 'logs', 'settings']).catch('patients'),
})

export const Route = createFileRoute('/nurse/$nurseId')({
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

    const tabs = [
        {
            value: 'patients',
            label: 'Assigned Patients',
            icon: Users,
            count: patients.length,
            content: <NursePatientsTab patients={patients} />,
        },
        {
            value: 'logs',
            label: 'Activity Logs',
            icon: Activity,
            content: <NurseLogsTab />,
        },
        {
            value: 'settings',
            label: 'Personnel Settings',
            icon: Settings,
            content: <NurseSettingsTab />,
        },
    ]

    return (
        <DetailWrapper>
            <NurseHeader nurse={nurse} onEdit={() => setIsEditing(true)} />

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

            <NurseEditDrawer nurse={nurse} open={isEditing} onOpenChange={setIsEditing} />
        </DetailWrapper>
    )
}
