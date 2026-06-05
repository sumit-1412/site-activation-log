export const ROUTES = {
  setup: '/setup',
  home: '/home',
  timeline: '/timeline',
  visits: '/visits',
  docs: '/docs',
  nudge: '/nudge',
  info: '/info',
  client: '/client',
} as const;

export type AppRoute = (typeof ROUTES)[keyof typeof ROUTES];
