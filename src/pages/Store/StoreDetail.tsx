/**
 * 매장 상세 페이지
 */
import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
} from '@ant-design/icons';

import {
  Card,
  Button,
  Badge,
  Spinner,
  MaskedData,
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
  CONTRACT_STATUS_LABELS,
  CONTRACT_TYPE_LABELS,
  STORE_STAFF_ROLE_LABELS,
  POS_VENDORS,
  PG_VENDORS,
  APP_OPERATING_STATUS_LABELS,
  WEEK_DAY_LABELS,
  REGULAR_CLOSED_TYPE_LABELS,
  WEEK_DAY_SHORT_LABELS,
  WEEK_DAYS,
  SIMPLE_PAYMENT_LABELS,
  type StoreStatus,
  type ContractStatus,
  type StoreStaffRole,
} from '@/types/store';
import { STAFF_STATUS_LABELS, type StaffStatus } from '@/types/staff';
import { StaffLinkModal } from './components/StaffLinkModal';

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
  { key: 'staff', label: '연결된 직원' },
];

export const StoreDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabKey>('basic');
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [unlinkTarget, setUnlinkTarget] = useState<{ linkId: string; staffName: string } | null>(
    null
  );

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
      toast.success('직원 연결이 해제되었습니다.');
      setUnlinkTarget(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '연결 해제에 실패했습니다.');
    }
  };

  const getStatusBadgeVariant = (status: StoreStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'pending':
        return 'info';
      case 'terminated':
        return 'critical';
      default:
        return 'secondary';
    }
  };

  const getContractBadgeVariant = (status: ContractStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'expired':
        return 'critical';
      case 'pending_renewal':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const getRoleBadgeVariant = (role: StoreStaffRole) => {
    return role === 'owner' ? 'info' : 'secondary';
  };

  const getStaffStatusBadgeVariant = (status: StaffStatus) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      default:
        return 'secondary';
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
              {store.address.address} {store.address.addressDetail}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/staff/stores/${id}/edit`)}>
            <EditOutlined className="mr-1" />
            수정
          </Button>
          <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
            <DeleteOutlined className="mr-1" />
            삭제
          </Button>
        </div>
      </div>

      {/* 탭 */}
      <div className="flex gap-2 border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key
              ? 'border-primary text-primary'
              : 'border-transparent text-txt-muted hover:text-txt-main'
              }`}
          >
            {tab.label}
            {tab.key === 'staff' && store.staffLinks.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded-full">
                {store.staffLinks.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 탭 컨텐츠 */}
      <Card className="p-6">
        {activeTab === 'basic' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold">기본 정보</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm text-txt-muted">매장명</label>
                <p className="mt-1 font-medium">{store.name}</p>
              </div>
              <div>
                <label className="text-sm text-txt-muted">매장 코드</label>
                <p className="mt-1 font-mono">{store.code || '-'}</p>
              </div>
              <div>
                <label className="text-sm text-txt-muted">상태</label>
                <div className="mt-1">
                  <Badge variant={getStatusBadgeVariant(store.status)}>
                    {STORE_STATUS_LABELS[store.status]}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm text-txt-muted">오픈일</label>
                <p className="mt-1">{store.openingDate ? formatDate(store.openingDate) : '-'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm text-txt-muted">주소</label>
                <p className="mt-1">
                  ({store.address.zipCode}) {store.address.address} {store.address.addressDetail}
                </p>
              </div>
              <div>
                <label className="text-sm text-txt-muted">지역</label>
                <p className="mt-1">{store.address.region}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'business' && (
          <div className="space-y-10">
            {/* 가맹점주 정보 */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b border-border pb-2">가맹점주 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-txt-muted">점주명</label>
                  <p className="mt-1 font-medium">{store.owner.name}</p>
                </div>
                <div>
                  <label className="text-sm text-txt-muted">연락처</label>
                  <div className="mt-1">
                    <MaskedData value={store.owner.phone} />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-txt-muted">이메일</label>
                  <p className="mt-1">{store.owner.email || '-'}</p>
                </div>
              </div>
            </div>

            {/* 사업자 정보 */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b border-border pb-2">사업자 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-txt-muted">사업자등록번호</label>
                  <p className="mt-1 font-mono">{store.business.businessNumber}</p>
                </div>
                <div>
                  <label className="text-sm text-txt-muted">상호명</label>
                  <p className="mt-1 font-medium">{store.business.businessName}</p>
                </div>
                <div>
                  <label className="text-sm text-txt-muted">대표자명</label>
                  <p className="mt-1">{store.business.representativeName}</p>
                </div>
                <div>
                  <label className="text-sm text-txt-muted">업종</label>
                  <p className="mt-1">{store.business.businessType || '-'}</p>
                </div>
                <div>
                  <label className="text-sm text-txt-muted">업태</label>
                  <p className="mt-1">{store.business.businessCategory || '-'}</p>
                </div>
              </div>
            </div>

            {/* 계약 정보 — 본사↔매장 가맹 계약 */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b border-border pb-2">계약 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {store.contract.contractType && (
                  <div>
                    <label className="text-sm text-txt-muted">계약 유형</label>
                    <p className="mt-1">{CONTRACT_TYPE_LABELS[store.contract.contractType]}</p>
                  </div>
                )}
                <div>
                  <label className="text-sm text-txt-muted">계약 상태</label>
                  <div className="mt-1">
                    <Badge variant={getContractBadgeVariant(store.contract.contractStatus)}>
                      {CONTRACT_STATUS_LABELS[store.contract.contractStatus]}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-txt-muted">계약일</label>
                  <p className="mt-1">{formatDate(store.contract.contractDate)}</p>
                </div>
                <div>
                  <label className="text-sm text-txt-muted">만료일</label>
                  <p className="mt-1">{formatDate(store.contract.expirationDate)}</p>
                </div>
                {store.contract.notes && (
                  <div className="md:col-span-2">
                    <label className="text-sm text-txt-muted">비고</label>
                    <p className="mt-1">{store.contract.notes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* 계좌 정보 */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b border-border pb-2">계좌 정보</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="text-sm text-txt-muted">은행</label>
                  <p className="mt-1">{store.bankAccount.bankName}</p>
                </div>
                <div>
                  <label className="text-sm text-txt-muted">계좌번호</label>
                  <div className="mt-1">
                    <MaskedData value={store.bankAccount.accountNumber} />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-txt-muted">예금주</label>
                  <p className="mt-1">{store.bankAccount.accountHolder}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'operating' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">영업 정보</h2>
              <Button size="sm" variant="outline" onClick={() => navigate(`/staff/stores/${id}/edit/operating`)}>
                <EditOutlined className="mr-1" />
                수정
              </Button>
            </div>

            {store.operatingInfo ? (
              <>
                {/* 매장 노출 상태 */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium border-b border-border pb-2">매장 노출</h3>
                  <div className="flex items-center gap-4">
                    <Badge
                      variant={store.operatingInfo.isVisible !== false ? 'success' : 'critical'}
                      className="text-base px-4 py-2"
                    >
                      {store.operatingInfo.isVisible !== false ? '노출' : '비노출'}
                    </Badge>
                    <span className="text-sm text-txt-muted">
                      {store.operatingInfo.isVisible !== false
                        ? '고객에게 매장이 노출되고 있습니다.'
                        : '현재 매장이 비노출 상태입니다. 고객에게 보이지 않습니다.'}
                    </span>
                  </div>
                </div>

                {/* 앱 운영상태 */}
                {store.operatingInfo.appOperatingStatus && (
                  <div className="space-y-4">
                    <h3 className="text-md font-medium border-b border-border pb-2">앱 운영상태</h3>
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={
                          store.operatingInfo.appOperatingStatus === 'open'
                            ? 'success'
                            : store.operatingInfo.appOperatingStatus === 'preparing'
                              ? 'warning'
                              : store.operatingInfo.appOperatingStatus === 'break_time'
                                ? 'info'
                                : 'critical'
                        }
                        className="text-base px-4 py-2"
                      >
                        {APP_OPERATING_STATUS_LABELS[store.operatingInfo.appOperatingStatus]}
                      </Badge>
                      <span className="text-sm text-txt-muted">
                        앱에서 고객에게 보이는 현재 운영 상태입니다.
                      </span>
                    </div>
                  </div>
                )}

                {/* 영업시간 */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium border-b border-border pb-2">영업시간</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-bg-hover rounded-lg">
                      <label className="text-sm text-txt-muted">평일</label>
                      {store.operatingInfo.weekdayHours.isOpen ? (
                        <p className="mt-1 font-medium">
                          {store.operatingInfo.weekdayHours.openTime} ~ {store.operatingInfo.weekdayHours.closeTime}
                          <span className="block text-xs text-txt-muted mt-1">(라스트오더: 마감 {store.operatingInfo.weekdayHours.lastOrderMinutes ?? 30}분 전)</span>
                        </p>
                      ) : (
                        <p className="mt-1 text-txt-muted">휴무</p>
                      )}
                    </div>
                    <div className="p-4 bg-bg-hover rounded-lg">
                      <label className="text-sm text-txt-muted">주말</label>
                      {store.operatingInfo.weekendHours.isOpen ? (
                        <p className="mt-1 font-medium">
                          {store.operatingInfo.weekendHours.openTime} ~ {store.operatingInfo.weekendHours.closeTime}
                          <span className="block text-xs text-txt-muted mt-1">(라스트오더: 마감 {store.operatingInfo.weekendHours.lastOrderMinutes ?? 30}분 전)</span>
                        </p>
                      ) : (
                        <p className="mt-1 text-txt-muted">휴무</p>
                      )}
                    </div>
                    {store.operatingInfo.holidayHours && (
                      <div className="p-4 bg-bg-hover rounded-lg">
                        <label className="text-sm text-txt-muted">공휴일</label>
                        {store.operatingInfo.holidayHours.isOpen ? (
                          <p className="mt-1 font-medium">
                            {store.operatingInfo.holidayHours.openTime} ~ {store.operatingInfo.holidayHours.closeTime}
                            <span className="block text-xs text-txt-muted mt-1">(라스트오더: 마감 {store.operatingInfo.holidayHours.lastOrderMinutes ?? 30}분 전)</span>
                          </p>
                        ) : (
                          <p className="mt-1 text-txt-muted">휴무</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* 배달비 정책 */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium border-b border-border pb-2">배달비 정책</h3>
                  <div className="p-3 bg-bg-hover rounded-lg flex items-center justify-between">
                    <span className="text-sm text-txt-secondary">배달비는 상권관리에서 설정합니다.</span>
                    <button
                      onClick={() => navigate('/delivery-zones')}
                      className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
                    >
                      상권관리로 이동 →
                    </button>
                  </div>
                </div>

                {/* 영업 상태 */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium border-b border-border pb-2">영업 상태</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm text-txt-muted">임시 휴업</label>
                      <div className="mt-1">
                        <Badge variant={store.operatingInfo.isTemporarilyClosed ? 'critical' : 'success'}>
                          {store.operatingInfo.isTemporarilyClosed ? '휴업중' : '정상영업'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-txt-muted">배달</label>
                      <div className="mt-1">
                        <Badge variant={store.operatingInfo.isDeliveryAvailable ? 'success' : 'secondary'}>
                          {store.operatingInfo.isDeliveryAvailable ? '가능' : '불가'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-txt-muted">포장</label>
                      <div className="mt-1">
                        <Badge variant={store.operatingInfo.isPickupAvailable ? 'success' : 'secondary'}>
                          {store.operatingInfo.isPickupAvailable ? '가능' : '불가'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  {store.operatingInfo.isTemporarilyClosed && store.operatingInfo.temporaryCloseReason && (
                    <div className="p-4 bg-critical/10 rounded-lg">
                      <label className="text-sm text-critical">휴업 사유</label>
                      <p className="mt-1">{store.operatingInfo.temporaryCloseReason}</p>
                    </div>
                  )}
                </div>

                {/* 요일별 영업시간 (dailyHours가 있을 경우) */}
                {store.operatingInfo.dailyHours && (
                  <div className="space-y-4">
                    <h3 className="text-md font-medium border-b border-border pb-2">요일별 영업시간</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      {WEEK_DAYS.map((day) => {
                        const hours = store.operatingInfo!.dailyHours![day];
                        return (
                          <div key={day} className="p-3 bg-bg-hover rounded-lg">
                            <label className="text-sm text-txt-muted">{WEEK_DAY_SHORT_LABELS[day]}</label>
                            {hours.isOpen ? (
                              <p className="mt-1 font-medium text-sm">
                                {hours.openTime} ~ {hours.closeTime}
                                <span className="block text-xs text-txt-muted mt-1">
                                  라스트오더 마감 {hours.lastOrderMinutes ?? 30}분 전
                                </span>
                                {hours.breakStart && hours.breakEnd && (
                                  <span className="block text-xs text-txt-muted mt-0.5">휴게 {hours.breakStart}~{hours.breakEnd}</span>
                                )}
                              </p>
                            ) : (
                              <p className="mt-1 text-txt-muted text-sm">휴무</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 배달 상세 설정 */}
                {store.operatingInfo.deliverySettings && (
                  <div className="space-y-4">
                    <h3 className="text-md font-medium border-b border-border pb-2">배달 상세 설정</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <label className="text-sm text-txt-muted">배달 가능</label>
                        <div className="mt-1">
                          <Badge variant={store.operatingInfo.deliverySettings.isAvailable ? 'success' : 'secondary'}>
                            {store.operatingInfo.deliverySettings.isAvailable ? '가능' : '불가'}
                          </Badge>
                        </div>
                      </div>
                      {store.operatingInfo.deliverySettings.isAvailable && (
                        <>
                          <div>
                            <label className="text-sm text-txt-muted">배달 주문 가능 시간</label>
                            <p className="mt-1 text-sm text-txt-secondary">영업 시작 ~ 마감 전 라스트오더 시간까지 자동 적용</p>
                          </div>
                          {store.operatingInfo.deliverySettings.minOrderAmount != null && (
                            <div>
                              <label className="text-sm text-txt-muted">최소 주문금액</label>
                              <div className="mt-1 flex items-center gap-2">
                                <span className="font-medium">{store.operatingInfo.deliverySettings.minOrderAmount.toLocaleString()}원</span>
                                <button
                                  onClick={() => navigate('/delivery-zones')}
                                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                                >
                                  상권관리에서 설정
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* 포장 상세 설정 */}
                {store.operatingInfo.pickupSettings && (
                  <div className="space-y-4">
                    <h3 className="text-md font-medium border-b border-border pb-2">포장 상세 설정</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div>
                        <label className="text-sm text-txt-muted">포장 가능</label>
                        <div className="mt-1">
                          <Badge variant={store.operatingInfo.pickupSettings.isAvailable ? 'success' : 'secondary'}>
                            {store.operatingInfo.pickupSettings.isAvailable ? '가능' : '불가'}
                          </Badge>
                        </div>
                      </div>
                      {store.operatingInfo.pickupSettings.isAvailable && (
                        <>
                          <div>
                            <label className="text-sm text-txt-muted">포장 주문 가능 시간</label>
                            <p className="mt-1 text-sm text-txt-secondary">영업 시작 ~ 마감 전 라스트오더 시간까지 자동 적용</p>
                          </div>
                          {store.operatingInfo.pickupSettings.minOrderAmount != null && (
                            <div>
                              <label className="text-sm text-txt-muted">최소 주문금액</label>
                              <p className="mt-1 font-medium">{store.operatingInfo.pickupSettings.minOrderAmount.toLocaleString()}원</p>
                            </div>
                          )}
                        </>
                      )}
                      <div>
                        <label className="text-sm text-txt-muted">예약 가능</label>
                        <div className="mt-1">
                          <Badge variant="secondary">-</Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 정기휴무 */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border pb-2">
                    <h3 className="text-md font-medium">정기휴무</h3>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/staff/stores/${id}/edit/closed-day`)}>
                      <EditOutlined className="mr-1" />
                      수정
                    </Button>
                  </div>
                  {store.operatingInfo.regularClosedDays && store.operatingInfo.regularClosedDays.length > 0 ? (
                    <div className="space-y-2">
                      {store.operatingInfo.regularClosedDays.map((closedDay, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-bg-hover rounded-lg">
                          <Badge variant="secondary">
                            {REGULAR_CLOSED_TYPE_LABELS[closedDay.type]}
                          </Badge>
                          {closedDay.dayOfWeek && (
                            <span className="font-medium">
                              {closedDay.nthWeek && `${closedDay.nthWeek}째주 `}
                              {WEEK_DAY_LABELS[closedDay.dayOfWeek]}
                            </span>
                          )}
                          {closedDay.dates && (
                            <span className="font-medium">
                              {closedDay.dates.join(', ')}일
                            </span>
                          )}
                          {closedDay.description && (
                            <span className="text-sm text-txt-muted">
                              ({closedDay.description})
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-txt-muted">연중무휴</p>
                  )}
                </div>

                {/* 비정기 휴무 */}
                {store.operatingInfo.irregularClosedDays && store.operatingInfo.irregularClosedDays.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-md font-medium border-b border-border pb-2">비정기 휴무</h3>
                    <div className="space-y-2">
                      {store.operatingInfo.irregularClosedDays.map((day, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-bg-hover rounded-lg">
                          <span className="font-mono font-medium">{day.date}</span>
                          {day.reason && (
                            <span className="text-sm text-txt-muted">- {day.reason}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 매장 편의시설 */}
                {store.amenities && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <h3 className="text-md font-medium">매장 편의시설</h3>
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/staff/stores/${id}/edit/amenities`)}>
                        <EditOutlined className="mr-1" />
                        수정
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* 주차 */}
                      <div className="p-4 border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm text-txt-muted">주차</label>
                          <Badge variant={store.amenities.hasParking ? 'success' : 'secondary'}>
                            {store.amenities.hasParking ? '가능' : '불가'}
                          </Badge>
                        </div>
                        {store.amenities.hasParking && (
                          <div className="space-y-1">
                            {store.amenities.parkingNote && (
                              <p className="text-sm text-txt-muted">{store.amenities.parkingNote}</p>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 좌석 */}
                      <div className="p-4 border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm text-txt-muted">매장 내 식사</label>
                          <Badge variant={store.amenities.hasDineIn ? 'success' : 'secondary'}>
                            {store.amenities.hasDineIn ? '가능' : '불가'}
                          </Badge>
                        </div>
                        {store.amenities.hasDineIn && store.amenities.seatCapacity && (
                          <p className="text-sm">좌석 수: <span className="font-medium">{store.amenities.seatCapacity}석</span></p>
                        )}
                      </div>

                      {/* 와이파이 */}
                      <div className="p-4 border border-border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm text-txt-muted">와이파이</label>
                          <Badge variant={store.amenities.hasWifi ? 'success' : 'secondary'}>
                            {store.amenities.hasWifi ? '제공' : '미제공'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-txt-muted">영업 정보가 등록되지 않았습니다.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate(`/staff/stores/${id}/edit/operating`)}
                >
                  <EditOutlined className="mr-1" />
                  영업 정보 등록
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'integration' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">연동 정보</h2>
              <Button size="sm" variant="outline" onClick={() => navigate(`/staff/stores/${id}/edit/integration`)}>
                <EditOutlined className="mr-1" />
                수정
              </Button>
            </div>

            {store.integrationCodes ? (
              <div className="space-y-6">
                {/* POS 연동 */}
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-medium">POS 연동</h3>
                    <Badge variant={store.integrationCodes.pos.isConnected ? 'success' : 'secondary'}>
                      {store.integrationCodes.pos.isConnected ? '연동됨' : '미연동'}
                    </Badge>
                  </div>
                  {store.integrationCodes.pos.isConnected && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm text-txt-muted">POS 벤더</label>
                        <p className="mt-1">{POS_VENDORS.find(v => v.code === store.integrationCodes?.pos.posVendor)?.name || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-txt-muted">POS 코드</label>
                        <p className="mt-1 font-mono">{store.integrationCodes.pos.posCode || '-'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* SK 할인/적립 */}
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-medium">SK 할인/적립 연동</h3>
                    <Badge variant={store.integrationCodes.sk.isEnabled ? 'success' : 'secondary'}>
                      {store.integrationCodes.sk.isEnabled ? '활성' : '비활성'}
                    </Badge>
                  </div>
                  {store.integrationCodes.sk.isEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-txt-muted">가맹점 코드</label>
                        <p className="mt-1 font-mono">{store.integrationCodes.sk.storeCode || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-txt-muted">전체 코드 (V902+코드)</label>
                        <p className="mt-1 font-mono font-medium text-primary">{store.integrationCodes.sk.fullCode || '-'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* PG사 연동 */}
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-medium">PG사 연동 (스마트로 등)</h3>
                    <div className="flex gap-2">
                      {store.integrationCodes.pg.isTestMode && (
                        <Badge variant="warning">테스트</Badge>
                      )}
                      <Badge variant={store.integrationCodes.pg.isEnabled ? 'success' : 'secondary'}>
                        {store.integrationCodes.pg.isEnabled ? '활성' : '비활성'}
                      </Badge>
                    </div>
                  </div>
                  {store.integrationCodes.pg.isEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-txt-muted">PG사</label>
                        <p className="mt-1">{PG_VENDORS.find(v => v.code === store.integrationCodes?.pg.pgVendor)?.name || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-txt-muted">MID (Merchant ID)</label>
                        <p className="mt-1 font-mono">{store.integrationCodes.pg.mid || '-'}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 교환권 벤더사 */}
                <div className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-md font-medium">교환권 벤더사 연동</h3>
                    <Badge variant={store.integrationCodes.voucherVendor.isEnabled ? 'success' : 'secondary'}>
                      {store.integrationCodes.voucherVendor.isEnabled ? '활성' : '비활성'}
                    </Badge>
                  </div>
                  {store.integrationCodes.voucherVendor.isEnabled && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-txt-muted">벤더사</label>
                        <p className="mt-1">{store.integrationCodes.voucherVendor.vendorName || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-txt-muted">가맹점 코드</label>
                        <p className="mt-1 font-mono">{store.integrationCodes.voucherVendor.storeCode || '-'}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-txt-muted">연동 정보가 등록되지 않았습니다.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate(`/staff/stores/${id}/edit/integration`)}
                >
                  <EditOutlined className="mr-1" />
                  연동 정보 등록
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'payment' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">결제 수단</h2>
              <Button size="sm" variant="outline" onClick={() => navigate(`/staff/stores/${id}/edit/payment-methods`)}>
                <EditOutlined className="mr-1" />
                수정
              </Button>
            </div>

            {store.paymentMethods ? (
              <div className="space-y-6">
                {/* 기본 결제 수단 */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium border-b border-border pb-2">기본 결제 수단</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <span className="font-medium">카드 결제</span>
                      <Badge variant={store.paymentMethods.isCardEnabled ? 'success' : 'secondary'}>
                        {store.paymentMethods.isCardEnabled ? '사용' : '미사용'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <span className="font-medium">현금 결제</span>
                      <Badge variant={store.paymentMethods.isCashEnabled ? 'success' : 'secondary'}>
                        {store.paymentMethods.isCashEnabled ? '사용' : '미사용'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                      <span className="font-medium">포인트 결제</span>
                      <Badge variant={store.paymentMethods.isPointEnabled ? 'success' : 'secondary'}>
                        {store.paymentMethods.isPointEnabled ? '사용' : '미사용'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* 간편 결제 */}
                <div className="space-y-4">
                  <h3 className="text-md font-medium border-b border-border pb-2">간편 결제</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {store.paymentMethods.simplePayments.map((sp) => (
                      <div
                        key={sp.type}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <span className="font-medium">{SIMPLE_PAYMENT_LABELS[sp.type]}</span>
                        <Badge variant={sp.isEnabled ? 'success' : 'secondary'}>
                          {sp.isEnabled ? '사용' : '미사용'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-txt-muted">결제 수단이 등록되지 않았습니다.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate(`/staff/stores/${id}/edit/payment-methods`)}
                >
                  <EditOutlined className="mr-1" />
                  결제 수단 등록
                </Button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">연결된 직원</h2>
              <Button size="sm" onClick={() => setIsLinkModalOpen(true)}>
                <PlusOutlined className="mr-1" />
                직원 연결
              </Button>
            </div>

            {store.staffLinks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-txt-muted">연결된 직원이 없습니다.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setIsLinkModalOpen(true)}
                >
                  <PlusOutlined className="mr-1" />
                  직원 연결하기
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="data-table w-full">
                  <thead>
                    <tr>
                      <th>이름</th>
                      <th>역할</th>
                      <th>연락처</th>
                      <th>이메일</th>
                      <th>상태</th>
                      <th className="w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {store.staffLinks.map((link) => (
                      <tr key={link.id}>
                        <td className="font-medium">{link.staffName}</td>
                        <td>
                          <Badge variant={getRoleBadgeVariant(link.role)}>
                            {STORE_STAFF_ROLE_LABELS[link.role]}
                          </Badge>
                        </td>
                        <td>
                          <MaskedData value={link.staffPhone} />
                        </td>
                        <td className="text-sm text-txt-secondary">{link.staffEmail}</td>
                        <td>
                          <Badge
                            variant={getStaffStatusBadgeVariant(link.staffStatus as StaffStatus)}
                          >
                            {STAFF_STATUS_LABELS[link.staffStatus as StaffStatus] || link.staffStatus}
                          </Badge>
                        </td>
                        <td>
                          <button
                            onClick={() =>
                              setUnlinkTarget({
                                linkId: link.id,
                                staffName: link.staffName,
                              })
                            }
                            className="p-2 rounded hover:bg-bg-hover text-txt-muted hover:text-critical transition-colors"
                            title="연결 해제"
                          >
                            <DeleteOutlined />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 직원 연결 모달 */}
      <StaffLinkModal
        isOpen={isLinkModalOpen}
        onClose={() => setIsLinkModalOpen(false)}
        storeId={id!}
        storeName={store.name}
      />

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

      {/* 직원 연결 해제 확인 */}
      <ConfirmDialog
        isOpen={!!unlinkTarget}
        onClose={() => setUnlinkTarget(null)}
        onConfirm={handleUnlink}
        title="직원 연결 해제"
        message={`'${unlinkTarget?.staffName}' 직원의 연결을 해제하시겠습니까?`}
        confirmText="해제"
        type="warning"
      />
    </div>
  );
};
