// Shared metadata used by both TemplatesView and the project-creation wizard
// so the two surfaces stay visually consistent.

export const IDEAL_FOR = {
  'starter-1': 'SaaS landing pages and startups',
  'starter-2': 'Creative agencies and tech brands',
  'starter-3': 'Cafes, bakeries, and artisan shops',
  'starter-4': 'Consultants, law firms, and finance',
  'starter-5': 'Magazines, publications, and content sites',
  'starter-6': 'Portfolios and product showcases',
  'starter-7': 'B2B SaaS and product launches',
  'starter-8': 'Personal brands and single-product pages',
  'starter-9': 'High-converting sales pages',
  'starter-10': 'Premium brands and luxury services',
  'starter-11': 'Feature-rich products and platforms',
  'starter-12': 'Local service businesses',
  'starter-13': 'Neighborhood-focused businesses',
  'starter-14': 'Enterprise and B2B services',
  'starter-15': 'Creative agencies and studios',
  'starter-16': 'Upscale local businesses',
  'starter-17': 'Product comparison reviews',
  'starter-18': 'Tutorials and step-by-step guides',
  'starter-19': '"Best of" roundups and rankings',
};

export const CATEGORY_STYLE = {
  'General': {
    bg: 'bg-teal-50 dark:bg-teal-500/10',
    fg: 'text-teal-600 dark:text-teal-400',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
  },
  'Local Business': {
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    fg: 'text-amber-600 dark:text-amber-400',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
  },
  'Professional Services': {
    bg: 'bg-blue-50 dark:bg-blue-500/10',
    fg: 'text-blue-600 dark:text-blue-400',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
  },
  'Premium': {
    bg: 'bg-violet-50 dark:bg-violet-500/10',
    fg: 'text-violet-600 dark:text-violet-400',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3z"/></svg>
  },
  'Blog': {
    bg: 'bg-rose-50 dark:bg-rose-500/10',
    fg: 'text-rose-600 dark:text-rose-400',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13h6M9 17h4"/></svg>
  },
  'Custom': {
    bg: 'bg-teal-50 dark:bg-teal-500/10',
    fg: 'text-teal-600 dark:text-teal-400',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
  },
};

export const styleForTemplate = (t) => {
  if (t._isUserTemplate) return CATEGORY_STYLE['Custom'];
  return CATEGORY_STYLE[t.category] || CATEGORY_STYLE['General'];
};
