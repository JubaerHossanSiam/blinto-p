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
  'task-rating-guide.md',
  'performance-rules.md',
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

// These markdown files ship with the deployment and never change at runtime,
// but they were re-read from disk on every render — a blocking readFileSync on
// the request path of nine routes. Reading each one once and keeping it is
// enough; the allowlist check still runs on every call.
// Not cached in development, so editing a markdown file still shows up on
// reload without restarting the dev server.
const cacheContents = process.env.NODE_ENV === 'production';
const fileCache = new Map<string, string>();

export function readFrameworkFile(fileName: string): string {
  if (!allowedFiles.has(fileName)) {
    throw new Error(`Unknown framework file: ${fileName}`);
  }

  const cached = fileCache.get(fileName);
  if (cached !== undefined) return cached;

  const contents = fs.readFileSync(path.join(ROOT, fileName), 'utf8');
  if (cacheContents) fileCache.set(fileName, contents);
  return contents;
}
