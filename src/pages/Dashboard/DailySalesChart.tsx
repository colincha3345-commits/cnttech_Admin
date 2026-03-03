import { Card, CardHeader, CardContent } from '@/components/ui/Card';

// This would come from props or a hook in a real app
const mockSalesData = [
  { date: '09.01', value: 65 },
  { date: '09.02', value: 70 },
  { date: '09.03', value: 60 },
  { date: '09.04', value: 55 },
  { date: '09.05', value: 68 },
  { date: '09.06', value: 62 },
  { date: '09.07', value: 72 },
];

export function DailySalesChart() {
  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-txt-main">일별 매출 현황</h2>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-end justify-between gap-2">
          {mockSalesData.map((item) => (
            <div key={item.date} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full bg-primary rounded-t-lg" style={{ height: `${item.value}%` }} />
              <span className="text-xs text-txt-muted">{item.date}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
