-- A free-text justification for a task rating. Stored per row like task_name
-- and task_url are: the note belongs to the whole rating, and every field row
-- of that rating carries the same copy, so reading one row is enough.
alter table task_rating_integrity
  add column if not exists rater_note text not null default '';
