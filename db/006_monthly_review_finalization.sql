alter table manager_monthly_reviews
  drop constraint if exists manager_monthly_reviews_status_check;
alter table manager_monthly_reviews
  add constraint manager_monthly_reviews_status_check
  check (status in ('draft','submitted','finalized','locked'));
alter table manager_monthly_reviews
  add column if not exists submitted_at timestamptz,
  add column if not exists finalized_at timestamptz,
  add column if not exists finalized_by_email text,
  add column if not exists locked_at timestamptz,
  add column if not exists reopened_at timestamptz,
  add column if not exists reopened_by_email text;
