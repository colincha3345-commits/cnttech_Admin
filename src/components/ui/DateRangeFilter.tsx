import { useState } from 'react';
import { clsx } from 'clsx';
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfMonth,
  endOfMonth,
  subMonths,
  format,
} from 'date-fns';
import type { DashboardDateRange, DateRangePreset } from '@/types';
import { DATE_RANGE_PRESET_LABELS } from '@/types';

interface DateRangeFilterProps {
  value: DashboardDateRange;
  onChange: (range: DashboardDateRange) => void;
}

const PRESETS: DateRangePreset[] = ['yesterday', 'today', 'last7days', 'lastMonth', 'custom'];

/** 프리셋에 따른 from/to 자동 계산 */
export function getDateRangeFromPreset(preset: DateRangePreset): { from: Date; to: Date } {
  const now = new Date();
  switch (preset) {
    case 'yesterday':
      return { from: startOfDay(subDays(now, 1)), to: endOfDay(subDays(now, 1)) };
    case 'today':
      return { from: startOfDay(now), to: endOfDay(now) };
    case 'last7days':
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
    case 'lastMonth': {
      const lastMonth = subMonths(now, 1);
      return { from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) };
    }
    case 'custom':
      return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
  }
}

export function DateRangeFilter({ value, onChange }: DateRangeFilterProps) {
  const [showCustom, setShowCustom] = useState(value.preset === 'custom');

  const handlePresetClick = (preset: DateRangePreset) => {
    if (preset === 'custom') {
      setShowCustom(true);
      onChange({ preset: 'custom', from: value.from, to: value.to });
      return;
    }
    setShowCustom(false);
    const { from, to } = getDateRangeFromPreset(preset);
    onChange({ preset, from, to });
  };

  const handleCustomDateChange = (field: 'from' | 'to', dateStr: string) => {
    if (!dateStr) return;
    const date = field === 'from' ? startOfDay(new Date(dateStr)) : endOfDay(new Date(dateStr));
    onChange({ ...value, preset: 'custom', [field]: date });
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {PRESETS.map((preset) => (
        <button
          key={preset}
          onClick={() => handlePresetClick(preset)}
          className={clsx(
            'px-3 py-1.5 text-sm rounded-lg border transition-colors',
            value.preset === preset
              ? 'bg-primary text-white border-primary'
              : 'bg-bg-main text-txt-muted border-border hover:bg-bg-hover'
          )}
        >
          {DATE_RANGE_PRESET_LABELS[preset]}
        </button>
      ))}

      {showCustom && (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={format(value.from, 'yyyy-MM-dd')}
            onChange={(e) => handleCustomDateChange('from', e.target.value)}
            className="px-2 py-1.5 text-sm border border-border rounded-lg bg-bg-main"
          />
          <span className="text-txt-muted text-sm">~</span>
          <input
            type="date"
            value={format(value.to, 'yyyy-MM-dd')}
            onChange={(e) => handleCustomDateChange('to', e.target.value)}
            className="px-2 py-1.5 text-sm border border-border rounded-lg bg-bg-main"
          />
        </div>
      )}
    </div>
  );
}
