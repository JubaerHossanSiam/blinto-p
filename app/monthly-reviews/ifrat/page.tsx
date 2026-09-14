import type { Metadata } from 'next';
import { MonthlyReview } from '@/components/monthly-review';

export const metadata: Metadata = {
  title: 'Ifrat October Review Workspace',
  description: 'Working monthly review form for Ifrat. The approved result is presented on the employee Performance Card.',
  robots: { index: false, follow: false },
};

export default function IfratMonthlyReviewPage() {
  return <MonthlyReview />;
}
