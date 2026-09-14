export type PersonProfile = {
  slug: string;
  name: string;
  role: string;
  function: string;
  roleFile: string;
};

export const people: PersonProfile[] = [
  { slug: 'ifrat', name: 'Ifrat', role: 'Project Manager / Website & Growth Lead', function: 'Project Delivery', roleFile: 'role-success-plan-ifrat.md' },
  { slug: 'rakibul', name: 'Rakibul', role: 'Shopify App & Growth Lead', function: 'Growth', roleFile: 'role-success-plan-rakibul.md' },
  { slug: 'mukta', name: 'Jannatul Mukta', role: 'People & Operations Executive', function: 'People & Operations', roleFile: 'role-success-plan-mukta.md' },
  { slug: 'rafsan', name: 'Rafsan Zahid', role: 'Chief of Staff', function: 'CEO Office', roleFile: 'role-success-plan-rafsan.md' },
  { slug: 'munna', name: 'Munna', role: 'Software Developer', function: 'Engineering', roleFile: 'role-success-plan-munna.md' },
  { slug: 'sayem', name: 'Sayem', role: 'Backend Engineer / Technical Lead', function: 'Engineering', roleFile: 'role-success-plan-sayem.md' },
  { slug: 'siam', name: 'Siam', role: 'Senior Frontend Developer', function: 'Engineering', roleFile: 'role-success-plan-siam.md' },
  { slug: 'usha', name: 'Usha', role: 'Frontend Developer', function: 'Engineering', roleFile: 'role-success-plan-usha.md' },
  { slug: 'raihan', name: 'Raihan', role: 'Frontend Developer', function: 'Engineering', roleFile: 'role-success-plan-raihan.md' },
  { slug: 'fatema', name: 'Fatema', role: 'Frontend Developer', function: 'Engineering', roleFile: 'role-success-plan-fatema.md' },
  { slug: 'yasin', name: 'Yasin', role: 'Frontend Developer', function: 'Engineering', roleFile: 'role-success-plan-yasin.md' },
  { slug: 'silvia', name: 'Silvia', role: 'UI/UX Designer', function: 'Design', roleFile: 'role-success-plan-silvia.md' },
  { slug: 'imran', name: 'Imran', role: 'Product Designer', function: 'Design', roleFile: 'role-success-plan-imran.md' },
  { slug: 'drishty', name: 'Drishty', role: 'Content Strategist', function: 'Growth', roleFile: 'role-success-plan-drishty.md' },
  { slug: 'abbrar', name: 'Abbrar', role: 'SEO Executive', function: 'Growth', roleFile: 'role-success-plan-abbrar.md' },
];

export function getPerson(slug: string): PersonProfile | undefined {
  return people.find((person) => person.slug === slug);
}
