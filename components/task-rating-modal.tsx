'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  hasNumericScale,
  KPI_DEFINITIONS,
  labelForValue,
  valueForLabel,
  type KpiDefinition,
} from '@/lib/kpi-fields';
import type { TaskRatingSummary } from '@/lib/task-rating-types';

/**
 * What the field's dropdown offers. Numeric fields keep the guide's 1-5 scale
 * visible in the option text, so picking "4 — Strong" still teaches the scale
 * the way a bare number box never did.
 */
function fieldOptions(definition: KpiDefinition) {
  if (!hasNumericScale(definition.fieldId)) {
    return definition.options.map((option) => ({ value: option.label, text: option.label }));
  }
  return definition.options
    .filter((option) => option.value !== undefined)
    .map((option) => ({ value: String(option.value), text: `${option.value} — ${option.label}` }));
}

/** Mirrors the server-side cap in app/api/task-ratings/route.ts. */
const NOTE_MAX = 2000;

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
  const [note, setNote] = useState(existing?.note ?? '');
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
          note,
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
          {resolved.map(({ definition, raw, numeric, invalid }) => {
            const fieldId = `kpi-${definition.fieldId}`;
            const hintId = `kpi-hint-${definition.fieldId}`;

            function set(next: string) {
              setValues((current) => {
                const updated = { ...current };
                if (next.trim()) updated[definition.fieldId] = next;
                else delete updated[definition.fieldId];
                return updated;
              });
            }

            return (
              <div className="rating-field" key={definition.fieldId}>
                <label className="rating-field-label" htmlFor={fieldId}>
                  {definition.label}
                  {numeric ? <span className="rating-field-scale">Scale 1–5</span> : null}
                </label>

                <div className="rating-field-control">
                  <select
                    id={fieldId}
                    className={`rating-select${invalid ? ' rating-select-invalid' : ''}`}
                    value={invalid ? '' : raw}
                    aria-invalid={invalid}
                    aria-describedby={invalid ? hintId : undefined}
                    onChange={(event) => set(event.target.value)}
                  >
                    <option value="">Not Relevent</option>
                    {fieldOptions(definition).map((option) => (
                      <option value={option.value} key={option.value}>{option.text}</option>
                    ))}
                  </select>
                  {/* Only reachable when a saved rating uses a label the field no
                      longer offers — the dropdown itself cannot produce one. */}
                  {invalid ? (
                    <span className="rating-field-note" id={hintId}>
                      Saved value “{raw}” is no longer a valid option — pick a new one.
                    </span>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <div className="rating-note">
          <label htmlFor="rating-note-input">
            Why this rating?
            <span className="rating-note-optional">Optional</span>
          </label>
          <textarea
            id="rating-note-input"
            className="rating-note-input"
            rows={3}
            maxLength={NOTE_MAX}
            placeholder="What happened on this task that justifies these scores?"
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <span className="rating-note-count">{note.length}/{NOTE_MAX}</span>
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
