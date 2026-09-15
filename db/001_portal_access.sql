create table if not exists employees (
  slug text primary key,
  full_name text not null,
  email text unique,
  manager_slug text references employees(slug) on update cascade on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists approved_users (
  email text primary key,
  employee_slug text references employees(slug) on update cascade on delete set null,
  role text not null check (role in ('employee', 'manager', 'delivery_reviewer', 'people_ops', 'admin')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists review_assignments (
  employee_slug text not null references employees(slug) on update cascade on delete cascade,
  reviewer_slug text not null references employees(slug) on update cascade on delete cascade,
  reviewer_type text not null default 'delivery' check (reviewer_type in ('delivery', 'secondary')),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (employee_slug, reviewer_slug, reviewer_type)
);

create index if not exists employees_manager_slug_idx on employees(manager_slug) where is_active = true;
create index if not exists review_assignments_reviewer_idx on review_assignments(reviewer_slug) where is_active = true;
create index if not exists approved_users_employee_idx on approved_users(employee_slug) where is_active = true;

-- Better Auth maintains its own user/session/account tables.
-- Run the Better Auth migration after DATABASE_URL is configured, then apply this file.
-- Add approved emails only after the employee row exists.
--
-- Example:
-- insert into employees (slug, full_name, email) values ('example', 'Example Employee', 'example@blinto.co');
-- insert into approved_users (email, employee_slug, role) values ('example@blinto.co', 'example', 'employee');
