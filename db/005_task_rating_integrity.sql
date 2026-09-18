create table if not exists task_rating_integrity (
  task_id text not null,
  field_id text not null,
  employee_slug text not null references employees(slug) on delete cascade,
  task_name text not null default '',
  task_url text not null default '',
  current_score numeric(3,1),
  current_label text,
  current_actor_clickup_id text,
  current_actor_name text,
  verified_score numeric(3,1),
  verified_label text,
  verified_actor_clickup_id text,
  verified_actor_name text,
  verification_status text not null default 'needs_validation'
    check (verification_status in ('verified','needs_validation','invalid')),
  validation_reason text not null default '',
  completed_at timestamptz,
  changed_at timestamptz not null,
  validated_by_email text,
  validated_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (task_id, field_id, employee_slug)
);

create index if not exists task_rating_integrity_employee_month_idx
  on task_rating_integrity (employee_slug, completed_at);

create index if not exists task_rating_integrity_status_idx
  on task_rating_integrity (verification_status);
