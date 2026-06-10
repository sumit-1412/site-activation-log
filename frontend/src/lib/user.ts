import type { AuthUser } from '../api/auth';

/** Display name for nudges, visits, and UI — derived from the signed-in account. */
export function displayNameFromUser(user: AuthUser | null | undefined): string {
  if (!user) return 'Humblx Team';
  if (user.name?.trim()) return user.name.trim();
  if (user.email && user.email !== 'local') {
    const local = user.email.split('@')[0] ?? '';
    return local
      .split(/[._-]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }
  return 'Humblx Team';
}

export function firstNameFromUser(user: AuthUser | null | undefined): string {
  return displayNameFromUser(user).split(' ')[0] ?? 'there';
}

/** Humblx lead on a hospital — saved value or signed-in user. */
export function humblxPocName(saved: string | undefined, user: AuthUser | null | undefined): string {
  const trimmed = saved?.trim();
  if (trimmed) return trimmed;
  return displayNameFromUser(user);
}
