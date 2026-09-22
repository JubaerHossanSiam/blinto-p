// Shared KPI field definitions. This module deliberately has no database or
// network imports so the rating modal can use it on the client.

export const CLICKUP_FIELD_IDS = {
  deliveryStatus: 'bf3575c2-fe31-4a9c-8b30-23db06b49577',
  deliveryQuality: '8c37a189-6859-4b8a-9786-6d70a7a63567',
  ownership: 'b6cf5e86-fa91-4efe-bd14-c92cb3faea9c',
  communication: '8b6f266d-f156-414d-897f-338db20098ea',
  problemSolving: 'b7c4e2ca-1e92-4751-a8ac-55dd68dc2a8d',
  collaboration: '917ab086-50f3-462d-923b-5b438c884487',
  proactiveness: '2ae1ebcf-ce8e-4659-9736-25fbd4efd045',
  businessImpact: '4c25dd82-4e96-476b-b297-caa38933af60',
} as const;

export type KpiOption = {
  label: string;
  /** Internal score out of 10, used by all KPI scoring. */
  score: number;
  /** The 1-5 value raters use, per the shared rating scale in the guide. */
  value?: number;
};

// Mirrors the dropdown options configured on the ClickUp custom fields. The
// guide's shared scale runs 1-5 and is "multiplied by two to produce a score
// out of 10", so `value` is what a rater enters and `score` is what is stored.
const standardOptions: KpiOption[] = [
  { label: 'Exceptional', value: 5, score: 10 },
  { label: 'Strong', value: 4, score: 8 },
  { label: 'Effective', value: 3, score: 6 },
  { label: 'Needs Improvement', value: 2, score: 4 },
  { label: 'Significant Improvement Needed', value: 1, score: 2 },
];

// Delivery Status is deliberately label-only: the guide records that no
// numeric delivery-rating conversion has been agreed yet, and the 10/7/4
// scores below are the existing internal values, not a documented scale.
const deliveryOptions: KpiOption[] = [
  { label: 'On Time', score: 10 },
  { label: 'Minor Delay', score: 7 },
  { label: 'Late', score: 4 },
];

const impactOptions: KpiOption[] = [
  { label: 'Exceptional Impact', value: 5, score: 10 },
  { label: 'Strong Impact', value: 4, score: 8 },
  { label: 'Expected Impact', value: 3, score: 6 },
  { label: 'Limited Impact', value: 2, score: 4 },
  { label: 'No Meaningful Impact', value: 1, score: 2 },
];

export type KpiDefinition = {
  label: string;
  fieldId: string;
  options: KpiOption[];
};

export const KPI_DEFINITIONS: KpiDefinition[] = [
  { label: 'Delivery & Reliability', fieldId: CLICKUP_FIELD_IDS.deliveryStatus, options: deliveryOptions },
  { label: 'Work Quality', fieldId: CLICKUP_FIELD_IDS.deliveryQuality, options: standardOptions },
  { label: 'Ownership', fieldId: CLICKUP_FIELD_IDS.ownership, options: standardOptions },
  { label: 'Communication', fieldId: CLICKUP_FIELD_IDS.communication, options: standardOptions },
  { label: 'Problem Solving', fieldId: CLICKUP_FIELD_IDS.problemSolving, options: standardOptions },
  { label: 'Collaboration', fieldId: CLICKUP_FIELD_IDS.collaboration, options: standardOptions },
  { label: 'Proactiveness', fieldId: CLICKUP_FIELD_IDS.proactiveness, options: standardOptions },
  { label: 'Business / Client Impact', fieldId: CLICKUP_FIELD_IDS.businessImpact, options: impactOptions },
];

const byFieldId = new Map(KPI_DEFINITIONS.map((definition) => [definition.fieldId, definition]));

export function kpiDefinition(fieldId: string) {
  return byFieldId.get(fieldId);
}

/** The numeric score for a label, or undefined if the label is not valid for that field. */
export function scoreForLabel(fieldId: string, label: string) {
  return byFieldId.get(fieldId)?.options.find((option) => option.label === label)?.score;
}

/**
 * The label a typed 1-5 value maps to, or undefined when the value is not one
 * of that field's options. Values are never snapped to a neighbour: a rating
 * the field cannot express is rejected rather than quietly changed.
 */
export function labelForValue(fieldId: string, value: number) {
  return byFieldId.get(fieldId)?.options.find((option) => option.value === value)?.label;
}

/** The 1-5 value for a stored label, so a saved rating can be edited. */
export function valueForLabel(fieldId: string, label: string) {
  return byFieldId.get(fieldId)?.options.find((option) => option.label === label)?.value;
}

/** Allowed 1-5 values for a field, highest first. Empty when it has no numeric scale. */
export function allowedValues(fieldId: string) {
  return byFieldId.get(fieldId)?.options
    .map((option) => option.value)
    .filter((value): value is number => value !== undefined) ?? [];
}

/** Whether this field is rated on the numeric 1-5 scale rather than by label. */
export function hasNumericScale(fieldId: string) {
  return allowedValues(fieldId).length > 0;
}
