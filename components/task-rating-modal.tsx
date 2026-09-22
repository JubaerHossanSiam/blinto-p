'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  allowedValues,
  hasNumericScale,
  KPI_DEFINITIONS,
  labelForValue,
  valueForLabel,
} from '@/lib/kpi-fields';
import type { TaskRatingSummary } from '@/lib/task-rating-types';

type TaskRatingModalProps = {
  taskId: string;
  taskName: string;
  employeeSlug: string;
  employeeName: string;
  existing?: TaskRatingSummary;
  onClose: () => void;
};

export function TaskRatingModal({
  taskId,
  taskName,
  employeeSlug,
  employeeName,
  existing,
  onClose,
}: TaskRatingModalProps) {
  const router = useRouter();
  // Raw text per field, so a half-typed value is never discarded mid-edit.
  const [values, setValues] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const [fieldId, label] of Object.entries(existing?.fields ?? {})) {
      // Numeric fields edit as their 1-5 value; label-only fields keep the label.
      const value = valueForLabel(fieldId, label);
      initial[fieldId] = value === undefined ? label : String(value);
    }
    return initial;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  // Resolve every box once: a blank field is simply not rated, a number that
  // matches one of the field's options is valid, anything else is an error.
  const resolved = KPI_DEFINITIONS.map((definition) => {
    const numeric = hasNumericScale(definition.fieldId);
    const raw = (values[definition.fieldId] ?? '').trim();
    if (!raw) return { definition, raw, numeric, label: undefined, invalid: false };

    if (!numeric) {
      // Label-only field: the stored string is the label itself.
      const valid = definition.options.some((option) => option.label === raw);
      return { definition, raw, numeric, label: valid ? raw : undefined, invalid: !valid };
    }

    const value = Number(raw);
    const label = Number.isFinite(value) ? labelForValue(definition.fieldId, value) : undefined;
    return { definition, raw, numeric, label, invalid: !label };
  });

  const chosen = resolved.filter((entry) => entry.label).length;
  const hasInvalid = resolved.some((entry) => entry.invalid);

  async function submit() {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch('/api/task-ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId,
          employeeSlug,
          ratings: Object.fromEntries(
            resolved
              .filter((entry) => entry.label)
              .map((entry) => [entry.definition.fieldId, entry.label as string]),
          ),
        }),
      });
      const payload = await response.json().catch(() => null) as
        | { ok?: boolean; message?: string; status?: string; completed?: boolean }
        | null;

      if (!response.ok || !payload?.ok) {
        setError(payload?.message ?? 'Unable to save this rating.');
        return;
      }

      router.refresh();
      onClose();
    } catch {
      setError('Unable to reach the server.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rating-backdrop" role="presentation" onClick={onClose}>
      <div
        className="rating-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rating-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="rating-modal-head">
          <div>
            <p className="eyebrow">Task KPI rating</p>
            <h2 id="rating-modal-title">{employeeName}</h2>
            <p className="rating-modal-task">{taskName}</p>
          </div>
          <button className="rating-close" type="button" onClick={onClose} aria-label="Close">×</button>
        </header>

        {existing ? (
          <div className={`rating-status rating-status-${existing.status}`}>
            <strong>
              {existing.status === 'verified'
                ? 'Verified evidence'
                : existing.status === 'needs_validation'
                  ? 'Awaiting CEO/Admin validation'
                  : 'Rejected'}
            </strong>
            <span>{existing.reason}</span>
          </div>
        ) : null}

        <div className="rating-grid">
          {resolved.map(({ definition, raw, numeric, label, invalid }) => {
            const scale = allowedValues(definition.fieldId);

            function set(next: string) {
              setValues((current) => {
                const updated = { ...current };
                if (next.trim()) updated[definition.fieldId] = next;
                else delete updated[definition.fieldId];
                return updated;
              });
            }

            return (
              <div className="rating-row" key={definition.fieldId}>
                <label htmlFor={numeric ? `kpi-${definition.fieldId}` : undefined}>
                  {definition.label}
                </label>

                {numeric ? (
                  <div className="rating-input-line">
                    <input
                      id={`kpi-${definition.fieldId}`}
                      className={`rating-score-input${invalid ? ' rating-score-invalid' : ''}`}
                      type="number"
                      inputMode="numeric"
                      min={Math.min(...scale)}
                      max={Math.max(...scale)}
                      step={1}
                      placeholder="—"
                      value={raw}
                      aria-invalid={invalid}
                      aria-describedby={`kpi-hint-${definition.fieldId}`}
                      onChange={(event) => set(event.target.value)}
                    />
                    <span className="rating-out-of">/ 5</span>
                    <span
                      id={`kpi-hint-${definition.fieldId}`}
                      className={`rating-resolved${invalid ? ' rating-resolved-invalid' : ''}`}
                    >
                      {label ?? (invalid ? 'Enter a value from 1 to 5' : 'Not rated')}
                    </span>
                  </div>
                ) : (
                  <div className="rating-choice" role="group" aria-label={definition.label}>
                    {definition.options.map((option) => (
                      <button
                        type="button"
                        key={option.label}
                        className={`rating-choice-chip${raw === option.label ? ' rating-choice-chip-active' : ''}`}
                        aria-pressed={raw === option.label}
                        onClick={() => set(raw === option.label ? '' : option.label)}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {error ? <p className="form-error rating-error">{error}</p> : null}

        <footer className="rating-modal-foot">
          <p className="rating-progress">{chosen} of {KPI_DEFINITIONS.length} KPIs rated</p>
          <div className="rating-actions">
            <button className="button button-secondary" type="button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button
              className="button"
              type="button"
              onClick={submit}
              disabled={saving || !chosen || hasInvalid}
              title={hasInvalid ? 'Fix the highlighted scores first.' : undefined}
            >
              {saving ? 'Saving…' : 'Save rating'}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
