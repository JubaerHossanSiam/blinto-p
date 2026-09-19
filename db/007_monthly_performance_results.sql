create table if not exists monthly_performance_results (
  employee_slug text not null references employees(slug) on delete cascade,
  month_key text not null,
  clickup_score numeric(4,1),
  manager_score numeric(4,1),
  final_score numeric(5,1),
  status text not null default 'pending' check (status in ('pending','complete','incomplete')),
  generated_at timestamptz not null default now(),
  primary key (employee_slug, month_key)
);