import { AppSidebar } from '@/components/app-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4 sticky top-0 z-50 transition-all duration-200 ease-in-out">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
        </header>

        <main className="flex-1 min-h-0 bg-background relative overflow-hidden">
          <div className="h-full w-full">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
