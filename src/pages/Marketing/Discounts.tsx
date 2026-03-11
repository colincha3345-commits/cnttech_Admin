import { useState, useMemo } from 'react';
import {
  PlusOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  PercentageOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  GiftOutlined,
} from '@ant-design/icons';

import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Input,
  Label,
  Badge,
  Switch,
  ConfirmDialog,
  SearchInput,
  StoreSelector,
  ProductSelector,
  type ExcludedProduct,
} from '@/components/ui';
import type {
  Discount,
  DiscountFormData,
  DiscountPeriodType,
  DiscountTargetType,
  DiscountChannel,
  OrderType,
  GiftConditionType,
  DayOfWeek,
  RoundingUnit,
  RoundingType,
} from '@/types/discount';
import {
  CHANNEL_LABELS,
  ORDER_TYPE_LABELS,
  GIFT_CONDITION_LABELS,
  DEFAULT_DISCOUNT_FORM,
} from '@/types/discount';
import { useToast, useStores, useDiscountList, useCreateDiscount, useUpdateDiscount, useDeleteDiscount, useDiscountStats } from '@/hooks';

const DAY_LABELS_MAP: Record<number, string> = {
  0: '일',
  1: '월',
  2: '화',
  3: '수',
  4: '목',
  5: '금',
  6: '토',
};

const DAYS_OF_WEEK: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0];

// 기본 폼 데이터 생성
const getDefaultFormData = (): DiscountFormData => ({
  ...DEFAULT_DISCOUNT_FORM,
});

