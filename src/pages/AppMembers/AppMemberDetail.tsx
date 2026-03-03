import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  UserOutlined,
  HistoryOutlined,
  ShoppingOutlined,
  GiftOutlined,
  TagOutlined,
  WalletOutlined,
  BellOutlined,
} from '@ant-design/icons';

import { Card, Button, Badge, Spinner } from '@/components/ui';
import { useAppMember } from '@/hooks';
import { MEMBER_STATUS_LABELS } from '@/types';
import { getMemberGradeLabel, getGradeBadgeVariant } from '@/utils/memberGrade';
import type { MemberDetailTab } from '@/types/app-member';
import { MEMBER_DETAIL_TAB_LABELS } from '@/types/app-member';

// Tabs
import { MemberInfoTab } from './tabs/MemberInfoTab';
import { UsageLogTab } from './tabs/UsageLogTab';
import { OrderHistoryTab } from './tabs/OrderHistoryTab';
import { PointHistoryTab } from './tabs/PointHistoryTab';
import { CouponHistoryTab } from './tabs/CouponHistoryTab';
import { VoucherHistoryTab } from './tabs/VoucherHistoryTab';
import { NotificationHistoryTab } from './tabs/NotificationHistoryTab';

// Tab icons
const TAB_ICONS: Record<MemberDetailTab, React.ReactNode> = {
  info: <UserOutlined />,
  usage_log: <HistoryOutlined />,
  orders: <ShoppingOutlined />,
  points: <GiftOutlined />,
  coupons: <TagOutlined />,
  vouchers: <WalletOutlined />,
  notifications: <BellOutlined />,
};

export const AppMemberDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<MemberDetailTab>('info');

  const { member, isLoading, error } = useAppMember(id);

  // 상태별 Badge 색상
  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'dormant':
        return 'default';
      case 'withdrawn':
        return 'critical';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return <Spinner layout="center" />;
  }

  if (error || !member) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <p className="text-txt-muted mb-4">회원을 찾을 수 없습니다.</p>
        <Button onClick={() => navigate('/app-members')}>목록으로 돌아가기</Button>
      </div>
    );
  }

  // 탭 컨텐츠 렌더링
  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return <MemberInfoTab member={member} />;
      case 'usage_log':
        return <UsageLogTab memberId={member.id} />;
      case 'orders':
        return <OrderHistoryTab memberId={member.id} />;
      case 'points':
        return <PointHistoryTab memberId={member.id} />;
      case 'coupons':
        return <CouponHistoryTab memberId={member.id} />;
      case 'vouchers':
        return <VoucherHistoryTab memberId={member.id} />;
      case 'notifications':
        return <NotificationHistoryTab memberId={member.id} />;
      default:
        return null;
    }
  };

  const tabs: MemberDetailTab[] = [
    'info',
    'usage_log',
    'orders',
    'points',
    'coupons',
    'vouchers',
    'notifications',
  ];

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/app-members')}
          className="p-2"
        >
          <ArrowLeftOutlined />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-txt-main">{member.name}</h1>
            <Badge variant={getGradeBadgeVariant(member.grade)}>
              {getMemberGradeLabel(member.grade)}
            </Badge>
            <Badge variant={getStatusBadgeVariant(member.status)}>
              {MEMBER_STATUS_LABELS[member.status]}
            </Badge>
          </div>
          <p className="text-sm text-txt-muted mt-1">
            회원 ID: {member.memberId} · 가입일:{' '}
            {new Date(member.registeredAt).toLocaleDateString('ko-KR')}
          </p>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <Card>
        <div className="flex border-b border-border overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                border-b-2 transition-colors
                ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-txt-muted hover:text-txt-main hover:bg-bg-hover'
                }
              `}
            >
              {TAB_ICONS[tab]}
              {MEMBER_DETAIL_TAB_LABELS[tab]}
            </button>
          ))}
        </div>

        {/* 탭 컨텐츠 */}
        <div className="p-0">{renderTabContent()}</div>
      </Card>
    </div>
  );
};
