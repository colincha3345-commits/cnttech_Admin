import { useState, useMemo } from 'react';
import {
    DownloadOutlined,
    BarChartOutlined,
    DollarOutlined,
    ShopOutlined,
} from '@ant-design/icons';
import {
    Card,
    CardContent,
    Button,
    SearchInput,
} from '@/components/ui';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { DateRangeFilter, getDateRangeFromPreset } from '@/components/ui/DateRangeFilter';
import type { DashboardDateRange } from '@/types';
import { SettlementBarChart } from './SettlementBarChart';


interface StoreSettlementStat {
    id: string;
    dateString: string;
    storeId: string;
    storeName: string;
    totalSales: number;
    deliveryFee: number;
    hqDiscount: number;
    storeDiscount: number;
    pointsUsed: number;
    couponsUsed: number;
    vouchersUsed: number;
    platformFee: number;
    netAmount: number;
}

const MOCK_STATS_DATA: StoreSettlementStat[] = [
    {
        id: 'stats-1',
        dateString: '2024-02-25',
        storeId: 'store-1',
        storeName: '강남점',
        totalSales: 2500000,
        deliveryFee: 150000,
        hqDiscount: 30000,
        storeDiscount: 20000,
        pointsUsed: 10000,
        couponsUsed: 15000,
        vouchersUsed: 25000,
        platformFee: 125000,
        netAmount: 2525000,
    },
    {
        id: 'stats-2',
        dateString: '2024-02-25',
        storeId: 'store-2',
        storeName: '홍대점',
        totalSales: 1800000,
        deliveryFee: 120000,
        hqDiscount: 15000,
        storeDiscount: 15000,
        pointsUsed: 5000,
        couponsUsed: 10000,
        vouchersUsed: 15000,
        platformFee: 90000,
        netAmount: 1830000,
    },
    {
        id: 'stats-3',
        dateString: '2024-02-24',
        storeId: 'store-1',
        storeName: '강남점',
        totalSales: 2200000,
        deliveryFee: 110000,
        hqDiscount: 25000,
        storeDiscount: 10000,
        pointsUsed: 8000,
        couponsUsed: 12000,
        vouchersUsed: 15000,
        platformFee: 110000,
        netAmount: 2215000,
    }
];

