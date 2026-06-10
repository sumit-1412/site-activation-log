/** Production frontend — update if the Vercel URL changes. */
export const PRODUCTION_APP_URL = 'https://site-activation-log.vercel.app';

export const LOCAL_APP_URL = 'http://localhost:5173';

export const appUrl = import.meta.env.VITE_APP_URL || (import.meta.env.DEV ? LOCAL_APP_URL : PRODUCTION_APP_URL);

export const apiBase = import.meta.env.VITE_API_URL || '/api';
