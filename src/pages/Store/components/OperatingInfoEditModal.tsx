/**
 * 영업정보 편집 모달
 * Accordion 구조: 영업시간 / 배달설정 / 포장설정 / 임시휴업
 */
import React, { useState, useEffect, useRef } from 'react';

import { Modal, Button, Input, Spinner, Accordion, Switch } from '@/components/ui';
import type { AccordionItemData } from '@/components/ui';
import { useUpdateOperatingInfo, useToast } from '@/hooks';
import type {
  OperatingInfo,
  OperatingInfoFormData,
  DayOperatingHours,
  DeliverySettings,
  PickupSettings,
  WeekDay,
} from '@/types/store';
import { WEEK_DAYS, WEEK_DAY_SHORT_LABELS, DEFAULT_DAILY_HOURS } from '@/types/store';

interface OperatingInfoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  currentData?: OperatingInfo;
}

type HoursMode = 'simple' | 'daily';

const DEFAULT_HOURS: DayOperatingHours = {
  isOpen: true,
  openTime: '11:00',
  closeTime: '22:00',
  lastOrderMinutes: 30,
};

export const OperatingInfoEditModal: React.FC<OperatingInfoEditModalProps> = ({
  isOpen,
  onClose,
  storeId,
  currentData,
}) => {
  const toast = useToast();
  const updateOperatingInfo = useUpdateOperatingInfo();

  // 영업시간 모드: 간편(평일/주말) vs 요일별
  const [hoursMode, setHoursMode] = useState<HoursMode>(
    currentData?.dailyHours ? 'daily' : 'simple'
  );

  const [formData, setFormData] = useState<OperatingInfoFormData>({
    weekdayHours: currentData?.weekdayHours || DEFAULT_HOURS,
    weekendHours: currentData?.weekendHours || DEFAULT_HOURS,
    holidayHours: currentData?.holidayHours,
    dailyHours: currentData?.dailyHours,
    regularClosedDays: currentData?.regularClosedDays,
    irregularClosedDays: currentData?.irregularClosedDays,
    deliveryFee: currentData?.deliveryFee || 3000,
    freeDeliveryMinAmount: currentData?.freeDeliveryMinAmount,
    isTemporarilyClosed: currentData?.isTemporarilyClosed || false,
    temporaryCloseReason: currentData?.temporaryCloseReason,
    temporaryCloseStartDate: currentData?.temporaryCloseStartDate
      ? currentData.temporaryCloseStartDate.toISOString().split('T')[0]
      : undefined,
    temporaryCloseEndDate: currentData?.temporaryCloseEndDate
      ? currentData.temporaryCloseEndDate.toISOString().split('T')[0]
      : undefined,
    isDeliveryAvailable: currentData?.isDeliveryAvailable ?? true,
    isPickupAvailable: currentData?.isPickupAvailable ?? true,
    deliverySettings: currentData?.deliverySettings || { isAvailable: currentData?.isDeliveryAvailable ?? true },
    pickupSettings: currentData?.pickupSettings || { isAvailable: currentData?.isPickupAvailable ?? true },
    isVisible: currentData?.isVisible ?? true,
  });

  const initialDataRef = useRef<string>('');

  useEffect(() => {
    if (currentData) {
      setHoursMode(currentData.dailyHours ? 'daily' : 'simple');
      const data: OperatingInfoFormData = {
        weekdayHours: currentData.weekdayHours,
        weekendHours: currentData.weekendHours,
        holidayHours: currentData.holidayHours,
        dailyHours: currentData.dailyHours,
        regularClosedDays: currentData.regularClosedDays,
        irregularClosedDays: currentData.irregularClosedDays,
        deliveryFee: currentData.deliveryFee,
        freeDeliveryMinAmount: currentData.freeDeliveryMinAmount,
        isTemporarilyClosed: currentData.isTemporarilyClosed || false,
        temporaryCloseReason: currentData.temporaryCloseReason,
        temporaryCloseStartDate: currentData.temporaryCloseStartDate
          ? currentData.temporaryCloseStartDate.toISOString().split('T')[0]
          : undefined,
        temporaryCloseEndDate: currentData.temporaryCloseEndDate
          ? currentData.temporaryCloseEndDate.toISOString().split('T')[0]
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
  }, [currentData]);

  // 간편 모드 영업시간 변경
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

  // 요일별 영업시간 변경
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

  // 배달 설정 변경
  const handleDeliveryChange = (field: keyof DeliverySettings, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      deliverySettings: {
        ...(prev.deliverySettings || { isAvailable: false }),
        [field]: value,
      },
    }));
  };

  // 포장 설정 변경
  const handlePickupChange = (field: keyof PickupSettings, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      pickupSettings: {
        ...(prev.pickupSettings || { isAvailable: false }),
        [field]: value,
      },
    }));
  };

  // 모드 전환 시 dailyHours 초기화
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

    // 간편 모드이면 dailyHours 제거
    const submitData: OperatingInfoFormData = {
      ...formData,
      dailyHours: hoursMode === 'daily' ? formData.dailyHours : undefined,
      isDeliveryAvailable: formData.deliverySettings?.isAvailable ?? formData.isDeliveryAvailable,
      isPickupAvailable: formData.pickupSettings?.isAvailable ?? formData.isPickupAvailable,
    };

    if (JSON.stringify(formData) === initialDataRef.current) {
      toast.info('변경사항이 없습니다.');
      onClose();
      return;
    }

    try {
      await updateOperatingInfo.mutateAsync({ storeId, data: submitData });
      toast.success('영업정보가 수정되었습니다.');
      onClose();
    } catch {
      toast.error('영업정보 수정에 실패했습니다.');
    }
  };

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
    <div className="flex items-center gap-3 flex-wrap">
      <div className="w-10 text-sm font-medium text-txt-main">{label}</div>
      <label className="flex items-center gap-1.5">
        <input
          type="checkbox"
          checked={hours.isOpen}
          onChange={(e) => onIsOpenChange(e.target.checked)}
          className="w-4 h-4 rounded border-border"
        />
        <span className="text-xs text-txt-muted">영업</span>
      </label>
      {hours.isOpen && (
        <>
          <Input
            type="time"
            value={hours.openTime || ''}
            onChange={(e) => onOpenTimeChange(e.target.value)}
            className="w-28 text-sm"
          />
          <span className="text-txt-muted">~</span>
          <Input
            type="time"
            value={hours.closeTime || ''}
            onChange={(e) => onCloseTimeChange(e.target.value)}
            className="w-28 text-sm"
          />

          <span className="text-xs text-txt-muted ml-2">라스트오더</span>
          <select
            value={hours.lastOrderMinutes ?? 30}
            onChange={(e) => onLastOrderChange(Number(e.target.value))}
            className="h-10 px-3 text-sm bg-bg-card border border-border rounded-lg outline-none focus:ring-1 focus:ring-primary"
          >
            {[10, 20, 30, 40, 50].map((min) => (
              <option key={min} value={min}>
                마감 {min}분 전
              </option>
            ))}
          </select>

          {onBreakStartChange && onBreakEndChange && (
            <>
              <span className="text-xs text-txt-muted ml-2">휴게</span>
              <Input
                type="time"
                value={hours.breakStart || ''}
                onChange={(e) => onBreakStartChange(e.target.value)}
                className="w-28 text-sm"
              />
              <span className="text-txt-muted">~</span>
              <Input
                type="time"
                value={hours.breakEnd || ''}
                onChange={(e) => onBreakEndChange(e.target.value)}
                className="w-28 text-sm"
              />
            </>
          )}
        </>
      )}
    </div>
  );

  // ── 섹션 1: 영업시간 ──
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
          )}
          {renderTimeRow(
            '주말',
            formData.weekendHours,
            (v) => handleSimpleHoursChange('weekendHours', 'isOpen', v),
            (v) => handleSimpleHoursChange('weekendHours', 'openTime', v),
            (v) => handleSimpleHoursChange('weekendHours', 'closeTime', v),
            (v) => handleSimpleHoursChange('weekendHours', 'lastOrderMinutes', v),
          )}
          {renderTimeRow(
            '공휴일',
            formData.holidayHours || { isOpen: false },
            (v) => handleSimpleHoursChange('holidayHours', 'isOpen', v),
            (v) => handleSimpleHoursChange('holidayHours', 'openTime', v),
            (v) => handleSimpleHoursChange('holidayHours', 'closeTime', v),
            (v) => handleSimpleHoursChange('holidayHours', 'lastOrderMinutes', v),
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {WEEK_DAYS.map((day) => {
            const dayHours = (formData.dailyHours || DEFAULT_DAILY_HOURS)[day];
            return (
              <div key={day}>
                {renderTimeRow(
                  WEEK_DAY_SHORT_LABELS[day],
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
        </div>
      )}
    </div>
  );

  // ── 섹션 2: 배달 설정 ──
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
          <div>
            <label className="block text-sm text-txt-muted mb-1">배달 가능 시간</label>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={formData.deliverySettings.availableStartTime || ''}
                onChange={(e) => handleDeliveryChange('availableStartTime', e.target.value)}
                className="w-32"
              />
              <span>~</span>
              <Input
                type="time"
                value={formData.deliverySettings.availableEndTime || ''}
                onChange={(e) => handleDeliveryChange('availableEndTime', e.target.value)}
                className="w-32"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-txt-muted mb-1">최소 주문금액</label>
              <Input
                type="number"
                value={formData.deliverySettings.minOrderAmount ?? ''}
                onChange={(e) =>
                  handleDeliveryChange('minOrderAmount', e.target.value ? Number(e.target.value) : 0)
                }
                placeholder="15000"
              />
            </div>
            <div>
              <label className="block text-sm text-txt-muted mb-1">배달 반경 (km)</label>
              <Input
                type="number"
                value={formData.deliverySettings.deliveryRadius ?? ''}
                onChange={(e) =>
                  handleDeliveryChange('deliveryRadius', e.target.value ? Number(e.target.value) : 0)
                }
                placeholder="3"
                step="0.5"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-txt-muted mb-1">기본 배달비</label>
              <Input
                type="number"
                value={formData.deliveryFee}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, deliveryFee: Number(e.target.value) }))
                }
                placeholder="3000"
              />
            </div>
            <div>
              <label className="block text-sm text-txt-muted mb-1">무료배달 최소금액</label>
              <Input
                type="number"
                value={formData.freeDeliveryMinAmount ?? ''}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    freeDeliveryMinAmount: e.target.value ? Number(e.target.value) : undefined,
                  }))
                }
                placeholder="20000"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── 섹션 3: 포장 설정 ──
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
          <div>
            <label className="block text-sm text-txt-muted mb-1">포장 가능 시간</label>
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={formData.pickupSettings.availableStartTime || ''}
                onChange={(e) => handlePickupChange('availableStartTime', e.target.value)}
                className="w-32"
              />
              <span>~</span>
              <Input
                type="time"
                value={formData.pickupSettings.availableEndTime || ''}
                onChange={(e) => handlePickupChange('availableEndTime', e.target.value)}
                className="w-32"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-txt-muted mb-1">최소 주문금액</label>
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
        </div>
      )}
    </div>
  );

  // ── 섹션 4: 임시 휴업 ──
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
        <div className="space-y-3 pl-1">
          <div>
            <label className="block text-sm text-txt-muted mb-1">휴업 사유</label>
            <Input
              value={formData.temporaryCloseReason || ''}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, temporaryCloseReason: e.target.value }))
              }
              placeholder="휴업 사유를 입력하세요"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-txt-muted mb-1">시작일</label>
              <Input
                type="date"
                value={formData.temporaryCloseStartDate || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, temporaryCloseStartDate: e.target.value || undefined }))
                }
              />
            </div>
            <div>
              <label className="block text-sm text-txt-muted mb-1">종료일</label>
              <Input
                type="date"
                value={formData.temporaryCloseEndDate || ''}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, temporaryCloseEndDate: e.target.value || undefined }))
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ── 섹션 0: 매장 노출 ──
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

  const accordionItems: AccordionItemData[] = [
    { id: 'visibility', title: '매장 노출', content: visibilityContent },
    { id: 'hours', title: '영업시간', content: hoursContent },
    { id: 'delivery', title: '배달 설정', content: deliveryContent },
    { id: 'pickup', title: '포장 설정', content: pickupContent },
    { id: 'closure', title: '임시 휴업', content: closureContent },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="영업정보 수정" size="lg">
      <form onSubmit={handleSubmit}>
        <Accordion
          items={accordionItems}
          defaultOpenId="hours"
          allowMultiple
          className="!p-0"
        />

        <div className="flex justify-end gap-3 pt-4 border-t border-border mt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            취소
          </Button>
          <Button type="submit" disabled={updateOperatingInfo.isPending}>
            {updateOperatingInfo.isPending ? <Spinner size="sm" /> : '저장'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
