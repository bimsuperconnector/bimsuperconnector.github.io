import { type ButtonHTMLAttributes, type AnchorHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'secondary-on-dark';

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-primary text-on-primary active:bg-primary-active hover:bg-primary-active',
  secondary:
    'bg-canvas text-ink border border-hairline hover:border-border-strong',
  'secondary-on-dark':
    'bg-canvas text-ink border border-hairline hover:border-border-strong',
};

const base =
  'inline-flex items-center justify-center rounded-lg px-lg py-md text-button font-medium transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', ...props }, ref) => (
    <button
      ref={ref}
      className={`${base} ${variantClasses[variant]} ${className}`}
      {...props}
    />
  ),
);
Button.displayName = 'Button';

type LinkButtonProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  variant?: Variant;
};

export function LinkButton({ variant = 'primary', className = '', ...props }: LinkButtonProps) {
  return <a className={`${base} ${variantClasses[variant]} ${className}`} {...props} />;
}
