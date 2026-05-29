import React, { useState, useRef, useEffect, useCallback } from 'react';
import { registerRenderer } from 'amis';
import type { FormControlProps } from 'amis';
import { getComponentI18n, getComponentLanguage } from '../../utils/i18n-config';

/**
 * DateRangePicker — Custom Amis form control for date range selection.
 *
 * Renders as a single unified input showing "start ~ end" range.
 * Clicking opens a date range picker popover for selecting both start and end.
 *
 * Schema usage:
 * {
 *   "type": "date-range-picker",
 *   "startName": "regStartTime",
 *   "endName": "regEndTime",
 *   "label": "Registration Period",
 *   "format": "YYYY-MM-DD HH:mm:ss",
 *   "required": true
 * }
 */

interface DateRangePickerSchema {
  type: 'date-range-picker';
  name?: string;
  startName?: string;
  endName?: string;
  label?: string;
  startLabel?: string;
  endLabel?: string;
  format?: string;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

interface DateRangePickerProps extends FormControlProps, DateRangePickerSchema {}

function parseDateValue(value: string | undefined, _format: string): Date | null {
  if (!value) return null;
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/);
  if (match) {
    return new Date(
      parseInt(match[1]),
      parseInt(match[2]) - 1,
      parseInt(match[3]),
      parseInt(match[4]),
      parseInt(match[5]),
      parseInt(match[6])
    );
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(date: Date, _format: string): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isBeforeOrSameDay(a: Date, b: Date): boolean {
  const startB = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return a.getTime() <= startB;
}

function isAfterOrSameDay(a: Date, b: Date): boolean {
  const endB = new Date(b.getFullYear(), b.getMonth(), b.getDate(), 23, 59, 59).getTime();
  return a.getTime() >= endB;
}

const DateRangePickerComponent: React.FC<DateRangePickerProps> = (props) => {
  const {
    startName = 'startTime',
    endName = 'endTime',
    label = '',
    format = 'YYYY-MM-DD HH:mm:ss',
    required = false,
    placeholder,
    className = '',
    onChange,
    data,
  } = props;

  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [selecting, setSelecting] = useState<'start' | 'end'>('start');
  const [tempStart, setTempStart] = useState<Date | null>(null);
  const [tempEnd, setTempEnd] = useState<Date | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [i18nKey, setI18nKey] = useState(0); // Force re-render on language change
  const containerRef = useRef<HTMLDivElement>(null);

  // Get current i18n strings — re-read on i18nKey change (triggered by language events)
  const t = getComponentI18n();
  const inputPlaceholder = placeholder || t.selectDateRange;

  const startValue = data?.[startName] as string | undefined;
  const endValue = data?.[endName] as string | undefined;
  const startDate = parseDateValue(startValue, format);
  const endDate = parseDateValue(endValue, format);

  // Local display state — provides immediate visual feedback after user actions
  // (confirm/clear) before Amis propagates the data change back through props.
  // Syncs from data prop when it changes externally (e.g. store.setValues, i18n switch).
  const [displayStartDate, setDisplayStartDate] = useState<Date | null>(startDate);
  const [displayEndDate, setDisplayEndDate] = useState<Date | null>(endDate);

  useEffect(() => {
    setDisplayStartDate(startDate);
    setDisplayEndDate(endDate);
  }, [startValue, endValue]);

  // Listen to preview language changes
  useEffect(() => {
    const handler = () => setI18nKey((k) => k + 1);
    window.addEventListener('previewLanguageChange', handler);
    return () => window.removeEventListener('previewLanguageChange', handler);
  }, []);

  // Built-in validation: end must be after start
  useEffect(() => {
    if (displayStartDate && displayEndDate && displayEndDate <= displayStartDate) {
      setValidationError(t.endAfterStart);
    } else {
      setValidationError(null);
    }
  }, [displayStartDate, displayEndDate, t.endAfterStart]);

  const displayText = displayStartDate && displayEndDate
    ? `${formatDate(displayStartDate, format)} ~ ${formatDate(displayEndDate, format)}`
    : '';

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleOpen = useCallback(() => {
    setTempStart(displayStartDate ? new Date(displayStartDate) : null);
    setTempEnd(displayEndDate ? new Date(displayEndDate) : null);
    setSelecting('start');
    if (displayStartDate) {
      setCurrentMonth({ year: displayStartDate.getFullYear(), month: displayStartDate.getMonth() });
    }
    setOpen(true);
  }, [displayStartDate, displayEndDate]);

  const handleDayClick = useCallback((day: number) => {
    const clickedDate = new Date(currentMonth.year, currentMonth.month, day);

    if (selecting === 'start' || !tempStart) {
      setTempStart(clickedDate);
      setTempEnd(null);
      setSelecting('end');
    } else {
      if (isBeforeOrSameDay(clickedDate, tempStart)) {
        setTempEnd(tempStart);
        setTempStart(clickedDate);
      } else {
        setTempEnd(clickedDate);
      }
    }
  }, [currentMonth, selecting, tempStart]);

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth(prev => {
      const m = prev.month - 1;
      return m < 0 ? { year: prev.year - 1, month: 11 } : { ...prev, month: m };
    });
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(prev => {
      const m = prev.month + 1;
      return m > 11 ? { year: prev.year + 1, month: 0 } : { ...prev, month: m };
    });
  }, []);

