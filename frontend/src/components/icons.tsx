import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IconCheck(props: IconProps) {
  return <svg {...base} strokeWidth={3} {...props}><polyline points="20 6 9 17 4 12" /></svg>;
}
export function IconCheckOk(props: IconProps) {
  return <svg {...base} strokeWidth={2} {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>;
}
export function IconCal(props: IconProps) {
  return <svg {...base} strokeWidth={2} {...props}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>;
}
export function IconSend(props: IconProps) {
  return <svg {...base} strokeWidth={2} {...props}><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" /></svg>;
}
export function IconAlert(props: IconProps) {
  return <svg {...base} strokeWidth={2} {...props}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 9v4M12 17h.01" /></svg>;
}
export function IconPhone(props: IconProps) {
  return <svg {...base} strokeWidth={2} {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" /></svg>;
}
export function IconChat(props: IconProps) {
  return <svg {...base} strokeWidth={2} {...props}><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z" /></svg>;
}
export function IconMail(props: IconProps) {
  return <svg {...base} strokeWidth={2} {...props}><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 5L2 7" /></svg>;
}
export function IconExt(props: IconProps) {
  return <svg {...base} strokeWidth={2} {...props}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><path d="M15 3h6v6M10 14 21 3" /></svg>;
}
export function IconChev({ className, ...props }: IconProps) {
  return (
    <svg
      {...base}
      strokeWidth={2}
      className={`h-3.5 w-3.5 shrink-0 stroke-ink3 transition-transform duration-200 ${className ?? ''}`.trim()}
      {...props}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
export function IconBack(props: IconProps) {
  return <svg {...base} strokeWidth={2} {...props}><polyline points="15 18 9 12 15 6" /></svg>;
}
export function IconLogOut(props: IconProps) {
  return <svg {...base} strokeWidth={2} {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>;
}
export function IconInbox(props: IconProps) {
  return <svg {...base} {...props}><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>;
}
export function IconPin(props: IconProps) {
  return <svg {...base} {...props}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
}
export function IconClock(props: IconProps) {
  return <svg {...base} strokeWidth={2} {...props}><circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" /></svg>;
}
export function IconSpinner(props: IconProps) {
  return <svg {...base} strokeWidth={2} {...props}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>;
}
export function IconDash(props: IconProps) {
  return <svg {...base} strokeWidth={2} {...props}><path d="M5 12h14" /></svg>;
}
export function IconDl(props: IconProps) {
  return <svg {...base} strokeWidth={2} {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
}
export function IconFile(props: IconProps) {
  return <svg {...base} strokeWidth={1.8} {...props}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>;
}
export function IconMic(props: IconProps) {
  return <svg {...base} strokeWidth={2} {...props}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8" /></svg>;
}
export function IconPlus(props: IconProps) {
  return <svg {...base} strokeWidth={2} {...props}><path d="M12 5v14M5 12h14" /></svg>;
}
export function IconBrand(props: IconProps) {
  return <svg {...base} strokeWidth={2.4} {...props}><path d="M4 6v12M4 12h16M20 6v12" /></svg>;
}
export function IconCopy(props: IconProps) {
  return <svg {...base} strokeWidth={2} {...props}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>;
}
