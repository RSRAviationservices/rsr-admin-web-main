import { UsersDataTable } from './table/users-data-table'

import PageHeader from '@/components/common/PageHeader'
import PageLayout from '@/layouts/PageLayout'

export default function UsersPage() {
  return (
    <div>
      <PageHeader
        title="User Management"
        description="View and manage all registered end-user accounts."
      />
      <PageLayout>
        <div className="flex flex-col px-8 py-8">
          <UsersDataTable />
        </div>
      </PageLayout>
    </div>
  )
}
