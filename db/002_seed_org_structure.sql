insert into employees (slug, full_name) values
  ('ifrat', 'Ifrat'),
  ('rakibul', 'Rakibul'),
  ('rafsan', 'Rafsan Zahid'),
  ('munna', 'Munna'),
  ('sayem', 'Sayem'),
  ('siam', 'Siam'),
  ('usha', 'Usha'),
  ('raihan', 'Raihan'),
  ('fatema', 'Fatema'),
  ('yasin', 'Yasin'),
  ('silvia', 'Silvia'),
  ('imran', 'Imran'),
  ('drishty', 'Drishty'),
  ('abbrar', 'Abbrar')
on conflict (slug) do update set
  full_name = excluded.full_name,
  is_active = true,
  updated_at = now();

-- Current internal reporting relationships used for portal access.
update employees set manager_slug = 'sayem', updated_at = now() where slug = 'munna';
update employees set manager_slug = 'siam', updated_at = now() where slug in ('usha', 'raihan', 'fatema', 'yasin');
update employees set manager_slug = 'rakibul', updated_at = now() where slug in ('silvia', 'imran');

-- CEO direct reports and externally managed roles intentionally remain without an
-- internal manager_slug here. Admin / People Ops access covers those records.
update employees set manager_slug = null, updated_at = now()
where slug in ('ifrat', 'rakibul', 'rafsan', 'sayem', 'siam', 'drishty', 'abbrar');

-- Ifrat is the delivery reviewer for the internal team; this grants review visibility
-- without creating a second numeric KPI score.
insert into review_assignments (employee_slug, reviewer_slug, reviewer_type)
select slug, 'ifrat', 'delivery'
from employees
where slug <> 'ifrat'
on conflict (employee_slug, reviewer_slug, reviewer_type) do update set is_active = true;

-- Approved Google emails are deliberately NOT guessed here.
-- Add exact addresses after confirmation, for example:
-- insert into approved_users (email, employee_slug, role)
-- values ('employee@blinto.co', 'usha', 'employee');
--
-- For the three organization-wide viewers, use roles such as:
-- CEO: admin
-- Rafsan / People Ops: people_ops or admin depending on desired edit scope
-- Ifrat: delivery_reviewer, or admin if you want unrestricted organization-wide access
