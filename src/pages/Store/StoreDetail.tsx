/**
 * 매장 상세 페이지
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

import {
  Card,
  Button,
  Badge,
  Spinner,
  ConfirmDialog,
} from '@/components/ui';
import {
  useStoreWithStaff,
  useDeleteStore,
  useUnlinkStaffFromStore,
  useToast,
} from '@/hooks';
import {
  STORE_STATUS_LABELS,
  type StoreStatus,
  type ContractStatus,
  type StoreStaffRole,
} from '@/types/store';
import { type StaffStatus } from '@/types/staff';

// 탭 컴포넌트 임포트
import { StoreBasicTab } from './components/tabs/StoreBasicTab';
import { StoreBusinessTab } from './components/tabs/StoreBusinessTab';
import { StoreOperatingTab } from './components/tabs/StoreOperatingTab';
import { StoreIntegrationTab } from './components/tabs/StoreIntegrationTab';
import { StorePaymentTab } from './components/tabs/StorePaymentTab';
import { StoreStaffTab } from './components/tabs/StoreStaffTab';

type TabKey = 'basic' | 'business' | 'operating' | 'integration' | 'payment' | 'staff';

interface TabItem {
  key: TabKey;
  label: string;
}

const TABS: TabItem[] = [
  { key: 'basic', label: '기본 정보' },
  { key: 'business', label: '사업자정보' },
  { key: 'operating', label: '영업정보' },
  { key: 'integration', label: '연동정보' },
  { key: 'payment', label: '결제수단' },
  { key: 'staff', label: '가맹점주' },
];

export const StoreDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState<TabKey>('basic');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState<{ linkId: string; staffName: string } | null>(null);

  const { data: store, isLoading } = useStoreWithStaff(id);
  const deleteStore = useDeleteStore();
  const unlinkStaff = useUnlinkStaffFromStore();

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteStore.mutateAsync(id);
      toast.success('매장이 삭제되었습니다.');
      navigate('/staff/stores');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '삭제에 실패했습니다.');
    }
  };

  const handleUnlink = async () => {
    if (!unlinkTarget) return;
    try {
      await unlinkStaff.mutateAsync(unlinkTarget.linkId);
      toast.success('가맹점주 연결이 해제되었습니다.');
      setUnlinkTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '연결 해제에 실패했습니다.');
    }
  };

  const getStatusBadgeVariant = (status: StoreStatus) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'pending': return 'info';
      case 'terminated': return 'critical';
      default: return 'secondary';
    }
  };

  const getContractBadgeVariant = (status: ContractStatus) => {
    switch (status) {
      case 'active': return 'success';
      case 'expired': return 'critical';
      case 'pending_renewal': return 'warning';
      default: return 'secondary';
    }
  };

  const getRoleBadgeVariant = (role: StoreStaffRole) => {
    return role === 'owner' ? 'info' : 'secondary';
  };

  const getStaffStatusBadgeVariant = (status: StaffStatus) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      default: return 'secondary';
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!store) {
    return (
      <div className="text-center py-12">
        <p className="text-txt-muted">매장을 찾을 수 없습니다.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate('/staff/stores')}>
          목록으로 돌아가기
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/staff/stores')}
            className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
          >
            <ArrowLeftOutlined />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-txt-main">{store.name}</h1>
              <Badge variant={getStatusBadgeVariant(store.status)}>
                {STORE_STATUS_LABELS[store.status]}
              </Badge>
            </div>
            <p className="text-sm text-txt-muted mt-1">
              ({store.address.zipCode}) {store.address.address} {store.address.addressDetail}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/staff/stores/${id}/edit`)}>
            <EditOutlined className="mr-1" />
            기본정보 수정
          </Button>
          <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
            <DeleteOutlined className="mr-1" />
            삭제
          </Button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="flex gap-2 border-b border-border">
        {TABS.map((tab) => (
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

      {/* 탭 컨텐츠 */}
      <Card className="p-6">
        {activeTab === 'basic' && (
          <StoreBasicTab
            store={store}
            getStatusBadgeVariant={getStatusBadgeVariant}
            formatDate={formatDate}
          />
        )}
        
        {activeTab === 'business' && (
          <StoreBusinessTab
            store={store}
            getContractBadgeVariant={getContractBadgeVariant}
            formatDate={formatDate}
          />
        )}

        {activeTab === 'operating' && id && (
          <StoreOperatingTab store={store} navigate={navigate} id={id} />
        )}

        {activeTab === 'integration' && id && (
          <StoreIntegrationTab store={store} navigate={navigate} id={id} />
        )}

        {activeTab === 'payment' && id && (
          <StorePaymentTab store={store} navigate={navigate} id={id} />
        )}

        {activeTab === 'staff' && (
          <StoreStaffTab
            store={store}
            getRoleBadgeVariant={getRoleBadgeVariant}
            getStaffStatusBadgeVariant={getStaffStatusBadgeVariant}
            setUnlinkTarget={setUnlinkTarget}
          />
        )}
      </Card>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="매장 삭제"
        message={`'${store.name}' 매장을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        type="warning"
      />

      {/* 가맹점주 연결 해제 확인 */}
      <ConfirmDialog
        isOpen={!!unlinkTarget}
        onClose={() => setUnlinkTarget(null)}
        onConfirm={handleUnlink}
        title="가맹점주 연결 해제"
        message={`'${unlinkTarget?.staffName}' 가맹점주의 연결을 해제하시겠습니까? 새 점주를 초대하려면 먼저 해제해야 합니다.`}
        confirmText="해제"
        type="warning"
      />
    </div>
  );
};
