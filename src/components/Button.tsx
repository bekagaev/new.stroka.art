import Link from 'next/link'
import { clsx } from 'clsx'

export function Button({
  href,
  children,
  variant = 'primary',
  className,
}: {
  href: string
  children: React.ReactNode
  variant?: 'primary' | 'ghost'
  className?: string
}) {
  const base =
    'inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-ember/40'

  const styles =
    variant === 'primary'
      ? 'bg-ember text-ink shadow-glow hover:bg-ember2'
      : 'bg-white/0 text-fog ring-1 ring-white/15 hover:ring-white/25 hover:bg-white/5'

  return (
    <Link href={href} className={clsx(base, styles, className)}>
      {children}
    </Link>
  )
}
