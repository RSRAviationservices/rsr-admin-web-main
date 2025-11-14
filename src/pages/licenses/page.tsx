import { LicensesDataTable } from './components/licenses-data-table'

import PageHeader from '@/components/common/PageHeader'
import PageLayout from '@/layouts/PageLayout'

export default function LicensePage() {
  return (
    <div>
      <PageHeader
        title="License & Plan Information"
        description="View your current software license, plan details, and usage limits."
      />
      <PageLayout>
        <div className="flex flex-col px-8 py-8">
          <LicensesDataTable />
        </div>
      </PageLayout>
    </div>
  )
}
