export default function DashboardFooter() {
  return (
    <div className="absolute bottom-0 left-0 w-full border-t border-slate-200 bg-white px-4 py-1.5 text-xs flex items-center justify-between">
      {/* Left side: Status */}
      <div className="flex items-center text-xs gap-x-2">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        <span className="font-medium text-slate-700">All systems normal</span>
        <p className=" text-muted-foreground">Version 1.0.1</p>
      </div>
    </div>
  )
}
