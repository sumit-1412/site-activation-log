import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg';
}

const pad = { sm: 'p-3', md: 'p-3.5 sm:p-4', lg: 'p-4 sm:p-5' };

export function Card({ children, className = '', padding = 'md' }: CardProps) {
  return (
    <div
      className={`mb-3 w-full rounded-app border border-line bg-surface shadow-app sm:mb-4 ${pad[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
