import { Check, Minus, X } from "lucide-react"
import { EXPRESSIONS } from "../expressions"
import { CHECKS } from "../svg-report"
import type { ExpressionFiles } from "../useExpressionFiles"
import { SectionHeading } from "./SectionHeading"

const RULES = [
  {
    title: "Three elements",
    text: "Every file is one body and two eyes — three ellipses, nothing added, no groups, gradients or filters.",
  },
  {
    title: "Squash & stretch",
    text: "Body proportions flex by 7% at most and stay anchored to the shared base line at y 308.",
  },
  {
    title: "Tilt",
    text: "Leans of up to 11° pivot low in the body at (200, 270), so they feel weighted and stay centred.",
  },
  {
    title: "Eyes",
    text: "The 14 × 28 oval holds; expressive scaling never exceeds 12% and the eyes stay well inside the body.",
  },
] as const

export function ConsistencySection({ files }: { files: ExpressionFiles }) {
  return (
    <section aria-labelledby="consistency-title" className="mt-24">
      <SectionHeading
        id="consistency-title"
        eyebrow="03 · Consistency"
        title="Same character, every time."
      >
        All eight files layered on one canvas: the ink is darkest where they
        agree. Below, every file is parsed live and checked against the
        character rules.
      </SectionHeading>

      <div className="mt-8 grid gap-4 lg:grid-cols-12">
        <figure className="rounded-[22px] bg-white p-2 ring-1 ring-line lg:col-span-5 lg:self-start">
          <div className="relative aspect-square overflow-hidden rounded-[16px] bg-stage">
            {EXPRESSIONS.map((expression) => (
              <img
                key={expression.name}
                src={expression.url}
                alt=""
                className="absolute inset-0 size-full scale-[1.45] opacity-35 mix-blend-multiply"
              />
            ))}
          </div>
          <figcaption className="flex items-center justify-between px-3 pb-1.5 pt-3 text-[12px] text-ink-3">
            <span>All eight expressions, overlaid</span>
            <span className="font-mono text-[11px]">8 × 3 ellipses</span>
          </figcaption>
        </figure>

        <div className="flex flex-col gap-4 lg:col-span-7">
          <div className="overflow-x-auto rounded-[22px] bg-white ring-1 ring-line">
            <table className="w-full min-w-[560px] text-left text-[13px]">
              <caption className="sr-only">
                Rule checks for each expression file
              </caption>
              <thead>
                <tr className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-3">
                  <th scope="col" className="px-5 py-3.5 font-normal">
                    File
                  </th>
                  {CHECKS.map((check) => (
                    <th
                      key={check.id}
                      scope="col"
                      className="px-2 py-3.5 text-center font-normal"
                    >
                      {check.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {EXPRESSIONS.map((expression) => {
                  const file = files[expression.name]
                  const report = file.state === "ready" ? file.report : null
                  return (
                    <tr key={expression.name} className="border-t border-line">
                      <th
                        scope="row"
                        className="px-5 py-2.5 font-mono text-[12px] font-normal text-ink"
                      >
                        {expression.file}
                      </th>
                      {CHECKS.map((check) => (
                        <td key={check.id} className="px-2 py-2.5">
                          <CheckMark
                            state={
                              file.state === "loading"
                                ? "pending"
                                : report?.checks[check.id]
                                  ? "pass"
                                  : "fail"
                            }
                          />
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {RULES.map((rule) => (
              <li
                key={rule.title}
                className="rounded-[18px] bg-white p-4 ring-1 ring-line"
              >
                <p className="text-[13.5px] font-medium">{rule.title}</p>
                <p className="mt-1 text-[13px] leading-[1.5] text-ink-2">
                  {rule.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function CheckMark({ state }: { state: "pass" | "fail" | "pending" }) {
  if (state === "pending") {
    return (
      <Minus className="mx-auto size-3.5 text-ink-3" aria-label="Checking" />
    )
  }
  if (state === "fail") {
    return (
      <span className="mx-auto grid size-5 place-items-center rounded-full bg-guide text-white">
        <X className="size-3" strokeWidth={3} aria-label="Fails" />
      </span>
    )
  }
  return (
    <span className="mx-auto grid size-5 place-items-center rounded-full bg-ink text-paper">
      <Check className="size-3" strokeWidth={3} aria-label="Passes" />
    </span>
  )
}
