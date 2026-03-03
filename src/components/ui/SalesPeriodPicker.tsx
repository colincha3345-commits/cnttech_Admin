/**
 * 판매기간 선택 컴포넌트
 * 시작일시 ~ 종료일시 입력
 */

import React, { useState } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';

export interface SalesPeriod {
  startDate?: Date;
  endDate?: Date;
}

export interface SalesPeriodPickerProps {
  value?: SalesPeriod;
  onChange: (period: SalesPeriod) => void;
  disabled?: boolean;
  label?: string;
  maxPeriodDays?: number; // 최대 판매기간 (일)
  allowPastDate?: boolean; // 과거 날짜 허용 여부
}

export const SalesPeriodPicker: React.FC<SalesPeriodPickerProps> = ({
  value = {},
  onChange,
  disabled = false,
  label = '판매기간',
  maxPeriodDays = 365, // 기본 1년
  allowPastDate = false, // 기본적으로 과거 날짜 불허
}) => {
  const [startDateValue, setStartDateValue] = useState<string>(
    value.startDate ? format(value.startDate, 'yyyy-MM-dd') : ''
  );
  const [startTimeValue, setStartTimeValue] = useState<string>(
    value.startDate ? format(value.startDate, 'HH:mm') : '00:00'
  );
  const [endDateValue, setEndDateValue] = useState<string>(
    value.endDate ? format(value.endDate, 'yyyy-MM-dd') : ''
  );
  const [endTimeValue, setEndTimeValue] = useState<string>(
    value.endDate ? format(value.endDate, 'HH:mm') : '23:59'
  );
  const [validationError, setValidationError] = useState<string | null>(null);

  // 현재 날짜 (과거 날짜 방지용)
  const today = format(new Date(), 'yyyy-MM-dd');

  // 유효성 검사 함수
  const validatePeriod = (start?: Date, end?: Date): string | null => {
    if (!start || !end) return null;

    // 1. 과거 날짜 체크
    if (!allowPastDate) {
      const now = new Date();
      if (start < now) {
        return '시작일시는 현재 시간 이후여야 합니다';
      }
    }

    // 2. 종료일시 > 시작일시
    if (end <= start) {
      return '종료일시는 시작일시 이후여야 합니다';
    }

    // 3. 최대 판매기간 체크
    const diffMs = end.getTime() - start.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    if (diffDays > maxPeriodDays) {
      return `판매기간은 최대 ${maxPeriodDays}일까지 가능합니다`;
    }

    return null;
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    setStartDateValue(dateStr);

    if (dateStr) {
      const startDate = new Date(`${dateStr}T${startTimeValue}:00`);
      const error = validatePeriod(startDate, value.endDate);
      setValidationError(error);
      onChange({
        startDate,
        endDate: value.endDate,
      });
    } else {
      setValidationError(null);
      onChange({
        startDate: undefined,
        endDate: value.endDate,
      });
    }
  };

  const handleStartTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeStr = e.target.value;
    setStartTimeValue(timeStr);

    if (startDateValue) {
      const startDate = new Date(`${startDateValue}T${timeStr}:00`);
      const error = validatePeriod(startDate, value.endDate);
      setValidationError(error);
      onChange({
        startDate,
        endDate: value.endDate,
      });
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    setEndDateValue(dateStr);

    if (dateStr) {
      const endDate = new Date(`${dateStr}T${endTimeValue}:00`);
      const error = validatePeriod(value.startDate, endDate);
      setValidationError(error);
      onChange({
        startDate: value.startDate,
        endDate,
      });
    } else {
      setValidationError(null);
      onChange({
        startDate: value.startDate,
        endDate: undefined,
      });
    }
  };

  const handleEndTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timeStr = e.target.value;
    setEndTimeValue(timeStr);

    if (endDateValue) {
      const endDate = new Date(`${endDateValue}T${timeStr}:00`);
      const error = validatePeriod(value.startDate, endDate);
      setValidationError(error);
      onChange({
        startDate: value.startDate,
        endDate,
      });
    }
  };

  const dateInputClassName = "w-full pl-8 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm focus:bg-white focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all";
  const timeInputClassName = "w-full pl-8 pr-2 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700 text-sm focus:bg-white focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all";

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm font-medium text-txt-main">{label}</label>}

      {/* 한 라인 레이아웃: 시작일 + 시작시간 ~ 종료일 + 종료시간 */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* 시작 날짜 */}
        <div className="w-[130px] relative shrink-0">
          <CalendarOutlined className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
          <input
            type="date"
            value={startDateValue}
            onChange={handleStartDateChange}
            disabled={disabled}
            min={allowPastDate ? undefined : today}
            className={dateInputClassName}
          />
        </div>
        {/* 시작 시간 */}
        <div className="w-[125px] relative shrink-0">
          <ClockCircleOutlined className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
          <input
            type="time"
            value={startTimeValue}
            onChange={handleStartTimeChange}
            disabled={disabled}
            className={timeInputClassName}
          />
        </div>

        {/* 구분자 */}
        <span className="text-gray-400 font-medium px-1">~</span>

        {/* 종료 날짜 */}
        <div className="w-[130px] relative shrink-0">
          <CalendarOutlined className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
          <input
            type="date"
            value={endDateValue}
            onChange={handleEndDateChange}
            disabled={disabled}
            min={startDateValue}
            className={dateInputClassName}
          />
        </div>
        {/* 종료 시간 */}
        <div className="w-[125px] relative shrink-0">
          <ClockCircleOutlined className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none text-xs" />
          <input
            type="time"
            value={endTimeValue}
            onChange={handleEndTimeChange}
            disabled={disabled}
            className={timeInputClassName}
          />
        </div>
      </div>

      {/* 유효성 검사 메시지 */}
      {validationError && (
        <div className="flex items-start gap-2 p-3 bg-critical/10 border border-critical/30 rounded-lg">
          <span className="text-critical">⚠️</span>
          <p className="text-xs text-critical font-medium">{validationError}</p>
        </div>
      )}

      {/* 기간 요약 */}
      {value.startDate && value.endDate && !validationError && (
        <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-xs text-gray-700">
            <span className="font-semibold">판매기간:</span>{' '}
            {format(value.startDate, 'yyyy년 MM월 dd일 HH:mm', { locale: ko })} ~{' '}
            {format(value.endDate, 'yyyy년 MM월 dd일 HH:mm', { locale: ko })}
          </p>
        </div>
      )}
    </div>
  );
};
