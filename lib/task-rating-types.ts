// Rating shapes shared between the server and the rating UI. Kept free of
// database imports so client components can use them without pulling in `pg`.

export type TaskRatingSummary = {
  /** fieldId -> selected label */
  fields: Record<string, string>;
  status: 'verified' | 'needs_validation' | 'invalid';
  reason: string;
  actorName: string | null;
  ratedAt: string | null;
};

/** Keyed `${taskId}:${employeeSlug}`. */
export type TaskRatingMap = Record<string, TaskRatingSummary>;

export function ratingKey(taskId: string, employeeSlug: string) {
  return `${taskId}:${employeeSlug}`;
}
