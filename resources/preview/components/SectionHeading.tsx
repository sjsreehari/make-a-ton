import type { ReactNode } from "react"
import { EYEBROW } from "../styles"

interface SectionHeadingProps {
  id: string
  eyebrow: string
  title: string
  children: ReactNode
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  children,
}: SectionHeadingProps) {
  return (
    <div className="grid gap-4 border-t border-line pt-6 lg:grid-cols-12 lg:gap-10">
      <div className="lg:col-span-6">
        <p className={EYEBROW}>{eyebrow}</p>
        <h2
          id={id}
          className="mt-3 font-display text-[38px] leading-none tracking-[-0.01em] sm:text-[46px]"
        >
          {title}
        </h2>
      </div>
      <p className="max-w-[52ch] text-[14.5px] leading-[1.6] text-ink-2 lg:col-span-5 lg:col-start-8 lg:self-end">
        {children}
      </p>
    </div>
  )
}
