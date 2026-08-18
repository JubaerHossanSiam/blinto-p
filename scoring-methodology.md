# KPI Scoring Methodology

This document defines how Blinto converts ClickUp task-level KPI evidence into the monthly 100-point performance score.

## Core principle

The monthly score should summarize evidence collected during actual work. Managers should not reconstruct KPI 1–8 from memory at month-end when task-level evidence exists.

The system has two measurement layers:

- **KPI 1–8:** primarily calculated from eligible ClickUp task evidence.
- **KPI 9–10:** assessed in the Monthly Performance Review using documented development and role evidence.

Each KPI is worth **10 points**, for a total monthly score of **100 points**.

---

## 1. Monthly evidence window

Use work completed during the calendar review month.

A task should normally count when:

- the employee was responsible for or materially contributed to the work;
- the task reached a completed/delivered state during the review month; and
- the relevant KPI field contains a valid observation.

Do not force every KPI field onto every task. A blank or genuinely non-applicable field is **not automatically a poor score**.

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

For each employee and each applicable KPI, calculate the arithmetic mean of all valid task-level evidence values collected during the month.

`Monthly evidence rating = Sum of valid evidence values ÷ Number of valid observations`

Then convert the five-point evidence rating to the KPI's ten-point scale:

`Monthly KPI score = Monthly evidence rating ÷ 5 × 10`

Equivalent shortcut:

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

A blank field means **no valid observation**, not zero.

Therefore:

- exclude blank KPI fields from the denominator;
- do not convert blanks to 1, 3, or 0;
- do not penalize an employee because a KPI was genuinely not observable on a particular task.

If there is insufficient task evidence to calculate a KPI fairly, the reviewer should mark the KPI as **Insufficient Evidence** during preparation and use documented monthly evidence to complete the assessment.

Any manual completion must include a short evidence note. It must not be based only on general impression.

---

## 6. Delivery & Reliability

Delivery & Reliability uses **Delivery Status** together with **Delay / Blockage Responsibility**.

The governing rule is attribution:

- delays attributable to **Client** do not reduce the employee's Delivery & Reliability score;
- delays attributable to **Vendors / Third Parties** do not reduce the employee's score unless the employee failed to manage or escalate the dependency appropriately;
- delays attributable to **Employee / Assignee** are valid negative performance evidence;
- reliable on-time completion is positive evidence.

External blockage should therefore be excluded from negative employee attribution rather than treated as employee lateness.

The exact Delivery Status-to-rating mapping should follow the configured ClickUp field values. If those values change, this methodology and `clickup-task-fields.md` must be updated together.

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
- operational improvement;
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
- supplement it only with documented evidence from the review period; and
- note the limited sample in the Monthly Performance Review when it materially affects confidence.

Do not invent additional task ratings merely to increase the sample size.

---

## 12. KPI 9 — Growth & Development

Growth & Development is assessed monthly against the employee's **2–3 agreed development goals**.

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

Role Excellence is assessed against the employee's individual **Role Success Plan**.

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

Task evidence should remain available so the employee and reviewer can understand how the score was produced.

---

## 15. Rounding

- Calculate averages using the underlying evidence values.
- Round each final KPI score to **one decimal place**.
- Sum the ten rounded KPI scores for the monthly total.
- Do not round task-level observations because they are already fixed 1–5 values.

---

## 16. Evidence correction and review

Employees should be able to see the evidence used in their review.

If a task rating is factually incorrect or important context is missing, it should be corrected at the evidence level where possible rather than compensated for by manipulating the final monthly score.

The reviewer remains responsible for ensuring the final assessment fairly represents documented evidence.

---

## 17. What this methodology does not yet define

This document defines **monthly KPI scoring** only.

It does not define:

- annual/final performance bands;
- how multiple monthly scores roll into the Final Assessment;
- promotion eligibility;
- salary adjustment decisions;
- probation outcomes;
- formal performance improvement triggers.

Those rules belong in `final-assessment.md`.
