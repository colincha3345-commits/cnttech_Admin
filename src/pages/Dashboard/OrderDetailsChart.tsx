import { useState } from 'react';
import { ArrowRightOutlined } from '@ant-design/icons';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type OrderTab = '주문 유형 별' | '채널 별' | '결제수단 별' | '회원 별';

// This would come from props or a hook in a real app
const mockData = {
  '주문 유형 별': [
    { label: '배달', value: 65 },
    { label: '포장', value: 35 },
  ],
  '채널 별': [
    { label: '앱', value: 50 },
    { label: '웹', value: 30 },
    { label: '전화', value: 20 },
  ],
  '결제수단 별': [
    { label: '신용카드', value: 70 },
    { label: '현금', value: 10 },
    { label: '포인트', value: 20 },
  ],
  '회원 별': [
    { label: '회원', value: 85 },
    { label: '비회원', value: 15 },
  ],
};

export function OrderDetailsChart() {
  const [activeTab, setActiveTab] = useState<OrderTab>('주문 유형 별');
  const chartData = mockData[activeTab];

  return (
    <Card>
      <CardHeader>
        <h2 className="text-lg font-semibold text-txt-main">주문 상세</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 border-b border-border">
          {(Object.keys(mockData) as OrderTab[]).map((tab) => (
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
