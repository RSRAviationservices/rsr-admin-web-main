import { InsightStatsCards } from "./components/InsightStatsCards";
import { InsightsDataTable } from "./table/insights-data-table";

import { useInsightStats } from "@/api/queries/insight.query";
import PageHeader from "@/components/common/PageHeader";
import PageLayout from "@/layouts/PageLayout";

export default function InsightsPage() {
  const { data: statsResponse, isLoading: statsLoading } = useInsightStats();

  return (
    <PageLayout>
      <PageHeader
        title="Insights & Blog"
        description="Manage blog posts and insights"
      />
      <div className="p-6 space-y-6">
        {/* Stats Cards */}
        <InsightStatsCards
          stats={statsResponse?.data ?? null}
          isLoading={statsLoading}
        />

        {/* DataTable */}
        <InsightsDataTable />
      </div>
    </PageLayout>
  );
}
