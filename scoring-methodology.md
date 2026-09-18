# KPI Scoring Methodology

This document defines how Blinto converts ClickUp work evidence, HRMS/People Ops reliability evidence, and manager-reviewed role/development evidence into the monthly 100-point performance score.

## Core principle

The monthly score should summarize evidence collected during actual work. Managers should not reconstruct objective evidence from memory at month-end when ClickUp or HRMS/People Ops records exist.

The system has three measurement layers:

- **KPI 1:** composite of ClickUp Delivery Reliability (60%), HRMS Attendance Reliability (20%), and HRMS/People Ops Leave & Policy Reliability (20%).
- **KPI 2–8:** primarily calculated from eligible ClickUp task evidence.
- **KPI 9–10:** assessed by the manager in the Monthly Performance Review using documented development and role evidence.

Each KPI is worth **10 points**, for a total monthly score of **100 points**.

---

## 1. Monthly evidence window

Use work completed during the calendar review month.

A task should normally count when:

- the employee was responsible for or materially contributed to the work;
- the task reached a completed/delivered state during the review month; and
- the relevant KPI field contains a valid observation.

Do not force every KPI field onto every task. A blank or genuinely non-applicable field is **not automatically a poor score**.

Attendance and leave/policy evidence should use the same calendar review month and the finalized HRMS/People Ops records for that month.

---

## 2. Standard five-level evidence scale

For rating-based task fields:

| Rating | Evidence value |
|---|---:|
| Exceptional | 5 |
| Strong | 4 |
| Effective | 3 |
| Needs Improvement | 2 |
| Significant Improvement Needed | 1 |

Business / Client Impact uses the equivalent outcome scale:

| Impact rating | Evidence value |
|---|---:|
| Exceptional Impact | 5 |
| Strong Impact | 4 |
| Expected Impact | 3 |
| Limited Impact | 2 |
| No Meaningful Impact | 1 |

The neutral expected-performance point is **3 — Effective / Expected Impact**.

---

## 3. Task evidence aggregation

For each employee and each applicable ClickUp-based KPI, calculate the arithmetic mean of all **verified** task-level evidence values collected during the month.

`Monthly evidence rating = Sum of valid evidence values ÷ Number of valid observations`

Then convert the five-point evidence rating to the KPI's ten-point scale:

`Monthly KPI score = Monthly evidence rating × 2`

### Example

Ownership observations during the month:

`4, 3, 4, 5, 3`

Average:

`19 ÷ 5 = 3.8`

Monthly Ownership score:

`3.8 × 2 = 7.6 / 10`

Keep one decimal place in the final KPI score.

---

## 4. Equal weighting by default

Each valid task observation has equal weight by default.

Do not make managers manually assign importance weights to routine tasks. This keeps the system simple, transparent, and repeatable.

For KPIs that should only be evaluated on meaningful deliverables — especially Business / Client Impact — record the field only when the task provides meaningful evidence. Non-applicable tasks should remain blank rather than being given an artificial neutral score.

If Blinto later introduces an objective task-weighting mechanism, it should be documented here before being used in performance scoring.

---

## 5. Missing and non-applicable evidence

A blank task field means **no valid observation**, not zero.

Therefore:

- exclude blank KPI fields from the denominator;
- do not convert blanks to 1, 3, or 0;
- do not penalize an employee because a KPI was genuinely not observable on a particular task.

If there is insufficient task evidence to calculate a KPI fairly, the reviewer should mark the KPI as **Insufficient Evidence** during preparation and use documented monthly evidence to complete the assessment.

Any manual completion must include a short evidence note. It must not be based only on general impression.

For HRMS/People Ops evidence, missing or disputed records must be resolved at the source before KPI 1 is finalized. Do not guess an attendance or leave/policy score.

---

## 6. KPI 1 — Delivery & Reliability

KPI 1 combines three evidence sources:

- **60% — ClickUp Delivery Reliability**
- **20% — HRMS Attendance Reliability**
- **20% — HRMS / People Ops Leave & Policy Reliability**

Formula:

`KPI 1 = (ClickUp Delivery Reliability × 0.60) + (Attendance Reliability × 0.20) + (Leave & Policy Reliability × 0.20)`

All three component scores are calculated out of 10 before weighting.

### 6.1 ClickUp Delivery Reliability — 60%

