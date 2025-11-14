import { AdminsDataTable } from './table/admins-data-table'

import PageHeader from '@/components/common/PageHeader'
import PageLayout from '@/layouts/PageLayout'

export default function AdminsPage() {
  return (
    <div>
      <PageHeader
        title="Administrator Management"
        description="Add, remove, and manage accounts for your admin team."
      />
      <PageLayout>
        <div className="flex flex-col px-8 py-8">
          <AdminsDataTable />
        </div>
      </PageLayout>
    </div>
  )
}
