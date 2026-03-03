import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import type { DashboardDateRange, MarketingPerformanceItem } from '@/types';
import { useMarketingStats } from '@/hooks/useDashboard';

type MarketingTab = 'all' | 'banner' | 'event';

const TAB_LABELS: Record<MarketingTab, string> = {
  all: '전체',
  banner: '배너',
  event: '이벤트',
};

interface MarketingPerformanceProps {
  dateRange?: DashboardDateRange;
}

export function MarketingPerformance({ dateRange }: MarketingPerformanceProps) {
  const { marketingStats, isLoading } = useMarketingStats(dateRange);
  const [activeTab, setActiveTab] = useState<MarketingTab>('all');

  if (isLoading || !marketingStats) {
    return <Spinner layout="fullHeight" />;
  }

  const filteredItems: MarketingPerformanceItem[] =
    activeTab === 'all'
      ? marketingStats.items
      : marketingStats.items.filter((i) => i.type === activeTab);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-txt-main">마케팅 성과 분석</h2>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 요약 카드 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '총 노출수', value: marketingStats.totalImpressions.toLocaleString() },
            { label: '총 클릭수', value: marketingStats.totalClicks.toLocaleString() },
            { label: '평균 클릭율(CTR)', value: `${marketingStats.avgCtr}%` },
            { label: '평균 전환율', value: `${marketingStats.avgConversionRate}%` },
          ].map((stat) => (
            <div key={stat.label} className="p-4 bg-bg-hover rounded-lg text-center">
              <p className="text-sm text-txt-muted">{stat.label}</p>
              <p className="text-xl font-bold text-txt-main mt-1">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* 탭 */}
        <div className="flex gap-4 border-b border-border">
          {(Object.keys(TAB_LABELS) as MarketingTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-txt-muted hover:text-txt-main'
              }`}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* 테이블 */}
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr>
                <th>항목명</th>
                <th>유형</th>
                <th className="text-right">노출수</th>
                <th className="text-right">클릭수</th>
                <th className="text-right">클릭율</th>
                <th className="text-right">전환수</th>
                <th className="text-right">전환율</th>
                <th>유입경로</th>
                <th className="text-right">체류시간</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td className="font-medium">{item.name}</td>
                  <td>
                    <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${
                      item.type === 'banner' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {item.type === 'banner' ? '배너' : '이벤트'}
                    </span>
                  </td>
                  <td className="text-right font-mono">{item.impressions.toLocaleString()}</td>
                  <td className="text-right font-mono">{item.clicks.toLocaleString()}</td>
                  <td className="text-right font-mono">{item.ctr}%</td>
                  <td className="text-right font-mono">{item.conversions.toLocaleString()}</td>
                  <td className="text-right font-mono">{item.conversionRate}%</td>
                  <td className="text-sm text-txt-muted">{item.trafficSource}</td>
                  <td className="text-right font-mono">{item.avgDwellTime}초</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
