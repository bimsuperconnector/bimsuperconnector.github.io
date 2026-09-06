import type { PropsWithChildren } from 'react';

export function Container({ children, className = '' }: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={`mx-auto w-full max-w-content px-lg md:px-xxl ${className}`}>
      {children}
    </div>
  );
}
