import { useState, useMemo, useEffect, useRef } from 'react';
import {
  PlusOutlined,
  StopOutlined,
  PlayCircleOutlined,
  GiftOutlined,
  CopyOutlined,
  CheckOutlined,
  DownloadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';

import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
  Badge,
  Label,
  SearchInput,
  ProductSelector,
  type ExcludedProduct,
} from '@/components/ui';
import {
  Coupon,
  CouponFormData,
  CouponDiscountType,
  CouponApplyScope,
  CouponOrderType,
  CouponStatus,
  CouponChannel,
  COUPON_APPLY_SCOPE_LABELS,
  COUPON_ORDER_TYPE_LABELS,
  COUPON_CHANNEL_LABELS,
  COUPON_STATUS_LABELS,
  COUPON_STATUS_FILTER_OPTIONS,
  DEFAULT_COUPON_FORM,
  validateCouponForm,
} from '@/types/coupon';
import { ToggleButtonGroup, ConfirmDialog } from '@/components/ui';
import { useToast, useStores, useCouponList, useCreateCoupon, useUpdateCoupon, useSuspendCoupon, useActivateCoupon, useDeleteCoupon, useDuplicateCoupon, useCouponStats } from '@/hooks';

// 요일 라벨
const DAY_LABELS: Record<number, string> = {
  0: '일', 1: '월', 2: '화', 3: '수', 4: '목', 5: '금', 6: '토',
};

// 기본 폼 데이터 생성
const getDefaultFormData = (): CouponFormData => ({
  ...DEFAULT_COUPON_FORM,
});

