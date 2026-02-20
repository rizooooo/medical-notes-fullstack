import { ChevronDown, Building2, Users, Receipt, ShieldUser, LogOut, LayoutDashboard, Settings, User2, ChevronRight, Calendar as CalendarIcon, ClipboardCheck } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarFooter,
  SidebarRail,
} from '@/components/ui/sidebar'
import { logoutFn } from '@/server/employee/employee.functions'
import { useEffect, useState } from 'react'
import { ModeToggle } from './mode-toggle'

export function AppSidebar() {
  const [user, setUser] = useState<{ name: string; email: string; role: string } | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('mn-user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleSignOut = async () => {
    await logoutFn()
    localStorage.removeItem('mn-token')
    localStorage.removeItem('mn-user')
    window.location.href = '/login'
  }

  return (
    <Sidebar collapsible="icon" className="border-sidebar-border bg-sidebar transition-colors duration-300">
      <SidebarHeader className="h-14 flex items-center justify-center border-b border-sidebar-border transition-all duration-200 ease-in-out group-data-[collapsible=icon]:p-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
                    <Building2 className="size-4" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-bold text-foreground">MedicalNotes</span>
                    <span className="truncate text-xs font-medium text-muted-foreground">Cloud registry</span>
                  </div>
                  <ChevronDown className="ml-auto size-4 text-muted-foreground/50 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-popper-anchor-width] min-w-56 rounded-lg shadow-xl border-border bg-popover"
                align="start"
                side="bottom"
                sideOffset={4}
              >
                <DropdownMenuItem className="p-2 cursor-pointer gap-2 focus:bg-muted">
                  <div className="flex size-6 items-center justify-center rounded-sm border bg-background">
                    <Building2 className="size-4" />
                  </div>
                  <div className="grid flex-1">
                    <span className="text-xs font-bold text-foreground">Acme Health Admin</span>
                    <span className="text-[10px] text-muted-foreground">Default Registry</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="gap-0 py-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-4 mb-2 group-data-[collapsible=icon]:hidden">
            Clinical Operations
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Dashboard" className="h-9 px-4 transition-all">
                  <Link to="/" activeProps={{ className: "bg-primary text-primary-foreground" }}>
                    <LayoutDashboard className="size-4" />
                    <span className="text-xs font-bold">Overview</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Calendar" className="h-9 px-4 transition-all">
                  <Link to="/calendar" activeProps={{ className: "bg-primary text-primary-foreground" }}>
                    <CalendarIcon className="size-4" />
                    <span className="text-xs font-bold">Plotting Calendar</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Billing" className="h-9 px-4 transition-all">
                  <Link
                    to="/invoice"
                    search={{ page: 1, pageSize: 10 }}
                    activeProps={{ className: "bg-primary text-primary-foreground" }}
                  >
                    <Receipt className="size-4" />
                    <span className="text-xs font-bold">Billing Registry</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="QA Progress" className="h-9 px-4 transition-all">
                  <Link
                    to="/qa"
                    search={{ search: '' }}
                    activeProps={{ className: "bg-primary text-primary-foreground" }}
                  >
                    <ClipboardCheck className="size-4" />
                    <span className="text-xs font-bold">QA Progress</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Hospices" className="h-9 px-4 transition-all">
                  <Link
                    to="/hospice"
                    search={{ page: 1, pageSize: 10 }}
                    activeProps={{ className: "bg-primary text-primary-foreground" }}
                  >
                    <Building2 className="size-4" />
                    <span className="text-xs font-bold">Facilities</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Nurses" className="h-9 px-4 transition-all">
                  <Link
                    to="/nurse"
                    search={{ page: 1, pageSize: 10 }}
                    activeProps={{ className: "bg-primary text-primary-foreground" }}
                  >
                    <Users className="size-4" />
                    <span className="text-xs font-bold">Clinical Staff</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup className="mt-2">
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-4 mb-2 group-data-[collapsible=icon]:hidden">
            System
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Employees" className="h-9 px-4 transition-all">
                  <Link to="/employee" activeProps={{ className: "bg-primary text-primary-foreground" }}>
                    <ShieldUser className="size-4" />
                    <span className="text-xs font-bold">Manage Personnel</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings" className="h-9 px-4 transition-all">
                  <Link to="/" activeProps={{ className: "bg-primary text-primary-foreground" }}>
                    <Settings className="size-4" />
                    <span className="text-xs font-bold">Preferences</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2 gap-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest group-data-[collapsible=icon]:hidden">Appearance</span>
              <ModeToggle />
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500 shadow-sm font-bold text-xs border border-indigo-500/20">
                    {user?.name?.charAt(0) || <User2 className="size-4" />}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-bold text-foreground">{user?.name || 'Practitioner'}</span>
                    <span className="truncate text-[10px] font-medium text-muted-foreground">{user?.email || 'authenticated'}</span>
                  </div>
                  <ChevronRight className="ml-auto size-4 text-muted-foreground/50 group-data-[collapsible=icon]:hidden rotate-90 md:rotate-0" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-popper-anchor-width] min-w-56 rounded-lg shadow-xl border-border bg-popover"
                side="right"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem className="p-2 cursor-pointer gap-2 focus:bg-muted">
                  <User2 className="size-4 text-muted-foreground" />
                  <span className="text-xs font-bold text-foreground">Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="p-2 cursor-pointer gap-2 focus:bg-destructive/10 text-destructive focus:text-destructive"
                  onClick={handleSignOut}
                >
                  <LogOut className="size-4" />
                  <span className="text-xs font-bold">Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
