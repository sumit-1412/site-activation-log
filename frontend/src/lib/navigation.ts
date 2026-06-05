import type { NavigateFunction } from 'react-router-dom';

let navigateFn: NavigateFunction | null = null;

export function registerNavigate(navigate: NavigateFunction): void {
  navigateFn = navigate;
}

export function appNavigate(to: string): void {
  navigateFn?.(to);
}
