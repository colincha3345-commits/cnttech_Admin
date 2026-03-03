/**
 * 휴무일 편집 모달
 * 정기휴무와 비정기휴무를 한 화면에서 관리
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';

import { Modal, Button, Input, Spinner } from '@/components/ui';
import { useUpdateOperatingInfo, useToast } from '@/hooks';
import type {
  OperatingInfo,
  OperatingInfoFormData,
  RegularClosedDay,
  RegularClosedType,
  IrregularClosedDay,
  WeekDay,
} from '@/types/store';
import {
  WEEK_DAYS,
  WEEK_DAY_LABELS,
  REGULAR_CLOSED_TYPE_LABELS,
} from '@/types/store';

// ── Props ──
interface ClosedDayEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  currentRegularClosedDays?: RegularClosedDay[];
  currentIrregularClosedDays?: IrregularClosedDay[];
  currentOperatingInfo?: OperatingInfo; // 전체 영업정보 (나머지 필드 유지용)
}

// ── n번째 주 라벨 ──
const NTH_WEEK_OPTIONS: { value: number; label: string }[] = [
  { value: 1, label: '첫째 주' },
  { value: 2, label: '둘째 주' },
  { value: 3, label: '셋째 주' },
  { value: 4, label: '넷째 주' },
  { value: 5, label: '마지막 주' },
];

// ── 기본 정기휴무 행 ──
const createDefaultRegular = (): RegularClosedDay => ({
  type: 'weekly',
  dayOfWeek: 'monday',
  description: '',
});

// ── 기본 비정기휴무 행 ──
const createDefaultIrregular = (): IrregularClosedDay => ({
  date: '',
  reason: '',
});

export const ClosedDayEditModal: React.FC<ClosedDayEditModalProps> = ({
  isOpen,
  onClose,
  storeId,
  currentRegularClosedDays,
  currentIrregularClosedDays,
  currentOperatingInfo,
}) => {
  const toast = useToast();
  const updateOperatingInfo = useUpdateOperatingInfo();

  // 정기휴무 목록
  const [regularDays, setRegularDays] = useState<RegularClosedDay[]>([]);
  // 비정기휴무 목록
  const [irregularDays, setIrregularDays] = useState<IrregularClosedDay[]>([]);
  const initialDataRef = useRef<string>('');

  // 모달 열릴 때 현재 데이터 동기화
  useEffect(() => {
    if (isOpen) {
      const regular = currentRegularClosedDays?.length
        ? currentRegularClosedDays.map((d) => ({ ...d }))
        : [];
      const irregular = currentIrregularClosedDays?.length
        ? currentIrregularClosedDays.map((d) => ({ ...d }))
        : [];
      setRegularDays(regular);
      setIrregularDays(irregular);
      initialDataRef.current = JSON.stringify({ regular, irregular });
    }
  }, [isOpen, currentRegularClosedDays, currentIrregularClosedDays]);

  // ── 정기휴무 핸들러 ──
  const handleAddRegular = useCallback(() => {
    setRegularDays((prev) => [...prev, createDefaultRegular()]);
  }, []);

  const handleRemoveRegular = useCallback((index: number) => {
    setRegularDays((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleRegularChange = useCallback(
    (index: number, patch: Partial<RegularClosedDay>) => {
      setRegularDays((prev) =>
        prev.map((item, i) => {
          if (i !== index) return item;

          const updated = { ...item, ...patch };

          // type 변경 시 관련 필드 초기화
          if (patch.type && patch.type !== item.type) {
            if (patch.type === 'weekly') {
              updated.dayOfWeek = updated.dayOfWeek || 'monday';
              updated.nthWeek = undefined;
              updated.dates = undefined;
            } else if (patch.type === 'monthly_nth') {
              updated.dayOfWeek = updated.dayOfWeek || 'monday';
              updated.nthWeek = updated.nthWeek || 1;
              updated.dates = undefined;
            } else if (patch.type === 'monthly_date') {
              updated.dayOfWeek = undefined;
              updated.nthWeek = undefined;
              updated.dates = updated.dates || [];
            }
          }

          return updated;
        })
      );
    },
    []
  );

  // ── 비정기휴무 핸들러 ──
  const handleAddIrregular = useCallback(() => {
    setIrregularDays((prev) => [...prev, createDefaultIrregular()]);
  }, []);

  const handleRemoveIrregular = useCallback((index: number) => {
    setIrregularDays((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleIrregularChange = useCallback(
    (index: number, patch: Partial<IrregularClosedDay>) => {
      setIrregularDays((prev) =>
        prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
      );
    },
    []
  );

  // ── dates 문자열 파싱 (쉼표 구분 1~31) ──
  const parseDatesString = (value: string): number[] => {
    return value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s !== '')
      .map(Number)
      .filter((n) => !isNaN(n) && n >= 1 && n <= 31);
  };

  // ── dates 배열 → 표시 문자열 ──
  const formatDates = (dates?: number[]): string => {
    if (!dates || dates.length === 0) return '';
    return dates.join(', ');
  };

  // ── 저장 ──
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (JSON.stringify({ regular: regularDays, irregular: irregularDays }) === initialDataRef.current) {
      toast.info('변경사항이 없습니다.');
      onClose();
      return;
    }

    try {
      // currentOperatingInfo에서 기존 값을 유지하면서 휴무일만 교체
      const submitData: OperatingInfoFormData = {
        weekdayHours: currentOperatingInfo?.weekdayHours || { isOpen: true, openTime: '09:00', closeTime: '22:00' },
        weekendHours: currentOperatingInfo?.weekendHours || { isOpen: true, openTime: '09:00', closeTime: '22:00' },
        holidayHours: currentOperatingInfo?.holidayHours,
        dailyHours: currentOperatingInfo?.dailyHours,
        deliveryFee: currentOperatingInfo?.deliveryFee ?? 0,
        freeDeliveryMinAmount: currentOperatingInfo?.freeDeliveryMinAmount,
        isTemporarilyClosed: currentOperatingInfo?.isTemporarilyClosed ?? false,
        temporaryCloseReason: currentOperatingInfo?.temporaryCloseReason,
        temporaryCloseStartDate: currentOperatingInfo?.temporaryCloseStartDate
          ? currentOperatingInfo.temporaryCloseStartDate.toISOString().split('T')[0]
          : undefined,
        temporaryCloseEndDate: currentOperatingInfo?.temporaryCloseEndDate
          ? currentOperatingInfo.temporaryCloseEndDate.toISOString().split('T')[0]
          : undefined,
        isDeliveryAvailable: currentOperatingInfo?.isDeliveryAvailable ?? true,
        isPickupAvailable: currentOperatingInfo?.isPickupAvailable ?? true,
        deliverySettings: currentOperatingInfo?.deliverySettings,
        pickupSettings: currentOperatingInfo?.pickupSettings,
        // 휴무일만 현재 편집 값으로 교체
        regularClosedDays: regularDays.length > 0 ? regularDays : undefined,
        irregularClosedDays: irregularDays.length > 0 ? irregularDays : undefined,
      };

      await updateOperatingInfo.mutateAsync({ storeId, data: submitData });
      toast.success('휴무일 설정이 수정되었습니다.');
      onClose();
    } catch {
      toast.error('휴무일 설정 수정에 실패했습니다.');
    }
  };

  // ── 정기휴무 type별 상세 입력 렌더링 ──
  const renderRegularDetail = (item: RegularClosedDay, index: number) => {
    switch (item.type) {
      case 'weekly':
        return (
          <select
            value={item.dayOfWeek || 'monday'}
            onChange={(e) =>
              handleRegularChange(index, { dayOfWeek: e.target.value as WeekDay })
            }
            className="px-3 py-2 text-sm border border-border rounded-lg bg-bg-card text-txt-main focus:outline-none focus:ring-1 focus:ring-primary"
          >
            {WEEK_DAYS.map((day) => (
              <option key={day} value={day}>
                {WEEK_DAY_LABELS[day]}
              </option>
            ))}
          </select>
        );

      case 'monthly_nth':
        return (
          <div className="flex items-center gap-2">
            <select
              value={item.nthWeek || 1}
              onChange={(e) =>
                handleRegularChange(index, { nthWeek: Number(e.target.value) })
              }
              className="px-3 py-2 text-sm border border-border rounded-lg bg-bg-card text-txt-main focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {NTH_WEEK_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <select
              value={item.dayOfWeek || 'monday'}
              onChange={(e) =>
                handleRegularChange(index, { dayOfWeek: e.target.value as WeekDay })
              }
              className="px-3 py-2 text-sm border border-border rounded-lg bg-bg-card text-txt-main focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {WEEK_DAYS.map((day) => (
                <option key={day} value={day}>
                  {WEEK_DAY_LABELS[day]}
                </option>
              ))}
            </select>
          </div>
        );

      case 'monthly_date':
        return (
          <Input
            value={formatDates(item.dates)}
            onChange={(e) =>
              handleRegularChange(index, { dates: parseDatesString(e.target.value) })
            }
            placeholder="1, 15, 31"
            className="w-40 text-sm"
          />
        );

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="휴무일 설정" size="lg">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── 정기 휴무 섹션 ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-txt-main">정기 휴무</h3>
            <button
              type="button"
              onClick={handleAddRegular}
              className="flex items-center gap-1 px-2 py-1 text-xs text-primary hover:bg-bg-hover rounded-md transition-colors"
            >
              <PlusOutlined />
              <span>추가</span>
            </button>
          </div>

          {regularDays.length === 0 ? (
            <p className="text-sm text-txt-muted py-3 text-center border border-dashed border-border rounded-lg">
              등록된 정기 휴무가 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {regularDays.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 flex-wrap p-3 border border-border rounded-lg bg-bg-card"
                >
                  {/* type 셀렉트 */}
                  <select
                    value={item.type}
                    onChange={(e) =>
                      handleRegularChange(index, {
                        type: e.target.value as RegularClosedType,
                      })
                    }
                    className="px-3 py-2 text-sm border border-border rounded-lg bg-bg-card text-txt-main focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {(
                      Object.entries(REGULAR_CLOSED_TYPE_LABELS) as [
                        RegularClosedType,
                        string,
                      ][]
                    ).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>

                  {/* type별 상세 입력 */}
                  {renderRegularDetail(item, index)}

                  {/* 설명 */}
                  <Input
                    value={item.description || ''}
                    onChange={(e) =>
                      handleRegularChange(index, { description: e.target.value })
                    }
                    placeholder="설명 (선택)"
                    className="flex-1 min-w-[120px] text-sm"
                  />

                  {/* 삭제 버튼 */}
                  <button
                    type="button"
                    onClick={() => handleRemoveRegular(index)}
                    className="p-1.5 text-txt-muted hover:text-critical rounded-md transition-colors"
                    aria-label="삭제"
                  >
                    <DeleteOutlined />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 비정기 휴무 섹션 ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-txt-main">비정기 휴무</h3>
            <button
              type="button"
              onClick={handleAddIrregular}
              className="flex items-center gap-1 px-2 py-1 text-xs text-primary hover:bg-bg-hover rounded-md transition-colors"
            >
              <PlusOutlined />
              <span>추가</span>
            </button>
          </div>

          {irregularDays.length === 0 ? (
            <p className="text-sm text-txt-muted py-3 text-center border border-dashed border-border rounded-lg">
              등록된 비정기 휴무가 없습니다.
            </p>
          ) : (
            <div className="space-y-3">
              {irregularDays.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 flex-wrap p-3 border border-border rounded-lg bg-bg-card"
                >
                  {/* 날짜 */}
                  <Input
                    type="date"
                    value={item.date}
                    onChange={(e) =>
                      handleIrregularChange(index, { date: e.target.value })
                    }
                    className="w-40 text-sm"
                  />

                  {/* 사유 */}
                  <Input
                    value={item.reason || ''}
                    onChange={(e) =>
                      handleIrregularChange(index, { reason: e.target.value })
                    }
                    placeholder="휴무 사유 (선택)"
                    className="flex-1 min-w-[150px] text-sm"
                  />

                  {/* 삭제 버튼 */}
                  <button
                    type="button"
                    onClick={() => handleRemoveIrregular(index)}
                    className="p-1.5 text-txt-muted hover:text-critical rounded-md transition-colors"
                    aria-label="삭제"
                  >
                    <DeleteOutlined />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── 하단 버튼 ── */}
        <div className="flex justify-end gap-3 pt-4 border-t border-border">
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