export function Discounts() {
  const toast = useToast();
  const { stores } = useStores();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [isFormActive, setIsFormActive] = useState(false);
  const [formData, setFormData] = useState<DiscountFormData>(getDefaultFormData());
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; discountId: string | null }>({
    isOpen: false,
    discountId: null,
  });
  const [successDialog, setSuccessDialog] = useState<{
    isOpen: boolean;
    discountName: string;
    isNew: boolean;
  }>({ isOpen: false, discountName: '', isNew: true });

  // 서버사이드 훅
  const { data: discountListData } = useDiscountList({ keyword: searchTerm });
  const { data: statsData } = useDiscountStats();
  const createDiscount = useCreateDiscount();
  const updateDiscountMutation = useUpdateDiscount();
  const deleteDiscountMutation = useDeleteDiscount();

  const discounts = discountListData?.data ?? [];
  const isLoading = createDiscount.isPending || updateDiscountMutation.isPending;
  const activeCount = statsData?.data?.active ?? 0;

  // 다른 할인에서 이미 사용 중인 상품 목록 계산
  const excludedProducts = useMemo((): ExcludedProduct[] => {
    const excluded: ExcludedProduct[] = [];

    discounts.forEach((discount) => {
      // 현재 수정 중인 할인은 제외
      if (selectedDiscount?.id === discount.id) return;
      // 비활성 할인은 제외
      if (!discount.isActive) return;

      // 적용 대상 상품 (target.type === 'product')
      if (discount.target.type === 'product' && discount.target.productIds) {
        discount.target.productIds.forEach((productId) => {
          if (!excluded.some((ep) => ep.productId === productId)) {
            excluded.push({
              productId,
              reason: `"${discount.name}" 할인에서 사용 중`,
            });
          }
        });
      }

      // 증정 할인의 경우 구매 조건 상품 및 증정 상품도 체크
      if (discount.discountType === 'gift') {
        // 구매 조건 상품
        if (discount.giftCondition?.purchaseProductIds) {
          discount.giftCondition.purchaseProductIds.forEach((productId) => {
            if (!excluded.some((ep) => ep.productId === productId)) {
              excluded.push({
                productId,
                reason: `"${discount.name}" 증정할인 구매조건에서 사용 중`,
              });
            }
          });
        }
        // 증정 상품
        if (discount.giftReward?.productIds) {
          discount.giftReward.productIds.forEach((productId) => {
            if (!excluded.some((ep) => ep.productId === productId)) {
              excluded.push({
                productId,
                reason: `"${discount.name}" 증정상품으로 사용 중`,
              });
            }
          });
        }
      }
    });

    return excluded;
  }, [discounts, selectedDiscount?.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  // 기간 표시 텍스트
  const getPeriodText = (discount: Discount) => {
    switch (discount.periodType) {
      case 'period':
        if (discount.startDate && discount.endDate) {
          return `${formatDate(discount.startDate)} ~ ${formatDate(discount.endDate)}`;
        }
        return '기간 미설정';
      case 'schedule':
        if (discount.schedule) {
          const days = discount.schedule.days.map((d) => DAY_LABELS_MAP[d]).join(', ');
          const time = discount.schedule.timeSlots?.[0];
          if (time) {
            return `${days} ${time.startTime}~${time.endTime}`;
          }
          return days;
        }
        return '스케줄 미설정';
      default:
        return '-';
    }
  };

  // 할인 선택
  const handleSelectDiscount = (discount: Discount) => {
    setSelectedDiscount(discount);
    setFormData({
      name: discount.name,
      discountType: discount.discountType,
      method: discount.method,
      value: discount.value,
      giftCondition: discount.giftCondition,
      giftReward: discount.giftReward,
      periodType: discount.periodType,
      startDate: discount.startDate,
      endDate: discount.endDate,
      schedule: discount.schedule,
      target: discount.target,
      applyToAll: discount.applyToAll,
      storeIds: discount.storeIds,
      channel: discount.channel,
      orderType: discount.orderType,
      minOrderAmount: discount.minOrderAmount,
      maxDiscountAmount: discount.maxDiscountAmount,
      rounding: discount.rounding,
      headquartersRatio: discount.headquartersRatio,
      franchiseRatio: discount.franchiseRatio,
      isActive: discount.isActive,
      description: discount.description,
    });
    setIsFormActive(true);
  };

  // 새 할인 등록
  const handleNewDiscount = () => {
    setSelectedDiscount(null);
    setFormData(getDefaultFormData());
    setIsFormActive(true);
  };

  // 폼 취소
  const handleCancel = () => {
    setSelectedDiscount(null);
    setIsFormActive(false);
  };

  // 폼 데이터 업데이트
  const updateFormData = (updates: Partial<DiscountFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // 정산 비율 변경
  const handleSettlementRatioChange = (headquartersRatio: number) => {
    const franchiseRatio = 100 - headquartersRatio;
    updateFormData({ headquartersRatio, franchiseRatio });
  };

  // 요일 토글
  const toggleDay = (day: DayOfWeek) => {
    const currentDays = formData.schedule?.days || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];

    updateFormData({
      schedule: {
        ...formData.schedule,
        days: newDays,
        timeSlots: formData.schedule?.timeSlots || [{ startTime: '00:00', endTime: '23:59' }],
      },
    });
  };

  // 저장
  const handleSave = async () => {
    // 유효성 검사
    if (!formData.name.trim()) {
      toast.warning('할인명을 입력해주세요');
      return;
    }

    if (formData.discountType === 'company' && formData.value <= 0) {
      toast.warning('할인값을 입력해주세요');
      return;
    }

    if (!formData.applyToAll && formData.storeIds.length === 0) {
      toast.warning('최소 1개 매장을 선택해주세요');
      return;
    }

    const isNew = !selectedDiscount;
    const onSuccess = () => {
      setSuccessDialog({ isOpen: true, discountName: formData.name, isNew });
    };
    const onError = () => toast.error('저장에 실패했습니다');

    if (isNew) {
      createDiscount.mutate(formData, { onSuccess, onError });
    } else {
      updateDiscountMutation.mutate(
        { id: selectedDiscount.id, data: formData },
        { onSuccess, onError },
      );
    }
  };

  // 저장 완료 후
  const continueRegistrationRef = { current: false };

  const handleSuccessDialogClose = () => {
    setSuccessDialog({ isOpen: false, discountName: '', isNew: true });

    if (continueRegistrationRef.current) {
      setSelectedDiscount(null);
      setFormData(getDefaultFormData());
      continueRegistrationRef.current = false;
    } else {
      handleCancel();
    }
  };

  const handleSuccessDialogConfirm = () => {
    continueRegistrationRef.current = true;
  };

  // 삭제 확인 열기
  const handleOpenDeleteConfirm = (discountId: string) => {
    setDeleteConfirm({ isOpen: true, discountId });
  };

  // 삭제 실행
  const handleConfirmDelete = () => {
    if (deleteConfirm.discountId) {
      const discountId = deleteConfirm.discountId;
      deleteDiscountMutation.mutate(discountId, {
        onSuccess: () => {
          toast.success('할인이 삭제되었습니다');
          if (selectedDiscount?.id === discountId) {
            handleCancel();
          }
        },
        onError: () => toast.error('삭제에 실패했습니다'),
      });
    }
    setDeleteConfirm({ isOpen: false, discountId: null });
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-txt-main">할인 관리</h1>
          <p className="text-sm text-txt-muted mt-1">할인 정책을 등록하고 관리합니다</p>
        </div>
      </div>

      {/* 통계 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-txt-muted">전체 할인</p>
            <p className="text-2xl font-bold text-primary">{statsData?.data?.total ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-txt-muted">활성 할인</p>
            <p className="text-2xl font-bold text-success">{activeCount}</p>
          </CardContent>
        </Card>
      </div>

      {/* 메인 컨텐츠 - 2컬럼 레이아웃 */}
      <div className="grid grid-cols-1 lg:grid-cols-[400px,1fr] gap-6">
        {/* 좌측: 할인 목록 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-txt-main">할인 목록</h2>
                <p className="text-xs text-txt-muted mt-1">총 {discounts.length}개</p>
              </div>
              <div className="flex gap-2">
                {isFormActive ? (
                  <>
                    <Button variant="secondary" size="sm" onClick={handleCancel}>
                      <CloseOutlined />
                      등록 취소
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSave} disabled={isLoading}>
                      <SaveOutlined />
                      저장
                    </Button>
                  </>
                ) : (
                  <Button variant="primary" size="sm" onClick={handleNewDiscount}>
                    <PlusOutlined />
                    할인 등록
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* 검색 */}
            <div className="mb-4">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="할인명 검색..."
              />
            </div>

            {/* 할인 리스트 */}
            <div className="space-y-2 overflow-y-auto" style={{ maxHeight: '600px' }}>
              {discounts.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-txt-muted">등록된 할인이 없습니다</p>
                </div>
              ) : (
                discounts.map((discount) => (
                  <div
                    key={discount.id}
                    onClick={() => handleSelectDiscount(discount)}
                    className={`group relative flex gap-3 p-3 rounded-lg border cursor-pointer transition-all hover:bg-hover ${selectedDiscount?.id === discount.id
                      ? 'bg-bg-hover ring-2 ring-primary/20 border-primary/30'
                      : 'border-border'
                      }`}
                  >
                    {/* 아이콘 */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${discount.discountType === 'gift' ? 'bg-warning/10' : 'bg-primary-light'
                        }`}
                    >
                      {discount.discountType === 'gift' ? (
                        <GiftOutlined style={{ fontSize: 18 }} className="text-warning" />
                      ) : (
                        <PercentageOutlined style={{ fontSize: 18 }} className="text-primary" />
                      )}
                    </div>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-txt-main truncate">{discount.name}</p>
                      </div>
                      <div className="flex gap-1 mt-1 flex-wrap">
                        <Badge variant={discount.isActive ? 'success' : 'secondary'}>
                          {discount.isActive ? '활성' : '비활성'}
                        </Badge>
                        <Badge variant={discount.discountType === 'gift' ? 'warning' : 'default'}>
                          {discount.discountType === 'gift' ? '증정' : '자사'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-txt-muted">
                        {discount.periodType === 'schedule' ? (
                          <ClockCircleOutlined style={{ fontSize: 10 }} />
                        ) : (
                          <CalendarOutlined style={{ fontSize: 10 }} />
                        )}
                        <span>{getPeriodText(discount)}</span>
                      </div>
                    </div>

                    {/* 삭제 버튼 */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDeleteConfirm(discount.id);
                      }}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg bg-bg-main hover:bg-hover border border-border shadow-sm"
                      title="삭제"
                    >
                      <DeleteOutlined className="text-sm text-critical" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* 우측: 할인 폼 */}
        <Card>
          {!isFormActive ? (
            <CardContent>
              <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="mb-6 flex items-center justify-center w-20 h-20 rounded-full bg-hover">
                  <PlusOutlined className="text-4xl text-txt-muted" />
                </div>
                <h3 className="text-lg font-semibold text-txt-main mb-2">
                  할인을 선택하거나 등록하세요
                </h3>
                <p className="text-sm text-txt-muted mb-6">
                  좌측 목록에서 할인을 선택하거나<br />
                  "할인 등록" 버튼을 클릭하여 새 할인을 추가하세요
                </p>
                <Button variant="primary" onClick={handleNewDiscount}>
                  <PlusOutlined />
                  할인 등록
                </Button>
              </div>
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-txt-main">
                    {selectedDiscount ? '할인 수정' : '할인 등록'}
                  </h2>
                  {selectedDiscount && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleOpenDeleteConfirm(selectedDiscount.id)}
                    >
                      <DeleteOutlined />
                      삭제
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 max-h-[calc(100vh-300px)] overflow-y-auto pr-2">
                  {/* 기본 정보 섹션 */}
                  <div className="space-y-4 p-4 bg-hover rounded-lg border border-border">
                    <h3 className="text-sm font-semibold text-txt-main">기본 정보</h3>

                    {/* 할인명 */}
                    <div className="space-y-2">
                      <Label required>할인명</Label>
                      <Input
                        placeholder="할인명을 입력하세요"
                        value={formData.name}
                        onChange={(e) => updateFormData({ name: e.target.value })}
                      />
                    </div>

                    {/* 자사할인 설정 */}
                    {formData.discountType === 'company' && (
                      <>
                        <div className="space-y-2">
                          <Label required>할인 방식</Label>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => updateFormData({ method: 'percentage' })}
                              className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${formData.method === 'percentage'
                                ? 'bg-primary text-white border-primary'
                                : 'bg-bg-card text-txt-muted border-border hover:border-primary'
                                }`}
                            >
                              % 할인
                            </button>
                            <button
                              type="button"
                              onClick={() => updateFormData({ method: 'fixed' })}
                              className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${formData.method === 'fixed'
                                ? 'bg-primary text-white border-primary'
                                : 'bg-bg-card text-txt-muted border-border hover:border-primary'
                                }`}
                            >
                              금액 할인
                            </button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label required>할인값</Label>
                          <div className="relative">
                            <Input
                              type="number"
                              placeholder={formData.method === 'percentage' ? '10' : '1000'}
                              value={formData.value || ''}
                              onChange={(e) => updateFormData({ value: Number(e.target.value) })}
                              className="pr-12"
                            />
                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">
                              {formData.method === 'percentage' ? '%' : '원'}
                            </span>
                          </div>
                        </div>

                        {/* 단위 설정 */}
                        <div className="p-3 bg-bg-card rounded-lg border border-border">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.rounding?.enabled || false}
                              onChange={(e) =>
                                updateFormData({
                                  rounding: e.target.checked
                                    ? { enabled: true, unit: 1, type: 'round' }
                                    : undefined,
                                })
                              }
                              className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-txt-main">할인 금액 단위설정</span>
                          </label>

                          {formData.rounding?.enabled && (
                            <div className="mt-3 flex items-center gap-2">
                              <select
                                value={formData.rounding.unit}
                                onChange={(e) =>
                                  updateFormData({
                                    rounding: {
                                      ...formData.rounding!,
                                      unit: Number(e.target.value) as RoundingUnit,
                                    },
                                  })
                                }
                                className="px-3 py-1.5 bg-bg-card border border-border rounded-lg text-sm"
                              >
                                <option value={1}>1</option>
                                <option value={10}>10</option>
                                <option value={100}>100</option>
                              </select>
                              <span className="text-sm text-txt-muted">단위에서</span>
                              <select
                                value={formData.rounding.type}
                                onChange={(e) =>
                                  updateFormData({
                                    rounding: {
                                      ...formData.rounding!,
                                      type: e.target.value as RoundingType,
                                    },
                                  })
                                }
                                className="px-3 py-1.5 bg-bg-card border border-border rounded-lg text-sm"
                              >
                                <option value="round">반올림</option>
                                <option value="ceil">올림</option>
                                <option value="floor">내림</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {/* 증정할인 설정 */}
                    {formData.discountType === 'gift' && (
                      <>
                        <div className="space-y-2">
                          <Label required>증정 조건</Label>
                          <div className="flex gap-2 flex-wrap">
                            {(['product_purchase', 'n_plus_one', 'min_order'] as GiftConditionType[]).map(
                              (type) => (
                                <button
                                  key={type}
                                  type="button"
                                  onClick={() =>
                                    updateFormData({
                                      giftCondition: {
                                        type,
                                        ...(type === 'n_plus_one'
                                          ? { buyQuantity: 2, getQuantity: 1 }
                                          : {}),
                                        ...(type === 'product_purchase'
                                          ? { purchaseQuantity: 1 }
                                          : {}),
                                      },
                                    })
                                  }
                                  className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all ${formData.giftCondition?.type === type
                                    ? 'bg-primary text-white border-primary'
                                    : 'bg-bg-card text-txt-muted border-border hover:border-primary'
                                    }`}
                                >
                                  {GIFT_CONDITION_LABELS[type]}
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        {formData.giftCondition && (
                          <div className="p-3 bg-bg-card rounded-lg border border-border space-y-3">
                            {formData.giftCondition.type === 'n_plus_one' && (
                              <>
                                <ProductSelector
                                  selectedProductIds={formData.giftCondition.purchaseProductIds || []}
                                  onChange={(productIds) =>
                                    updateFormData({
                                      giftCondition: {
                                        ...formData.giftCondition!,
                                        purchaseProductIds: productIds,
                                      },
                                    })
                                  }
                                  maxSelect={formData.giftCondition.buyQuantity || 2}
                                  title="N+1 대상 상품"
                                  description={`이 상품 ${formData.giftCondition.buyQuantity || 2}개 구매 시 증정됩니다`}
                                  excludedProducts={excludedProducts}
                                />
                                <div className="flex items-center gap-2 pt-2 border-t border-border">
                                  <Input
                                    type="number"
                                    min={1}
                                    value={formData.giftCondition.buyQuantity || 2}
                                    onChange={(e) =>
                                      updateFormData({
                                        giftCondition: {
                                          ...formData.giftCondition!,
                                          buyQuantity: Number(e.target.value),
                                        },
                                      })
                                    }
                                    className="w-16"
                                  />
                                  <span className="text-sm text-txt-main">개 구매 시</span>
                                  <Input
                                    type="number"
                                    min={1}
                                    value={formData.giftCondition.getQuantity || 1}
                                    onChange={(e) =>
                                      updateFormData({
                                        giftCondition: {
                                          ...formData.giftCondition!,
                                          getQuantity: Number(e.target.value),
                                        },
                                      })
                                    }
                                    className="w-16"
                                  />
                                  <span className="text-sm text-txt-main">개 증정</span>
                                </div>
                              </>
                            )}

                            {formData.giftCondition.type === 'product_purchase' && (
                              <>
                                <ProductSelector
                                  selectedProductIds={formData.giftCondition.purchaseProductIds || []}
                                  onChange={(productIds) =>
                                    updateFormData({
                                      giftCondition: {
                                        ...formData.giftCondition!,
                                        purchaseProductIds: productIds,
                                      },
                                    })
                                  }
                                  title="구매 조건 상품"
                                  description="이 상품을 구매해야 증정 조건이 충족됩니다"
                                  excludedProducts={excludedProducts}
                                />
                                <div className="flex items-center gap-2 pt-2 border-t border-border">
                                  <span className="text-sm text-txt-main">구매 수량:</span>
                                  <Input
                                    type="number"
                                    min={1}
                                    value={formData.giftCondition.purchaseQuantity || 1}
                                    onChange={(e) =>
                                      updateFormData({
                                        giftCondition: {
                                          ...formData.giftCondition!,
                                          purchaseQuantity: Number(e.target.value),
                                        },
                                      })
                                    }
                                    className="w-16"
                                  />
                                  <span className="text-sm text-txt-main">개 이상</span>
                                </div>
                              </>
                            )}

                            {formData.giftCondition.type === 'min_order' && (
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-txt-main">최소 주문 금액:</span>
                                <div className="relative">
                                  <Input
                                    type="number"
                                    min={0}
                                    value={formData.giftCondition.minAmount || 0}
                                    onChange={(e) =>
                                      updateFormData({
                                        giftCondition: {
                                          ...formData.giftCondition!,
                                          minAmount: Number(e.target.value),
                                        },
                                      })
                                    }
                                    className="w-28 pr-8"
                                  />
                                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-txt-muted">
                                    원
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label required>증정 상품</Label>
                          <div className="p-3 bg-bg-card rounded-lg border border-border space-y-3">
                            <ProductSelector
                              selectedProductIds={formData.giftReward?.productIds || []}
                              onChange={(productIds) =>
                                updateFormData({
                                  giftReward: {
                                    ...formData.giftReward,
                                    productIds,
                                    quantity: formData.giftReward?.quantity || 1,
                                  },
                                })
                              }
                              title="증정할 상품"
                              description="조건 충족 시 자동으로 증정되는 상품입니다"
                              excludedProducts={excludedProducts}
                            />
                            <div className="pt-2 border-t border-border space-y-2">
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-txt-main">상품당 증정 수량:</span>
                                <Input
                                  type="number"
                                  min={1}
                                  value={formData.giftReward?.quantity || 1}
                                  onChange={(e) =>
                                    updateFormData({
                                      giftReward: {
                                        ...formData.giftReward,
                                        productIds: formData.giftReward?.productIds || [],
                                        quantity: Number(e.target.value),
                                      },
                                    })
                                  }
                                  className="w-16"
                                />
                                <span className="text-sm text-txt-main">개</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-txt-main">주문당 최대:</span>
                                <Input
                                  type="number"
                                  min={1}
                                  value={formData.giftReward?.maxPerOrder || ''}
                                  onChange={(e) =>
                                    updateFormData({
                                      giftReward: {
                                        ...formData.giftReward,
                                        productIds: formData.giftReward?.productIds || [],
                                        quantity: formData.giftReward?.quantity || 1,
                                        maxPerOrder: Number(e.target.value) || undefined,
                                      },
                                    })
                                  }
                                  className="w-16"
                                  placeholder="무제한"
                                />
                                <span className="text-sm text-txt-muted">회</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* 기간 설정 섹션 */}
                  <div className="space-y-4 p-4 bg-hover rounded-lg border border-border">
                    <h3 className="text-sm font-semibold text-txt-main">기간 설정</h3>

                    <div className="space-y-2">
                      <Label required>기간 타입</Label>
                      <div className="flex gap-2">
                        {(['period', 'schedule'] as DiscountPeriodType[]).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => updateFormData({ periodType: type })}
                            className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${formData.periodType === type
                              ? 'bg-primary text-white border-primary'
                              : 'bg-bg-card text-txt-muted border-border hover:border-primary'
                              }`}
                          >
                            {type === 'period' ? '기간' : '시간/요일'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {formData.periodType === 'period' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm text-txt-muted mb-1">시작일</label>
                          <div className="relative">
                            <CalendarOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
                            <input
                              type="date"
                              value={formData.startDate || ''}
                              onChange={(e) => updateFormData({ startDate: e.target.value })}
                              className="w-full pl-9 pr-3 py-2 bg-bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm text-txt-muted mb-1">종료일</label>
                          <div className="relative">
                            <CalendarOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
                            <input
                              type="date"
                              value={formData.endDate || ''}
                              onChange={(e) => updateFormData({ endDate: e.target.value })}
                              className="w-full pl-9 pr-3 py-2 bg-bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {formData.periodType === 'schedule' && (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm text-txt-muted mb-2">적용 요일</label>
                          <div className="flex gap-1">
                            {DAYS_OF_WEEK.map((day) => (
                              <button
                                key={day}
                                type="button"
                                onClick={() => toggleDay(day)}
                                className={`w-9 h-9 rounded-full text-sm font-medium transition-all ${formData.schedule?.days?.includes(day)
                                  ? 'bg-primary text-white'
                                  : 'bg-bg-card border border-border text-txt-muted hover:border-primary'
                                  }`}
                              >
                                {DAY_LABELS_MAP[day]}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm text-txt-muted mb-2">적용 시간</label>
                          <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                              <ClockCircleOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
                              <input
                                type="time"
                                value={formData.schedule?.timeSlots?.[0]?.startTime || '00:00'}
                                onChange={(e) =>
                                  updateFormData({
                                    schedule: {
                                      ...formData.schedule,
                                      days: formData.schedule?.days || [],
                                      timeSlots: [
                                        {
                                          startTime: e.target.value,
                                          endTime: formData.schedule?.timeSlots?.[0]?.endTime || '23:59',
                                        },
                                      ],
                                    },
                                  })
                                }
                                className="w-full pl-9 pr-3 py-2 bg-bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                              />
                            </div>
                            <span className="text-txt-muted">~</span>
                            <div className="relative flex-1">
                              <ClockCircleOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
                              <input
                                type="time"
                                value={formData.schedule?.timeSlots?.[0]?.endTime || '23:59'}
                                onChange={(e) =>
                                  updateFormData({
                                    schedule: {
                                      ...formData.schedule,
                                      days: formData.schedule?.days || [],
                                      timeSlots: [
                                        {
                                          startTime:
                                            formData.schedule?.timeSlots?.[0]?.startTime || '00:00',
                                          endTime: e.target.value,
                                        },
                                      ],
                                    },
                                  })
                                }
                                className="w-full pl-9 pr-3 py-2 bg-bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 적용 대상 섹션 */}
                  {!(
                    formData.discountType === 'gift' &&
                    (formData.giftCondition?.type === 'n_plus_one' ||
                      formData.giftCondition?.type === 'product_purchase')
                  ) && (
                      <div className="space-y-4 p-4 bg-hover rounded-lg border border-border">
                        <h3 className="text-sm font-semibold text-txt-main">적용 대상</h3>

                        <div className="space-y-2">
                          <Label required>적용 상품</Label>
                          <div className="flex gap-2">
                            {(['all', 'category', 'product'] as DiscountTargetType[]).map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => updateFormData({ target: { type } })}
                                className={`flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${formData.target.type === type
                                  ? 'bg-primary text-white border-primary'
                                  : 'bg-bg-card text-txt-muted border-border hover:border-primary'
                                  }`}
                              >
                                {type === 'all'
                                  ? '전체 상품'
                                  : type === 'category'
                                    ? '카테고리'
                                    : '특정 상품'}
                              </button>
                            ))}
                          </div>
                        </div>

                        {formData.target.type === 'category' && (
                          <ProductSelector
                            selectedProductIds={formData.target.categoryIds || []}
                            onChange={(categoryIds) =>
                              updateFormData({
                                target: {
                                  ...formData.target,
                                  categoryIds,
                                },
                              })
                            }
                            title="적용 카테고리"
                            description="선택한 카테고리의 상품에만 할인이 적용됩니다"
                          />
                        )}
                        {formData.target.type === 'product' && (
                          <ProductSelector
                            selectedProductIds={formData.target.productIds || []}
                            onChange={(productIds) =>
                              updateFormData({
                                target: {
                                  ...formData.target,
                                  productIds,
                                },
                              })
                            }
                            title="적용 상품"
                            description="선택한 상품에만 할인이 적용됩니다 (다른 할인에서 사용 중인 상품은 선택 불가)"
                            excludedProducts={excludedProducts}
                          />
                        )}
                      </div>
                    )}

                  {/* 사용 조건 섹션 */}
                  <div className="space-y-4 p-4 bg-hover rounded-lg border border-border">
                    <h3 className="text-sm font-semibold text-txt-main">사용 조건</h3>

                    <div className="space-y-2">
                      <Label required>사용 채널</Label>
                      <div className="flex gap-3 flex-wrap">
                        {(['all', 'app', 'pc_web', 'mobile_web'] as DiscountChannel[]).map((ch) => (
                          <label key={ch} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="channel"
                              checked={formData.channel === ch}
                              onChange={() => updateFormData({ channel: ch })}
                              className="w-4 h-4 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-txt-main">{CHANNEL_LABELS[ch]}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label required>주문 유형</Label>
                      <div className="flex gap-3 flex-wrap">
                        {(['all', 'delivery', 'pickup'] as OrderType[]).map((ot) => (
                          <label key={ot} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="orderType"
                              checked={formData.orderType === ot}
                              onChange={() => updateFormData({ orderType: ot })}
                              className="w-4 h-4 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-txt-main">{ORDER_TYPE_LABELS[ot]}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* 정산 비율 섹션 */}
                  <div className="space-y-4 p-4 bg-hover rounded-lg border border-border">
                    <h3 className="text-sm font-semibold text-txt-main">정산 비율</h3>

                    <div className="space-y-4">
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
                    </div>
                  </div>

                  {/* 참여 매장 섹션 */}
                  <div className="space-y-4 p-4 bg-hover rounded-lg border border-border">
                    <h3 className="text-sm font-semibold text-txt-main">참여 매장</h3>
                    <StoreSelector
                      stores={stores}
                      selectedStores={formData.storeIds}
                      onChange={(storeIds) => updateFormData({ storeIds })}
                      applyToAll={formData.applyToAll}
                      onApplyToAllChange={(applyToAll) => updateFormData({ applyToAll })}
                    />
                  </div>

                  {/* 추가 설정 섹션 */}
                  <div className="space-y-4 p-4 bg-hover rounded-lg border border-border">
                    <h3 className="text-sm font-semibold text-txt-main">추가 설정</h3>

                    <div className="space-y-2">
                      <Label>최소 주문 금액</Label>
                      <div className="relative">
                        <Input
                          type="number"
                          placeholder="10000"
                          value={formData.minOrderAmount || ''}
                          onChange={(e) =>
                            updateFormData({ minOrderAmount: Number(e.target.value) || undefined })
                          }
                          className="pr-12"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">
                          원
                        </span>
                      </div>
                    </div>

                    {formData.discountType === 'company' && formData.method === 'percentage' && (
                      <div className="space-y-2">
                        <Label>최대 할인 금액</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="5000"
                            value={formData.maxDiscountAmount || ''}
                            onChange={(e) =>
                              updateFormData({
                                maxDiscountAmount: Number(e.target.value) || undefined,
                              })
                            }
                            className="pr-12"
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">
                            원
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between py-2">
                      <div>
                        <Label>활성 상태</Label>
                        <p className="text-xs text-txt-muted">할인 적용 여부</p>
                      </div>
                      <Switch
                        checked={formData.isActive}
                        onCheckedChange={(checked) => updateFormData({ isActive: checked })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, discountId: null })}
        onConfirm={handleConfirmDelete}
        title="할인 삭제"
        message="이 할인을 삭제하시겠습니까? 삭제된 할인은 복구할 수 없습니다."
        type="warning"
        confirmText="삭제"
        cancelText="취소"
      />

      {/* 저장 완료 다이얼로그 */}
      <ConfirmDialog
        isOpen={successDialog.isOpen}
        onClose={handleSuccessDialogClose}
        onConfirm={handleSuccessDialogConfirm}
        title={successDialog.isNew ? '할인 등록 완료' : '할인 수정 완료'}
        message={`"${successDialog.discountName}" 할인이 ${successDialog.isNew ? '등록' : '수정'}되었습니다.\n다음 작업을 선택해주세요.`}
        type="success"
        confirmText="추가 등록"
        cancelText="목록으로"
        showCancel={true}
      />
    </div>
  );
}