export function SettlementStats() {
    const [keyword, setKeyword] = useState('');
    const [dateRange, setDateRange] = useState<DashboardDateRange>({
        preset: 'last7days',
        ...getDateRangeFromPreset('last7days'),
    });

    const handleStatsExcel = () => {
        const rows = MOCK_STATS_DATA.map((s) => ({
            '날짜': s.dateString,
            '가맹점': s.storeName,
            '총매출': s.totalSales,
            '배달비': s.deliveryFee,
            '본사할인': s.hqDiscount,
            '가맹할인': s.storeDiscount,
            '포인트': s.pointsUsed,
            '쿠폰': s.couponsUsed,
            '교환권': s.vouchersUsed,
            '플랫폼수수료': s.platformFee,
            '정산액': s.netAmount,
        }));
        const ws = XLSX.utils.json_to_sheet(rows);
        ws['!cols'] = Array(11).fill({ wch: 14 });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, '정산통계');
        const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        saveAs(new Blob([buf], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }), `정산통계_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    const filteredData = useMemo(() => {
        return MOCK_STATS_DATA.filter(item => {
            const matchKeyword = item.storeName.includes(keyword) || item.storeId.includes(keyword);
            
            // Check date range safely
            const itemDate = new Date(item.dateString);
            const inRange = (!dateRange || !dateRange.from || itemDate >= dateRange.from) && 
                            (!dateRange || !dateRange.to || itemDate <= dateRange.to);

            return matchKeyword && inRange;
        });
    }, [keyword, dateRange]);

    const summary = useMemo(() => {
        return filteredData.reduce(
            (acc, curr) => {
                acc.totalSales += curr.totalSales;
                acc.hqDiscount += curr.hqDiscount;
                acc.storeDiscount += curr.storeDiscount;
                acc.netAmount += curr.netAmount;
                return acc;
            },
            { totalSales: 0, hqDiscount: 0, storeDiscount: 0, netAmount: 0 }
        );
    }, [filteredData]);

    const chartData = useMemo(() => {
        // 일별, 가맹점별 합산
        const grouped = filteredData.reduce((acc, curr) => {
            if (!acc[curr.dateString]) {
                acc[curr.dateString] = { totalSales: 0, netAmount: 0 };
            }
            acc[curr.dateString]!.totalSales += curr.totalSales;
            acc[curr.dateString]!.netAmount += curr.netAmount;
            return acc;
        }, {} as Record<string, { totalSales: number, netAmount: number }>);

        return Object.entries(grouped)
            .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
            .map(([date, data]) => ({
                label: date.slice(5), // MM-DD
                totalSales: data.totalSales,
                netAmount: data.netAmount
            }));
    }, [filteredData]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-txt-main">가맹점별 정산 통계조회</h1>
                <Button variant="outline" onClick={handleStatsExcel}>
                    <span className="flex items-center gap-2">
                        <DownloadOutlined /> 통계 엑셀 다운로드
                    </span>
                </Button>
            </div>
            
            <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                <DateRangeFilter value={dateRange} onChange={setDateRange} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-txt-muted mb-1">총 매출액 (조회 기간내)</p>
                                <h3 className="text-2xl font-bold text-txt-main">
                                    ₩{summary.totalSales.toLocaleString()}
                                </h3>
                            </div>
                            <ShopOutlined style={{ fontSize: 32 }} className="text-border" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-red-50 border-red-100">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-600 mb-1">본사 부담 할인금 (포인트/이벤트)</p>
                                <h3 className="text-2xl font-bold text-red-900">
                                    ₩{summary.hqDiscount.toLocaleString()}
                                </h3>
                            </div>
                            <BarChartOutlined style={{ fontSize: 32 }} className="text-red-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-orange-50 border-orange-100">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-600 mb-1">가맹점 부담 할인금 (쿠폰등)</p>
                                <h3 className="text-2xl font-bold text-orange-900">
                                    ₩{summary.storeDiscount.toLocaleString()}
                                </h3>
                            </div>
                            <BarChartOutlined style={{ fontSize: 32 }} className="text-orange-200" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-blue-50 border-blue-100">
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600 mb-1">최종 정산 대상액 (조회 기간내)</p>
                                <h3 className="text-2xl font-bold text-blue-900">
                                    ₩{summary.netAmount.toLocaleString()}
                                </h3>
                            </div>
                            <DollarOutlined style={{ fontSize: 32 }} className="text-blue-200" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                        <SearchInput
                            placeholder="가맹점명 또는 가맹점 ID 검색"
                            value={keyword}
                            onChange={(val) => setKeyword(val)}
                        />
                    </div>
                </CardContent>
            </Card>

            <SettlementBarChart data={chartData} />

            <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-bg-hover border-y border-border text-left">
                                <th className="p-4 text-xs font-bold text-txt-muted uppercase tracking-wider">날짜</th>
                                <th className="p-4 text-xs font-bold text-txt-muted uppercase tracking-wider">가맹점</th>
                                <th className="p-4 text-right text-xs font-bold text-txt-muted uppercase tracking-wider">총 매출액</th>
                                <th className="p-4 text-right text-xs font-bold text-txt-muted uppercase tracking-wider">배달비용</th>
                                <th className="p-4 text-right text-xs font-bold text-blue-500 uppercase tracking-wider">포인트</th>
                                <th className="p-4 text-right text-xs font-bold text-orange-500 uppercase tracking-wider">쿠폰</th>
                                <th className="p-4 text-right text-xs font-bold text-purple-500 uppercase tracking-wider">교환권</th>
                                <th className="p-4 text-right text-xs font-bold text-red-600 uppercase tracking-wider">할인액(본사)</th>
                                <th className="p-4 text-right text-xs font-bold text-orange-600 uppercase tracking-wider">할인액(가맹점)</th>
                                <th className="p-4 text-right text-xs font-bold text-txt-muted uppercase tracking-wider">플랫폼 수수료</th>
                                <th className="p-4 text-right text-xs font-bold text-blue-600 uppercase tracking-wider">정산 대상액</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border text-left">
                            {filteredData.map((item) => (
                                <tr key={item.id} className="hover:bg-bg-hover transition-colors">
                                    <td className="p-4 whitespace-nowrap text-sm text-txt-main">{item.dateString}</td>
                                    <td className="p-4 whitespace-nowrap">
                                        <span className="font-bold text-sm text-txt-main">{item.storeName}</span>
                                        <span className="block text-xs text-txt-muted mt-0.5">{item.storeId}</span>
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap text-sm text-txt-main">
                                        ₩{item.totalSales.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap text-sm text-txt-muted">
                                        ₩{item.deliveryFee.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap text-sm text-blue-500">
                                        ₩{item.pointsUsed?.toLocaleString() || '0'}
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap text-sm text-orange-500">
                                        ₩{item.couponsUsed?.toLocaleString() || '0'}
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap text-sm text-purple-500">
                                        ₩{item.vouchersUsed?.toLocaleString() || '0'}
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap text-sm text-red-600 font-bold bg-red-50/20">
                                        ₩{item.hqDiscount.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap text-sm text-orange-600 font-bold bg-orange-50/20">
                                        ₩{item.storeDiscount.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap text-sm text-txt-muted">
                                        -₩{item.platformFee.toLocaleString()}
                                    </td>
                                    <td className={`p-4 text-right whitespace-nowrap text-sm font-bold bg-blue-50/20 ${item.netAmount < 0 ? 'text-red-500' : 'text-blue-600'}`}>
                                        ₩{item.netAmount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan={11} className="p-12 text-center text-txt-muted">
                                        검색 조건에 일치하는 내역이 없습니다.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
