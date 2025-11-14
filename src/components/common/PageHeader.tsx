interface PageHeaderProps {
  title: string
  description: string
}

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div className="border-b px-8 py-2.5">
      <p className="text-xl font-black tracking-tight">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
