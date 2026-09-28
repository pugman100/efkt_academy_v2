import Link from 'next/link';
import type { ComponentProps, CSSProperties, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'navy' | 'tertiary' | 'onPhoto' | 'ghost' | 'danger';

type Common = {
  variant?: ButtonVariant;
  size?: 'sm' | 'md' | 'lg';
  iconRight?: string;
  iconLeft?: string;
  children?: ReactNode;
  style?: CSSProperties;
  className?: string;
};

function cls(variant: ButtonVariant, size: string, extra?: string) {
  return ['efkt-btn', `efkt-btn--${variant}`, size !== 'md' ? `efkt-btn--${size}` : '', extra ?? ''].filter(Boolean).join(' ');
}

function Inner({ iconLeft, iconRight, children }: Pick<Common, 'iconLeft' | 'iconRight' | 'children'>) {
  return (
    <>
      {iconLeft ? <i className={`ph ph-${iconLeft}`} style={{ fontSize: 20 }} aria-hidden /> : null}
      {children}
      {iconRight ? <i className={`ph ph-${iconRight}`} style={{ fontSize: 20 }} aria-hidden /> : null}
    </>
  );
}

/** EFKT button. Always fully rounded ends. Renders a Link when `href` is set. */
export function Button({
  variant = 'primary',
  size = 'md',
  iconRight,
  iconLeft,
  children,
  className,
  ...rest
}: Common & Omit<ComponentProps<'button'>, 'children'>) {
  return (
    <button type="button" className={cls(variant, size, className)} {...rest}>
      <Inner iconLeft={iconLeft} iconRight={iconRight}>{children}</Inner>
    </button>
  );
}

export function ButtonLink({
  variant = 'primary',
  size = 'md',
  iconRight,
  iconLeft,
  children,
  className,
  href,
  ...rest
}: Common & Omit<ComponentProps<typeof Link>, 'children'>) {
  return (
    <Link href={href} className={cls(variant, size, className)} {...rest}>
      <Inner iconLeft={iconLeft} iconRight={iconRight}>{children}</Inner>
    </Link>
  );
}
