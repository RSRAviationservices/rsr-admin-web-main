import {
  Briefcase,
  FileText,
  Clock,
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

interface CareerStatsCardsProps {
  stats: {
    total: number;
    published: number;
    draft: number;
    closed: number;
  } | null;
  isLoading: boolean;
}

export function CareerStatsCards({ stats, isLoading }: CareerStatsCardsProps) {
  // ✅ Use static imports instead of require()
  const iconMap = {
    Briefcase,
    FileText,
    Clock,
    XCircle,
  } as const;

  // Type the icon keys
  type IconKey = keyof typeof iconMap;

  const statsConfig: {
    title: string;
    key: keyof NonNullable<CareerStatsCardsProps["stats"]>;
    icon: IconKey;
    iconColor: string;
  }[] = [
    {
      title: "Total Careers",
      key: "total",
      icon: "Briefcase",
      iconColor: "text-blue-600",
    },
    {
      title: "Published",
      key: "published",
      icon: "FileText",
      iconColor: "text-green-600",
    },
    {
      title: "Drafts",
      key: "draft",
      icon: "Clock",
      iconColor: "text-yellow-600",
    },
    {
      title: "Closed",
      key: "closed",
      icon: "XCircle",
      iconColor: "text-gray-600",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