export function Coupons() {
  const toast = useToast();
  const { stores } = useStores();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<CouponStatus | 'all'>('all');
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [isFormActive, setIsFormActive] = useState(false);
  const [formData, setFormData] = useState<CouponFormData>(getDefaultFormData());
  const [successDialog, setSuccessDialog] = useState<{
    isOpen: boolean;
    couponName: string;
    isNew: boolean;
  }>({ isOpen: false, couponName: '', isNew: true });
  const [suspendDialog, setSuspendDialog] = useState<{
    isOpen: boolean;
    coupon: Coupon | null;
    gracePeriodDays: number;
  }>({ isOpen: false, coupon: null, gracePeriodDays: 7 });
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // 서버사이드 훅
  const { data: couponListData } = useCouponList({
    keyword: searchTerm,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const { data: statsData } = useCouponStats();
  const createCoupon = useCreateCoupon();
  const updateCouponMutation = useUpdateCoupon();
  const suspendMutation = useSuspendCoupon();
  const activateMutation = useActivateCoupon();
  const deleteCouponMutation = useDeleteCoupon();
  const duplicateCouponMutation = useDuplicateCoupon();

  const coupons = couponListData?.data ?? [];
  const activeCount = statsData?.data?.active ?? 0;

  // 쿠폰 목록 갱신 시 selectedCoupon 동기화
  useEffect(() => {
    if (selectedCoupon && coupons.length > 0) {
      const updated = coupons.find((c) => c.id === selectedCoupon.id);
      if (updated && updated.status !== selectedCoupon.status) {
        setSelectedCoupon(updated);
      }
    }
  }, [coupons, selectedCoupon]);

  // 다른 쿠폰에서 이미 사용 중인 상품 목록 계산
  const excludedProducts = useMemo((): ExcludedProduct[] => {
    const excluded: ExcludedProduct[] = [];

    coupons.forEach((coupon) => {
      if (selectedCoupon?.id === coupon.id) return;
      if (coupon.applyScope !== 'specific_product') return;
      if (coupon.status !== 'active') return;

      coupon.applicableProductIds.forEach((productId) => {
        if (!excluded.some((ep) => ep.productId === productId)) {
          excluded.push({
            productId,
            reason: `"${coupon.name}" 쿠폰에서 사용 중`,
          });
        }
      });
    });

    return excluded;
  }, [coupons, selectedCoupon?.id]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ko-KR').format(value);
  };

  // 쿠폰 선택
  const handleSelectCoupon = (coupon: Coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      name: coupon.name,
      description: coupon.description,
      notice: coupon.notice || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscountAmount: coupon.maxDiscountAmount,
      applyScope: coupon.applyScope || 'cart_total',
      orderType: coupon.orderType || 'all',
      channel: coupon.channel || 'all',
      startDate: coupon.startDate || '',
      endDate: coupon.endDate || '',
      autoDelete: coupon.autoDelete,
      singleUsePerMember: coupon.singleUsePerMember,
      totalCount: coupon.totalCount,
      applicableProductIds: coupon.applicableProductIds,
      applicableCategoryIds: coupon.applicableCategoryIds,
      availableDays: coupon.schedule?.availableDays || [0, 1, 2, 3, 4, 5, 6],
      availableStartTime: coupon.schedule?.availableTimeRanges[0]?.startTime || '00:00',
      availableEndTime: coupon.schedule?.availableTimeRanges[0]?.endTime || '23:59',
      storeRestrictionType: coupon.storeRestriction?.type || 'all',
      restrictedStoreIds: coupon.storeRestriction?.storeIds || [],
      headquartersRatio: coupon.settlementRatio?.headquartersRatio || 100,
      franchiseRatio: coupon.settlementRatio?.franchiseRatio || 0,
    });
    setIsFormActive(true);
  };

  // 쿠폰 복제
  const handleDuplicateCoupon = () => {
    if (!selectedCoupon) return;
    duplicateCouponMutation.mutate(selectedCoupon.id, {
      onSuccess: () => {
        handleCancel();
        toast.success('쿠폰이 복제되었습니다.');
      },
      onError: () => toast.error('복제에 실패했습니다.'),
    });
  };

  // 요일 토글
  const handleToggleDay = (day: number) => {
    setFormData((prev) => {
      const days = prev.availableDays.includes(day)
        ? prev.availableDays.filter((d) => d !== day)
        : [...prev.availableDays, day].sort();
      return { ...prev, availableDays: days };
    });
  };

  // 정산 비율 변경
  const handleSettlementRatioChange = (headquartersRatio: number) => {
    const franchiseRatio = 100 - headquartersRatio;
    setFormData((prev) => ({ ...prev, headquartersRatio, franchiseRatio }));
  };

  // 신규 등록
  const handleNewCoupon = () => {
    setSelectedCoupon(null);
    setFormData(getDefaultFormData());
    setIsFormActive(true);
  };

  // 취소
  const handleCancel = () => {
    setSelectedCoupon(null);
    setFormData(getDefaultFormData());
    setIsFormActive(false);
  };

  // 저장
  const handleSave = () => {
    const errors = validateCouponForm(formData);
    if (errors.length > 0) {
      toast.error(errors[0] as string);
      return;
    }

    const isNew = !selectedCoupon;
    const onSuccess = () => {
      setSuccessDialog({ isOpen: true, couponName: formData.name, isNew });
    };
    const onError = () => toast.error(isNew ? '등록에 실패했습니다.' : '수정에 실패했습니다.');

    if (isNew) {
      createCoupon.mutate(formData, { onSuccess, onError });
    } else {
      updateCouponMutation.mutate(
        { id: selectedCoupon.id, data: formData },
        { onSuccess, onError },
      );
    }
  };

  // 정지 다이얼로그 열기 / 활성화 즉시 실행
  const handleToggleActive = (coupon: Coupon) => {
    if (coupon.status === 'active') {
      // 활성 → 정지: 유예기간 다이얼로그 표시
      setSuspendDialog({ isOpen: true, coupon, gracePeriodDays: 7 });
    } else {
      // 정지 → 활성화
      activateMutation.mutate(coupon.id, {
        onSuccess: (result) => {
          toast.success('쿠폰이 활성화되었습니다.');
          if (selectedCoupon?.id === coupon.id) {
            setSelectedCoupon(result.data);
          }
        },
        onError: () => toast.error('활성화에 실패했습니다.'),
      });
    }
  };

  // 정지 확정 (유예기간 포함)
  const handleConfirmSuspend = () => {
    if (!suspendDialog.coupon) return;
    suspendMutation.mutate(
      { id: suspendDialog.coupon.id, gracePeriodDays: suspendDialog.gracePeriodDays },
      {
        onSuccess: (result) => {
          toast.success(`쿠폰이 정지되었습니다. (유예기간 ${suspendDialog.gracePeriodDays}일)`);
          if (selectedCoupon?.id === suspendDialog.coupon?.id) {
            setSelectedCoupon(result.data);
          }
          setSuspendDialog({ isOpen: false, coupon: null, gracePeriodDays: 7 });
        },
        onError: () => toast.error('정지에 실패했습니다.'),
      },
    );
  };

  // 삭제 확정
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteCouponMutation.mutate(deleteTarget.id, {
      onSuccess: () => {
        handleCancel();
        toast.success('쿠폰이 삭제되었습니다.');
      },
      onError: () => toast.error('삭제에 실패했습니다.'),
    });
    setDeleteTarget(null);
  };

  // 수정 모드 여부 (기존 쿠폰 선택 시)
  const isEditMode = isFormActive && !!selectedCoupon;

  // 성공 다이얼로그 닫기
  const handleCloseSuccessDialog = (addMore: boolean) => {
    setSuccessDialog({ isOpen: false, couponName: '', isNew: true });
    if (addMore) {
      setFormData(getDefaultFormData());
      setSelectedCoupon(null);
    } else {
      handleCancel();
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-txt-main">쿠폰 관리</h1>
          <p className="text-sm text-txt-muted mt-1">
            쿠폰을 등록하고 관리합니다. (활성: {activeCount}개)
          </p>
        </div>
      </div>

      {/* 전체 통계 요약 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-txt-muted">총 쿠폰 수</p>
          <p className="text-2xl font-bold text-txt-main">{formatCurrency(statsData?.data?.total ?? 0)}</p>
          <p className="text-xs text-txt-muted">활성 {activeCount}개</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-txt-muted">총 사용 수</p>
          <p className="text-2xl font-bold text-success">
            {formatCurrency(statsData?.data?.totalUsed ?? 0)}
          </p>
          <p className="text-xs text-txt-muted">누적 사용</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-txt-muted">활성 쿠폰</p>
          <p className="text-2xl font-bold text-primary">{formatCurrency(activeCount)}</p>
          <p className="text-xs text-txt-muted">운영 중</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-txt-muted">평균 사용률</p>
          <p className="text-2xl font-bold text-warning">
            {(() => {
              const total = statsData?.data?.total ?? 0;
              const totalUsed = statsData?.data?.totalUsed ?? 0;
              return total > 0 ? `${Math.round((totalUsed / total) * 100)}%` : '-';
            })()}
          </p>
          <p className="text-xs text-txt-muted">사용/발행</p>
        </Card>
      </div>

      {/* 2컬럼 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-6">
        {/* 왼쪽: 쿠폰 목록 */}
        <Card className="h-fit">
          <CardHeader className="flex flex-row items-center justify-between">
            <h2 className="text-lg font-semibold text-txt-main">쿠폰 목록</h2>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.success('발급 내역 다운로드 (준비중)')}
                title="발급 내역 다운로드"
              >
                <DownloadOutlined style={{ fontSize: 14 }} />
              </Button>
              <Button size="sm" onClick={handleNewCoupon}>
                <PlusOutlined style={{ fontSize: 14, marginRight: 4 }} />
                추가
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 상태 필터 */}
            <ToggleButtonGroup
              value={statusFilter}
              onChange={(val) => setStatusFilter(val as CouponStatus | 'all')}
              options={COUPON_STATUS_FILTER_OPTIONS}
            />

            {/* 검색 */}
            <SearchInput
              placeholder="쿠폰명 검색..."
              value={searchTerm}
              onChange={setSearchTerm}
            />

            {/* 쿠폰 리스트 */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {coupons.length > 0 ? (
                coupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    onClick={() => handleSelectCoupon(coupon)}
                    className={`
                      p-4 rounded-lg border cursor-pointer transition-all
                      ${selectedCoupon?.id === coupon.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50 hover:bg-bg-hover'
                      }
                    `}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <GiftOutlined style={{ fontSize: 18 }} className="text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-txt-main truncate">{coupon.name}</h3>
                          <Badge
                            variant={coupon.status === 'active' ? 'success' : coupon.status === 'suspended' ? 'warning' : 'secondary'}
                            className="flex-shrink-0"
                          >
                            {coupon.status === 'suspended'
                              ? (() => {
                                  if (!coupon.graceExpiresAt) return '정지';
                                  const remaining = Math.ceil((new Date(coupon.graceExpiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                                  return remaining > 0 ? `정지 (유예 ${remaining}일)` : '정지됨';
                                })()
                              : COUPON_STATUS_LABELS[coupon.status]}
                          </Badge>
                        </div>
                        <p className="text-sm text-txt-muted mt-1">
                          {coupon.discountType === 'percentage'
                            ? `${coupon.discountValue}% 할인`
                            : `${formatCurrency(coupon.discountValue)}원 할인`}
                          {' · '}
                          소진 {coupon.issuedCount}/{coupon.totalCount || '∞'} · 사용 {coupon.usedCount}
                        </p>
                        {coupon.autoDeleteAt && (
                          <p className="text-xs text-danger mt-0.5">
                            자동 삭제: {new Date(coupon.autoDeleteAt).toLocaleDateString('ko-KR')}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleActive(coupon);
                          }}
                          className={`p-1.5 rounded transition-colors ${coupon.status === 'active' ? 'hover:bg-warning/10' : 'hover:bg-success/10'}`}
                          title={coupon.status === 'active' ? '정지' : '활성화'}
                        >
                          {coupon.status === 'active'
                            ? <StopOutlined style={{ fontSize: 14 }} className="text-warning" />
                            : <PlayCircleOutlined style={{ fontSize: 14 }} className="text-success" />
                          }
                        </button>
                        {(coupon.status === 'suspended' || coupon.status === 'expired') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget({ id: coupon.id, name: coupon.name });
                            }}
                            className="p-1.5 rounded transition-colors hover:bg-danger/10"
                            title="삭제"
                          >
                            <DeleteOutlined style={{ fontSize: 14 }} className="text-danger" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-txt-muted">
                  <GiftOutlined style={{ fontSize: 32 }} className="mb-2 opacity-50" />
                  <p>등록된 쿠폰이 없습니다.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 오른쪽: 쿠폰 등록/수정 폼 */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-txt-main">
              {!isFormActive
                ? '쿠폰 정보'
                : selectedCoupon
                  ? '쿠폰 수정'
                  : '새 쿠폰 등록'}
            </h2>
          </CardHeader>
          <CardContent>
            {!isFormActive ? (
              // 빈 상태
              <div className="flex flex-col items-center justify-center py-16 text-txt-muted">
                <GiftOutlined style={{ fontSize: 48 }} className="mb-4 opacity-30" />
                <p className="text-lg mb-2">쿠폰을 선택하거나 새로 등록하세요</p>
                <p className="text-sm mb-6">왼쪽 목록에서 쿠폰을 선택하면 상세 정보를 확인할 수 있습니다.</p>
                <Button onClick={handleNewCoupon}>
                  <PlusOutlined style={{ fontSize: 16, marginRight: 8 }} />
                  새 쿠폰 등록
                </Button>
              </div>
            ) : (
              // 폼
              <div className="space-y-6">
                {/* 선택된 쿠폰 통계 (수정 모드일 때만) */}
                {selectedCoupon && (
                  <div className="grid grid-cols-4 gap-3 p-4 bg-bg-hover rounded-lg">
                    <div className="text-center">
                      <p className="text-sm text-txt-muted">발행 수</p>
                      <p className="text-xl font-bold text-primary">
                        {formatCurrency(selectedCoupon.totalCount || 0)}
                      </p>
                    </div>
                    <div className="text-center border-x border-border">
                      <p className="text-sm text-txt-muted">소진</p>
                      <p className="text-xl font-bold text-txt-main">{formatCurrency(selectedCoupon.issuedCount)}</p>
                    </div>
                    <div className="text-center border-r border-border">
                      <p className="text-sm text-txt-muted">쿠폰사용</p>
                      <p className="text-xl font-bold text-success">{formatCurrency(selectedCoupon.usedCount)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-txt-muted">사용율</p>
                      <p className="text-xl font-bold text-warning">
                        {selectedCoupon.issuedCount > 0
                          ? `${Math.round((selectedCoupon.usedCount / selectedCoupon.issuedCount) * 100)}%`
                          : '-'}
                      </p>
                    </div>
                  </div>
                )}

                {/* 수정 모드 안내 */}
                {isEditMode && (
                  <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg text-sm text-warning">
                    기존 쿠폰은 <strong>가맹점 설정</strong>만 수정 가능합니다.
                  </div>
                )}

                {/* 기본 정보 */}
                <div className={`space-y-4${isEditMode ? ' pointer-events-none opacity-60' : ''}`}>
                  <h3 className="font-medium text-txt-main border-b border-border pb-2">기본 정보</h3>

                  <div className="space-y-2">
                    <Label required>쿠폰명</Label>
                    <Input
                      placeholder="예: 첫 주문 할인 쿠폰"
                      value={formData.name}
                      maxLength={30}
                      onChange={(e) => {
                        const v = e.target.value.replace(/[^a-zA-Z0-9가-힣ㄱ-ㅎㅏ-ㅣ\s]/g, '');
                        setFormData((prev) => ({ ...prev, name: v }));
                      }}
                    />
                    <span className="text-xs text-txt-muted">{formData.name.length}/30</span>
                  </div>

                  <div className="space-y-2">
                    <Label>설명</Label>
                    <Input
                      placeholder="쿠폰에 대한 설명을 입력하세요"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>유의사항</Label>
                    <textarea
                      placeholder="사용 시 유의사항을 입력하세요"
                      value={formData.notice}
                      onChange={(e) => setFormData((prev) => ({ ...prev, notice: e.target.value }))}
                      className="w-full min-h-[80px] px-4 py-3 border border-border rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>

                {/* 할인 정보 */}
                <div className={`space-y-4${isEditMode ? ' pointer-events-none opacity-60' : ''}`}>
                  <h3 className="font-medium text-txt-main border-b border-border pb-2">할인 정보</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label required>할인 방식</Label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, discountType: 'fixed' as CouponDiscountType }))}
                          className={`
                            flex-1 py-2 px-4 rounded-lg border-2 transition-all
                            ${formData.discountType === 'fixed' ? 'border-primary bg-primary/5 text-primary' : 'border-border'}
                          `}
                        >
                          정액 (원)
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, discountType: 'percentage' as CouponDiscountType }))}
                          className={`
                            flex-1 py-2 px-4 rounded-lg border-2 transition-all
                            ${formData.discountType === 'percentage' ? 'border-primary bg-primary/5 text-primary' : 'border-border'}
                          `}
                        >
                          정률 (%)
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label required>할인 {formData.discountType === 'percentage' ? '비율' : '금액'}</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder={formData.discountType === 'percentage' ? '10' : '3000'}
                          value={formData.discountValue || ''}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, discountValue: Number(e.target.value) }))
                          }
                          className="pr-12"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">
                          {formData.discountType === 'percentage' ? '%' : '원'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>최소 주문 금액</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="15000"
                          value={formData.minOrderAmount || ''}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, minOrderAmount: Number(e.target.value) }))
                          }
                          className="pr-12"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">원</span>
                      </div>
                    </div>

                    {formData.discountType === 'percentage' && (
                      <div className="space-y-2">
                        <Label>최대 할인 금액</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="5000"
                            value={formData.maxDiscountAmount || ''}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                maxDiscountAmount: e.target.value ? Number(e.target.value) : null,
                              }))
                            }
                            className="pr-12"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">원</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 적용 범위 */}
                <div className={`space-y-4${isEditMode ? ' pointer-events-none opacity-60' : ''}`}>
                  <h3 className="font-medium text-txt-main border-b border-border pb-2">적용 범위</h3>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>적용 대상</Label>
                      <select
                        value={formData.applyScope}
                        onChange={(e) => {
                          const value = e.target.value as CouponApplyScope;
                          setFormData((prev) => ({ ...prev, applyScope: value, applicableProductIds: value !== 'specific_product' ? [] : prev.applicableProductIds }));
                        }}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-bg-card text-sm"
                      >
                        {(Object.entries(COUPON_APPLY_SCOPE_LABELS) as [CouponApplyScope, string][]).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>주문 유형</Label>
                      <select
                        value={formData.orderType}
                        onChange={(e) => setFormData((prev) => ({ ...prev, orderType: e.target.value as CouponOrderType }))}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-bg-card text-sm"
                      >
                        {(Object.entries(COUPON_ORDER_TYPE_LABELS) as [CouponOrderType, string][]).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>사용 채널</Label>
                      <select
                        value={formData.channel}
                        onChange={(e) => setFormData((prev) => ({ ...prev, channel: e.target.value as CouponChannel }))}
                        className="w-full h-10 px-3 rounded-lg border border-border bg-bg-card text-sm"
                      >
                        {(Object.entries(COUPON_CHANNEL_LABELS) as [CouponChannel, string][]).map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 특정 상품 선택 UI */}
                  {formData.applyScope === 'specific_product' && (
                    <ProductSelector
                      selectedProductIds={formData.applicableProductIds}
                      onChange={(productIds) => setFormData((prev) => ({ ...prev, applicableProductIds: productIds }))}
                      title="적용 상품 선택"
                      description="쿠폰이 적용될 상품을 선택하세요 (다른 쿠폰에서 사용 중인 상품은 선택 불가)"
                      excludedProducts={excludedProducts}
                    />
                  )}
                </div>

                {/* 정산 비율 */}
                <div className={`space-y-4${isEditMode ? ' pointer-events-none opacity-60' : ''}`}>
                  <h3 className="font-medium text-txt-main border-b border-border pb-2">정산 비율</h3>
                  <p className="text-xs text-txt-muted">
                    {formData.discountType === 'fixed'
                      ? '할인 금액을 본사/가맹점으로 나누어 정산합니다.'
                      : '할인율(%)을 본사/가맹점 비율로 나누어 정산합니다.'}
                  </p>

                  <div className="space-y-4">
                    {formData.discountType === 'fixed' ? (
                      <FixedAmountSettlement
                        totalAmount={formData.discountValue || 0}
                        headquartersRatio={formData.headquartersRatio}
                        onRatioChange={handleSettlementRatioChange}
                      />
                    ) : (
                      <>
                        <div className="flex gap-4">
                          <div className="flex-1 space-y-2">
                            <Label>본사 부담 (%)</Label>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={formData.headquartersRatio}
                              onChange={(e) => {
                                const val = Math.max(0, Math.min(100, Number(e.target.value)));
                                handleSettlementRatioChange(val);
                              }}
                            />
                          </div>
                          <div className="flex-1 space-y-2">
                            <Label>가맹점 부담 (%)</Label>
                            <Input
                              type="number"
                              min={0}
                              max={100}
                              value={formData.franchiseRatio}
                              onChange={(e) => {
                                const val = Math.max(0, Math.min(100, Number(e.target.value)));
                                handleSettlementRatioChange(100 - val);
                              }}
                            />
                          </div>
                        </div>
                        <div className="pt-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={formData.headquartersRatio}
                            onChange={(e) => handleSettlementRatioChange(Number(e.target.value))}
                            className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                          <div className="flex justify-between px-1 mt-2">
                            <span className="text-xs font-medium text-primary">본사 {formData.headquartersRatio}%</span>
                            <span className="text-xs font-medium text-warning">가맹점 {formData.franchiseRatio}%</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 유효 기간 */}
                <div className={`space-y-4${isEditMode ? ' pointer-events-none opacity-60' : ''}`}>
                  <h3 className="font-medium text-txt-main border-b border-border pb-2">유효 기간</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>시작일</Label>
                      <Input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>종료일</Label>
                      <Input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* 사용 제한 */}
                <div className={`space-y-4${isEditMode ? ' pointer-events-none opacity-60' : ''}`}>
                  <h3 className="font-medium text-txt-main border-b border-border pb-2">사용 제한</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>총 발행 수량</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="무제한"
                          value={formData.totalCount || ''}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              totalCount: e.target.value ? Number(e.target.value) : null,
                            }))
                          }
                          className="pr-12"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">개</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>1인 1회 사용 제한</Label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, singleUsePerMember: true }))}
                          className={`
                            flex-1 py-2 px-4 rounded-lg border-2 transition-all
                            ${formData.singleUsePerMember ? 'border-primary bg-primary/5 text-primary' : 'border-border'}
                          `}
                        >
                          사용
                        </button>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, singleUsePerMember: false }))}
                          className={`
                            flex-1 py-2 px-4 rounded-lg border-2 transition-all
                            ${!formData.singleUsePerMember ? 'border-primary bg-primary/5 text-primary' : 'border-border'}
                          `}
                        >
                          미사용
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>만료 시 자동 삭제</Label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, autoDelete: true }))}
                        className={`
                          flex-1 py-2 px-4 rounded-lg border-2 transition-all
                          ${formData.autoDelete ? 'border-primary bg-primary/5 text-primary' : 'border-border'}
                        `}
                      >
                        자동 삭제
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, autoDelete: false }))}
                        className={`
                          flex-1 py-2 px-4 rounded-lg border-2 transition-all
                          ${!formData.autoDelete ? 'border-primary bg-primary/5 text-primary' : 'border-border'}
                        `}
                      >
                        유지
                      </button>
                    </div>
                  </div>
                </div>

                {/* 사용 가능 스케줄 */}
                <div className={`space-y-4${isEditMode ? ' pointer-events-none opacity-60' : ''}`}>
                  <h3 className="font-medium text-txt-main border-b border-border pb-2">사용 가능 스케줄</h3>

                  <div className="space-y-3">
                    <Label>사용 가능 요일</Label>
                    <div className="flex gap-2">
                      {[0, 1, 2, 3, 4, 5, 6].map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleToggleDay(day)}
                          className={`
                            w-10 h-10 rounded-lg border-2 font-medium transition-all
                            ${formData.availableDays.includes(day) ? 'border-primary bg-primary text-white' : 'border-border text-txt-muted'}
                          `}
                        >
                          {DAY_LABELS[day]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>시작 시간</Label>
                      <Input
                        type="time"
                        value={formData.availableStartTime}
                        onChange={(e) => setFormData((prev) => ({ ...prev, availableStartTime: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>종료 시간</Label>
                      <Input
                        type="time"
                        value={formData.availableEndTime}
                        onChange={(e) => setFormData((prev) => ({ ...prev, availableEndTime: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                {/* 가맹점 제한 */}
                <div className="space-y-4">
                  <h3 className="font-medium text-txt-main border-b border-border pb-2">가맹점 설정</h3>

                  <div className="space-y-2">
                    <Label>적용 가맹점</Label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, storeRestrictionType: 'all', restrictedStoreIds: [] }))}
                        className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${formData.storeRestrictionType === 'all' ? 'border-primary bg-primary/5 text-primary' : 'border-border'}`}
                      >
                        전체 가맹점
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, storeRestrictionType: 'include' }))}
                        className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${formData.storeRestrictionType === 'include' ? 'border-primary bg-primary/5 text-primary' : 'border-border'}`}
                      >
                        특정 가맹점만
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, storeRestrictionType: 'exclude' }))}
                        className={`flex-1 py-2 px-4 rounded-lg border-2 transition-all ${formData.storeRestrictionType === 'exclude' ? 'border-primary bg-primary/5 text-primary' : 'border-border'}`}
                      >
                        특정 가맹점 제외
                      </button>
                    </div>
                  </div>

                  {formData.storeRestrictionType !== 'all' && (
                    <div className="space-y-2">
                      <Label>{formData.storeRestrictionType === 'include' ? '사용 가능 가맹점' : '사용 불가 가맹점'}</Label>
                      <select
                        multiple
                        value={formData.restrictedStoreIds}
                        onChange={(e) => {
                          const selected = Array.from(e.target.selectedOptions, (option) => option.value);
                          setFormData((prev) => ({ ...prev, restrictedStoreIds: selected }));
                        }}
                        className="w-full h-32 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                      >
                        {stores.map((store) => (
                          <option key={store.id} value={store.id}>{store.name}</option>
                        ))}
                      </select>
                      <p className="text-xs text-txt-muted">Ctrl/Cmd 클릭으로 다중 선택</p>
                    </div>
                  )}
                </div>

                {/* 액션 버튼 */}
                <div className="flex justify-between pt-4 border-t border-border">
                  <div className="flex gap-2">
                    {selectedCoupon && (
                      <Button variant="outline" onClick={handleDuplicateCoupon}>
                        <CopyOutlined style={{ fontSize: 14, marginRight: 6 }} />
                        복제
                      </Button>
                    )}
                    {selectedCoupon && (selectedCoupon.status === 'active' || selectedCoupon.status === 'suspended') && (
                      <Button
                        variant="outline"
                        onClick={() => handleToggleActive(selectedCoupon)}
                      >
                        {selectedCoupon.status === 'active'
                          ? <><StopOutlined style={{ fontSize: 14, marginRight: 6 }} className="text-warning" />정지</>
                          : <><PlayCircleOutlined style={{ fontSize: 14, marginRight: 6 }} className="text-success" />활성화</>
                        }
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={handleCancel}>
                      취소
                    </Button>
                    <Button onClick={handleSave}>
                      {selectedCoupon ? '수정' : '등록'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 성공 다이얼로그 */}
      {successDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-bg-card rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckOutlined style={{ fontSize: 32 }} className="text-success" />
              </div>
              <h3 className="text-lg font-semibold text-txt-main mb-2">
                {successDialog.isNew ? '쿠폰 등록 완료' : '쿠폰 수정 완료'}
              </h3>
              <p className="text-txt-muted mb-6">
                "{successDialog.couponName}" 쿠폰이 {successDialog.isNew ? '등록' : '수정'}되었습니다.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => handleCloseSuccessDialog(false)}>
                  목록으로
                </Button>
                {successDialog.isNew && (
                  <Button className="flex-1" onClick={() => handleCloseSuccessDialog(true)}>
                    추가 등록
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 정지 확인 다이얼로그 */}
      {suspendDialog.isOpen && suspendDialog.coupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-bg-card rounded-xl shadow-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-txt-main mb-2">쿠폰 정지</h3>
            <p className="text-sm text-txt-muted mb-4">
              "{suspendDialog.coupon.name}" 쿠폰을 정지합니다.<br />
              이미 발급된 쿠폰은 유예기간 후 사용 불가됩니다.<br />
              <span className="text-danger">유예기간 종료 7일 후 쿠폰이 자동 삭제됩니다.</span>
            </p>
            <div className="space-y-2 mb-6">
              <Label>유예기간 (일)</Label>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={suspendDialog.gracePeriodDays}
                  onChange={(e) => setSuspendDialog((prev) => ({ ...prev, gracePeriodDays: Math.max(0, Math.min(30, Number(e.target.value))) }))}
                  className="w-24"
                />
                <span className="text-sm text-txt-muted">0~30일 (0: 즉시 정지)</span>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setSuspendDialog({ isOpen: false, coupon: null, gracePeriodDays: 7 })}>
                취소
              </Button>
              <Button variant="danger" className="flex-1" onClick={handleConfirmSuspend}>
                정지
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="쿠폰 삭제"
        message={`"${deleteTarget?.name}" 쿠폰을 삭제하시겠습니까? 고객에게 발급된 쿠폰도 함께 삭제됩니다. 이 작업은 되돌릴 수 없습니다.`}
        confirmText="삭제"
        type="warning"
      />
    </div>
  );
}

/** 금액 할인 정산 비율 입력 (로컬 state로 타이핑 안정화) */
function FixedAmountSettlement({
  totalAmount,
  headquartersRatio,
  onRatioChange,
}: {
  totalAmount: number;
  headquartersRatio: number;
  onRatioChange: (ratio: number) => void;
}) {
  const hqAmt = totalAmount > 0 ? Math.round(totalAmount * headquartersRatio / 100) : 0;
  const frAmt = totalAmount - hqAmt;

  const [hqInput, setHqInput] = useState(String(hqAmt));
  const [frInput, setFrInput] = useState(String(frAmt));
  const isTyping = useRef(false);

  useEffect(() => {
    if (!isTyping.current) {
      setHqInput(String(hqAmt));
      setFrInput(String(frAmt));
    }
  }, [hqAmt, frAmt]);

  const commitRatio = (amt: number, isHq: boolean) => {
    const clamped = Math.max(0, Math.min(totalAmount, amt));
    const ratio = totalAmount > 0 ? (clamped / totalAmount) * 100 : 0;
    onRatioChange(isHq ? ratio : 100 - ratio);
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('ko-KR').format(value);

  return (
    <>
      <div className="flex gap-4">
        <div className="flex-1 space-y-2">
          <Label>본사 부담 (원)</Label>
          <Input
            type="number"
            min={0}
            max={totalAmount}
            value={hqInput}
            onChange={(e) => {
              isTyping.current = true;
              setHqInput(e.target.value);
              const num = Number(e.target.value);
              if (e.target.value !== '' && !isNaN(num)) {
                commitRatio(num, true);
              }
            }}
            onBlur={() => {
              isTyping.current = false;
              setHqInput(String(hqAmt));
              setFrInput(String(frAmt));
            }}
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label>가맹점 부담 (원)</Label>
          <Input
            type="number"
            min={0}
            max={totalAmount}
            value={frInput}
            onChange={(e) => {
              isTyping.current = true;
              setFrInput(e.target.value);
              const num = Number(e.target.value);
              if (e.target.value !== '' && !isNaN(num)) {
                commitRatio(num, false);
              }
            }}
            onBlur={() => {
              isTyping.current = false;
              setHqInput(String(hqAmt));
              setFrInput(String(frAmt));
            }}
          />
        </div>
      </div>
      <div className="pt-2">
        <input
          type="range"
          min="0"
          max={totalAmount || 100}
          value={hqAmt}
          onChange={(e) => {
            const amt = Number(e.target.value);
            const ratio = totalAmount > 0 ? (amt / totalAmount) * 100 : 0;
            onRatioChange(ratio);
          }}
          className="w-full h-2 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
        />
        <div className="flex justify-between px-1 mt-2">
          <span className="text-xs font-medium text-primary">
            본사 {formatCurrency(hqAmt)}원
          </span>
          <span className="text-xs font-medium text-warning">
            가맹점 {formatCurrency(frAmt)}원
          </span>
        </div>
      </div>
    </>
  );
}
