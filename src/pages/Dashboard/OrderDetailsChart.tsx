import { useState } from 'react';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useOrderDetails } from '@/hooks/useDashboard';

type OrderTab = '주문 유형 별' | '채널 별' | '결제수단 별' | '회원 별';

const TAB_KEYS: Record<OrderTab, 'byType' | 'byChannel' | 'byPayment' | 'byMember'> = {
  '주문 유형 별': 'byType',
  '채널 별': 'byChannel',
  '결제수단 별': 'byPayment',
  '회원 별': 'byMember',
};

export function OrderDetailsChart() {
  const { orderDetails, isLoading } = useOrderDetails();
  const [activeTab, setActiveTab] = useState<OrderTab>('주문 유형 별');
  const chartData = orderDetails?.[TAB_KEYS[activeTab]] ?? [];

  if (isLoading) return <Spinner layout="center" />;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-txt-main">주문 상세</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 border-b border-border">
          {(Object.keys(TAB_KEYS) as OrderTab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-txt-muted hover:text-txt-main'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="space-y-4 py-4">
          {chartData.map((item) => (
            <div key={item.label}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-txt-main">{item.label}</span>
                <span className="text-sm font-semibold text-txt-main">{item.value}%</span>
              </div>
              <div className="h-8 bg-bg-hover rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full" style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>

        <Button variant="ghost" className="w-full justify-between">
          주문내역 확인하러 가기
          <ArrowRightOutlined style={{ fontSize: 14 }} />
        </Button>
      </CardContent>
    </Card>
  );
}
