# KPI 01 — Delivery & Reliability

## Points

**10 points**

## Final formula

`Delivery & Reliability = (ClickUp Delivery Reliability × 60%) + (HRMS Attendance Reliability × 20%) + (HRMS Leave & Policy Reliability × 20%)`

All components are scored out of 10.

## ClickUp Delivery Reliability

For each eligible completed task:

`Task Delivery Reliability = (Adjusted Delivery Status × 70%) + (Rework Required × 30%)`

### Delivery Status

| Value | Score |
|---|---:|
| On Time | 10 |
| Minor Delay | 6 |
| Late | 2 |

### Rework Required

| Value | Score |
|---|---:|
| None | 10 |
| Minor | 6 |
| Major | 2 |

### Blockage Responsibility

Blockage Responsibility controls attribution; it does not add another score.

- **Assignee** — keep the recorded Delivery Status score.
- **Client** — if the delay was caused by the client, neutralize the timing penalty and use 10 for Adjusted Delivery Status.
- **Third Parties** — if the delay was caused by an external dependency, neutralize the timing penalty and use 10 for Adjusted Delivery Status.
- **Blank / no blockage** — use the recorded Delivery Status score.

If the employee failed to manage or escalate an external dependency appropriately, record responsibility accurately rather than automatically neutralizing the delay.

The monthly ClickUp component is the average of all Task Delivery Reliability scores.

## Coverage requirement

`KPI Review Coverage = Reviewed completed tasks ÷ Total completed eligible tasks × 100`

The monthly review may display a preview score before all tasks are reviewed, but it cannot be finalized until KPI Review Coverage reaches **100%**.

Example: 10 completed tasks with KPI review completed on 4 tasks = **40% coverage**, **6 missing reviews**, and the monthly review remains **Incomplete**.

## HRMS components

Attendance Reliability and Leave & Policy Reliability come from HRMS / People Ops rules. Approved leave and approved attendance exceptions are neutral.

## Primary evaluator

The task-level reviewer finalizes ClickUp task fields. The monthly system aggregates those final values; the manager does not rescore the same task evidence during monthly review.

## Evidence standard

Use observable task evidence. Do not punish client or third-party delays that were outside the employee's responsibility, and do not finalize a monthly result from incomplete task-review coverage.
