import KpiCards from './components/kpi-cards'
import VisitorsChart from './components/visitors-chart'

import PageHeader from '@/components/common/PageHeader'
import PageLayout from '@/layouts/PageLayout'

export default function DashboardPage() {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="A real-time overview of key metrics and recent activity."
      />
      <PageLayout>
        <div className="flex h-full flex-col gap-y-8 p-8">
          <KpiCards />
          <VisitorsChart />
        </div>
      </PageLayout>
    </div>
  )
}