The ClickUp component uses **Delivery Status** together with **Delay / Blockage Responsibility**.

The governing rule is attribution:

- delays attributable to **Client** do not reduce the employee's delivery score;
- delays attributable to **Vendors / Third Parties** do not reduce the employee's score unless the employee failed to manage or escalate the dependency appropriately;
- delays attributable to **Employee / Assignee** are valid negative performance evidence;
- reliable on-time completion is positive evidence.

External blockage should therefore be excluded from negative employee attribution rather than treated as employee lateness.

The exact Delivery Status-to-rating mapping should follow the configured ClickUp field values. If those values change, this methodology and `clickup-task-fields.md` must be updated together.

### 6.2 HRMS Attendance Reliability — 20%

Attendance Reliability uses finalized HRMS attendance data for the review month.

Use these records:

- scheduled working days;
- approved leave;
- company holidays;
- approved attendance exceptions;
- late attendance beyond policy allowance;
- unapproved absence; and
- documented attendance-policy breach.

Approved leave is **neutral**. Taking legitimate approved leave must not reduce a performance score.

Use:

`Eligible working days = Scheduled working days − Approved leave − Company holidays − Approved exceptions`

The employee is assessed only against attendance obligations that applied to eligible working days.

| Monthly attendance evidence | Attendance Reliability |
|---|---:|
| No unapproved absence and no late/attendance issue beyond policy allowance | 10 / 10 |
| One minor attendance issue beyond policy allowance; no unapproved absence | 8 / 10 |
| Two minor attendance issues beyond policy allowance, or one isolated unapproved absence | 6 / 10 |
| Repeated attendance issues or repeated unapproved absence | 4 / 10 |
| Serious or persistent attendance-policy breach | 2 / 10 |

The manager does **not** manually choose this score. Finalized HRMS/People Ops records determine the applicable rating.

### 6.3 Leave & Policy Reliability — 20%

This component measures **process discipline and professional reliability around leave and related policy**, not the amount of approved leave used.

Approved leave by itself is neutral.

Use these records:

- whether leave was requested within the required notice period;
- whether the correct approval process was followed;
- whether required handover or coverage was completed for planned leave;
- whether absence was properly communicated;
- unapproved leave;
- repeated last-minute leave outside policy; and
- documented leave/policy misuse or non-compliance.

| Monthly leave/policy evidence | Leave & Policy Reliability |
|---|---:|
| All required leave, approval, notification, and handover processes followed correctly | 10 / 10 |
| One minor process miss with no material impact | 8 / 10 |
| Repeated late requests, one meaningful process breach, or weak handover | 6 / 10 |
| Repeated non-compliance, unapproved leave, or recurring poor handover/notification | 4 / 10 |
| Serious or persistent leave/policy misuse or non-compliance | 2 / 10 |

Approved emergency exceptions remain neutral when properly approved.

A manager should not reduce this component because an employee used legitimate approved leave, even when the number of approved leave days is comparatively high.

### 6.4 KPI 1 example

If:

- ClickUp Delivery Reliability = `8.0 / 10`
- Attendance Reliability = `10 / 10`
- Leave & Policy Reliability = `8 / 10`

then:

`(8.0 × 0.60) + (10 × 0.20) + (8 × 0.20) = 8.4 / 10`

This gives HR-related reliability a maximum of **4 points inside KPI 1**, while actual work delivery remains the largest component at **6 points**.

### 6.5 No double counting

Do not deduct the same incident repeatedly across Attendance Reliability, Leave & Policy Reliability, Ownership, or Communication.

A separate KPI may be affected only when there is separate observable behaviour.

Example:

- an unapproved absence may reduce Leave & Policy Reliability;
- the same absence should not automatically reduce Ownership;
- but failure to notify the manager may separately provide Communication evidence because that is a distinct behaviour.

---

## 7. Work Quality

Work Quality uses **Delivery Quality** and **Rework Required**.

Delivery Quality provides the primary quality observation. Rework Required provides supporting evidence and context.

Necessary iteration caused by changed scope, new client direction, or another external dependency should not be treated as employee-caused quality failure.

Avoidable rework caused by incomplete, inaccurate, defective, or below-standard delivery is valid negative quality evidence.

---

## 8. Behavioural KPIs

