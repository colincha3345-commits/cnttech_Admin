import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useDailySales } from '@/hooks/useDashboard';
import type { DashboardDateRange } from '@/types';

interface DailySalesChartProps {
  dateRange?: DashboardDateRange;
}

export function DailySalesChart({ dateRange }: DailySalesChartProps) {
  const { dailySales, isLoading } = useDailySales(dateRange);

  if (isLoading) return <Spinner layout="center" />;

  const maxRevenue = Math.max(...dailySales.map((d) => d.revenue), 1);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-txt-main">일별 매출 현황</h2>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-between gap-2">
          {dailySales.map((item) => (
            <div key={item.date} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs text-txt-muted font-medium">
                {(item.revenue / 10000).toFixed(0)}만
              </span>
              <div
                className="w-full bg-primary rounded-t-lg transition-all"
                style={{ height: `${(item.revenue / maxRevenue) * 100}%`, minHeight: 4 }}
              />
              <span className="text-xs text-txt-muted">{item.date.slice(5)}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
