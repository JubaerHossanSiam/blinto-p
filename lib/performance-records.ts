export type ReviewStatus = 'Pending' | 'In review' | 'Complete';

export type ReviewMonth = 'September' | 'October' | 'November' | 'December';

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

export type DeliveryReviewerFeedback = {
  strengths?: string[];
  improvementPatterns?: string[];
  context?: string;
  summary?: string;
};

export type MonthlyPerformanceReview = {
  month: ReviewMonth;
  status: ReviewStatus;
  score?: number;
  summary?: string;
  kpiScores?: Partial<Record<KpiName, number>>;
  managerReview?: ManagerReviewRecord;
  deliveryReview?: DeliveryReviewerFeedback;
  isTest?: boolean;
  assessmentEligible?: boolean;
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
  deliveryReviewer?: string;
  reviews?: Partial<Record<ReviewMonth, Partial<MonthlyPerformanceReview>>>;
  deliverables?: DeliverableRecord[];
  career?: Partial<CareerAssessmentRecord>;
};

/**
 * Employee Performance Card data layer.
 *
 * September 2026 is a live trial period. Real ClickUp and manager-review data are collected and
 * displayed so the team uses the actual workflow. September remains assessment-ineligible and
 * must never be included in career-level, promotion, salary, or official monthly totals.
 */

export const performanceRecords: Record<string, EmployeePerformanceRecord> = {
  ifrat: { reviewManager: 'Fazle Rabbi', career: { status: 'Assessment', proposedLevel: 'L2' } },
  rakibul: { reviewManager: 'Fazle Rabbi', deliveryReviewer: 'Ifrat Jahan Chowdhury', career: { status: 'Assessment', proposedLevel: 'L3' } },
  rafsan: { reviewManager: 'Fazle Rabbi', career: { status: 'Assessment', proposedLevel: 'L3' } },
  munna: { reviewManager: 'Abu Sayem', deliveryReviewer: 'Ifrat Jahan Chowdhury', career: { status: 'Assessment', proposedLevel: 'L1' } },
  sayem: { reviewManager: 'Fazle Rabbi', deliveryReviewer: 'Ifrat Jahan Chowdhury', career: { status: 'Assessment', proposedLevel: 'L1' } },
  siam: { reviewManager: 'Fazle Rabbi', deliveryReviewer: 'Ifrat Jahan Chowdhury', career: { status: 'Assessment', proposedLevel: 'L2' } },
  usha: { reviewManager: 'Siam', deliveryReviewer: 'Ifrat Jahan Chowdhury', career: { status: 'Assessment', proposedLevel: 'L1' } },
  raihan: { reviewManager: 'Siam', deliveryReviewer: 'Ifrat Jahan Chowdhury', career: { status: 'Assessment', proposedLevel: 'L1' } },
  fatema: { reviewManager: 'Siam', deliveryReviewer: 'Ifrat Jahan Chowdhury', career: { status: 'Assessment', proposedLevel: 'L1' } },
  yasin: { reviewManager: 'Siam', deliveryReviewer: 'Ifrat Jahan Chowdhury', career: { status: 'Assessment', proposedLevel: 'L1' } },
  silvia: { reviewManager: 'Rakibul', deliveryReviewer: 'Ifrat Jahan Chowdhury', career: { status: 'Assessment', proposedLevel: 'L1' } },
  imran: { reviewManager: 'Rakibul', deliveryReviewer: 'Ifrat Jahan Chowdhury', career: { status: 'Assessment', proposedLevel: 'L1' } },
  drishty: { reviewManager: 'Shemanto', deliveryReviewer: 'Ifrat Jahan Chowdhury', career: { status: 'Assessment', proposedLevel: 'L2' } },
  abbrar: { reviewManager: 'Shemanto', deliveryReviewer: 'Ifrat Jahan Chowdhury', career: { status: 'Assessment', proposedLevel: 'L2' } },
};

export function getPerformanceRecord(slug: string) {
  const record = performanceRecords[slug] ?? {};
  const months: ReviewMonth[] = ['September', 'October', 'November', 'December'];

  const reviews: MonthlyPerformanceReview[] = months.map((month) => ({
    month,
    status: record.reviews?.[month]?.status ?? 'Pending',
    score: record.reviews?.[month]?.score,
    summary: record.reviews?.[month]?.summary,
    kpiScores: record.reviews?.[month]?.kpiScores,
    managerReview: record.reviews?.[month]?.managerReview,
    deliveryReview: record.reviews?.[month]?.deliveryReview,
    isTest: record.reviews?.[month]?.isTest ?? false,
    assessmentEligible: record.reviews?.[month]?.assessmentEligible ?? month !== 'September',
  }));

  return {
    reviewManager: record.reviewManager,
    deliveryReviewer: record.deliveryReviewer,
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
