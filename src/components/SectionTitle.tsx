import { clsx } from 'clsx'

export function SectionTitle({
  kicker,
  title,
  className,
}: {
  kicker?: string
  title: string
  className?: string
}) {
  return (
    <div className={clsx('space-y-3', className)}>
      {kicker ? (
        <div className="text-xs uppercase tracking-wide2 text-ember font-display opacity-95">
          {kicker}
        </div>
      ) : null}
      <h2 className="font-display text-2xl md:text-4xl leading-tight">
        {title}
      </h2>
    </div>
  )
}
