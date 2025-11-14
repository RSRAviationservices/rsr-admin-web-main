'use client'

import { ChevronRight, type LucideIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'

type NavItem = {
  title: string
  url: string
  icon?: LucideIcon
  items?: { title: string; url: string }[]
}

export function NavMain({ items }: { items: NavItem[] }) {
  const { pathname } = useLocation()

  return (
    <SidebarMenu>
      {items.map((item) => {
        const isActive = pathname.startsWith(item.url)
        const isChildActive = !!item.items?.find((child) => child.url === pathname)

        return (
          <Collapsible
            key={item.title}
            asChild
            className="group/collapsible"
            defaultOpen={isChildActive}
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  asChild
                  className={cn(
                    'relative flex items-center my-0.5 gap-3 px-3 py-2.5 rounded transition-colors',
                    !isActive && 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                    isActive &&
                      "bg-sidebar-accent text-sidebar-accent-foreground before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:w-1 before:bg-primary before:rounded-r-lg"
                  )}
                >
                  <Link to={item.url}>
                    {item.icon && <item.icon className="h-6 w-6" />}
                    <span className="text-base font-medium">{item.title}</span>
                    {item.items && (
                      <ChevronRight className="ml-auto h-5 w-5 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    )}
                  </Link>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              {item.items && (
                <CollapsibleContent>
                  <SidebarMenuSub className="ml-8 mt-1 space-y-1">
                    {item.items.map((subItem) => {
                      const isSubActive = pathname === subItem.url
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link
                              to={subItem.url}
                              className={cn(
                                'block px-3 py-1.5 text-sm hover:text-foreground',
                                isSubActive
                                  ? 'text-foreground font-semibold'
                                  : 'text-muted-foreground'
                              )}
                            >
                              {subItem.title}
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              )}
            </SidebarMenuItem>
          </Collapsible>
        )
      })}
    </SidebarMenu>
  )
}
