export const ROUTES = {
  login: '/login',
  hospitals: '/hospitals',
  hospitalNew: '/hospitals/new',
  hospitalEdit: (id: string) => `/hospitals/${id}/edit`,
  home: '/home',
  timeline: '/timeline',
  visits: '/visits',
  docs: '/docs',
  nudge: '/nudge',
  info: '/info',
  client: '/client',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
