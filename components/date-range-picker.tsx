'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

export type DateRange = { from: string; to: string };

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Days are handled as Dhaka-local YYYY-MM-DD strings throughout. They sort and
 * compare correctly as plain strings, which keeps range maths free of the
 * timezone drift that comes from comparing Date objects.
 */
export function dayKey(value: string | Date) {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Dhaka',
  }).format(typeof value === 'string' ? new Date(value) : value);
}

export function todayKey() {
  return dayKey(new Date());
}

/** First and last day of the month a given day falls in. */
export function monthRange(day: string): DateRange {
  const [year, month] = day.split('-').map(Number);
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const mm = String(month).padStart(2, '0');
  return { from: `${year}-${mm}-01`, to: `${year}-${mm}-${String(last).padStart(2, '0')}` };
}

function shortLabel(day: string) {
  const [year, month, date] = day.split('-').map(Number);
  return { d: date, m: MONTHS[month - 1].slice(0, 3), y: year };
}

export function rangeLabel(range: DateRange | null) {
  if (!range) return 'All time';
  const a = shortLabel(range.from);
  const b = shortLabel(range.to);
  if (range.from === range.to) return `${a.d} ${a.m} ${a.y}`;
  if (a.y === b.y && a.m === b.m) return `${a.d} – ${b.d} ${b.m} ${b.y}`;
  if (a.y === b.y) return `${a.d} ${a.m} – ${b.d} ${b.m} ${b.y}`;
  return `${a.d} ${a.m} ${a.y} – ${b.d} ${b.m} ${b.y}`;
}

/** The 42 cells of a month grid, starting on the Sunday on or before the 1st. */
function gridDays(year: number, month: number) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const start = new Date(first);
  start.setUTCDate(1 - first.getUTCDay());
  return Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start);
    date.setUTCDate(start.getUTCDate() + i);
    return {
      key: date.toISOString().slice(0, 10),
      date: date.getUTCDate(),
      outside: date.getUTCMonth() + 1 !== month,
    };
  });
}

type DateRangePickerProps = {
  value: DateRange | null;
  onChange: (next: DateRange | null) => void;
  /** Days that hold completed work, marked with a dot. */
  markers?: Set<string>;
};

export function DateRangePicker({ value, onChange, markers }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => (value?.from ?? todayKey()).slice(0, 7));
  // Holds the first click of a new range until the second lands.
  const [anchor, setAnchor] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const [year, month] = cursor.split('-').map(Number);
  const days = useMemo(() => gridDays(year, month), [year, month]);
  const today = todayKey();

  const step = (delta: number) => {
    const next = new Date(Date.UTC(year, month - 1 + delta, 1));
    setCursor(`${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}`);
  };

  const select = (day: string) => {
    if (!anchor) {
      // First click starts a new range; the list narrows to that single day
      // until the second click widens it, so nothing is ever in a half state.
      setAnchor(day);
      onChange({ from: day, to: day });
      return;
    }
    const from = day < anchor ? day : anchor;
    const to = day < anchor ? anchor : day;
    setAnchor(null);
    onChange({ from, to });
    setOpen(false);
  };

  return (
    <div className="range-picker" ref={root}>
      <button
        type="button"
        className={`range-trigger${open ? ' range-trigger-open' : ''}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true" className="range-trigger-icon" />
        {rangeLabel(value)}
        <span aria-hidden="true" className="range-trigger-caret" />
      </button>

      {open ? (
        <div className="range-panel" role="dialog" aria-label="Choose a date range">
          <div className="range-head">
            <button type="button" className="range-step" aria-label="Previous month" onClick={() => step(-1)}>‹</button>
            <strong>{MONTHS[month - 1]} {year}</strong>
            <button type="button" className="range-step" aria-label="Next month" onClick={() => step(1)}>›</button>
          </div>

          <div className="range-weekdays" aria-hidden="true">
            {WEEKDAYS.map((day) => <span key={day}>{day}</span>)}
          </div>

          <div className="range-grid">
            {days.map((day) => {
              const inRange = value ? day.key >= value.from && day.key <= value.to : false;
              const edge = value && (day.key === value.from || day.key === value.to);
              return (
                <button
                  type="button"
                  key={day.key}
                  className={[
                    'range-day',
                    day.outside ? 'range-day-outside' : '',
                    inRange ? 'range-day-in' : '',
                    edge ? 'range-day-edge' : '',
                    day.key === today ? 'range-day-today' : '',
                    markers?.has(day.key) ? 'range-day-marked' : '',
                  ].filter(Boolean).join(' ')}
                  aria-pressed={inRange}
                  onClick={() => select(day.key)}
                >
                  {day.date}
                </button>
              );
            })}
          </div>

          <div className="range-foot">
            <button
              type="button"
              className="range-action"
              onClick={() => { setAnchor(null); onChange(monthRange(today)); setCursor(today.slice(0, 7)); setOpen(false); }}
            >
              This month
            </button>
            <button
              type="button"
              className="range-action"
              onClick={() => { setAnchor(null); onChange(null); setOpen(false); }}
            >
              All time
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
