export type PersonProfile = {
  slug: string;
  name: string;
  role: string;
  function: string;
  manager: string;
  roleFile: string;
};

export const people: PersonProfile[] = [
  { slug: 'ifrat', name: 'Ifrat', role: 'Project Manager / Website & Growth Lead', function: 'Project Delivery', manager: 'Fazle Rabbi', roleFile: 'role-success-plan-ifrat.md' },
  { slug: 'rakibul', name: 'Rakibul', role: 'Shopify App & Growth Lead', function: 'Growth', manager: 'Fazle Rabbi', roleFile: 'role-success-plan-rakibul.md' },
  { slug: 'rafsan', name: 'Rafsan Zahid', role: 'Chief of Staff', function: 'CEO Office', manager: 'Fazle Rabbi', roleFile: 'role-success-plan-rafsan.md' },
  { slug: 'munna', name: 'Munna', role: 'Software Developer', function: 'Engineering', manager: 'Sayem', roleFile: 'role-success-plan-munna.md' },
  { slug: 'sayem', name: 'Sayem', role: 'Backend Engineer / Technical Lead', function: 'Engineering', manager: 'Fazle Rabbi', roleFile: 'role-success-plan-sayem.md' },
  { slug: 'siam', name: 'Siam', role: 'Senior Frontend Developer', function: 'Engineering', manager: 'Fazle Rabbi', roleFile: 'role-success-plan-siam.md' },
  { slug: 'usha', name: 'Usha', role: 'Frontend Developer', function: 'Engineering', manager: 'Siam', roleFile: 'role-success-plan-usha.md' },
  { slug: 'raihan', name: 'Raihan', role: 'Frontend Developer', function: 'Engineering', manager: 'Siam', roleFile: 'role-success-plan-raihan.md' },
  { slug: 'fatema', name: 'Fatema', role: 'Frontend Developer', function: 'Engineering', manager: 'Siam', roleFile: 'role-success-plan-fatema.md' },
  { slug: 'yasin', name: 'Yasin', role: 'Frontend Developer', function: 'Engineering', manager: 'Siam', roleFile: 'role-success-plan-yasin.md' },
  { slug: 'silvia', name: 'Silvia', role: 'UI/UX Designer', function: 'Design', manager: 'Rakibul', roleFile: 'role-success-plan-silvia.md' },
  { slug: 'imran', name: 'Imran', role: 'Product Designer', function: 'Design', manager: 'Rakibul', roleFile: 'role-success-plan-imran.md' },
  { slug: 'drishty', name: 'Drishty', role: 'Content Strategist', function: 'Growth', manager: 'Shemanto', roleFile: 'role-success-plan-drishty.md' },
  { slug: 'abbrar', name: 'Abbrar', role: 'SEO Executive', function: 'Growth', manager: 'Shemanto', roleFile: 'role-success-plan-abbrar.md' },
];

export function getPerson(slug: string): PersonProfile | undefined {
  return people.find((person) => person.slug === slug);
}
