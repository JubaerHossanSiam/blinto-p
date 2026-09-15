export type PersonProfile = {
  slug: string;
  name: string;
  role: string;
  function: string;
  manager: string;
  roleFile: string;
  clickupUserId?: string;
};

export const people: PersonProfile[] = [
  { slug: 'ifrat', name: 'Ifrat', role: 'Project Manager / Website & Growth Lead', function: 'Project Delivery', manager: 'Fazle Rabbi', roleFile: 'role-success-plan-ifrat.md', clickupUserId: '107691172' },
  { slug: 'rakibul', name: 'Rakibul', role: 'Shopify App & Growth Lead', function: 'Growth', manager: 'Fazle Rabbi', roleFile: 'role-success-plan-rakibul.md', clickupUserId: '107634631' },
  { slug: 'rafsan', name: 'Rafsan Zahid', role: 'Chief of Staff', function: 'CEO Office', manager: 'Fazle Rabbi', roleFile: 'role-success-plan-rafsan.md', clickupUserId: '95582076' },
  { slug: 'munna', name: 'Munna', role: 'Software Developer', function: 'Engineering', manager: 'Sayem', roleFile: 'role-success-plan-munna.md', clickupUserId: '308419016' },
  { slug: 'sayem', name: 'Sayem', role: 'Backend Engineer / Technical Lead', function: 'Engineering', manager: 'Fazle Rabbi', roleFile: 'role-success-plan-sayem.md', clickupUserId: '254513990' },
  { slug: 'siam', name: 'Siam', role: 'Senior Frontend Developer', function: 'Engineering', manager: 'Fazle Rabbi', roleFile: 'role-success-plan-siam.md', clickupUserId: '95582077' },
  { slug: 'usha', name: 'Usha', role: 'Frontend Developer', function: 'Engineering', manager: 'Siam', roleFile: 'role-success-plan-usha.md', clickupUserId: '95641534' },
  { slug: 'raihan', name: 'Raihan', role: 'Frontend Developer', function: 'Engineering', manager: 'Siam', roleFile: 'role-success-plan-raihan.md', clickupUserId: '95598382' },
  { slug: 'fatema', name: 'Fatema', role: 'Frontend Developer', function: 'Engineering', manager: 'Siam', roleFile: 'role-success-plan-fatema.md', clickupUserId: '95598379' },
  { slug: 'yasin', name: 'Yasin', role: 'Frontend Developer', function: 'Engineering', manager: 'Siam', roleFile: 'role-success-plan-yasin.md', clickupUserId: '284632917' },
  { slug: 'silvia', name: 'Silvia', role: 'UI/UX Designer', function: 'Design', manager: 'Rakibul', roleFile: 'role-success-plan-silvia.md', clickupUserId: '95588205' },
  { slug: 'imran', name: 'Imran', role: 'Product Designer', function: 'Design', manager: 'Rakibul', roleFile: 'role-success-plan-imran.md', clickupUserId: '95583466' },
  { slug: 'drishty', name: 'Drishty', role: 'Content Strategist', function: 'Growth', manager: 'Shemanto', roleFile: 'role-success-plan-drishty.md', clickupUserId: '296484484' },
  { slug: 'abbrar', name: 'Abbrar', role: 'SEO Executive', function: 'Growth', manager: 'Shemanto', roleFile: 'role-success-plan-abbrar.md', clickupUserId: '216007117' },
];

export function getPerson(slug: string): PersonProfile | undefined {
  return people.find((person) => person.slug === slug);
}
