import { Outlet } from 'react-router-dom'

import { AppSidebar } from '@/components/app-bar/AppSidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export default function AdminLayout() {
  return (
    <div className="max-h-screen w-screen h-screen max-w-screen overflow-hidden">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <main className="flex-1 max-h-screen">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
