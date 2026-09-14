export type RoleDeliverable = {
  title: string;
  expectedResult: string;
};

export type RoleProfileData = {
  mission: string;
  deliverables: RoleDeliverable[];
  evidence: string;
};

export const kpis = [
  'Delivery & Reliability',
  'Work Quality',
  'Ownership',
  'Communication',
  'Problem Solving',
  'Collaboration',
  'Proactiveness',
  'Business / Client Impact',
  'Growth & Development',
  'Role Excellence',
] as const;

export const careerLevels = [
  { level: 'L1', name: 'Associate', meaning: 'Entry / Foundation', salaryBand: '৳25,000–৳35,000' },
  { level: 'L2', name: 'Executive / Specialist', meaning: 'Independent Contributor', salaryBand: '৳35,000–৳50,000' },
  { level: 'L3', name: 'Senior', meaning: 'Strong Ownership', salaryBand: '৳50,000–৳75,000' },
  { level: 'L4', name: 'Lead', meaning: 'Leads Work or Small Team', salaryBand: '৳75,000–৳110,000' },
  { level: 'L5', name: 'Principal / Manager', meaning: 'High Impact', salaryBand: '৳110,000–৳160,000' },
  { level: 'L6', name: 'Architect / Head', meaning: 'Department Authority', salaryBand: '৳160,000–৳240,000' },
  { level: 'L7', name: 'Director', meaning: 'Strategic Leadership', salaryBand: '৳240,000–৳350,000+' },
] as const;

export function getCareerLevel(level?: string) {
  return careerLevels.find((item) => item.level === level);
}

function section(content: string, headings: string[]): string {
  const lines = content.split(/\r?\n/);

  for (const heading of headings) {
    const target = `## ${heading}`.toLowerCase();
    const start = lines.findIndex((line) => line.trim().toLowerCase() === target);
    if (start === -1) continue;

    const collected: string[] = [];
    for (let index = start + 1; index < lines.length; index += 1) {
      const line = lines[index] ?? '';
      if (line.startsWith('## ')) break;
      collected.push(line);
    }

    return collected.join('\n').trim();
  }

  return '';
}

function cleanInline(value: string): string {
  return value
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function firstParagraph(value: string): string {
  return cleanInline(value.split(/\n\s*\n/)[0] ?? '');
}

function parseOutcomeList(value: string): RoleDeliverable[] {
  const deliverables: RoleDeliverable[] = [];

  for (const line of value.split(/\r?\n/)) {
    const match = /^\d+\.\s+\*\*(.+?)\*\*\s+[—-]\s+(.+)$/.exec(line.trim());
    if (!match) continue;

    deliverables.push({
      title: cleanInline(match[1] ?? ''),
      expectedResult: cleanInline(match[2] ?? ''),
    });
  }

  return deliverables;
}

function parseResponsibilityHeadings(value: string): RoleDeliverable[] {
  const lines = value.split(/\r?\n/);
  const deliverables: RoleDeliverable[] = [];

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index] ?? '';
    const match = /^###\s+(?:\d+\.\s+)?(.+)$/.exec(line.trim());
    if (!match) continue;

    const description: string[] = [];
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      const next = lines[cursor] ?? '';
      if (next.startsWith('### ')) break;
      description.push(next);
    }

    deliverables.push({
      title: cleanInline(match[1] ?? ''),
      expectedResult: firstParagraph(description.join('\n')),
    });
  }

  return deliverables;
}

function parseSuccessMeasures(value: string): RoleDeliverable[] {
  const deliverables: RoleDeliverable[] = [];

  for (const line of value.split(/\r?\n/)) {
    const match = /^-\s+\*\*(.+?):\*\*\s+(.+)$/.exec(line.trim());
    if (!match) continue;

    deliverables.push({
      title: cleanInline(match[1] ?? ''),
      expectedResult: cleanInline(match[2] ?? ''),
    });
  }

  return deliverables;
}

export function parseRoleProfile(content: string): RoleProfileData {
  const missionSource = section(content, ['Role purpose', 'Role Mission', 'Purpose']);
  const outcomeSource = section(content, ['Core success outcomes']);
  const responsibilitiesSource = section(content, ['Core Responsibilities']);
  const successMeasuresSource = section(content, ['Success Measures']);
  const evidenceSource = section(content, ['Observable evidence']);

  const outcomeDeliverables = parseOutcomeList(outcomeSource);
  const responsibilityDeliverables = parseResponsibilityHeadings(responsibilitiesSource);
  const deliverables = outcomeDeliverables.length > 0
    ? outcomeDeliverables
    : responsibilityDeliverables.length > 0
      ? responsibilityDeliverables
      : parseSuccessMeasures(successMeasuresSource);

  return {
    mission: firstParagraph(missionSource),
    deliverables,
    evidence: firstParagraph(evidenceSource),
  };
}
