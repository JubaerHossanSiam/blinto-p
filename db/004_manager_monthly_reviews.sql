create table if not exists manager_monthly_reviews (
  employee_slug text not null references employees(slug) on delete cascade,
  month_key text not null,
  growth_score numeric(3,1),
  role_excellence_score numeric(3,1),
  went_well text not null default '',
  needs_improvement text not null default '',
  next_priorities text not null default '',
  support_needed text not null default '',
  manager_summary text not null default '',
  status text not null default 'draft' check (status in ('draft','submitted')),
  reviewed_by_email text,
  updated_at timestamptz not null default now(),
  primary key (employee_slug, month_key),
  check (growth_score is null or (growth_score >= 0 and growth_score <= 10)),
  check (role_excellence_score is null or (role_excellence_score >= 0 and role_excellence_score <= 10))
);
