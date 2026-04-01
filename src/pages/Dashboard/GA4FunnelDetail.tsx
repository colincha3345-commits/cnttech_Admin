import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, FunnelPlotOutlined, SwapOutlined, ClockCircleOutlined, DollarOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

import { DateRangeFilter, getDateRangeFromPreset } from '@/components/ui/DateRangeFilter';
import type { DashboardDateRange } from '@/types';

import { Card, CardHeader, CardContent, Badge } from '@/components/ui';
import { StatCard } from '@/components/ui/StatCard';

// Mock 데이터 - 퍼널 상세
const FUNNEL_STEPS = [
    { step: '방문 (Visit)', users: 100000, sessions: 135000, conversionRate: 100, avgTime: '-', revenue: 0 },
    { step: '상품 조회 (View Item)', users: 65000, sessions: 98000, conversionRate: 65.0, avgTime: '1:24', revenue: 0 },
    { step: '장바구니 (Add to Cart)', users: 25000, sessions: 32000, conversionRate: 38.5, avgTime: '2:45', revenue: 0 },
    { step: '주문서 작성 (Checkout)', users: 10000, sessions: 11500, conversionRate: 40.0, avgTime: '3:52', revenue: 0 },
    { step: '결제 완료 (Purchase)', users: 8500, sessions: 8500, conversionRate: 85.0, avgTime: '4:30', revenue: 425000000 },
];

const DAILY_CONVERSION = [
    { date: '02/20', visit: 14200, view: 9300, cart: 3600, checkout: 1450, purchase: 1230 },
    { date: '02/21', visit: 14800, view: 9500, cart: 3700, checkout: 1480, purchase: 1260 },
    { date: '02/22', visit: 13500, view: 8800, cart: 3400, checkout: 1350, purchase: 1150 },
    { date: '02/23', visit: 15100, view: 9800, cart: 3800, checkout: 1520, purchase: 1290 },
    { date: '02/24', visit: 14600, view: 9600, cart: 3650, checkout: 1460, purchase: 1240 },
    { date: '02/25', visit: 13900, view: 9100, cart: 3500, checkout: 1380, purchase: 1180 },
    { date: '02/26', visit: 13900, view: 8900, cart: 3350, checkout: 1360, purchase: 1150 },
];

const DROP_OFF_REASONS = [
    { from: '방문 → 상품 조회', dropRate: 35.0, topReasons: ['첫 페이지에서 이탈', '검색 결과 없음', '페이지 로딩 속도'], improvement: '메인 페이지 UX 개선 권장' },
    { from: '상품 조회 → 장바구니', dropRate: 61.5, topReasons: ['가격 비교 후 이탈', '배달비 확인 후 이탈', '원하는 옵션 부재'], improvement: '가격 경쟁력 및 옵션 다양화 필요' },
    { from: '장바구니 → 주문서', dropRate: 60.0, topReasons: ['최소 주문금액 미달', '배달 시간 길어 이탈', '쿠폰/할인 미적용'], improvement: '최소 주문금액 완화 및 프로모션 강화' },
    { from: '주문서 → 결제 완료', dropRate: 15.0, topReasons: ['결제 오류', '결제 수단 미지원', '주소 입력 번거로움'], improvement: '결제 프로세스 간소화 필요' },
];

const TOP_CONVERTING_ITEMS = [
    { name: '시그니처 세트 A', views: 12500, purchases: 2100, rate: 16.8, revenue: 63000000 },
    { name: '점심 특선 도시락', views: 9800, purchases: 1650, rate: 16.8, revenue: 14850000 },
    { name: '아메리카노 (ICE)', views: 18200, purchases: 2800, rate: 15.4, revenue: 11200000 },
    { name: '치킨 버거 세트', views: 8500, purchases: 1200, rate: 14.1, revenue: 13200000 },
    { name: '시즌 한정 메뉴', views: 6200, purchases: 850, rate: 13.7, revenue: 12750000 },
];

type FunnelTab = 'funnel' | 'trend' | 'dropoff' | 'topitems';

