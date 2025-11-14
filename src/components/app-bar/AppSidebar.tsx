'use client'

import * as React from 'react'

import AppHeader from './AppHeader'
import { NavMain } from './NavMain'
import { NavUser } from './NavUser'
import { navItems } from './sidebar-data'

import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader } from '@/components/ui/sidebar'

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible={'none'}
      {...props}
      className="w-[14%] border-r bg-sidebar shadow-md h-screen"
    >
      <SidebarHeader className="p-2 border-b-1">
        <AppHeader role={'Super Admin'} />
      </SidebarHeader>
      <SidebarContent className="px-2 py-2.5">
        <NavMain items={navItems} />
      </SidebarContent>
      <SidebarFooter className="p-2 border-t">
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
