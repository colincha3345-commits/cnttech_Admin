import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftOutlined, MobileOutlined, DesktopOutlined, TabletOutlined, GlobalOutlined, ChromeOutlined, AppleOutlined, AndroidOutlined, WindowsOutlined } from '@ant-design/icons';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

import { DateRangeFilter, getDateRangeFromPreset } from '@/components/ui/DateRangeFilter';
import type { DashboardDateRange } from '@/types';

import { Card, CardHeader, CardContent, Badge } from '@/components/ui';
import { StatCard } from '@/components/ui/StatCard';

// Mock 데이터
const DEVICE_SUMMARY = {
    totalSessions: 245000,
    mobile: { sessions: 176400, percentage: 72, avgDuration: '3:24', bounceRate: 42.1, pages: 4.2 },
    desktop: { sessions: 58800, percentage: 24, avgDuration: '5:12', bounceRate: 28.5, pages: 6.8 },
    tablet: { sessions: 9800, percentage: 4, avgDuration: '4:05', bounceRate: 35.2, pages: 5.1 },
};

const BROWSER_DATA = [
    { name: 'Chrome', sessions: 112700, percentage: 46.0, avgDuration: '4:02', bounceRate: 35.2 },
    { name: 'Safari', sessions: 68600, percentage: 28.0, avgDuration: '3:45', bounceRate: 38.1 },
    { name: 'Samsung Internet', sessions: 24500, percentage: 10.0, avgDuration: '3:18', bounceRate: 44.5 },
    { name: 'Edge', sessions: 19600, percentage: 8.0, avgDuration: '5:08', bounceRate: 29.8 },
    { name: 'Firefox', sessions: 12250, percentage: 5.0, avgDuration: '4:55', bounceRate: 31.2 },
    { name: '기타', sessions: 7350, percentage: 3.0, avgDuration: '3:30', bounceRate: 42.0 },
];

const OS_DATA = [
    { name: 'Android', sessions: 127050, percentage: 51.9, icon: AndroidOutlined },
    { name: 'iOS', sessions: 63700, percentage: 26.0, icon: AppleOutlined },
    { name: 'Windows', sessions: 39200, percentage: 16.0, icon: WindowsOutlined },
    { name: 'macOS', sessions: 9800, percentage: 4.0, icon: AppleOutlined },
    { name: '기타', sessions: 5250, percentage: 2.1, icon: GlobalOutlined },
];

const SCREEN_RESOLUTION_DATA = [
    { resolution: '412x915', percentage: 22.5, device: 'Mobile' },
    { resolution: '390x844', percentage: 18.3, device: 'Mobile' },
    { resolution: '1920x1080', percentage: 15.2, device: 'Desktop' },
    { resolution: '393x873', percentage: 12.1, device: 'Mobile' },
    { resolution: '1440x900', percentage: 8.4, device: 'Desktop' },
    { resolution: '360x780', percentage: 7.2, device: 'Mobile' },
    { resolution: '768x1024', percentage: 4.0, device: 'Tablet' },
    { resolution: '기타', percentage: 12.3, device: '-' },
];

const DAILY_DEVICE_TREND = [
    { date: '02/20', mobile: 24500, desktop: 8200, tablet: 1400 },
    { date: '02/21', mobile: 25800, desktop: 8400, tablet: 1350 },
    { date: '02/22', mobile: 23200, desktop: 7900, tablet: 1500 },
    { date: '02/23', mobile: 26100, desktop: 8800, tablet: 1300 },
    { date: '02/24', mobile: 25400, desktop: 8600, tablet: 1420 },
    { date: '02/25', mobile: 24800, desktop: 8100, tablet: 1380 },
    { date: '02/26', mobile: 26600, desktop: 8800, tablet: 1450 },
];

type DeviceTab = 'overview' | 'browser' | 'os' | 'resolution';

