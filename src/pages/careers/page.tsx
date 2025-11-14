import { CareerStatsCards } from "./components/CareerStatsCards";
import { CareersDataTable } from "./table/careers-data-table";

import { useCareerStats } from "@/api/queries/career.query";
import PageHeader from "@/components/common/PageHeader";
import PageLayout from "@/layouts/PageLayout";

export default function CareersPage() {
  const { data: statsResponse, isLoading: statsLoading } = useCareerStats();

  return (
    <PageLayout>
      <PageHeader
        title="Career Postings"
        description="Manage job postings and track applications"
      />
      <div className="p-6 space-y-6">
        <CareerStatsCards
          stats={statsResponse?.data ?? null}
          isLoading={statsLoading}
        />
        <CareersDataTable />
      </div>
    </PageLayout>
  );
}
