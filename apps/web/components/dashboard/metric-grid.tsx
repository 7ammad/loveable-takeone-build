import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { DashboardMetric } from "@/lib/definitions";

interface MetricGridProps {
  metrics: DashboardMetric[];
}

const trendBadge: Record<DashboardMetric["trend"], { label: string; variant: "success" | "warning" | "danger" | "outline" }> = {
  up: { label: "Up", variant: "success" },
  down: { label: "Down", variant: "danger" },
  flat: { label: "Stable", variant: "outline" },
};

export function MetricGrid({ metrics }: MetricGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const badge = trendBadge[metric.trend];
        return (
          <Card key={metric.id} className="p-0">
            <CardHeader className="p-5">
              <CardDescription>{metric.label}</CardDescription>
              <CardTitle className="text-2xl font-semibold">{metric.value}</CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{metric.change}</span>
                <Badge variant={badge.variant}>{badge.label}</Badge>
              </div>
              <Progress value={metric.trend === "up" ? 70 : metric.trend === "down" ? 40 : 50} className="mt-3" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
