# Blinto 100-Point KPI Framework

| # | KPI | Points | Measurement |
|---|---|---:|---|
| 1 | Delivery & Reliability | 10 | 60% ClickUp Delivery Reliability + 20% HRMS Attendance Reliability + 20% HRMS Leave/Policy Reliability |
| 2 | Work Quality | 10 | ClickUp task evidence |
| 3 | Ownership | 10 | ClickUp task evidence |
| 4 | Communication | 10 | ClickUp task evidence |
| 5 | Problem Solving | 10 | ClickUp task evidence |
| 6 | Collaboration | 10 | ClickUp task evidence |
| 7 | Proactiveness | 10 | ClickUp task evidence |
| 8 | Business / Client Impact | 10 | ClickUp task evidence + results |
| 9 | Growth & Development | 10 | Manager assessment in Monthly KPI Review |
| 10 | Role Excellence | 10 | Manager assessment against Role Success Plan |
| | **TOTAL** | **100** | |

## Evidence architecture

The monthly score combines three evidence sources:

1. **Work evidence — ClickUp**: task delivery, quality, ownership, communication, problem solving, collaboration, proactiveness, and business/client impact.
2. **People reliability evidence — HRMS / People Ops**: attendance, approved leave, leave-request discipline, unapproved absence, and policy compliance used only where the framework explicitly requires them.
3. **Manager review evidence**: Growth & Development and Role Excellence, supported by documented monthly evidence.

## KPI review coverage rule

Every completed task that is eligible for employee performance review must be reviewed before the monthly score becomes final.

`KPI Review Coverage = Reviewed completed tasks ÷ Total completed eligible tasks × 100`

The system may show a **preview** from currently reviewed tasks, but the monthly review cannot be finalized until coverage reaches **100%**.

Example:

- Completed eligible tasks: 10
- Tasks with KPI review completed: 4
- Coverage: 40%
- Missing reviews: 6
- Result: preview score may be displayed, but the monthly review remains **Incomplete**.

Blank KPI fields must not silently become zero. The reviewer must either complete the applicable task review or document why a field is not applicable before the task is treated as reviewed.

## KPI 1 — Delivery & Reliability

KPI 1 is a composite score:

`Delivery & Reliability = (ClickUp Delivery Reliability × 60%) + (HRMS Attendance Reliability × 20%) + (HRMS Leave & Policy Reliability × 20%)`

All three components are scored out of 10 before applying the weighting.

This means:

- ClickUp Delivery Reliability contributes a maximum of **6 points**.
- Attendance Reliability contributes a maximum of **2 points**.
- Leave & Policy Reliability contributes a maximum of **2 points**.

### ClickUp Delivery Reliability

Each reviewed task receives a Delivery Reliability score out of 10.

`Task Delivery Reliability = (Adjusted Delivery Status × 70%) + (Rework Required × 30%)`

#### Delivery Status conversion

| Delivery Status | Score |
|---|---:|
| On Time | 10 |
| Minor Delay | 6 |
| Late | 2 |

#### Rework Required conversion

| Rework Required | Score |
|---|---:|
| None | 10 |
| Minor | 6 |
| Major | 2 |

#### Blockage attribution rule

Blockage Responsibility does not create a separate score. It determines whether a timing penalty belongs to the employee.

- **Assignee**: use the Delivery Status score as recorded.
- **Client**: if the delay is client-caused, neutralize the timing penalty and use 10 for the adjusted Delivery Status component.
- **Third Parties**: if the delay is third-party-caused, neutralize the timing penalty and use 10 for the adjusted Delivery Status component.
- **No blockage**: use the Delivery Status score as recorded.

If the task was delayed by a client or third party but the employee failed to manage or escalate the dependency appropriately, the reviewer should record the primary responsibility accurately rather than neutralizing the delay automatically.

The monthly ClickUp Delivery Reliability value is:

`Monthly ClickUp Delivery Reliability = Average of Task Delivery Reliability scores for all reviewed eligible completed tasks`

The value remains provisional until KPI Review Coverage reaches 100%.

### Approved leave is neutral

Approved annual leave, sick leave, company holidays, and approved attendance exceptions do **not** reduce performance simply because time away was taken.

Use:

`Eligible working days = Scheduled working days − Approved leave − Company holidays − Approved exceptions`

The employee should be assessed only against obligations that actually applied.

### Attendance Reliability scale

HRMS data should map to the following objective monthly rating. The manager does not manually choose this score.

| HRMS attendance record for the month | Attendance Reliability |
|---|---:|
| No unapproved absence and no late/attendance issue beyond policy allowance | 10 / 10 |
| One minor attendance issue beyond policy allowance; no unapproved absence | 8 / 10 |
| Two minor attendance issues beyond policy allowance, or one isolated unapproved absence | 6 / 10 |
| Repeated attendance issues or repeated unapproved absence | 4 / 10 |
| Serious or persistent attendance-policy breach | 2 / 10 |

### Leave & Policy Reliability scale

This measures **how leave and policy processes are followed**, not how much approved leave an employee takes.

| Monthly leave/policy record | Leave & Policy Reliability |
|---|---:|
| All leave requests and required handovers/processes followed correctly | 10 / 10 |
| One minor process miss with no material impact | 8 / 10 |
| Repeated late requests, one meaningful process breach, or weak handover | 6 / 10 |
| Repeated non-compliance, unapproved leave, or recurring poor handover/notification | 4 / 10 |
| Serious or persistent leave/policy misuse or non-compliance | 2 / 10 |

Examples of valid negative evidence include:

- unapproved leave;
- leave requested outside the required notice period without an approved exception;
- repeated last-minute leave requests outside policy;
- absence without following the required notification process;
- failure to complete required handover for planned leave; and
- documented misuse of leave or attendance policy.

Approved emergency exceptions remain neutral when properly approved.

### No double counting

Do not deduct the same incident repeatedly across Attendance Reliability, Leave & Policy Reliability, Ownership, Communication, or another KPI.

Delivery Quality remains the source for Work Quality. Delivery Reliability uses Delivery Status, Rework Required, and Blockage Responsibility only for the documented reliability formula above.

## Scoring

KPI 2–8 are calculated from final task-level values collected during the month. The task-level values are not reinterpreted during the monthly review.

For the five-level task KPI fields:

- Exceptional = 10 / 10
- Strong = 8 / 10
- Effective = 6 / 10
- Needs Improvement = 4 / 10
- Significant Improvement Needed = 2 / 10

The monthly KPI score is the average of the eligible task values for that KPI.

KPI 9 and KPI 10 are assessed by the manager during the Monthly KPI Review because they require broader development and role-specific judgment.

The framework intentionally avoids arbitrary manager rescoring wherever objective evidence exists. ClickUp and HRMS / People Ops data feed the calculation according to the documented methodology, while managers remain responsible for reviewing context and evidence quality.
