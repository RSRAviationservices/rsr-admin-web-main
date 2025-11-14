import { LeadsDataTable } from './table/leads-data-table'

import PageHeader from '@/components/common/PageHeader'
import PageLayout from '@/layouts/PageLayout'

export default function LeadsPage() {
  return (
    <div>
      <PageHeader
        title="Lead Management"
        description="Manage and track all potential customer leads from various sources."
      />
      <PageLayout>
        <div className="flex flex-col px-8 py-8">
          <LeadsDataTable />
        </div>
      </PageLayout>
    </div>
  )
}
