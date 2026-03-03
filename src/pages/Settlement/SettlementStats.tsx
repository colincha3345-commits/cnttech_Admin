import { useState, useMemo } from 'react';
import {
    DownloadOutlined,
    SearchOutlined,
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

type TimeUnit = 'daily' | 'monthly' | 'yearly';

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
    const [timeUnit, setTimeUnit] = useState<TimeUnit>('daily');
    const [dateRange, setDateRange] = useState('');

    const filteredData = useMemo(() => {
        return MOCK_STATS_DATA.filter(item => {
            const matchKeyword = item.storeName.includes(keyword) || item.storeId.includes(keyword);
            return matchKeyword;
        });
    }, [keyword, timeUnit]);

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

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-txt-main">가맹점별 정산 통계조회</h1>
                <Button variant="outline">
                    <span className="flex items-center gap-2">
                        <DownloadOutlined /> 통계 엑셀 다운로드
                    </span>
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-txt-muted mb-1">총 매출액 (조회 기간내)</p>
                                <h3 className="text-2xl font-bold text-txt-main font-mono">
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
                                <h3 className="text-2xl font-bold text-red-900 font-mono">
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
                                <h3 className="text-2xl font-bold text-orange-900 font-mono">
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
                                <h3 className="text-2xl font-bold text-blue-900 font-mono">
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
                    <div className="w-full md:w-32 text-left">
                        <label className="block text-xs font-medium text-txt-muted mb-1">조회 단위</label>
                        <select
                            className="w-full border border-border rounded-lg p-2 text-sm h-10 bg-bg-main text-txt-main"
                            value={timeUnit}
                            onChange={(e) => setTimeUnit(e.target.value as TimeUnit)}
                        >
                            <option value="daily">일별</option>
                            <option value="monthly">월별</option>
                            <option value="yearly">연별</option>
                        </select>
                    </div>
                    <div className="w-full md:w-48 text-left">
                        <label className="block text-xs font-medium text-txt-muted mb-1">조회 일자(기간)</label>
                        <input
                            type="date"
                            className="w-full border border-border rounded-lg p-2 text-sm h-10 bg-bg-main text-txt-main"
                            value={dateRange}
                            onChange={(e) => setDateRange(e.target.value)}
                        />
                    </div>
                    <Button variant="secondary">
                        <span className="flex items-center gap-2">
                            <SearchOutlined /> 검색
                        </span>
                    </Button>
                </CardContent>
            </Card>

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
                                    <td className="p-4 whitespace-nowrap text-sm font-mono text-txt-main">{item.dateString}</td>
                                    <td className="p-4 whitespace-nowrap">
                                        <span className="font-bold text-sm text-txt-main">{item.storeName}</span>
                                        <span className="block text-xs text-txt-muted font-mono mt-0.5">{item.storeId}</span>
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap text-sm font-mono text-txt-main">
                                        ₩{item.totalSales.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap text-sm font-mono text-txt-muted">
                                        ₩{item.deliveryFee.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap text-sm font-mono text-blue-500">
                                        ₩{item.pointsUsed?.toLocaleString() || '0'}
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap text-sm font-mono text-orange-500">
                                        ₩{item.couponsUsed?.toLocaleString() || '0'}
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap text-sm font-mono text-purple-500">
                                        ₩{item.vouchersUsed?.toLocaleString() || '0'}
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap text-sm font-mono text-red-600 font-bold bg-red-50/20">
                                        ₩{item.hqDiscount.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap text-sm font-mono text-orange-600 font-bold bg-orange-50/20">
                                        ₩{item.storeDiscount.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap text-sm font-mono text-txt-muted">
                                        -₩{item.platformFee.toLocaleString()}
                                    </td>
                                    <td className="p-4 text-right whitespace-nowrap text-sm font-mono text-blue-600 font-bold bg-blue-50/20">
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
