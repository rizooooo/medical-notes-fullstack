import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import SidebarLayout from '@/layout/sidebarlayout'
import { getCookie } from '@tanstack/react-start/server'

export const Route = createFileRoute('/_authenticated')({
    beforeLoad: async ({ location }) => {
        let token: string | undefined

        if (typeof window !== 'undefined') {
            token = localStorage.getItem('mn-token') || undefined
        } else {
            // SSR check
            token = getCookie('mn-token')
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
