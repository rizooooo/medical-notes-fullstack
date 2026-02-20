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
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4 sticky top-0 z-10 transition-all duration-200 ease-in-out">
          <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
        </header>

        <div className="flex flex-1 flex-col p-4 lg:p-6 bg-background min-h-0">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
