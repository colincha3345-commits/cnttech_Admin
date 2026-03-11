/**
 * 할인 추가/수정 모달
 */
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { CloseOutlined, CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';

import { Button } from './Button';
import { Input } from './Input';
import { Label } from './Label';
import { Switch } from './Switch';
import type {
  DiscountFormData,
  DiscountPeriodType,
  DiscountTargetType,
  DayOfWeek,
  RoundingUnit,
  RoundingType,
} from '@/types/discount';

interface DiscountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: DiscountFormData) => void;
  initialData?: DiscountFormData;
  isEditing?: boolean;
}

const DAY_LABELS_MAP: Record<DayOfWeek, string> = {
  0: '일',
  1: '월',
  2: '화',
  3: '수',
  4: '목',
  5: '금',
  6: '토',
};

const DAYS_OF_WEEK: DayOfWeek[] = [1, 2, 3, 4, 5, 6, 0]; // 월~토, 일

export function DiscountModal({
  isOpen,
  onClose,
  onSave,
  initialData,
  isEditing = false,
}: DiscountModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const [formData, setFormData] = useState<DiscountFormData>(
    initialData || {
      name: '',
      discountType: 'company',
      method: 'percentage',
      value: 0,
      periodType: 'period',
      target: { type: 'all' },
      applyToAll: true,
      storeIds: [],
      channel: 'all',
      orderType: 'all',
      isActive: true,
      headquartersRatio: 0,
      franchiseRatio: 100,
    }
  );

  // 초기 데이터 변경 시 폼 리셋
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        name: '',
        discountType: 'company',
        method: 'percentage',
        value: 0,
        periodType: 'period',
        target: { type: 'all' },
        applyToAll: true,
        storeIds: [],
        channel: 'all',
        headquartersRatio: 0,
        franchiseRatio: 100,
        orderType: 'all',
        isActive: true,
      });
    }
  }, [initialData, isOpen]);

  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 스크롤 방지
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = () => {
    onSave(formData);
  };

  const updateFormData = (updates: Partial<DiscountFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
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

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 animate-fadeIn"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={dialogRef}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-bg-card rounded-xl shadow-lg animate-scaleIn"
        tabIndex={-1}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-bg-card z-10 flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="text-lg font-semibold text-txt-main">
            {isEditing ? '할인 수정' : '할인 추가'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-txt-muted hover:text-txt-main rounded-md transition-colors"
          >
            <CloseOutlined style={{ fontSize: 16 }} />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-6">
          {/* 할인 유형 (고정: 자사할인) */}
          <div>
            <Label>할인 유형</Label>
            <div className="mt-2 px-4 py-3 bg-bg-hover rounded-lg border border-border">
              <span className="text-sm text-txt-main">자사할인</span>
            </div>
          </div>

          {/* 할인명 */}
          <div>
            <Label required>할인명</Label>
            <Input
              className="mt-2"
              placeholder="할인명을 입력하세요"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
            />
          </div>

          {/* 할인 방식 */}
          <div>
            <Label required>할인 방식</Label>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => updateFormData({ method: 'percentage' })}
                className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                  formData.method === 'percentage'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-bg-hover text-txt-muted border-border hover:border-primary'
                }`}
              >
                % 할인
              </button>
              <button
                type="button"
                onClick={() => updateFormData({ method: 'fixed' })}
                className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                  formData.method === 'fixed'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-bg-hover text-txt-muted border-border hover:border-primary'
                }`}
              >
                금액 할인
              </button>
            </div>
          </div>

          {/* 할인값 */}
          <div>
            <Label required>할인값</Label>
            <div className="mt-2 relative">
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

          {/* 할인 금액 단위설정 */}
          <div className="p-4 bg-bg-hover rounded-lg border border-border">
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
                className="w-5 h-5 rounded border-border text-primary focus:ring-primary"
              />
              <span className="text-sm font-medium text-txt-main">할인 금액 단위설정</span>
            </label>

            {formData.rounding?.enabled && (
              <div className="mt-4 flex items-center gap-3">
                {/* 단위 선택 */}
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
                  className="px-4 py-2 bg-bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                >
                  <option value={1}>1</option>
                  <option value={10}>10</option>
                  <option value={100}>100</option>
                </select>

                <span className="text-sm text-txt-muted">단위에서</span>

                {/* 반올림 방식 선택 */}
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
                  className="px-4 py-2 bg-bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                >
                  <option value="round">반올림</option>
                  <option value="ceil">올림</option>
                  <option value="floor">내림</option>
                </select>
              </div>
            )}
          </div>

          {/* 기간 설정 */}
          <div>
            <Label required>기간 설정</Label>
            <div className="mt-2 flex gap-2">
              {(['period', 'schedule'] as DiscountPeriodType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateFormData({ periodType: type })}
                  className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                    formData.periodType === type
                      ? 'bg-primary text-white border-primary'
                      : 'bg-bg-hover text-txt-muted border-border hover:border-primary'
                  }`}
                >
                  {type === 'period' ? '기간' : '특정 시간/요일'}
                </button>
              ))}
            </div>

            {/* 기간 선택 UI */}
            {formData.periodType === 'period' && (
              <div className="mt-4 p-4 bg-bg-hover rounded-lg space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-txt-muted mb-2">시작일</label>
                    <div className="relative">
                      <CalendarOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
                      <input
                        type="date"
                        value={formData.startDate || ''}
                        onChange={(e) => updateFormData({ startDate: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-txt-muted mb-2">종료일</label>
                    <div className="relative">
                      <CalendarOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
                      <input
                        type="date"
                        value={formData.endDate || ''}
                        onChange={(e) => updateFormData({ endDate: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 특정 시간/요일 UI */}
            {formData.periodType === 'schedule' && (
              <div className="mt-4 p-4 bg-bg-hover rounded-lg space-y-4">
                {/* 요일 선택 */}
                <div>
                  <label className="block text-sm text-txt-muted mb-2">적용 요일</label>
                  <div className="flex gap-2">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`w-10 h-10 rounded-full text-sm font-medium transition-all ${
                          formData.schedule?.days?.includes(day)
                            ? 'bg-primary text-white'
                            : 'bg-bg-card border border-border text-txt-muted hover:border-primary'
                        }`}
                      >
                        {DAY_LABELS_MAP[day]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 시간대 선택 */}
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
                        className="w-full pl-10 pr-4 py-2 bg-bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
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
                                  startTime: formData.schedule?.timeSlots?.[0]?.startTime || '00:00',
                                  endTime: e.target.value,
                                },
                              ],
                            },
                          })
                        }
                        className="w-full pl-10 pr-4 py-2 bg-bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* 기간 제한 (선택) */}
                <div>
                  <label className="block text-sm text-txt-muted mb-2">기간 제한 (선택)</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="relative">
                      <CalendarOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
                      <input
                        type="date"
                        value={formData.schedule?.startDate || ''}
                        onChange={(e) =>
                          updateFormData({
                            schedule: {
                              ...formData.schedule,
                              days: formData.schedule?.days || [],
                              timeSlots: formData.schedule?.timeSlots || [],
                              startDate: e.target.value,
                            },
                          })
                        }
                        placeholder="시작일"
                        className="w-full pl-10 pr-4 py-2 bg-bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="relative">
                      <CalendarOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-muted" />
                      <input
                        type="date"
                        value={formData.schedule?.endDate || ''}
                        onChange={(e) =>
                          updateFormData({
                            schedule: {
                              ...formData.schedule,
                              days: formData.schedule?.days || [],
                              timeSlots: formData.schedule?.timeSlots || [],
                              endDate: e.target.value,
                            },
                          })
                        }
                        placeholder="종료일"
                        className="w-full pl-10 pr-4 py-2 bg-bg-card border border-border rounded-lg text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 적용 상품 */}
          <div>
            <Label required>적용 상품</Label>
            <div className="mt-2 flex gap-2">
              {(['all', 'category', 'product'] as DiscountTargetType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => updateFormData({ target: { type } })}
                  className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                    formData.target.type === type
                      ? 'bg-primary text-white border-primary'
                      : 'bg-bg-hover text-txt-muted border-border hover:border-primary'
                  }`}
                >
                  {type === 'all' ? '전체 상품' : type === 'category' ? '특정 카테고리' : '특정 상품'}
                </button>
              ))}
            </div>

            {/* TODO: 카테고리/상품 선택 UI */}
            {formData.target.type === 'category' && (
              <div className="mt-4 p-4 bg-bg-hover rounded-lg">
                <p className="text-sm text-txt-muted">카테고리 선택 기능 (추후 구현)</p>
              </div>
            )}
            {formData.target.type === 'product' && (
              <div className="mt-4 p-4 bg-bg-hover rounded-lg">
                <p className="text-sm text-txt-muted">상품 선택 기능 (추후 구현)</p>
              </div>
            )}
          </div>

          {/* 최소 주문 금액 */}
          <div>
            <Label>최소 주문 금액</Label>
            <div className="mt-2 relative">
              <Input
                type="number"
                placeholder="10000"
                value={formData.minOrderAmount || ''}
                onChange={(e) => updateFormData({ minOrderAmount: Number(e.target.value) || undefined })}
                className="pr-12"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">
                원
              </span>
            </div>
          </div>

          {/* 최대 할인 금액 (% 할인 시) */}
          {formData.method === 'percentage' && (
            <div>
              <Label>최대 할인 금액</Label>
              <div className="mt-2 relative">
                <Input
                  type="number"
                  placeholder="5000"
                  value={formData.maxDiscountAmount || ''}
                  onChange={(e) => updateFormData({ maxDiscountAmount: Number(e.target.value) || undefined })}
                  className="pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-txt-muted text-sm">
                  원
                </span>
              </div>
            </div>
          )}

          {/* 활성 상태 */}
          <div className="flex items-center justify-between py-2">
            <div>
              <Label>활성 상태</Label>
              <p className="text-sm text-txt-muted">할인 적용 여부</p>
            </div>
            <Switch
              checked={formData.isActive}
              onCheckedChange={(checked) => updateFormData({ isActive: checked })}
            />
          </div>
        </div>

        {/* 푸터 */}
        <div className="sticky bottom-0 bg-bg-card z-10 flex gap-3 justify-end px-6 py-4 border-t border-border">
          <Button variant="secondary" onClick={onClose}>
            취소
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            {isEditing ? '수정' : '추가'}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
