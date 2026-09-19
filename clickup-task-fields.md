# ClickUp Task KPI Fields

The following fields collect task-level performance evidence in ClickUp.

## Evidence eligibility

Performance evidence follows **Task Type**, not ClickUp hierarchy.

Use the standard **Task** type for a meaningful individual deliverable that should create performance evidence. When that deliverable is broken into smaller internal assignments—implementation steps, fixes, checks, coordination, or supporting execution—use the **Feature** type. Feature items remain operationally trackable but do not independently enter rating coverage or KPI calculations.

**System convention:** **Task = performance evidence. Feature = supporting/internal work breakdown.**

A parent task or a subtask may count when it uses the performance-enabled Task Type on which the KPI custom fields are configured. Eligibility is therefore not determined by whether an item is a parent or subtask.

This allows a project to contain multiple accountable deliverables without forcing reviewers to rate every small feature or execution item, and prevents one deliverable from being overweighted simply because it was decomposed into several ClickUp items.

A task-level rating is countable only when:

- the item uses the performance-enabled Task Type;
- the work is completed in the review month;
- the relevant KPI field contains an observation; and
- the rating passes Blinto's rating-authority validation.

## Delivery & Reliability

- Delivery Status
- Delay / Blockage Responsibility

Delay / blockage values:

- Client
- Employee / Assignee
- Vendors / Third Parties

## Work Quality

- Delivery Quality
- Rework Required

## Behavioural performance

- Ownership
- Communication
- Problem Solving
- Collaboration
- Proactiveness

These use the five-level rating scale:

1. Exceptional
2. Strong
3. Effective
4. Needs Improvement
5. Significant Improvement Needed

## Business / Client Impact

Use the five-level outcome scale:

- Exceptional Impact
- Strong Impact
- Expected Impact
- Limited Impact
- No Meaningful Impact

Only work with meaningful outcome evidence needs a Business / Client Impact observation.

## Rating integrity

ClickUp remains the operational rating interface, but the presence of a value in ClickUp does **not** automatically make it official performance evidence.

Blinto records the rating actor and validates the rating against the configured authority relationship.

Each rating is classified as:

- **Verified** — entered by an authorized rating authority.
- **Needs Validation** — potentially legitimate evidence from outside the normal authority path; CEO/Admin can validate or reject the specific exception.
- **Invalid** — evidence that must not enter KPI calculations, including self-rating or a rejected exception.

If an unauthorized user changes a previously verified field, the new ClickUp value does not silently replace the official evidence. The system retains the last verified value and surfaces the change for review.

Exception validation is task-specific. Validating one cross-functional rating does not permanently authorize that person to rate the employee.

## Line-manager authority rules — first official cycle

- Ifrat — Fazle only.
- Rafsan — Fazle only.
- Siam — Ifrat or Fazle.
- Rakibul — Ifrat or Fazle.
- Sayem — Ifrat or Fazle.

For other employees, a legitimate direct line-manager rating is normally valid. Ratings outside the normal authority relationship are routed to **Needs Validation** rather than automatically counted.

## Privacy principle

Task-level ratings are management evidence. Employees should primarily receive the finalized monthly KPI result, KPI breakdown, feedback, and development actions rather than a live task-by-task performance feed.
