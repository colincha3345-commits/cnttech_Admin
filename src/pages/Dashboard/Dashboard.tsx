import { useState } from 'react';
import {
  DollarOutlined,
  ShoppingCartOutlined,
  UserAddOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

import { Spinner } from '@/components/ui/Spinner';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { DateRangeFilter, getDateRangeFromPreset } from '@/components/ui/DateRangeFilter';
import { DevGuide, DASHBOARD_DEV_GUIDE } from '@/components/dev';
import { useDashboard, useDashboardExport } from '@/hooks/useDashboard';
import { downloadDashboardExcel } from '@/utils/excel';
import { usePageViewLog } from '@/hooks/useActivityLog';
import type { DashboardDateRange } from '@/types';

import { InfoCard } from './InfoCard';
import { OrderDetailsChart } from './OrderDetailsChart';
import { DailySalesChart } from './DailySalesChart';
import { MemberAnalytics } from './MemberAnalytics';
import { MarketingPerformance } from './MarketingPerformance';
import { RecentLogins } from './RecentLogins';

export function Dashboard() {
  usePageViewLog('dashboard');
  const navigate = useNavigate();
  const now = new Date();

  const [dateRange, setDateRange] = useState<DashboardDateRange>({
    preset: 'today',
    ...getDateRangeFromPreset('today'),
  });

  const { stats, isLoading } = useDashboard(dateRange);
  const { fetchExportData, isExporting } = useDashboardExport(dateRange);

  const handleExcelDownload = async () => {
    const result = await fetchExportData();
    if (result.data?.data) {
      downloadDashboardExcel(result.data.data);
    }
  };

  const mockInfoCards = [
    {
      title: '매출 현황',
      stats: [
        { label: '전체 주문 금액', value: stats ? stats.todayRevenue.toLocaleString() : '-' },
        { label: '주문 완료 금액', value: stats ? Math.round(stats.todayRevenue * 0.6).toLocaleString() : '-' },
        { label: '주문 취소 금액', value: stats ? Math.round(stats.todayRevenue * 0.1).toLocaleString() : '-' },
      ],
      buttonText: '주문내역 확인하러 가기',
      onButtonClick: () => navigate('/orders'),
    },
    {
      title: '회원 현황',
      stats: [
        { label: '전체 회원 수', value: '88,000' },
        { label: '신규 일반 회원가입 수', value: '80' },
        { label: '신규 간편 회원가입 수', value: '60' },
        { label: '탈퇴 회원 수', value: '8' },
      ],
      buttonText: '회원 정보 확인하러 가기',
      onButtonClick: () => navigate('/app-members'),
    },
    {
      title: '문의 현황',
      stats: [
        { label: '신규 문의', value: '88' },
        { label: '미확인 문의', value: '80' },
        { label: '확인 문의', value: '8' },
        { label: '진행 중 문의', value: '8' },
      ],
      buttonText: '1:1 문의 확인하러 가기',
      onButtonClick: () => alert('준비 중인 기능입니다.'),
    },
  ];

  if (isLoading) {
    return <Spinner layout="fullHeight" />;
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-txt-main">운영 현황</h1>
            <p className="text-sm text-txt-muted mt-1">
              {format(now, 'yyyy-MM-dd eeee', { locale: ko })} (최종 업데이트 :{' '}
              {format(now, 'yyyy년 M월 d일 HH:mm')})
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExcelDownload}
              disabled={isExporting}
            >
              <DownloadOutlined style={{ fontSize: 14 }} />
              {isExporting ? '다운로드 중...' : '엑셀 다운로드'}
            </Button>
            <DevGuide {...DASHBOARD_DEV_GUIDE} />
          </div>
        </div>
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>

      {/* 상단 4개 카드 */}
      <div className="admin-grid">
        <StatCard
          title="전체 주문 금액"
          value={stats?.todayRevenue ?? 0}
          icon={<DollarOutlined />}
          color="neutral"
          format="currency"
        />
        <StatCard
          title="전체 주문 수"
          value={stats?.todayOrders ?? 0}
          icon={<ShoppingCartOutlined />}
          color="neutral"
        />
        <StatCard
          title="최소 주문 건수"
          value={10}
          icon={<ShoppingCartOutlined />}
          color="neutral"
        />
        <StatCard
          title="신규 가입 회원 수"
          value={180}
          icon={<UserAddOutlined />}
          color="neutral"
        />
      </div>

      {/* 중간 3개 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {mockInfoCards.map((card) => (
          <InfoCard
            key={card.title}
            title={card.title}
            stats={card.stats}
            buttonText={card.buttonText}
            onButtonClick={card.onButtonClick}
          />
        ))}
      </div>

      {/* 하단 2개 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrderDetailsChart />
        <DailySalesChart />
      </div>

      {/* 마케팅 성과 분석 */}
      <MarketingPerformance dateRange={dateRange} />

      {/* 최근 로그인 이력 */}
      <RecentLogins />

      {/* 회원 분석 */}
      <MemberAnalytics />
    </div>
  );
}
