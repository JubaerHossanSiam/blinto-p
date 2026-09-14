import type { Metadata } from 'next';
import { MonthlyReview } from '@/components/monthly-review';

export const metadata: Metadata = {
  title: 'Ifrat Monthly Performance Review',
  description: 'Blinto monthly performance review template with evidence, KPI benchmarks, manager feedback, employee reflection, and final scoring.',
  robots: { index: false, follow: false },
};

export default function IfratMonthlyReviewPage() {
  return <MonthlyReview />;
}
