import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';

import { Card, Button, Input, Spinner, Switch } from '@/components/ui';
import { useStore, useUpdateOperatingInfo, useToast } from '@/hooks';
import type {
  OperatingInfoFormData,
  DayOperatingHours,
  DeliverySettings,
  PickupSettings,
  WeekDay,
} from '@/types/store';
import { WEEK_DAYS, WEEK_DAY_LABELS, DEFAULT_DAILY_HOURS } from '@/types/store';

type HoursMode = 'simple' | 'daily';

// 임시 휴업 사유 목록
const CLOSE_REASONS = [
  '재료 소진',
  '기기점검 및 매장 보수',
  '개인사정으로 인한 임시휴무',
  '기타',
] as const;

const DEFAULT_HOURS: DayOperatingHours = {
  isOpen: true,
  openTime: '11:00',
  closeTime: '22:00',
  lastOrderMinutes: 30,
};

export const OperatingInfoEdit: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();

  const { data: store, isLoading } = useStore(id);
  const updateOperatingInfo = useUpdateOperatingInfo();

  const [hoursMode, setHoursMode] = useState<HoursMode>('simple');
  const [formData, setFormData] = useState<OperatingInfoFormData>({
    weekdayHours: DEFAULT_HOURS,
    weekendHours: DEFAULT_HOURS,
    isTemporarilyClosed: false,
    isDeliveryAvailable: true,
    isPickupAvailable: true,
    deliverySettings: { isAvailable: true },
    pickupSettings: { isAvailable: true },
    isVisible: true,
  });

  const initialDataRef = useRef<string>('');

  useEffect(() => {
    if (store?.operatingInfo) {
      const currentData = store.operatingInfo;
      setHoursMode(currentData.dailyHours ? 'daily' : 'simple');
      const data: OperatingInfoFormData = {
        weekdayHours: currentData.weekdayHours || DEFAULT_HOURS,
        weekendHours: currentData.weekendHours || DEFAULT_HOURS,
        holidayHours: currentData.holidayHours,
        dailyHours: currentData.dailyHours,
        regularClosedDays: currentData.regularClosedDays,
        irregularClosedDays: currentData.irregularClosedDays,
        isTemporarilyClosed: currentData.isTemporarilyClosed || false,
        temporaryCloseReason: currentData.temporaryCloseReason,
        temporaryCloseReasonDetail: currentData.temporaryCloseReasonDetail,
        temporaryCloseStartDate: currentData.temporaryCloseStartDate
          ? new Date(currentData.temporaryCloseStartDate).toISOString().split('T')[0]
          : undefined,
        temporaryCloseEndDate: currentData.temporaryCloseEndDate
          ? new Date(currentData.temporaryCloseEndDate).toISOString().split('T')[0]
          : undefined,
        isDeliveryAvailable: currentData.isDeliveryAvailable ?? true,
        isPickupAvailable: currentData.isPickupAvailable ?? true,
        deliverySettings: currentData.deliverySettings || { isAvailable: currentData.isDeliveryAvailable ?? true },
        pickupSettings: currentData.pickupSettings || { isAvailable: currentData.isPickupAvailable ?? true },
        isVisible: currentData.isVisible ?? true,
      };
      setFormData(data);
      initialDataRef.current = JSON.stringify(data);
    }
  }, [store]);

  const handleSimpleHoursChange = (
    type: 'weekdayHours' | 'weekendHours' | 'holidayHours',
    field: keyof DayOperatingHours,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [type]: {
        ...(prev[type] || DEFAULT_HOURS),
        [field]: value,
      },
    }));
  };

  const handleDailyHoursChange = (
    day: WeekDay,
    field: keyof DayOperatingHours,
    value: string | boolean | number
  ) => {
    setFormData((prev) => ({
      ...prev,
      dailyHours: {
        ...(prev.dailyHours || DEFAULT_DAILY_HOURS),
        [day]: {
          ...((prev.dailyHours || DEFAULT_DAILY_HOURS)[day]),
          [field]: value,
        },
      },
    }));
  };

  // [2026-03-23] 배달/포장 최소 1개 필수 — 둘 다 끄려는 경우 차단
  const handleDeliveryChange = (field: keyof DeliverySettings, value: string | number | boolean) => {
    if (field === 'isAvailable' && value === false) {
      const pickupOn = formData.pickupSettings?.isAvailable ?? false;
      if (!pickupOn) {
        toast.error('배달 또는 포장 중 최소 1개는 활성화해야 합니다.');
        return;
      }
    }
    setFormData((prev) => ({
      ...prev,
      deliverySettings: {
        ...(prev.deliverySettings || { isAvailable: false }),
        [field]: value,
      },
    }));
  };

  const handlePickupChange = (field: keyof PickupSettings, value: string | number | boolean) => {
    if (field === 'isAvailable' && value === false) {
      const deliveryOn = formData.deliverySettings?.isAvailable ?? false;
      if (!deliveryOn) {
        toast.error('배달 또는 포장 중 최소 1개는 활성화해야 합니다.');
        return;
      }
    }
    setFormData((prev) => ({
      ...prev,
      pickupSettings: {
        ...(prev.pickupSettings || { isAvailable: false }),
        [field]: value,
      },
    }));
  };

  const handleModeChange = (mode: HoursMode) => {
    setHoursMode(mode);
    if (mode === 'daily' && !formData.dailyHours) {
      setFormData((prev) => ({
        ...prev,
        dailyHours: { ...DEFAULT_DAILY_HOURS },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const isDeliveryOn = formData.deliverySettings?.isAvailable ?? formData.isDeliveryAvailable;
    const isPickupOn = formData.pickupSettings?.isAvailable ?? formData.isPickupAvailable;

    // [2026-03-23] 배달/포장 최소 1개 필수 검증
    if (!isDeliveryOn && !isPickupOn) {
      toast.error('배달 또는 포장 중 최소 1개는 활성화해야 합니다.');
      return;
    }

    // 임시휴업 사유: "기타" 선택 시 상세 사유를 temporaryCloseReason에 병합
    const resolvedCloseReason =
      formData.isTemporarilyClosed && formData.temporaryCloseReason === '기타'
        ? formData.temporaryCloseReasonDetail || '기타'
        : formData.temporaryCloseReason;

    const submitData: OperatingInfoFormData = {
      ...formData,
      dailyHours: hoursMode === 'daily' ? formData.dailyHours : undefined,
      isDeliveryAvailable: isDeliveryOn,
      isPickupAvailable: isPickupOn,
      temporaryCloseReason: resolvedCloseReason,
    };

    if (JSON.stringify(formData) === initialDataRef.current) {
      toast.info('변경사항이 없습니다.');
      navigate(`/staff/stores/${id}`);
      return;
    }

    try {
      await updateOperatingInfo.mutateAsync({ storeId: id, data: submitData });
      toast.success('영업정보가 수정되었습니다.');
      navigate(`/staff/stores/${id}`);
    } catch {
      toast.error('영업정보 수정에 실패했습니다.');
    }
  };

  /**
   * 영업시간 행 렌더링 — 카드형 레이아웃
   * [2026-03-23] UX 개선: 한 줄 flex-wrap → 카드형 2단 구조
   */
  const renderTimeRow = (
    label: string,
    hours: DayOperatingHours,
    onIsOpenChange: (v: boolean) => void,
    onOpenTimeChange: (v: string) => void,
    onCloseTimeChange: (v: string) => void,
    onLastOrderChange: (v: number) => void,
    onBreakStartChange?: (v: string) => void,
    onBreakEndChange?: (v: string) => void,
  ) => (
    <div className={`p-4 border rounded-xl transition-colors ${hours.isOpen ? 'bg-bg-card border-border' : 'bg-bg-secondary border-border/50 opacity-60'}`}>
      {/* 1행: 요일 + 영업 토글 */}
      <div className="flex items-center justify-between">
        <span className="text-base font-semibold text-txt-main">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-sm ${hours.isOpen ? 'text-success font-medium' : 'text-txt-muted'}`}>
            {hours.isOpen ? '영업' : '휴무'}
          </span>
          <Switch
            checked={hours.isOpen}
            onCheckedChange={onIsOpenChange}
          />
        </div>
      </div>

      {hours.isOpen && (
        <div className="mt-4 space-y-3">
          {/* 2행: 영업시간 */}
          <div>
            <span className="text-sm font-medium text-txt-secondary mb-2 block">영업시간</span>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={hours.openTime || ''}
                onChange={(e) => onOpenTimeChange(e.target.value)}
                className="w-36 text-base h-12"
              />
              <span className="text-txt-muted font-medium">~</span>
              <Input
                type="time"
                value={hours.closeTime || ''}
                onChange={(e) => onCloseTimeChange(e.target.value)}
                className="w-36 text-base h-12"
              />
            </div>
          </div>

          {/* 3행: 라스트오더 + 휴게시간 */}
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <span className="text-sm font-medium text-txt-secondary mb-2 block">라스트오더</span>
              <select
                value={hours.lastOrderMinutes ?? 30}
                onChange={(e) => onLastOrderChange(Number(e.target.value))}
                className="h-12 px-4 text-sm bg-bg-card border border-border rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                {[10, 20, 30, 40, 50, 60].map((min) => (
                  <option key={min} value={min}>
                    마감 {min}분 전
                  </option>
                ))}
              </select>
            </div>

            {onBreakStartChange && onBreakEndChange && (
              <div>
                <span className="text-sm font-medium text-txt-secondary mb-2 block">휴게시간 <span className="text-txt-muted font-normal">(선택)</span></span>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={hours.breakStart || ''}
                    onChange={(e) => onBreakStartChange(e.target.value)}
                    className="w-36 text-base h-12"
                  />
                  <span className="text-txt-muted font-medium">~</span>
                  <Input
                    type="time"
                    value={hours.breakEnd || ''}
                    onChange={(e) => onBreakEndChange(e.target.value)}
                    className="w-36 text-base h-12"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const hoursContent = (
    <div className="space-y-4">
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="hoursMode"
            checked={hoursMode === 'simple'}
            onChange={() => handleModeChange('simple')}
            className="w-4 h-4"
          />
          <span className="text-sm">간편 설정 (평일/주말)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="hoursMode"
            checked={hoursMode === 'daily'}
            onChange={() => handleModeChange('daily')}
            className="w-4 h-4"
          />
          <span className="text-sm">요일별 설정</span>
        </label>
      </div>

      {hoursMode === 'simple' ? (
        <div className="space-y-3">
          {renderTimeRow(
            '평일',
            formData.weekdayHours,
            (v) => handleSimpleHoursChange('weekdayHours', 'isOpen', v),
            (v) => handleSimpleHoursChange('weekdayHours', 'openTime', v),
            (v) => handleSimpleHoursChange('weekdayHours', 'closeTime', v),
            (v) => handleSimpleHoursChange('weekdayHours', 'lastOrderMinutes', v),
            (v) => handleSimpleHoursChange('weekdayHours', 'breakStart', v),
            (v) => handleSimpleHoursChange('weekdayHours', 'breakEnd', v),
          )}
          {renderTimeRow(
            '주말',
            formData.weekendHours,
            (v) => handleSimpleHoursChange('weekendHours', 'isOpen', v),
            (v) => handleSimpleHoursChange('weekendHours', 'openTime', v),
            (v) => handleSimpleHoursChange('weekendHours', 'closeTime', v),
            (v) => handleSimpleHoursChange('weekendHours', 'lastOrderMinutes', v),
            (v) => handleSimpleHoursChange('weekendHours', 'breakStart', v),
            (v) => handleSimpleHoursChange('weekendHours', 'breakEnd', v),
          )}
          {/* 공휴일 휴무 안내 (on/off만) */}
          <div className="p-4 border rounded-xl bg-bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-base font-semibold text-txt-main">공휴일 휴무</span>
                <p className="text-xs text-txt-muted mt-0.5">공휴일에 매장을 휴무 처리합니다. 고객 앱에 "공휴일 휴무" 안내가 표시됩니다.</p>
              </div>
              <Switch
                checked={formData.holidayHours?.isOpen === false}
                onCheckedChange={(v) =>
                  setFormData((prev) => ({
                    ...prev,
                    holidayHours: { isOpen: !v, openTime: '', closeTime: '' },
                  }))
                }
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {WEEK_DAYS.map((day) => {
            const dayHours = (formData.dailyHours || DEFAULT_DAILY_HOURS)[day];
            return (
              <div key={day}>
                {renderTimeRow(
                  WEEK_DAY_LABELS[day],
                  dayHours,
                  (v) => handleDailyHoursChange(day, 'isOpen', v),
                  (v) => handleDailyHoursChange(day, 'openTime', v),
                  (v) => handleDailyHoursChange(day, 'closeTime', v),
                  (v) => handleDailyHoursChange(day, 'lastOrderMinutes', v),
                  (v) => handleDailyHoursChange(day, 'breakStart', v),
                  (v) => handleDailyHoursChange(day, 'breakEnd', v),
                )}
              </div>
            );
          })}
          {/* 공휴일 휴무 (요일별 설정에서도 표시) */}
          <div className="p-4 border rounded-xl bg-bg-card border-border">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-base font-semibold text-txt-main">공휴일 휴무</span>
                <p className="text-xs text-txt-muted mt-0.5">공휴일에 매장을 휴무 처리합니다.</p>
              </div>
              <Switch
                checked={formData.holidayHours?.isOpen === false}
                onCheckedChange={(v) =>
                  setFormData((prev) => ({
                    ...prev,
                    holidayHours: { isOpen: !v, openTime: '', closeTime: '' },
                  }))
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const deliveryContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">배달 가능</span>
        <Switch
          checked={formData.deliverySettings?.isAvailable ?? false}
          onCheckedChange={(v) => handleDeliveryChange('isAvailable', v)}
        />
      </div>

      {formData.deliverySettings?.isAvailable && (
        <div className="space-y-4 pl-1">
          {/* 주문 가능 시간 안내 — 영업시간 + 라스트오더로 자동 계산 */}
          <div className="p-3 bg-bg-secondary rounded-lg">
            <p className="text-sm text-txt-secondary">
              배달 주문 가능 시간은 <span className="font-medium text-txt-main">영업 시작 ~ 마감 전 라스트오더 시간</span>까지 자동 적용됩니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-txt-secondary mb-2">최소 주문금액</label>
              <Input
                type="number"
                value={formData.deliverySettings.minOrderAmount ?? 0}
                onChange={(e) =>
                  handleDeliveryChange('minOrderAmount', e.target.value ? Number(e.target.value) : 0)
                }
                placeholder="15000"
                min={0}
                step={1000}
              />
            </div>
          </div>

          <div className="p-3 bg-bg-hover rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-txt-secondary">배달비는 상권관리에서 설정합니다.</span>
              <button
                type="button"
                onClick={() => navigate('/delivery-zones')}
                className="text-sm text-blue-600 hover:text-blue-800 underline font-medium"
              >
                상권관리로 이동 →
              </button>
            </div>
          </div>

          {/* 예상 배달시간 */}
          <div>
            <label className="block text-sm font-medium text-txt-secondary mb-2">예상 배달시간 (고객 앱 안내용)</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={formData.deliverySettings?.estimatedMinutes ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    deliverySettings: {
                      ...prev.deliverySettings,
                      isAvailable: prev.deliverySettings?.isAvailable ?? true,
                      estimatedMinutes: e.target.value ? Number(e.target.value) : undefined,
                    },
                  }))
                }
                placeholder="30"
                min={1}
                className="w-24"
              />
              <span className="text-sm text-txt-muted">분</span>
            </div>
            <p className="text-xs text-txt-muted mt-1">고객 앱에서 "약 N분 소요"로 표시됩니다.</p>
          </div>

        </div>
      )}
    </div>
  );

  const pickupContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">포장 가능</span>
        <Switch
          checked={formData.pickupSettings?.isAvailable ?? false}
          onCheckedChange={(v) => handlePickupChange('isAvailable', v)}
        />
      </div>

      {formData.pickupSettings?.isAvailable && (
        <div className="space-y-4 pl-1">
          {/* 주문 가능 시간 안내 — 영업시간 + 라스트오더로 자동 계산 */}
          <div className="p-3 bg-bg-secondary rounded-lg">
            <p className="text-sm text-txt-secondary">
              포장 주문 가능 시간은 <span className="font-medium text-txt-main">영업 시작 ~ 마감 전 라스트오더 시간</span>까지 자동 적용됩니다.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-txt-secondary mb-2">최소 주문금액</label>
            <Input
              type="number"
              value={formData.pickupSettings.minOrderAmount ?? ''}
              onChange={(e) =>
                handlePickupChange('minOrderAmount', e.target.value ? Number(e.target.value) : 0)
              }
              placeholder="10000"
              className="w-48"
            />
          </div>

          {/* 예상 포장 준비시간 */}
          <div>
            <label className="block text-sm font-medium text-txt-secondary mb-2">예상 준비시간 (고객 앱 안내용)</label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={formData.pickupSettings.estimatedMinutes ?? ''}
                onChange={(e) =>
                  handlePickupChange('estimatedMinutes', e.target.value ? Number(e.target.value) : 0)
                }
                placeholder="15"
                min={1}
                className="w-24"
              />
              <span className="text-sm text-txt-muted">분</span>
            </div>
            <p className="text-xs text-txt-muted mt-1">고객 앱에서 "약 N분 소요"로 표시됩니다.</p>
          </div>

        </div>
      )}
    </div>
  );

  // 예약 설정 (배달/포장 통합)
  const reservationContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium">예약 주문</span>
          <p className="text-xs text-txt-muted mt-0.5">배달/포장 모두에 적용됩니다.</p>
        </div>
        <Switch
          checked={formData.isReservationAvailable ?? false}
          onCheckedChange={(v) =>
            setFormData((prev) => ({ ...prev, isReservationAvailable: v }))
          }
        />
      </div>

      {formData.isReservationAvailable && (
        <div className="flex items-center gap-2 pl-1">
          <span className="text-sm text-txt-muted">현재 시간 기준</span>
          <Input
            type="number"
            value={formData.reservationLeadTimeMinutes ?? ''}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                reservationLeadTimeMinutes: e.target.value ? Number(e.target.value) : 0,
              }))
            }
            placeholder="30"
            className="w-24 text-center h-12"
          />
          <span className="text-sm text-txt-muted">분 후부터 예약 가능</span>
        </div>
      )}
    </div>
  );

  const closureContent = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-critical">임시 휴업</span>
        <Switch
          checked={formData.isTemporarilyClosed}
          onCheckedChange={(v) =>
            setFormData((prev) => ({ ...prev, isTemporarilyClosed: v }))
          }
        />
      </div>

      {formData.isTemporarilyClosed && (
        <div className="space-y-4 pl-1">
          {/* 휴업 사유 — 버튼 선택 */}
          <div>
            <label className="block text-sm font-medium text-txt-secondary mb-2">휴업 사유</label>
            <div className="flex flex-wrap gap-2">
              {CLOSE_REASONS.map((reason) => {
                const isSelected = formData.temporaryCloseReason === reason;
                return (
                  <button
                    key={reason}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        temporaryCloseReason: reason,
                        ...(reason !== '기타' ? {} : { temporaryCloseReason: '기타' }),
                      }))
                    }
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                      isSelected
                        ? 'bg-primary text-white border-primary'
                        : 'bg-bg-card text-txt-secondary border-border hover:border-primary/50'
                    }`}
                  >
                    {reason}
                  </button>
                );
              })}
            </div>
            {/* 기타 선택 시 직접 입력 */}
            {formData.temporaryCloseReason === '기타' && (
              <Input
                value={formData.temporaryCloseReasonDetail || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, temporaryCloseReasonDetail: e.target.value }))
                }
                placeholder="휴업 사유를 직접 입력하세요"
                className="mt-2"
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-txt-secondary mb-2">시작일</label>
              <Input
                type="date"
                value={formData.temporaryCloseStartDate || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, temporaryCloseStartDate: e.target.value || undefined }))
                }
                className="h-12 text-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-txt-secondary mb-2">종료일</label>
              <Input
                type="date"
                value={formData.temporaryCloseEndDate || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, temporaryCloseEndDate: e.target.value || undefined }))
                }
                className="h-12 text-base"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const visibilityContent = (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm font-medium">매장 노출</span>
          <p className="text-xs text-txt-muted mt-0.5">
            비노출 시 고객에게 매장이 보이지 않습니다.
          </p>
        </div>
        <Switch
          checked={formData.isVisible ?? true}
          onCheckedChange={(v) =>
            setFormData((prev) => ({ ...prev, isVisible: v }))
          }
        />
      </div>
    </div>
  );

  // 5개 독립 카드 섹션 정의
  const sections = [
    { id: 'status', title: '운영 상태', description: '매장 노출 여부와 임시 휴업을 관리합니다.', content: (
      <div className="space-y-6">
        {visibilityContent}
        <div className="border-t border-border pt-4">{closureContent}</div>
      </div>
    )},
    { id: 'hours', title: '영업시간', description: '평일/주말/공휴일 또는 요일별 영업시간을 설정합니다.', content: hoursContent },
    { id: 'delivery', title: '배달 설정', description: '배달 가능 여부, 최소주문금액, 예상 배달시간을 설정합니다.', content: deliveryContent },
    { id: 'pickup', title: '포장 설정', description: '포장 가능 여부, 최소주문금액, 예상 준비시간을 설정합니다.', content: pickupContent },
    { id: 'reservation', title: '예약 설정', description: '예약 주문 가능 여부와 예약 가능 시간을 설정합니다.', content: reservationContent },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/staff/stores/${id}`)}
          className="p-2 rounded-lg hover:bg-bg-hover transition-colors"
        >
          <ArrowLeftOutlined />
        </button>
        <h1 className="text-2xl font-bold text-txt-main">
          영업정보 수정
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4 text-txt-muted text-sm">
          매장명: <span className="font-medium text-txt-main">{store?.name}</span>
        </div>

        <div className="space-y-4">
          {sections.map((section) => (
            <Card key={section.id} className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-txt-main">{section.title}</h2>
                <p className="text-sm text-txt-muted mt-0.5">{section.description}</p>
              </div>
              {section.content}
            </Card>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-6 mt-2">
          <Button type="button" variant="outline" onClick={() => navigate(`/staff/stores/${id}`)}>
            취소
          </Button>
          <Button type="submit" disabled={updateOperatingInfo.isPending}>
            {updateOperatingInfo.isPending ? <Spinner size="sm" /> : '저장'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OperatingInfoEdit;
