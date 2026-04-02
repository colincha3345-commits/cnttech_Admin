import { Card, CardHeader, CardContent } from '@/components/ui';

interface SettlementStatChartItem {
    label: string;
    totalSales: number;
    netAmount: number;
}

interface SettlementBarChartProps {
    data: SettlementStatChartItem[];
}

export function SettlementBarChart({ data }: SettlementBarChartProps) {
    if (!data.length) {
        return (
            <Card>
                <CardHeader>
                    <h2 className="text-lg font-semibold text-txt-main">매출 대비 정산 추이</h2>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center">
                    <p className="text-txt-muted">표시할 데이터가 없습니다.</p>
                </CardContent>
            </Card>
        );
    }

    const maxVal = Math.max(...data.map(d => Math.max(d.totalSales, d.netAmount)), 1);

    return (
        <Card>
            <CardHeader>
                <h2 className="text-lg font-semibold text-txt-main">매출 대비 정산 추이</h2>
                <div className="flex gap-4 mt-2">
                    <div className="flex items-center gap-2 text-xs text-txt-muted">
                        <span className="w-3 h-3 bg-blue-200 rounded-sm"></span> 총 매출
                    </div>
                    <div className="flex items-center gap-2 text-xs text-txt-muted">
                        <span className="w-3 h-3 bg-blue-600 rounded-sm"></span> 정산 대상액
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-64 flex items-end justify-between gap-4 mt-4 overflow-x-auto pb-4">
                    {data.map((item) => (
                        <div key={item.label} className="flex-1 flex flex-col items-center justify-end gap-1 min-w-[60px] h-full group relative">
                            {/* 툴팁 */}
                            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs rounded py-1 px-2 pointer-events-none whitespace-nowrap z-10 w-max text-center flex flex-col gap-0.5">
                                <span>매출: {(item.totalSales / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}만</span>
                                <span>정산: {(item.netAmount / 10000).toLocaleString(undefined, { maximumFractionDigits: 1 })}만</span>
                            </div>
                            
                            <div className="w-full flex items-end justify-center gap-1 h-full">
                                {/* 총매출 바 */}
                                <div
                                    className="w-1/2 bg-blue-200 rounded-t-sm transition-all hover:bg-blue-300"
                                    style={{ height: `${(item.totalSales / maxVal) * 100}%`, minHeight: 4 }}
                                />
                                {/* 순정산액 바 */}
                                <div
                                    className="w-1/2 bg-blue-600 rounded-t-sm transition-all hover:bg-blue-700"
                                    style={{ height: `${(item.netAmount / maxVal) * 100}%`, minHeight: 4 }}
                                />
                            </div>
                            <span className="text-[10px] text-txt-muted mt-2 text-center whitespace-nowrap w-full truncate border-t border-gray-100 pt-1">
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
