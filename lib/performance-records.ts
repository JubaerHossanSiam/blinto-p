export type ReviewStatus = 'Pending' | 'In review' | 'Complete';

export type MonthlyPerformanceReview = {
  month: 'October' | 'November' | 'December';
  status: ReviewStatus;
  score?: number;
  summary?: string;
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
  reviews?: Partial<Record<'October' | 'November' | 'December', Partial<MonthlyPerformanceReview>>>;
  deliverables?: DeliverableRecord[];
  career?: Partial<CareerAssessmentRecord>;
};

/**
 * Read-only website snapshot.
 *
 * ClickUp remains the operational source of truth. When a monthly review, deliverable status,
 * or career decision should be reflected on the website, add only the approved summary here.
 * Vercel will publish the updated snapshot after the repository changes.
 */
export const performanceRecords: Record<string, EmployeePerformanceRecord> = {
  ifrat: { career: { status: 'Assessment', proposedLevel: 'L2' } },
  rakibul: { career: { status: 'Assessment', proposedLevel: 'L3' } },
  rafsan: { career: { status: 'Assessment', proposedLevel: 'L3' } },
  munna: { career: { status: 'Assessment', proposedLevel: 'L1' } },
  sayem: { career: { status: 'Assessment', proposedLevel: 'L1' } },
  siam: { career: { status: 'Assessment', proposedLevel: 'L2' } },
  usha: { career: { status: 'Assessment', proposedLevel: 'L1' } },
  raihan: { career: { status: 'Assessment', proposedLevel: 'L1' } },
  fatema: { career: { status: 'Assessment', proposedLevel: 'L1' } },
  yasin: { career: { status: 'Assessment', proposedLevel: 'L1' } },
  silvia: { career: { status: 'Assessment', proposedLevel: 'L1' } },
  imran: { career: { status: 'Assessment', proposedLevel: 'L1' } },
  drishty: { career: { status: 'Assessment', proposedLevel: 'L2' } },
  abbrar: { career: { status: 'Assessment', proposedLevel: 'L2' } },
};

export function getPerformanceRecord(slug: string) {
  const record = performanceRecords[slug] ?? {};

  const reviews: MonthlyPerformanceReview[] = (['October', 'November', 'December'] as const).map((month) => ({
    month,
    status: record.reviews?.[month]?.status ?? 'Pending',
    score: record.reviews?.[month]?.score,
    summary: record.reviews?.[month]?.summary,
  }));

  return {
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