export function GA4FunnelDetail() {
    const navigate = useNavigate();
    const now = new Date();
    const [activeTab, setActiveTab] = useState<FunnelTab>('funnel');
    const [dateRange, setDateRange] = useState<DashboardDateRange>({
        preset: 'today',
        ...getDateRangeFromPreset('today'),
    });

    const multiplier = useMemo(() => {
        switch (dateRange.preset) {
            case 'today': return 1;
            case 'yesterday': return 0.85;
            case 'last7days': return 6.5;
            case 'lastMonth': return 31.5;
            default: return 5.5;
        }
    }, [dateRange.preset]);

    const currentFunnelSteps = useMemo(() => {
        return FUNNEL_STEPS.map(step => ({
            ...step,
            users: Math.floor(step.users * multiplier),
            sessions: Math.floor(step.sessions * multiplier),
            revenue: Math.floor(step.revenue * multiplier)
        }));
    }, [multiplier]);

    const currentDailyConversion = useMemo(() => {
        return DAILY_CONVERSION.map(day => ({
            ...day,
            visit: Math.floor(day.visit * multiplier),
            view: Math.floor(day.view * multiplier),
            cart: Math.floor(day.cart * multiplier),
            checkout: Math.floor(day.checkout * multiplier),
            purchase: Math.floor(day.purchase * multiplier)
        }));
    }, [multiplier]);

    const currentTopItems = useMemo(() => {
        return TOP_CONVERTING_ITEMS.map(item => ({
            ...item,
            views: Math.floor(item.views * multiplier),
            purchases: Math.floor(item.purchases * multiplier),
            revenue: Math.floor(item.revenue * multiplier)
        }));
    }, [multiplier]);

    const tabs: { key: FunnelTab; label: string }[] = [
        { key: 'funnel', label: '퍼널 상세' },
        { key: 'trend', label: '일별 전환 추이' },
        { key: 'dropoff', label: '이탈 분석' },
        { key: 'topitems', label: '전환율 TOP 상품' },
    ];

    const overallConversion = ((currentFunnelSteps[4]?.users ?? 0) / (currentFunnelSteps[0]?.users ?? 1)) * 100;
    const avgOrderValue = (currentFunnelSteps[4]?.revenue ?? 0) / (currentFunnelSteps[4]?.users ?? 1);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate('/dashboard/ga4')}
                            className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
                        >
                            <ArrowLeftOutlined />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-txt-main">퍼널 상세 분석</h1>
                            <p className="text-sm text-txt-muted mt-1">
                                {format(now, 'yyyy-MM-dd eeee', { locale: ko })} (최종 업데이트 :{' '}
                                {format(now, 'yyyy년 M월 d일 HH:mm')})
                            </p>
                        </div>
                    </div>
                </div>
                <DateRangeFilter value={dateRange} onChange={setDateRange} />
            </div>

            {/* 상단 요약 카드 */}
            <div className="admin-grid">
                <StatCard
                    title="전체 전환율"
                    value={overallConversion.toFixed(1)}
                    icon={<FunnelPlotOutlined />}
                    color="primary"
                    format="percent"
                    change={0.5}
                />
                <StatCard
                    title="총 구매 수"
                    value={currentFunnelSteps[4]?.users ?? 0}
                    icon={<ShoppingCartOutlined />}
                    color="success"
                    change={2.1}
                />
                <StatCard
                    title="평균 주문 금액"
                    value={avgOrderValue}
                    icon={<DollarOutlined />}
                    color="info"
                    format="currency"
                    change={-1.2}
                />
                <StatCard
                    title="평균 구매 소요시간"
                    value="4:30"
                    icon={<ClockCircleOutlined />}
                    color="warning"
                    change={-3.5}
                />
            </div>

            {/* 탭 */}
            <div className="flex gap-2 border-b border-border">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                            activeTab === tab.key
                                ? 'border-primary text-primary'
                                : 'border-transparent text-txt-muted hover:text-txt-main'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* 퍼널 상세 */}
            {activeTab === 'funnel' && (
                <div className="space-y-6">
                    {/* 퍼널 시각화 */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold text-txt-main">고객 여정 퍼널</h2>
                        </CardHeader>
                        <CardContent>
                            <div className="relative pt-2">
                                {currentFunnelSteps.map((step, index) => {
                                    const maxUsers = currentFunnelSteps[0]?.users || 1;
                                    const widthPerc = (step.users / maxUsers) * 100;
                                    const prevUsers = index > 0 ? (currentFunnelSteps[index - 1]?.users ?? 0) : step.users;
                                    const stepDropRate = index > 0 ? ((1 - step.users / prevUsers) * 100).toFixed(1) : '-';

                                    return (
                                        <div key={step.step} className="mb-4">
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm font-medium text-txt-main">{step.step}</span>
                                                <div className="flex gap-6 items-center">
                                                    <span className="text-sm font-bold text-primary">{step.users.toLocaleString()}명</span>
                                                    <span className="text-sm text-txt-muted w-20 text-right">세션 {step.sessions.toLocaleString()}</span>
                                                    {index > 0 && (
                                                        <span className="text-sm text-critical w-20 text-right">이탈 {stepDropRate}%</span>
                                                    )}
                                                    {index === 0 && <span className="w-20" />}
                                                </div>
                                            </div>
                                            <div className="w-full bg-bg-muted rounded-md h-10 relative flex items-center">
                                                <div
                                                    className="h-full rounded-md transition-all flex items-center justify-end pr-3"
                                                    style={{
                                                        width: `${widthPerc}%`,
                                                        backgroundColor: `hsl(215, 80%, ${50 + index * 8}%)`,
                                                    }}
                                                >
                                                    <span className="text-xs text-white font-medium">
                                                        {step.conversionRate}%
                                                    </span>
                                                </div>
                                            </div>
                                            {index < currentFunnelSteps.length - 1 && (
                                                <div className="flex items-center gap-2 ml-4 my-1">
                                                    <div className="h-4 w-px bg-border" />
                                                    <SwapOutlined className="text-txt-muted rotate-90" style={{ fontSize: 10 }} />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 단계별 상세 테이블 */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold text-txt-main">단계별 상세 데이터</h2>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="data-table w-full">
                                    <thead>
                                        <tr>
                                            <th>단계</th>
                                            <th className="text-right">사용자</th>
                                            <th className="text-right">세션</th>
                                            <th className="text-right">전체 대비 전환율</th>
                                            <th className="text-right">평균 체류시간</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {currentFunnelSteps.map((step) => (
                                            <tr key={step.step}>
                                                <td className="font-medium">{step.step}</td>
                                                <td className="text-right font-mono">{step.users.toLocaleString()}</td>
                                                <td className="text-right font-mono">{step.sessions.toLocaleString()}</td>
                                                <td className="text-right">
                                                    <Badge variant={step.conversionRate >= 80 ? 'success' : step.conversionRate >= 40 ? 'warning' : 'critical'}>
                                                        {step.conversionRate}%
                                                    </Badge>
                                                </td>
                                                <td className="text-right font-mono">{step.avgTime}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* 일별 전환 추이 */}
            {activeTab === 'trend' && (
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-txt-main">일별 전환 추이</h2>
                    </CardHeader>
                    <CardContent>
                        {/* 범례 */}
                        <div className="flex flex-wrap gap-4 mb-6">
                            {[
                                { label: '방문', color: 'bg-blue-500' },
                                { label: '상품 조회', color: 'bg-cyan-500' },
                                { label: '장바구니', color: 'bg-amber-500' },
                                { label: '주문서', color: 'bg-orange-500' },
                                { label: '결제 완료', color: 'bg-emerald-500' },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                    <span className="text-sm text-txt-muted">{item.label}</span>
                                </div>
                            ))}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="data-table w-full">
                                <thead>
                                    <tr>
                                        <th>날짜</th>
                                        <th className="text-right">방문</th>
                                        <th className="text-right">상품 조회</th>
                                        <th className="text-right">장바구니</th>
                                        <th className="text-right">주문서</th>
                                        <th className="text-right">결제 완료</th>
                                        <th className="text-right">전환율</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentDailyConversion.map((day) => {
                                        const rate = ((day.purchase / day.visit) * 100).toFixed(1);
                                        return (
                                            <tr key={day.date}>
                                                <td className="font-medium">{day.date}</td>
                                                <td className="text-right font-mono">{day.visit.toLocaleString()}</td>
                                                <td className="text-right font-mono">{day.view.toLocaleString()}</td>
                                                <td className="text-right font-mono">{day.cart.toLocaleString()}</td>
                                                <td className="text-right font-mono">{day.checkout.toLocaleString()}</td>
                                                <td className="text-right font-mono font-bold text-primary">{day.purchase.toLocaleString()}</td>
                                                <td className="text-right">
                                                    <Badge variant="info">{rate}%</Badge>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* 전환율 추이 바 차트 */}
                        <div className="mt-8">
                            <h3 className="text-sm font-medium text-txt-muted mb-4">일별 전환율 추이</h3>
                            <div className="h-40 flex items-end justify-between gap-3">
                                {currentDailyConversion.map((day) => {
                                    const rate = (day.purchase / day.visit) * 100;
                                    return (
                                        <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                                            <span className="text-xs font-mono text-primary">{rate.toFixed(1)}%</span>
                                            <div className="w-full bg-primary rounded-t-md" style={{ height: `${rate * 10}%` }} />
                                            <span className="text-xs text-txt-muted">{day.date}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* 이탈 분석 */}
            {activeTab === 'dropoff' && (
                <div className="space-y-4">
                    {DROP_OFF_REASONS.map((item) => (
                        <Card key={item.from}>
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <h3 className="text-base font-semibold text-txt-main">{item.from}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Badge variant={item.dropRate > 50 ? 'critical' : item.dropRate > 30 ? 'warning' : 'success'}>
                                                이탈률 {item.dropRate}%
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="w-32 h-4 bg-bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-critical rounded-full transition-all"
                                            style={{ width: `${item.dropRate}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <h4 className="text-sm font-medium text-txt-muted mb-2">주요 이탈 원인</h4>
                                        <ul className="space-y-2">
                                            {item.topReasons.map((reason, idx) => (
                                                <li key={idx} className="flex items-center gap-2 text-sm">
                                                    <span className="w-5 h-5 rounded-full bg-critical/10 text-critical text-xs flex items-center justify-center font-bold">
                                                        {idx + 1}
                                                    </span>
                                                    {reason}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="p-4 bg-info/5 border border-info/20 rounded-lg">
                                        <h4 className="text-sm font-medium text-info mb-1">개선 제안</h4>
                                        <p className="text-sm text-txt-main">{item.improvement}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* 전환율 TOP 상품 */}
            {activeTab === 'topitems' && (
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-txt-main">전환율 TOP 상품</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="data-table w-full">
                                <thead>
                                    <tr>
                                        <th className="w-10">순위</th>
                                        <th>상품명</th>
                                        <th className="text-right">조회 수</th>
                                        <th className="text-right">구매 수</th>
                                        <th className="text-right">전환율</th>
                                        <th className="text-right">매출</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentTopItems.map((item, idx) => (
                                        <tr key={item.name}>
                                            <td className="text-center">
                                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                                                    idx === 0 ? 'bg-amber-100 text-amber-700' :
                                                    idx === 1 ? 'bg-gray-100 text-gray-600' :
                                                    idx === 2 ? 'bg-orange-100 text-orange-700' :
                                                    'bg-bg-muted text-txt-muted'
                                                }`}>
                                                    {idx + 1}
                                                </span>
                                            </td>
                                            <td className="font-medium">{item.name}</td>
                                            <td className="text-right font-mono">{item.views.toLocaleString()}</td>
                                            <td className="text-right font-mono">{item.purchases.toLocaleString()}</td>
                                            <td className="text-right">
                                                <Badge variant="success">{item.rate}%</Badge>
                                            </td>
                                            <td className="text-right font-mono font-medium">
                                                {(item.revenue / 10000).toLocaleString()}만원
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
