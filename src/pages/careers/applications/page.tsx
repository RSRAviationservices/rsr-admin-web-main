import { ApplicationStatsCards } from "./components/ApplicationStatsCards";
import { ApplicationsDataTable } from "./table/applications-data-table";

import { useApplicationStats } from "@/api/queries/application.query";
import PageHeader from "@/components/common/PageHeader";
import PageLayout from "@/layouts/PageLayout";

export default function ApplicationsPage() {
  const { data: statsResponse, isLoading: statsLoading } =
    useApplicationStats();

  return (
    <PageLayout>
      <PageHeader
        title="Job Applications"
        description="Review and manage candidate applications"
      />
      <div className="p-6 space-y-6">
        <ApplicationStatsCards
          stats={statsResponse?.data ?? null}
          isLoading={statsLoading}
        />
        <ApplicationsDataTable />
      </div>
    </PageLayout>
  );
}