export function GA4DeviceDetail() {
    const navigate = useNavigate();
    const now = new Date();
    const [activeTab, setActiveTab] = useState<DeviceTab>('overview');
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

    const currentDeviceSummary = useMemo(() => ({
        totalSessions: Math.floor(DEVICE_SUMMARY.totalSessions * multiplier),
        mobile: { ...DEVICE_SUMMARY.mobile, sessions: Math.floor(DEVICE_SUMMARY.mobile.sessions * multiplier) },
        desktop: { ...DEVICE_SUMMARY.desktop, sessions: Math.floor(DEVICE_SUMMARY.desktop.sessions * multiplier) },
        tablet: { ...DEVICE_SUMMARY.tablet, sessions: Math.floor(DEVICE_SUMMARY.tablet.sessions * multiplier) },
    }), [multiplier]);

    const currentBrowserData = useMemo(() => {
        return BROWSER_DATA.map(browser => ({
            ...browser,
            sessions: Math.floor(browser.sessions * multiplier)
        }));
    }, [multiplier]);

    const currentOsData = useMemo(() => {
        return OS_DATA.map(os => ({
            ...os,
            sessions: Math.floor(os.sessions * multiplier)
        }));
    }, [multiplier]);

    const tabs: { key: DeviceTab; label: string }[] = [
        { key: 'overview', label: '디바이스 개요' },
        { key: 'browser', label: '브라우저' },
        { key: 'os', label: '운영체제' },
        { key: 'resolution', label: '화면 해상도' },
    ];

    const maxTrend = Math.max(...DAILY_DEVICE_TREND.map(d => d.mobile + d.desktop + d.tablet));

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
                            <h1 className="text-2xl font-bold text-txt-main">디바이스 상세 분석</h1>
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
                    title="전체 세션"
                    value={currentDeviceSummary.totalSessions}
                    icon={<GlobalOutlined />}
                    color="primary"
                    change={3.2}
                />
                <StatCard
                    title="모바일"
                    value={`${currentDeviceSummary.mobile.percentage}%`}
                    icon={<MobileOutlined />}
                    color="info"
                    subValue={`${currentDeviceSummary.mobile.sessions.toLocaleString()} 세션`}
                    change={1.5}
                />
                <StatCard
                    title="데스크톱"
                    value={`${currentDeviceSummary.desktop.percentage}%`}
                    icon={<DesktopOutlined />}
                    color="success"
                    subValue={`${currentDeviceSummary.desktop.sessions.toLocaleString()} 세션`}
                    change={-0.8}
                />
                <StatCard
                    title="태블릿"
                    value={`${currentDeviceSummary.tablet.percentage}%`}
                    icon={<TabletOutlined />}
                    color="warning"
                    subValue={`${currentDeviceSummary.tablet.sessions.toLocaleString()} 세션`}
                    change={0.2}
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

            {/* 탭 콘텐츠 */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* 디바이스별 상세 비교 */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold text-txt-main">디바이스별 성과 비교</h2>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="data-table w-full">
                                    <thead>
                                        <tr>
                                            <th>디바이스</th>
                                            <th className="text-right">세션 수</th>
                                            <th className="text-right">비율</th>
                                            <th className="text-right">평균 체류시간</th>
                                            <th className="text-right">이탈률</th>
                                            <th className="text-right">페이지/세션</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { name: '모바일', icon: <MobileOutlined className="text-info" />, ...currentDeviceSummary.mobile },
                                            { name: '데스크톱', icon: <DesktopOutlined className="text-success" />, ...currentDeviceSummary.desktop },
                                            { name: '태블릿', icon: <TabletOutlined className="text-warning" />, ...currentDeviceSummary.tablet },
                                        ].map((device) => (
                                            <tr key={device.name}>
                                                <td>
                                                    <div className="flex items-center gap-2">
                                                        {device.icon}
                                                        <span className="font-medium">{device.name}</span>
                                                    </div>
                                                </td>
                                                <td className="text-right font-mono">{device.sessions.toLocaleString()}</td>
                                                <td className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className="w-24 h-2 bg-bg-muted rounded-full overflow-hidden">
                                                            <div className="h-full bg-primary rounded-full" style={{ width: `${device.percentage}%` }} />
                                                        </div>
                                                        <span className="font-mono w-12 text-right">{device.percentage}%</span>
                                                    </div>
                                                </td>
                                                <td className="text-right font-mono">{device.avgDuration}</td>
                                                <td className="text-right">
                                                    <Badge variant={device.bounceRate > 40 ? 'critical' : device.bounceRate > 30 ? 'warning' : 'success'}>
                                                        {device.bounceRate}%
                                                    </Badge>
                                                </td>
                                                <td className="text-right font-mono">{device.pages}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 일별 디바이스 트렌드 */}
                    <Card>
                        <CardHeader>
                            <h2 className="text-lg font-semibold text-txt-main">일별 디바이스 접속 트렌드</h2>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-1">
                                {/* 범례 */}
                                <div className="flex gap-6 mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                                        <span className="text-sm text-txt-muted">모바일</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                        <span className="text-sm text-txt-muted">데스크톱</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                                        <span className="text-sm text-txt-muted">태블릿</span>
                                    </div>
                                </div>
                                {/* 스택 바 차트 */}
                                <div className="h-64 flex items-end justify-between gap-3">
                                    {DAILY_DEVICE_TREND.map((day) => {
                                        const total = day.mobile + day.desktop + day.tablet;
                                        const height = (total / maxTrend) * 100;
                                        const mobileH = (day.mobile / total) * height;
                                        const desktopH = (day.desktop / total) * height;
                                        const tabletH = (day.tablet / total) * height;
                                        return (
                                            <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                                                <div className="w-full flex flex-col" style={{ height: `${height}%` }}>
                                                    <div className="w-full bg-amber-500 rounded-t" style={{ height: `${tabletH}%` }} />
                                                    <div className="w-full bg-emerald-500" style={{ height: `${desktopH}%` }} />
                                                    <div className="w-full bg-blue-500 rounded-b" style={{ height: `${mobileH}%` }} />
                                                </div>
                                                <span className="text-xs text-txt-muted">{day.date}</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {activeTab === 'browser' && (
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-txt-main">브라우저별 접속 현황</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="data-table w-full">
                                <thead>
                                    <tr>
                                        <th>브라우저</th>
                                        <th className="text-right">세션 수</th>
                                        <th className="text-right">비율</th>
                                        <th className="text-right">평균 체류시간</th>
                                        <th className="text-right">이탈률</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentBrowserData.map((browser) => (
                                        <tr key={browser.name}>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <ChromeOutlined className="text-txt-muted" />
                                                    <span className="font-medium">{browser.name}</span>
                                                </div>
                                            </td>
                                            <td className="text-right font-mono">{browser.sessions.toLocaleString()}</td>
                                            <td className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-24 h-2 bg-bg-muted rounded-full overflow-hidden">
                                                        <div className="h-full bg-info rounded-full" style={{ width: `${browser.percentage}%` }} />
                                                    </div>
                                                    <span className="font-mono w-12 text-right">{browser.percentage}%</span>
                                                </div>
                                            </td>
                                            <td className="text-right font-mono">{browser.avgDuration}</td>
                                            <td className="text-right">
                                                <Badge variant={browser.bounceRate > 40 ? 'critical' : browser.bounceRate > 30 ? 'warning' : 'success'}>
                                                    {browser.bounceRate}%
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'os' && (
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-txt-main">운영체제별 접속 현황</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {currentOsData.map((os) => (
                                <div key={os.name} className="flex items-center gap-4">
                                    <div className="w-28 flex items-center gap-2">
                                        <os.icon className="text-txt-muted" />
                                        <span className="text-sm font-medium">{os.name}</span>
                                    </div>
                                    <div className="flex-1 h-8 bg-bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary rounded-full flex items-center justify-end pr-3 transition-all"
                                            style={{ width: `${os.percentage}%`, minWidth: os.percentage > 5 ? undefined : '40px' }}
                                        >
                                            {os.percentage > 10 && (
                                                <span className="text-xs text-white font-medium">{os.percentage}%</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-32 text-right">
                                        <span className="text-sm font-mono">{os.sessions.toLocaleString()}</span>
                                        <span className="text-xs text-txt-muted ml-1">세션</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {activeTab === 'resolution' && (
                <Card>
                    <CardHeader>
                        <h2 className="text-lg font-semibold text-txt-main">화면 해상도별 분포</h2>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="data-table w-full">
                                <thead>
                                    <tr>
                                        <th>해상도</th>
                                        <th>디바이스</th>
                                        <th className="text-right">비율</th>
                                        <th className="text-right">분포</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {SCREEN_RESOLUTION_DATA.map((item) => (
                                        <tr key={item.resolution}>
                                            <td className="font-mono font-medium">{item.resolution}</td>
                                            <td>
                                                <Badge variant={item.device === 'Mobile' ? 'info' : item.device === 'Desktop' ? 'success' : item.device === 'Tablet' ? 'warning' : 'secondary'}>
                                                    {item.device}
                                                </Badge>
                                            </td>
                                            <td className="text-right font-mono">{item.percentage}%</td>
                                            <td className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <div className="w-32 h-2 bg-bg-muted rounded-full overflow-hidden">
                                                        <div className="h-full bg-primary rounded-full" style={{ width: `${(item.percentage / 22.5) * 100}%` }} />
                                                    </div>
                                                </div>
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
