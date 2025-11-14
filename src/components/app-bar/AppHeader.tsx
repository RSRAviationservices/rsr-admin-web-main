import { ShieldCheck } from 'lucide-react'

import { SidebarMenu, SidebarMenuItem } from '@/components/ui/sidebar'

interface AppHeaderProps {
  role: 'Super Admin' | 'Admin'
}

export default function AppHeader({ role }: AppHeaderProps) {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="p-0">
        <div className="flex w-full items-center gap-2 rounded-lg p-2">
          <div className="bg-primary text-primary-foreground flex size-9 shrink-0 items-center justify-center rounded-md">
            <ShieldCheck className="size-5" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate text-slate-950 font-bold">RSR Admin Console</span>
            <span className="text-muted-foreground truncate text-xs">{role}</span>
          </div>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
