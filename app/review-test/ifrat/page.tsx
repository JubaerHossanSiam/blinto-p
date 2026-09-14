import type { Metadata } from 'next';
import { MonthlyReviewTest } from '@/components/monthly-review-test';

export const metadata: Metadata = {
  title: 'Ifrat Monthly Review · TEST',
  description: 'A simulated monthly review with HRMS test inputs, manager feedback, employee reflection, and a transparent KPI breakdown.',
  robots: { index: false, follow: false },
};

export default function IfratReviewTestPage() {
  return <MonthlyReviewTest />;
}
