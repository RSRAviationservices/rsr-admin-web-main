// components/FooterStrip.tsx
import { Rotate3d } from 'lucide-react'
import type { FC } from 'react'

interface FooterStripProps {
  link?: string
}

export const FooterStrip: FC<FooterStripProps> = ({ link = 'https://github.com/pegasus' }) => {
  return (
    <div className="absolute bottom-0 left-0 w-full border-t border-slate-200 bg-white px-4 py-1.5 text-xs flex items-center justify-between">
      {/* Left side: Status */}
      <div className="flex items-center text-xs gap-x-2">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <span className="font-medium text-slate-700">All systems normal</span>
        <p className=" text-muted-foreground">Version 1.0.1</p>
      </div>

      {/* Right side: Credits */}
      <div className="flex items-center gap-1.5 text-slate-600">
        <Rotate3d className="h-3.5 w-3.5 " />
        <span>Designed & Developed by</span>
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-slate-950 hover:underline"
        >
          Pegasus
        </a>
      </div>
    </div>
  )
}
