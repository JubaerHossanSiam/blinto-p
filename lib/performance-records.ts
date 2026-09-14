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
 * The website is the employee-facing presentation layer. ClickUp remains the operational
 * source of truth for work evidence and monthly review workflow; HRMS / People Ops remains
 * the source of truth for attendance and leave-policy evidence. Until live integrations are
 * connected, only approved snapshots should be added here and missing data must stay visibly
 * pending rather than being invented.
 *
 * Review Manager owns the final monthly review and score. Delivery Reviewer provides a
 * qualitative monthly summary based on delivery evidence already captured in ClickUp task
 * fields. Delivery Reviewer feedback must not create a second score or double-count the same
 * task-level evidence.
 */
export const performanceRecords: Record<string, EmployeePerformanceRecord> = {
  ifrat: {
    reviewManager: 'Fazle Rabbi',
    reviews: {
      September: {
        status: 'In review',
        score: 78,
        summary: 'September baseline review using the current sample/manual values so the review system can be evaluated before the formal October cycle.',
        kpiScores: {
          'Delivery & Reliability': 10,
          'Work Quality': 10,
          'Ownership': 8,
          'Communication': 8,
          'Problem Solving': 8,
          'Collaboration': 8,
          'Proactiveness': 6,
          'Business / Client Impact': 6,
          'Growth & Development': 6,
          'Role Excellence': 8,
        },
        managerReview: {
          wentWell: [
            'Strong ownership, communication, problem solving, and collaboration.',
            'Work quality is currently rated Exceptional in the baseline values.',
          ],
          needsImprovement: [
            'Identify delivery risks and improvement opportunities earlier instead of waiting for escalation.',
          ],
          nextPriorities: [
            'Flag delivery risks early.',
            'Propose at least one practical workflow improvement during the month.',
          ],
          managerSummary: 'Strong overall contribution in the September baseline, with proactiveness and earlier risk identification as the main development focus.',
        },
      },
    },
    career: { status: 'Assessment', proposedLevel: 'L2' },
  },
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

  const months: ReviewMonth[] = slug === 'ifrat'
    ? ['September', 'October', 'November', 'December']
    : ['October', 'November', 'December'];

  const reviews: MonthlyPerformanceReview[] = months.map((month) => ({
    month,
    status: record.reviews?.[month]?.status ?? 'Pending',
    score: record.reviews?.[month]?.score,
    summary: record.reviews?.[month]?.summary,
    kpiScores: record.reviews?.[month]?.kpiScores,
    managerReview: record.reviews?.[month]?.managerReview,
    deliveryReview: record.reviews?.[month]?.deliveryReview,
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
