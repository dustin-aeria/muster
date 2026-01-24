import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { cn } from '../../lib/utils';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  X,
  CalendarDays,
  CalendarRange
} from 'lucide-react';

/**
 * Batch 91: DatePicker Component
 *
 * Date and time selection components.
 *
 * Exports:
 * - DatePicker: Basic date picker
 * - DateRangePicker: Date range selection
 * - TimePicker: Time selection
 * - DateTimePicker: Combined date and time
 * - MonthPicker: Month selection
 * - YearPicker: Year selection
 * - WeekPicker: Week selection
 * - CalendarView: Inline calendar
 * - DateInput: Date input with validation
 * - QuickDateSelect: Preset date options
 */

// ============================================================================
// UTILITIES
// ============================================================================
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function formatDate(date, format = 'yyyy-MM-dd') {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');

  return format
    .replace('yyyy', year)
    .replace('MM', month)
    .replace('dd', day)
    .replace('MMM', SHORT_MONTHS[d.getMonth()])
    .replace('MMMM', MONTHS[d.getMonth()]);
}

function isSameDay(date1, date2) {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isInRange(date, start, end) {
  if (!start || !end) return false;
  return date >= start && date <= end;
}

// ============================================================================
// DATE PICKER - Basic date picker
// ============================================================================
export const DatePicker = forwardRef(function DatePicker({
  value,
  onChange,
  placeholder = 'Select date',
  format = 'yyyy-MM-dd',
  minDate,
  maxDate,
  disabled = false,
  clearable = true,
  size = 'md',
  error,
  className,
  ...props
}, ref) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
  const containerRef = useRef(null);

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectDate = (day) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    onChange?.(newDate);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const days = [];

    // Empty cells for days before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      const isSelected = value && isSameDay(date, new Date(value));
      const isToday = isSameDay(date, new Date());
      const isDisabled =
        (minDate && date < new Date(minDate)) ||
        (maxDate && date > new Date(maxDate));

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => !isDisabled && handleSelectDate(day)}
          disabled={isDisabled}
          className={cn(
            'p-2 text-sm rounded-lg transition-colors',
            isSelected && 'bg-blue-600 text-white',
            !isSelected && isToday && 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400',
            !isSelected && !isToday && !isDisabled && 'hover:bg-gray-100 dark:hover:bg-gray-700',
            isDisabled && 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
          )}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div
        ref={ref}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 w-full border rounded-lg cursor-pointer',
          'bg-white dark:bg-gray-800',
          'border-gray-300 dark:border-gray-600',
          'focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500',
          error && 'border-red-500 focus-within:ring-red-500',
          disabled && 'opacity-50 cursor-not-allowed bg-gray-50 dark:bg-gray-900',
          sizeClasses[size]
        )}
        {...props}
      >
        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className={cn('flex-1', !value && 'text-gray-400')}>
          {value ? formatDate(value, format) : placeholder}
        </span>
        {clearable && value && !disabled && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange?.(null);
            }}
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div
                key={day}
                className="p-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-center"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>

          {/* Today button */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                const today = new Date();
                setViewDate(today);
                onChange?.(today);
                setIsOpen(false);
              }}
              className="w-full py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