The following KPIs use the standard five-level task evidence scale:

- Ownership
- Communication
- Problem Solving
- Collaboration
- Proactiveness

Reviewers should record the rating when the task provides enough observable evidence. The rating should describe demonstrated work behaviour, not personality.

---

## 9. Business / Client Impact

Business / Client Impact should only be evaluated on work where an outcome can reasonably be observed.

Examples include:

- client outcome;
- business result;
- product improvement;
- measurable growth;
- risk reduction;
- operational improvement; and
- meaningful stakeholder value.

Routine tasks with no meaningful impact signal should remain unrated for this KPI.

The monthly score is the average of the valid impact observations converted to the ten-point scale.

---

## 10. Multi-assignee and collaborative work

Do not automatically copy the same KPI rating to every assignee.

Where individual contribution can be distinguished, evaluate each employee based on their observable contribution.

Where contribution genuinely cannot be separated, the same task outcome may be used as shared evidence, but reviewers should avoid attributing exceptional or poor performance to an employee without evidence of their contribution.

---

## 11. Small sample sizes

A numerical average can be calculated from any valid observation, but a small sample should be treated cautiously.

When only a small amount of task evidence exists for a KPI:

- show the calculated evidence;
- review whether it is representative of the month;
- supplement it only with documented evidence from the review period;
- note the limited sample when it materially affects confidence; and
- do not invent additional task ratings merely to increase the sample size.

Approved leave may naturally reduce the volume of task evidence in a month. Lower evidence volume caused by legitimate approved leave is not itself negative performance evidence.

---

## 12. KPI 9 — Growth & Development

Growth & Development is assessed monthly by the manager against the employee's **2–3 agreed development goals**.

Use the universal five-level rating:

| Rating | Value | KPI score |
|---|---:|---:|
| Exceptional | 5 | 10 |
| Strong | 4 | 8 |
| Effective | 3 | 6 |
| Needs Improvement | 2 | 4 |
| Significant Improvement Needed | 1 | 2 |

The rating should reflect documented progress, application of learning, and agreed development outcomes — not simply course completion or attendance.

---

## 13. KPI 10 — Role Excellence

Role Excellence is assessed monthly by the manager against the employee's individual **Role Success Plan**.

Use the same five-level conversion:

`Role Excellence rating × 2 = KPI score out of 10`

The reviewer should consider evidence across the core success outcomes in the Role Success Plan and assign one overall monthly Role Excellence rating.

Role Excellence must not become a second arbitrary manager-opinion score. The assessment should reference observable monthly evidence.

---

## 14. Monthly 100-point score

Once all ten KPI scores are complete:

`Monthly Performance Score = KPI 1 + KPI 2 + ... + KPI 10`

Maximum score:

`100 points`

The underlying ClickUp evidence, HRMS/People Ops reliability records, and manager assessment notes should remain available so the employee can understand how the score was produced.

---

## 15. Rounding

- Calculate averages using the underlying evidence values.
- Calculate all three KPI 1 component scores before applying the 60/20/20 weighting.
- Round each final KPI score to **one decimal place**.
- Sum the ten rounded KPI scores for the monthly total.
- Do not round task-level observations because they are already fixed 1–5 values.

---

## 16. Evidence correction and review

Employees should be able to see the evidence used in their review.

If a ClickUp task rating is factually incorrect or important context is missing, it should be corrected at the evidence level where possible rather than compensated for by manipulating the final monthly score.

A ClickUp value is not automatically trusted merely because it exists. Blinto records the rating actor and classifies evidence as **Verified**, **Needs Validation**, or **Invalid**. Unauthorized changes to previously verified evidence are surfaced for review and do not silently replace the last verified value. CEO/Admin may validate a legitimate cross-functional exception for a specific task without granting permanent reviewer authority.

If attendance, leave, or policy data is incorrect, correct the HRMS/People Ops record before calculating KPI 1.

The reviewer remains responsible for ensuring the final assessment fairly represents documented evidence.

---

## 17. What this methodology does not yet define

This document defines **monthly KPI scoring** only.

It does not define:

- annual/final performance bands;
- how multiple monthly scores roll into the Final Assessment;
- promotion eligibility;
- salary adjustment decisions;
- probation outcomes; or
- formal performance improvement triggers.

Those rules belong in `final-assessment.md`.
