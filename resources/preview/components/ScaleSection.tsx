import { EXPRESSIONS } from "../expressions"
import { SectionHeading } from "./SectionHeading"

const SIZES = [40, 64, 96] as const

export function ScaleSection() {
  return (
    <section aria-labelledby="scale-title" className="mt-24">
      <SectionHeading
        id="scale-title"
        eyebrow="04 · Scale"
        title="Legible at interface sizes."
      >
        The same files rendered at companion sizes. Leans, glances and squashes
        stay readable even when Whyte is tucked into a corner of the interface.
      </SectionHeading>

      <div className="mt-8 overflow-x-auto rounded-[22px] bg-white ring-1 ring-line">
        <div className="min-w-[760px] divide-y divide-line">
          {SIZES.map((size) => (
            <div key={size} className="flex items-center gap-4 px-5 py-4">
              <span className="w-12 shrink-0 font-mono text-[11px] text-ink-3">
                {size} px
              </span>
              <div className="grid flex-1 grid-cols-8 place-items-center gap-3">
                {EXPRESSIONS.map((expression) => (
                  <img
                    key={expression.name}
                    src={expression.url}
                    alt=""
                    width={size}
                    height={size}
                    className="rounded-[10px] bg-stage"
                  />
                ))}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-4 px-5 py-3">
            <span className="w-12 shrink-0" />
            <div className="grid flex-1 grid-cols-8 gap-3 text-center text-[12px] text-ink-2">
              {EXPRESSIONS.map((expression) => (
                <span key={expression.name}>{expression.label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
