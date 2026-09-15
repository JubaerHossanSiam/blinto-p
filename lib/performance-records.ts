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
 * September 2026 is a trial period. Test values exist for every active employee so the full
 * workflow can be exercised before the official counted cycle begins on October 1. September
 * data must never be used in career-level, promotion, or salary-review calculations.
 */
function septemberTrialReview(seed: number): Partial<MonthlyPerformanceReview> {
  const ratingSets = [
    [8, 8, 8, 8, 8, 8, 6, 6, 6, 8],
    [8, 8, 8, 6, 8, 8, 6, 6, 8, 8],
    [8, 8, 6, 8, 8, 8, 8, 6, 6, 8],
    [8, 6, 8, 8, 8, 8, 6, 8, 6, 8],
  ];
  const values = ratingSets[seed % ratingSets.length];
  const score = values.reduce((sum, value) => sum + value, 0);

  return {
    status: 'In review',
    score,
    isTest: true,
    assessmentEligible: false,
    summary: 'September trial data for workflow testing only. This score is simulated and does not count toward the October 1–December 10 career-assessment window.',
    kpiScores: {
      'Delivery & Reliability': values[0],
      'Work Quality': values[1],
      'Ownership': values[2],
      'Communication': values[3],
      'Problem Solving': values[4],
      'Collaboration': values[5],
      'Proactiveness': values[6],
      'Business / Client Impact': values[7],
      'Growth & Development': values[8],
      'Role Excellence': values[9],
    },
    managerReview: {
      wentWell: ['Trial review data loaded successfully for end-to-end workflow testing.'],
      needsImprovement: ['Replace simulated September values with real October evidence when the official cycle begins.'],
      nextPriorities: ['Complete the September trial workflow and report any issues before October 1.'],
      managerSummary: 'Trial data only — excluded from career assessment and compensation decisions.',
    },
  };
}

export const performanceRecords: Record<string, EmployeePerformanceRecord> = {
  ifrat: { reviewManager: 'Fazle Rabbi', reviews: { September: septemberTrialReview(0) }, career: { status: 'Assessment', proposedLevel: 'L2' } },
  rakibul: { reviewManager: 'Fazle Rabbi', deliveryReviewer: 'Ifrat Jahan Chowdhury', reviews: { September: septemberTrialReview(1) }, career: { status: 'Assessment', proposedLevel: 'L3' } },
  rafsan: { reviewManager: 'Fazle Rabbi', reviews: { September: septemberTrialReview(2) }, career: { status: 'Assessment', proposedLevel: 'L3' } },
  munna: { reviewManager: 'Abu Sayem', deliveryReviewer: 'Ifrat Jahan Chowdhury', reviews: { September: septemberTrialReview(3) }, career: { status: 'Assessment', proposedLevel: 'L1' } },
  sayem: { reviewManager: 'Fazle Rabbi', deliveryReviewer: 'Ifrat Jahan Chowdhury', reviews: { September: septemberTrialReview(0) }, career: { status: 'Assessment', proposedLevel: 'L1' } },
  siam: { reviewManager: 'Fazle Rabbi', deliveryReviewer: 'Ifrat Jahan Chowdhury', reviews: { September: septemberTrialReview(1) }, career: { status: 'Assessment', proposedLevel: 'L2' } },
  usha: { reviewManager: 'Siam', deliveryReviewer: 'Ifrat Jahan Chowdhury', reviews: { September: septemberTrialReview(2) }, career: { status: 'Assessment', proposedLevel: 'L1' } },
  raihan: { reviewManager: 'Siam', deliveryReviewer: 'Ifrat Jahan Chowdhury', reviews: { September: septemberTrialReview(3) }, career: { status: 'Assessment', proposedLevel: 'L1' } },
  fatema: { reviewManager: 'Siam', deliveryReviewer: 'Ifrat Jahan Chowdhury', reviews: { September: septemberTrialReview(0) }, career: { status: 'Assessment', proposedLevel: 'L1' } },
  yasin: { reviewManager: 'Siam', deliveryReviewer: 'Ifrat Jahan Chowdhury', reviews: { September: septemberTrialReview(1) }, career: { status: 'Assessment', proposedLevel: 'L1' } },
  silvia: { reviewManager: 'Rakibul', deliveryReviewer: 'Ifrat Jahan Chowdhury', reviews: { September: septemberTrialReview(2) }, career: { status: 'Assessment', proposedLevel: 'L1' } },
  imran: { reviewManager: 'Rakibul', deliveryReviewer: 'Ifrat Jahan Chowdhury', reviews: { September: septemberTrialReview(3) }, career: { status: 'Assessment', proposedLevel: 'L1' } },
  drishty: { reviewManager: 'Shemanto', deliveryReviewer: 'Ifrat Jahan Chowdhury', reviews: { September: septemberTrialReview(0) }, career: { status: 'Assessment', proposedLevel: 'L2' } },
  abbrar: { reviewManager: 'Shemanto', deliveryReviewer: 'Ifrat Jahan Chowdhury', reviews: { September: septemberTrialReview(1) }, career: { status: 'Assessment', proposedLevel: 'L2' } },
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
