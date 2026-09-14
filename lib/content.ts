import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const allowedFiles = new Set([
  'career-framework.md',
  'career-ladder-engineering.md',
  'career-ladder-design.md',
  'career-ladder-growth.md',
  'career-ladder-project-delivery.md',
  'career-ladder-people-operations-finance.md',
  'kpi-framework.md',
  'scoring-methodology.md',
  'monthly-kpi-review.md',
  'final-assessment.md',
  'role-success-plan-ifrat.md',
  'role-success-plan-rakibul.md',
  'role-success-plan-mukta.md',
  'role-success-plan-rafsan.md',
  'role-success-plan-munna.md',
  'role-success-plan-sayem.md',
  'role-success-plan-siam.md',
  'role-success-plan-usha.md',
  'role-success-plan-raihan.md',
  'role-success-plan-fatema.md',
  'role-success-plan-yasin.md',
  'role-success-plan-silvia.md',
  'role-success-plan-imran.md',
  'role-success-plan-drishty.md',
  'role-success-plan-abbrar.md',
]);

export function readFrameworkFile(fileName: string): string {
  if (!allowedFiles.has(fileName)) {
    throw new Error(`Unknown framework file: ${fileName}`);
  }

  return fs.readFileSync(path.join(ROOT, fileName), 'utf8');
}
