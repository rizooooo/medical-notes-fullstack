import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import SidebarLayout from '@/layout/sidebarlayout'
import { createServerFn } from '@tanstack/react-start'

const getToken = createServerFn({ method: "GET" }).handler(async () => {
    const { getCookie } = await import('@tanstack/react-start/server')
    return getCookie('mn-token')
})

export const Route = createFileRoute('/_authenticated')({
    beforeLoad: async ({ location }) => {
        let token: string | undefined

        if (typeof window !== 'undefined') {
            token = localStorage.getItem('mn-token') || undefined
        } else {
            // SSR check
            token = await getToken()
        }

        if (!token) {
            throw redirect({
                to: '/login',
                search: {
                    redirect: location.href,
                },
            })
        }
    },
    component: AuthenticatedLayout,
})

function AuthenticatedLayout() {
    return (
        <SidebarLayout>
            <Outlet />
        </SidebarLayout>
    )
}
