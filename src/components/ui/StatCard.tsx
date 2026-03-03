import type { ReactNode } from 'react';
import { RiseOutlined, FallOutlined, MinusOutlined } from '@ant-design/icons';

import { Card, CardContent } from './Card';

type StatCardColor = 'primary' | 'success' | 'warning' | 'critical' | 'info' | 'neutral';

interface StatCardProps {
  /** 통계 항목 제목 */
  title: string;
  /** 통계 값 */
  value: number | string;
  /** 아이콘 */
  icon: ReactNode;
  /** 색상 테마 */
  color: StatCardColor;
  /** 변화율 (%) - 양수면 증가, 음수면 감소 */
  change?: number;
  /** 값 포맷 타입 */
  format?: 'number' | 'currency' | 'percent';
  /** 부가 정보 */
  subValue?: string;
}

const colorClasses: Record<StatCardColor, string> = {
  primary: 'text-primary bg-primary-light',
  success: 'text-success bg-success-light',
  warning: 'text-warning bg-warning-light',
  critical: 'text-critical bg-critical-light',
  info: 'text-info bg-info-light',
  neutral: 'text-gray-500 bg-gray-100',
};

// 금액 포맷 (만원 단위)
function formatCurrency(value: number): string {
  if (value >= 100000000) {
    return `${(value / 100000000).toFixed(1)}억원`;
  }
  if (value >= 10000) {
    return `${Math.floor(value / 10000).toLocaleString()}만원`;
  }
  return `${value.toLocaleString()}원`;
}

// 값 포맷팅
function formatValue(value: number | string, format?: 'number' | 'currency' | 'percent'): string {
  if (typeof value === 'string') return value;

  switch (format) {
    case 'currency':
      return formatCurrency(value);
    case 'percent':
      return `${value.toFixed(1)}%`;
    default:
      return value.toLocaleString();
  }
}

/**
 * 통계 카드 컴포넌트
 */
export function StatCard({ title, value, icon, color, change, format, subValue }: StatCardProps) {
  const displayValue = formatValue(value, format);

  const renderChange = () => {
    if (change === undefined) return null;

    const isPositive = change > 0;
    const isZero = change === 0;

    return (
      <div
        className={`flex items-center gap-1 text-xs mt-1 ${
          isZero ? 'text-txt-muted' : isPositive ? 'text-success' : 'text-critical'
        }`}
      >
        {isZero ? (
          <MinusOutlined style={{ fontSize: 12 }} />
        ) : isPositive ? (
          <RiseOutlined style={{ fontSize: 12 }} />
        ) : (
          <FallOutlined style={{ fontSize: 12 }} />
        )}
        <span>
          {isPositive ? '+' : ''}
          {change.toFixed(1)}%
        </span>
        <span className="text-txt-muted">전일 대비</span>
      </div>
    );
  };

  return (
    <Card hover>
      <CardContent className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-txt-muted">{title}</p>
          <p className="text-2xl font-semibold text-txt-main">{displayValue}</p>
          {renderChange()}
          {subValue && (
            <p className="text-xs text-txt-muted mt-1">{subValue}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
