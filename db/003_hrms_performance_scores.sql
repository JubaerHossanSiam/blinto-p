-- HRMS performance integration
-- Adds a stable HRMS employee identifier and stores monthly HRMS-owned scores.

alter table employees
  add column if not exists employee_id text;

create unique index if not exists employees_employee_id_uidx
  on employees(employee_id)
  where employee_id is not null;

create table if not exists hrms_monthly_scores (
  employee_slug text not null references employees(slug) on update cascade on delete cascade,
  month_key text not null check (month_key ~ '^\d{4}-\d{2}$'),
  attendance_score numeric(5,2) check (attendance_score between 0 and 100),
  leave_policy_score numeric(5,2) check (leave_policy_score between 0 and 100),
  sync_status text not null default 'pending' check (sync_status in ('pending', 'synced', 'error')),
  source_updated_at timestamptz,
  synced_at timestamptz,
  raw_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (employee_slug, month_key)
);

create index if not exists hrms_monthly_scores_month_idx
  on hrms_monthly_scores(month_key);

-- Integration rule:
-- 1. Match HRMS records primarily by employees.email.
-- 2. Keep employees.employee_id as the HRMS stable internal identifier.
-- 3. A score affects performance only when sync_status = 'synced' AND both scores are non-null.
-- 4. Pending/error/null HRMS values must never be treated as 0 or 100.
