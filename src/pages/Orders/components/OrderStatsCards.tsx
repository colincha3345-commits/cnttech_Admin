import {
  Card,
  CardContent,
} from '@/components/ui';
import {
  ShoppingCartOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';

interface OrderStatsCardsProps {
  stats?: {
    totalOrders: number;
    pendingOrders: number;
    completedToday: number;
    cancelledToday: number;
  };
}

export function OrderStatsCards({ stats }: OrderStatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShoppingCartOutlined className="text-lg text-primary" />
            </div>
            <div>
              <p className="text-xs text-txt-muted">전체 주문</p>
              <p className="text-xl font-bold text-txt-main">{stats?.totalOrders ?? 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <ClockCircleOutlined className="text-lg text-warning" />
            </div>
            <div>
              <p className="text-xs text-txt-muted">대기 중</p>
              <p className="text-xl font-bold text-txt-main">{stats?.pendingOrders ?? 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <CheckCircleOutlined className="text-lg text-success" />
            </div>
            <div>
              <p className="text-xs text-txt-muted">오늘 완료</p>
              <p className="text-xl font-bold text-txt-main">{stats?.completedToday ?? 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-critical/10 flex items-center justify-center">
              <CloseCircleOutlined className="text-lg text-critical" />
            </div>
            <div>
              <p className="text-xs text-txt-muted">오늘 취소</p>
              <p className="text-xl font-bold text-txt-main">{stats?.cancelledToday ?? 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
