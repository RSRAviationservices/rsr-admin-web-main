import {
  FileText,
  CheckCircle,
  Clock,
  Eye,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconColor: string;
  isLoading?: boolean;
}

function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  isLoading,
}: StatCardProps) {
  return (
    <Card className="shadow-none border border-gray-200 bg-linear-to-br from-gray-50 to-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold text-gray-900">{value}</p>
            )}
          </div>
          <div className={`p-3 rounded-full bg-gray-100`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface InsightStatsCardsProps {
  stats: {
    total: number;
    published: number;
    draft: number;
    totalViews: number;
  } | null;
  isLoading: boolean;
}

export function InsightStatsCards({
  stats,
  isLoading,
}: InsightStatsCardsProps) {
  const iconMap = {
    FileText,
    CheckCircle,
    Clock,
    Eye,
  };

  type IconKey = keyof typeof iconMap;

  const statsConfig: {
    title: string;
    key: keyof NonNullable<InsightStatsCardsProps["stats"]>;
    icon: IconKey;
    iconColor: string;
  }[] = [
    {
      title: "Total Insights",
      key: "total",
      icon: "FileText",
      iconColor: "text-blue-600",
    },
    {
      title: "Published",
      key: "published",
      icon: "CheckCircle",
      iconColor: "text-green-600",
    },
    {
      title: "Drafts",
      key: "draft",
      icon: "Clock",
      iconColor: "text-yellow-600",
    },
    {
      title: "Total Views",
      key: "totalViews",
      icon: "Eye",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsConfig.map((config) => (
        <StatCard
          key={config.key}
          title={config.title}
          value={stats?.[config.key] ?? 0}
          icon={iconMap[config.icon]}
          iconColor={config.iconColor}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
