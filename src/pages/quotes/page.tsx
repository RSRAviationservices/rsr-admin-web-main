import { QuotesDataTable } from './table/quotes-data-table'

import PageHeader from '@/components/common/PageHeader'
import PageLayout from '@/layouts/PageLayout'

export default function QuotesPage() {
  return (
    <div>
      <PageHeader
        title="Quote Management"
        description="Create, send, and track the status of all customer quotes."
      />
      <PageLayout>
        <div className="flex flex-col px-8 py-8">
          <QuotesDataTable />
        </div>
      </PageLayout>
    </div>
  )
}