  const handleTimeChange = useCallback(
    (field: 'start' | 'end', part: 'h' | 'm' | 's', val: number) => {
      const date = field === 'start' ? tempStart : tempEnd;
      if (!date) return;
      const newDate = new Date(date);
      if (part === 'h') newDate.setHours(val, date.getMinutes(), date.getSeconds());
      else if (part === 'm') newDate.setMinutes(val);
      else newDate.setSeconds(val);
      if (field === 'start') setTempStart(newDate);
      else setTempEnd(newDate);
    },
    [tempStart, tempEnd]
  );

  const handleConfirm = useCallback(() => {
    if (!tempStart) return;
    const finalEnd = tempEnd || new Date(
      tempStart.getFullYear(), tempStart.getMonth(), tempStart.getDate(), 23, 59, 59
    );
    setDisplayStartDate(tempStart);
    setDisplayEndDate(finalEnd);
    onChange?.({
      [startName]: formatDate(tempStart, format),
      [endName]: formatDate(finalEnd, format),
    });
    setOpen(false);
  }, [tempStart, tempEnd, format, startName, endName, onChange]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDisplayStartDate(null);
    setDisplayEndDate(null);
    onChange?.({ [startName]: '', [endName]: '' });
  }, [startName, endName, onChange]);

  const renderCalendarDays = () => {
    const { year, month } = currentMonth;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = getDaysInMonth(year, month);
    const prevMonthDays = getDaysInMonth(month === 0 ? year - 1 : year, month === 0 ? 11 : month - 1);

    const cells: React.ReactNode[] = [];

    // Previous month trailing days
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = prevMonthDays - i;
      const cellDate = new Date(year, month - 1, d);
      cells.push(
        <div key={`p${d}`} className="drp-day drp-day-other" onClick={() => {
          const m = month - 1;
          setCurrentMonth(m < 0 ? { year: year - 1, month: 11 } : { year, month: m });
          setTimeout(() => handleDayClick(d), 0);
        }}>
          {d}
        </div>
      );
    }

    // Current month
    for (let d = 1; d <= daysInMonth; d++) {
      const cellDate = new Date(year, month, d);
      const isStart = tempStart && isSameDay(cellDate, tempStart);
      const isEnd = tempEnd && isSameDay(cellDate, tempEnd);
      const inRange = tempStart && tempEnd && !isBeforeOrSameDay(cellDate, tempStart) && !isAfterOrSameDay(cellDate, tempEnd);

      let cls = 'drp-day';
      if (inRange) cls += ' drp-day-range';
      if (isStart) cls += ' drp-day-start';
      if (isEnd) cls += ' drp-day-end';

      cells.push(
        <div key={`c${d}`} className={cls} onClick={() => handleDayClick(d)}>{d}</div>
      );
    }

    // Next month leading
    const total = cells.length;
    const remaining = Math.ceil(total / 7) * 7 - total;
    for (let d = 1; d <= remaining; d++) {
      const cellDate = new Date(year, month + 1, d);
      cells.push(
        <div key={`n${d}`} className="drp-day drp-day-other" onClick={() => {
          const m = month + 1;
          setCurrentMonth(m > 11 ? { year: year + 1, month: 0 } : { year, month: m });
          setTimeout(() => handleDayClick(d), 0);
        }}>
          {d}
        </div>
      );
    }

    return cells;
  };

  return (
    <div className={`date-range-picker ${className}`} ref={containerRef}>
      {label && (
        <label className="date-range-picker-label">
          {label}{required && <span className="date-range-picker-req">*</span>}
        </label>
      )}
      <div className="date-range-picker-input-wrap">
        <input
          className="date-range-picker-input"
          type="text"
          readOnly
          value={displayText}
          placeholder={inputPlaceholder}
          onClick={handleOpen}
        />
        {displayText && (
          <button className="date-range-picker-clear-btn" type="button" onClick={handleClear}>
            ×
          </button>
        )}
        <span className="date-range-picker-icon" onClick={handleOpen}>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="2" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M1 5.5h12" stroke="currentColor" strokeWidth="1.2" />
            <path d="M4 1v2.5M10 1v2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </span>
      </div>

      {open && (
        <div className="date-range-picker-popover">
          <div className="drp-header">
            <button className="drp-nav drp-nav-prev" type="button" onClick={handlePrevMonth}>‹</button>
            <span className="drp-month-label">{t.months[currentMonth.month]} {currentMonth.year}</span>
            <button className="drp-nav drp-nav-next" type="button" onClick={handleNextMonth}>›</button>
          </div>
          <div className="drp-weekdays">
            {t.weekdays.map(d => (
              <div key={d} className="drp-weekday">{d}</div>
            ))}
          </div>
          <div className="drp-days">{renderCalendarDays()}</div>
          <div className="drp-selection-text">
            {tempStart ? formatDate(tempStart, format) : '--'} {' ~ '} {tempEnd ? formatDate(tempEnd, format) : '--'}
          </div>
          <div className="drp-time-row">
            <div className="drp-time-col">
              <label>{t.startLabel}</label>
              <div className="drp-time-fields">
                <input type="number" min="0" max="23" value={tempStart?.getHours() ?? 0}
                  onChange={e => handleTimeChange('start', 'h', Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))} />
                <span className="drp-time-sep">:</span>
                <input type="number" min="0" max="59" value={tempStart?.getMinutes() ?? 0}
                  onChange={e => handleTimeChange('start', 'm', Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))} />
                <span className="drp-time-sep">:</span>
                <input type="number" min="0" max="59" value={tempStart?.getSeconds() ?? 0}
                  onChange={e => handleTimeChange('start', 's', Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))} />
              </div>
            </div>
            <div className="drp-time-col">
              <label>{t.endLabel}</label>
              <div className="drp-time-fields">
                <input type="number" min="0" max="23" value={tempEnd?.getHours() ?? 23}
                  onChange={e => handleTimeChange('end', 'h', Math.min(23, Math.max(0, parseInt(e.target.value) || 0)))} />
                <span className="drp-time-sep">:</span>
                <input type="number" min="0" max="59" value={tempEnd?.getMinutes() ?? 59}
                  onChange={e => handleTimeChange('end', 'm', Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))} />
                <span className="drp-time-sep">:</span>
                <input type="number" min="0" max="59" value={tempEnd?.getSeconds() ?? 59}
                  onChange={e => handleTimeChange('end', 's', Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))} />
              </div>
            </div>
          </div>
          <div className="drp-actions">
            <button className="drp-btn drp-btn-cancel" type="button" onClick={() => setOpen(false)}>{t.cancel}</button>
            <button className="drp-btn drp-btn-confirm" type="button" onClick={handleConfirm}>{t.confirm}</button>
          </div>
        </div>
      )}

      {validationError && (
        <div className="cxd-Form-validation is-error" style={{ color: 'var(--danger)', fontSize: '12px', lineHeight: '1', marginTop: '4px' }}>
          {validationError}
        </div>
      )}
    </div>
  );
};

registerRenderer({
  type: 'date-range-picker',
  name: 'date-range-picker',
  component: DateRangePickerComponent,
});

export { DateRangePickerComponent };
export default DateRangePickerComponent;

