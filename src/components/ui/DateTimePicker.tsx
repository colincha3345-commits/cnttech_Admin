import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Label } from './Label';

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  label?: string;
  disabled?: boolean;
  minDate?: Date;
}

/**
 * 날짜/시간 선택 컴포넌트
 * 게시 예약 등에 사용
 */
export const DateTimePicker: React.FC<DateTimePickerProps> = ({
  value,
  onChange,
  label,
  disabled = false,
  minDate = new Date(),
}) => {
  // date-fns로 로컬 타임존 기반 포맷팅 (타임존 안전)
  const formatDateStr = (date: Date): string => format(date, 'yyyy-MM-dd');
  const formatTimeStr = (date: Date): string => format(date, 'HH:mm');

  const [dateValue, setDateValue] = useState<string>(value ? formatDateStr(value) : '');
  const [timeValue, setTimeValue] = useState<string>(value ? formatTimeStr(value) : '09:00');

  const handleDateChange = (newDate: string) => {
    setDateValue(newDate);

    if (newDate && timeValue) {
      const combined = new Date(`${newDate}T${timeValue}`);
      onChange(combined);
    } else {
      onChange(undefined);
    }
  };

  const handleTimeChange = (newTime: string) => {
    setTimeValue(newTime);

    if (dateValue && newTime) {
      const combined = new Date(`${dateValue}T${newTime}`);
      onChange(combined);
    } else {
      onChange(undefined);
    }
  };

  const handleClear = () => {
    setDateValue('');
    setTimeValue('09:00');
    onChange(undefined);
  };

  const minDateStr = formatDateStr(minDate);

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}

      <div className="grid grid-cols-2 gap-3">
        {/* 날짜 선택 */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <CalendarOutlined className="text-gray-400" />
          </div>
          <input
            type="date"
            value={dateValue}
            onChange={(e) => handleDateChange(e.target.value)}
            min={minDateStr}
            disabled={disabled}
            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-sm focus:bg-white focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
            placeholder="날짜 선택"
          />
        </div>

        {/* 시간 선택 */}
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <ClockCircleOutlined className="text-gray-400" />
          </div>
          <input
            type="time"
            value={timeValue}
            onChange={(e) => handleTimeChange(e.target.value)}
            disabled={disabled || !dateValue}
            className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-sm focus:bg-white focus:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
            placeholder="시간 선택"
          />
        </div>
      </div>

      {/* 선택된 값 표시 & 초기화 */}
      {value && (
        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl">
          <p className="text-sm text-gray-700 font-medium">
            {value.toLocaleString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
            에 자동 판매 시작
          </p>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
            >
              초기화
            </button>
          )}
        </div>
      )}

      {/* 안내 메시지 */}
      {!value && (
        <p className="text-xs text-txt-muted">
          예약 시간을 설정하면 해당 시간에 자동으로 판매가 시작됩니다
        </p>
      )}
    </div>
  );
};