// ============================================================================
// DATE RANGE PICKER - Date range selection
// ============================================================================
export function DateRangePicker({
  value = { start: null, end: null },
  onChange,
  placeholder = 'Select date range',
  format = 'MMM dd, yyyy',
  minDate,
  maxDate,
  disabled = false,
  size = 'md',
  className,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value.start ? new Date(value.start) : new Date());
  const [selecting, setSelecting] = useState('start');
  const [hoverDate, setHoverDate] = useState(null);
  const containerRef = useRef(null);

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectDate = (day) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);

    if (selecting === 'start' || (value.start && selectedDate < new Date(value.start))) {
      onChange?.({ start: selectedDate, end: null });
      setSelecting('end');
    } else {
      onChange?.({ ...value, end: selectedDate });
      setSelecting('start');
      setIsOpen(false);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      const isStart = value.start && isSameDay(date, new Date(value.start));
      const isEnd = value.end && isSameDay(date, new Date(value.end));
      const isInSelectedRange = value.start && value.end && isInRange(date, new Date(value.start), new Date(value.end));
      const isInHoverRange = value.start && !value.end && hoverDate && isInRange(date, new Date(value.start), hoverDate);
      const isToday = isSameDay(date, new Date());

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleSelectDate(day)}
          onMouseEnter={() => setHoverDate(date)}
          onMouseLeave={() => setHoverDate(null)}
          className={cn(
            'p-2 text-sm transition-colors',
            (isStart || isEnd) && 'bg-blue-600 text-white rounded-lg',
            (isInSelectedRange || isInHoverRange) && !isStart && !isEnd && 'bg-blue-100 dark:bg-blue-900/50',
            !isStart && !isEnd && !isInSelectedRange && !isInHoverRange && isToday && 'bg-gray-100 dark:bg-gray-700 rounded-lg',
            !isStart && !isEnd && !isInSelectedRange && !isInHoverRange && !isToday && 'hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg'
          )}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const displayValue = () => {
    if (!value.start) return placeholder;
    if (!value.end) return `${formatDate(value.start, format)} - ...`;
    return `${formatDate(value.start, format)} - ${formatDate(value.end, format)}`;
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 w-full border rounded-lg cursor-pointer',
          'bg-white dark:bg-gray-800',
          'border-gray-300 dark:border-gray-600',
          disabled && 'opacity-50 cursor-not-allowed',
          sizeClasses[size]
        )}
        {...props}
      >
        <CalendarRange className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className={cn('flex-1', !value.start && 'text-gray-400')}>
          {displayValue()}
        </span>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium">
              {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div key={day} className="p-2 text-xs font-medium text-gray-500 text-center">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {renderCalendar()}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// TIME PICKER - Time selection
// ============================================================================
export const TimePicker = forwardRef(function TimePicker({
  value,
  onChange,
  placeholder = 'Select time',
  format = '12h',
  step = 15,
  minTime,
  maxTime,
  disabled = false,
  size = 'md',
  className,
  ...props
}, ref) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const generateTimes = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += step) {
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        times.push(time);
      }
    }
    return times;
  };

  const formatTime = (time) => {
    if (!time) return '';
    if (format === '24h') return time;

    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const times = generateTimes();

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div
        ref={ref}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 w-full border rounded-lg cursor-pointer',
          'bg-white dark:bg-gray-800',
          'border-gray-300 dark:border-gray-600',
          disabled && 'opacity-50 cursor-not-allowed',
          sizeClasses[size]
        )}
        {...props}
      >
        <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className={cn('flex-1', !value && 'text-gray-400')}>
          {value ? formatTime(value) : placeholder}
        </span>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-auto">
          {times.map((time) => (
            <button
              key={time}
              type="button"
              onClick={() => {
                onChange?.(time);
                setIsOpen(false);
              }}
              className={cn(
                'w-full px-4 py-2 text-sm text-left',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                value === time && 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
              )}
            >
              {formatTime(time)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// ============================================================================
// DATE TIME PICKER - Combined date and time
// ============================================================================
export function DateTimePicker({
  value,
  onChange,
  datePlaceholder = 'Select date',
  timePlaceholder = 'Select time',
  dateFormat = 'yyyy-MM-dd',
  timeFormat = '12h',
  disabled = false,
  size = 'md',
  className,
  ...props
}) {
  const handleDateChange = (date) => {
    if (!date) {
      onChange?.(null);
      return;
    }

    const newValue = new Date(date);
    if (value) {
      const oldDate = new Date(value);
      newValue.setHours(oldDate.getHours(), oldDate.getMinutes());
    }
    onChange?.(newValue);
  };

  const handleTimeChange = (time) => {
    if (!time) return;

    const [hours, minutes] = time.split(':');
    const newValue = value ? new Date(value) : new Date();
    newValue.setHours(parseInt(hours), parseInt(minutes));
    onChange?.(newValue);
  };

  const getTimeValue = () => {
    if (!value) return null;
    const d = new Date(value);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className={cn('flex gap-2', className)} {...props}>
      <DatePicker
        value={value}
        onChange={handleDateChange}
        placeholder={datePlaceholder}
        format={dateFormat}
        disabled={disabled}
        size={size}
        clearable={false}
        className="flex-1"
      />
      <TimePicker
        value={getTimeValue()}
        onChange={handleTimeChange}
        placeholder={timePlaceholder}
        format={timeFormat}
        disabled={disabled}
        size={size}
        className="w-32"
      />
    </div>
  );
}

// ============================================================================
// MONTH PICKER - Month selection
// ============================================================================
export function MonthPicker({
  value,
  onChange,
  placeholder = 'Select month',
  minDate,
  maxDate,
  disabled = false,
  size = 'md',
  className,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(value ? new Date(value).getFullYear() : new Date().getFullYear());
  const containerRef = useRef(null);

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectMonth = (month) => {
    const newDate = new Date(viewYear, month, 1);
    onChange?.(newDate);
    setIsOpen(false);
  };

  const displayValue = () => {
    if (!value) return placeholder;
    const d = new Date(value);
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 w-full border rounded-lg cursor-pointer',
          'bg-white dark:bg-gray-800',
          'border-gray-300 dark:border-gray-600',
          disabled && 'opacity-50 cursor-not-allowed',
          sizeClasses[size]
        )}
        {...props}
      >
        <CalendarDays className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className={cn('flex-1', !value && 'text-gray-400')}>
          {displayValue()}
        </span>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setViewYear(viewYear - 1)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium">{viewYear}</span>
            <button
              type="button"
              onClick={() => setViewYear(viewYear + 1)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {SHORT_MONTHS.map((month, index) => {
              const isSelected = value &&
                new Date(value).getMonth() === index &&
                new Date(value).getFullYear() === viewYear;

              return (
                <button
                  key={month}
                  type="button"
                  onClick={() => handleSelectMonth(index)}
                  className={cn(
                    'px-4 py-2 text-sm rounded-lg transition-colors',
                    isSelected && 'bg-blue-600 text-white',
                    !isSelected && 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  {month}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// YEAR PICKER - Year selection
// ============================================================================
export function YearPicker({
  value,
  onChange,
  placeholder = 'Select year',
  minYear = 1900,
  maxYear = 2100,
  disabled = false,
  size = 'md',
  className,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDecade, setViewDecade] = useState(
    value ? Math.floor(new Date(value).getFullYear() / 10) * 10 : Math.floor(new Date().getFullYear() / 10) * 10
  );
  const containerRef = useRef(null);

  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-3 text-base',
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSelectYear = (year) => {
    const newDate = new Date(year, 0, 1);
    onChange?.(newDate);
    setIsOpen(false);
  };

  const years = [];
  for (let i = 0; i < 12; i++) {
    const year = viewDecade - 1 + i;
    if (year >= minYear && year <= maxYear) {
      years.push(year);
    }
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 w-full border rounded-lg cursor-pointer',
          'bg-white dark:bg-gray-800',
          'border-gray-300 dark:border-gray-600',
          disabled && 'opacity-50 cursor-not-allowed',
          sizeClasses[size]
        )}
        {...props}
      >
        <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span className={cn('flex-1', !value && 'text-gray-400')}>
          {value ? new Date(value).getFullYear() : placeholder}
        </span>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => setViewDecade(viewDecade - 10)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium">
              {viewDecade} - {viewDecade + 9}
            </span>
            <button
              type="button"
              onClick={() => setViewDecade(viewDecade + 10)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {years.map((year) => {
              const isSelected = value && new Date(value).getFullYear() === year;

              return (
                <button
                  key={year}
                  type="button"
                  onClick={() => handleSelectYear(year)}
                  className={cn(
                    'px-4 py-2 text-sm rounded-lg transition-colors',
                    isSelected && 'bg-blue-600 text-white',
                    !isSelected && 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  {year}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// CALENDAR VIEW - Inline calendar
// ============================================================================
export function CalendarView({
  value,
  onChange,
  minDate,
  maxDate,
  highlightDates = [],
  className,
  ...props
}) {
  const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const firstDay = getFirstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
      const isSelected = value && isSameDay(date, new Date(value));
      const isToday = isSameDay(date, new Date());
      const isHighlighted = highlightDates.some((d) => isSameDay(date, new Date(d)));

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => onChange?.(date)}
          className={cn(
            'p-2 text-sm rounded-lg transition-colors relative',
            isSelected && 'bg-blue-600 text-white',
            !isSelected && isToday && 'bg-blue-100 dark:bg-blue-900/50 text-blue-600',
            !isSelected && !isToday && 'hover:bg-gray-100 dark:hover:bg-gray-700'
          )}
        >
          {day}
          {isHighlighted && !isSelected && (
            <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
          )}
        </button>
      );
    }

    return days;
  };

  return (
    <div
      className={cn(
        'p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="font-medium">
          {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
        </span>
        <button
          type="button"
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div key={day} className="p-2 text-xs font-medium text-gray-500 text-center">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {renderCalendar()}
      </div>
    </div>
  );
}

// ============================================================================
// QUICK DATE SELECT - Preset date options
// ============================================================================
export function QuickDateSelect({
  value,
  onChange,
  presets = 'default',
  className,
  ...props
}) {
  const defaultPresets = [
    { label: 'Today', getValue: () => new Date() },
    { label: 'Yesterday', getValue: () => { const d = new Date(); d.setDate(d.getDate() - 1); return d; } },
    { label: 'Last 7 days', getValue: () => { const d = new Date(); d.setDate(d.getDate() - 7); return d; } },
    { label: 'Last 30 days', getValue: () => { const d = new Date(); d.setDate(d.getDate() - 30); return d; } },
    { label: 'This month', getValue: () => new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    { label: 'Last month', getValue: () => new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1) },
  ];

  const presetOptions = presets === 'default' ? defaultPresets : presets;

  return (
    <div className={cn('flex flex-wrap gap-2', className)} {...props}>
      {presetOptions.map((preset) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => onChange?.(preset.getValue())}
          className={cn(
            'px-3 py-1.5 text-sm rounded-lg border transition-colors',
            'border-gray-300 dark:border-gray-600',
            'hover:bg-gray-50 dark:hover:bg-gray-700'
          )}
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}

export default DatePicker;
