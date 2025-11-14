import {
  Users,
  Clock,
  Search,
  Star,
  CheckCircle,
  XCircle,
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

interface ApplicationStatsCardsProps {
  stats: {
    total: number;
    pending: number;
    reviewing: number;
    shortlisted: number;
    rejected: number;
    hired: number;
  } | null;
  isLoading: boolean;
}

export function ApplicationStatsCards({
  stats,
  isLoading,
}: ApplicationStatsCardsProps) {
  // 🔹 Instead of require(), use static imports above
  const iconMap = {
    Users,
    Clock,
    Search,
    Star,
    CheckCircle,
    XCircle,
  } as const;

  // Type keys properly
  type IconKey = keyof typeof iconMap;

  const statsConfig: {
    title: string;
    key: keyof NonNullable<ApplicationStatsCardsProps["stats"]>;
    icon: IconKey;
    iconColor: string;
  }[] = [
    {
      title: "Total Applications",
      key: "total",
      icon: "Users",
      iconColor: "text-blue-600",
    },
    {
      title: "Pending",
      key: "pending",
      icon: "Clock",
      iconColor: "text-yellow-600",
    },
    {
      title: "Reviewing",
      key: "reviewing",
      icon: "Search",
      iconColor: "text-orange-600",
    },
    {
      title: "Shortlisted",
      key: "shortlisted",
      icon: "Star",
      iconColor: "text-purple-600",
    },
    {
      title: "Hired",
      key: "hired",
      icon: "CheckCircle",
      iconColor: "text-green-600",
    },
    {
      title: "Rejected",
      key: "rejected",
      icon: "XCircle",
      iconColor: "text-red-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
      {statsConfig.map((config) => {
        const Icon = iconMap[config.icon];
        return (
          <StatCard
            key={config.key}
            title={config.title}
            value={stats?.[config.key] ?? 0}
            icon={Icon}
            iconColor={config.iconColor}
            isLoading={isLoading}
          />
        );
      })}
    </div>
  );
}
