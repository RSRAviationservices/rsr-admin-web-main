import { PlaneTakeoff } from 'lucide-react'
import { BarLoader } from 'react-spinners'

import { FooterStrip } from '@/components/common/FooterStrip'

export default function LoadingPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="mb-4 flex items-center justify-center rounded-lg bg-primary p-4 text-primary-foreground">
          <PlaneTakeoff size={40} />
        </div>
        <BarLoader />
        <p className="text-muted-foreground">RSR Admin Software</p>
      </div>
      <FooterStrip />
    </div>
  )
}
