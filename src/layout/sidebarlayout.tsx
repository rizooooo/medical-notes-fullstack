import { AppSidebar } from '@/components/app-sidebar'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger, // <--- Import this
} from '@/components/ui/sidebar'
// adjust path as needed

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />

      {/* Replace <main> with <SidebarInset> */}
      <SidebarInset>
        {/* 1. Put the Trigger in a specific Header area */}
        <header className="flex h-12 shrink-0 items-center gap-2 px-4 border-b">
          <SidebarTrigger className="-ml-1" />
          {/* You can add Breadcrumbs here later */}
        </header>

        {/* 2. Create a content wrapper with Padding (p-4 or p-8) */}
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
