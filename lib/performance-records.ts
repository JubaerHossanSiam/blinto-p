export type ReviewStatus = 'Pending' | 'In review' | 'Complete';

export type KpiName =
  | 'Delivery & Reliability'
  | 'Work Quality'
  | 'Ownership'
  | 'Communication'
  | 'Problem Solving'
  | 'Collaboration'
  | 'Proactiveness'
  | 'Business / Client Impact'
  | 'Growth & Development'
  | 'Role Excellence';

export type ManagerReviewRecord = {
  wentWell?: string[];
  needsImprovement?: string[];
  employeeReflection?: string;
  nextPriorities?: string[];
  managerSummary?: string;
};

export type MonthlyPerformanceReview = {
  month: 'October' | 'November' | 'December';
  status: ReviewStatus;
  score?: number;
  summary?: string;
  kpiScores?: Partial<Record<KpiName, number>>;
  managerReview?: ManagerReviewRecord;
};

export type DeliverableRecord = {
  title: string;
  status: 'Ongoing' | 'On track' | 'At risk' | 'Complete';
  evidence?: string;
};

export type CareerAssessmentRecord = {
  status: 'Evidence collection' | 'Assessment' | 'Calibration' | 'Communicated' | 'Active';
  proposedLevel?: string;
  finalLevel?: string;
  summary?: string;
};

export type EmployeePerformanceRecord = {
  reviewManager?: string;
  reviews?: Partial<Record<'October' | 'November' | 'December', Partial<MonthlyPerformanceReview>>>;
  deliverables?: DeliverableRecord[];
  career?: Partial<CareerAssessmentRecord>;
};

/**
 * Employee Performance Card data layer.
 *
 * The website is the employee-facing presentation layer. ClickUp remains the operational
 * source of truth for work evidence and monthly review workflow; HRMS / People Ops remains
 * the source of truth for attendance and leave-policy evidence. Until live integrations are
 * connected, only approved snapshots should be added here and missing data must stay visibly
 * pending rather than being invented.
 */
export const performanceRecords: Record<string, EmployeePerformanceRecord> = {
  ifrat: { reviewManager: 'Fazle Rabbi', career: { status: 'Assessment', proposedLevel: 'L2' } },
  rakibul: { reviewManager: 'Fazle Rabbi', career: { status: 'Assessment', proposedLevel: 'L3' } },
  rafsan: { reviewManager: 'Fazle Rabbi', career: { status: 'Assessment', proposedLevel: 'L3' } },
  munna: { reviewManager: 'Abu Sayem', career: { status: 'Assessment', proposedLevel: 'L1' } },
  sayem: { reviewManager: 'Fazle Rabbi', career: { status: 'Assessment', proposedLevel: 'L1' } },
  siam: { reviewManager: 'Fazle Rabbi', career: { status: 'Assessment', proposedLevel: 'L2' } },
  usha: { reviewManager: 'Siam', career: { status: 'Assessment', proposedLevel: 'L1' } },
  raihan: { reviewManager: 'Siam', career: { status: 'Assessment', proposedLevel: 'L1' } },
  fatema: { reviewManager: 'Siam', career: { status: 'Assessment', proposedLevel: 'L1' } },
  yasin: { reviewManager: 'Siam', career: { status: 'Assessment', proposedLevel: 'L1' } },
  silvia: { reviewManager: 'Rakibul', career: { status: 'Assessment', proposedLevel: 'L1' } },
  imran: { reviewManager: 'Rakibul', career: { status: 'Assessment', proposedLevel: 'L1' } },
  drishty: { reviewManager: 'Shemanto', career: { status: 'Assessment', proposedLevel: 'L2' } },
  abbrar: { reviewManager: 'Shemanto', career: { status: 'Assessment', proposedLevel: 'L2' } },
};

export function getPerformanceRecord(slug: string) {
  const record = performanceRecords[slug] ?? {};

  const reviews: MonthlyPerformanceReview[] = (['October', 'November', 'December'] as const).map((month) => ({
    month,
    status: record.reviews?.[month]?.status ?? 'Pending',
    score: record.reviews?.[month]?.score,
    summary: record.reviews?.[month]?.summary,
    kpiScores: record.reviews?.[month]?.kpiScores,
    managerReview: record.reviews?.[month]?.managerReview,
  }));

  return {
    reviewManager: record.reviewManager,
    reviews,
    deliverables: record.deliverables ?? [],
    career: {
      status: record.career?.status ?? 'Evidence collection',
      proposedLevel: record.career?.proposedLevel,
      finalLevel: record.career?.finalLevel,
      summary: record.career?.summary,
    } satisfies CareerAssessmentRecord,
  };
}
