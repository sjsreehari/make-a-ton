import { EXPRESSIONS, EXPRESSIONS_PATH } from "../expressions"
import { CodeBlock } from "./CodeBlock"
import { SectionHeading } from "./SectionHeading"

const map = EXPRESSIONS.map(
  (e) => `  ${e.name}: '/${EXPRESSIONS_PATH}${e.file}',`,
).join("\n")

const REACT_SNIPPET = `const expressions = {
${map}
} as const

export type WhyteExpression = keyof typeof expressions

export function Whyte({ expression = 'idle', size = 120 }: {
  expression?: WhyteExpression
  size?: number
}) {
  return (
    <img
      src={expressions[expression]}
      width={size}
      height={size}
      alt={\`Whyte, \${expression}\`}
    />
  )
}`

const HTML_SNIPPET = `<!-- Plain, dependency-free SVG: works in any page or framework -->
<img src="/${EXPRESSIONS_PATH}whyte-thinking.svg" width="120" height="120" alt="Whyte, thinking">`

const INLINE_CODE = "whitespace-nowrap font-mono text-[13px] text-ink"

export function UsageSection({
  idleMarkup,
}: {
  idleMarkup: string | undefined
}) {
  return (
    <section aria-labelledby="usage-title" className="mt-24">
      <SectionHeading
        id="usage-title"
        eyebrow="05 · Usage"
        title="Drop-in, anywhere."
      >
        Copy <code className={INLINE_CODE}>public/{EXPRESSIONS_PATH}</code> into
        any project. Use the files as images, or inline the markup to target{" "}
        <code className={INLINE_CODE}>#body</code>,{" "}
        <code className={INLINE_CODE}>#eye-left</code> and{" "}
        <code className={INLINE_CODE}>#eye-right</code> directly.
      </SectionHeading>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <CodeBlock title="Whyte.tsx" code={REACT_SNIPPET} />
        <div className="flex min-w-0 flex-col gap-4">
          <CodeBlock title="index.html" code={HTML_SNIPPET} />
          <CodeBlock
            title="whyte-idle.svg"
            code={idleMarkup?.trim()}
            className="flex-1"
          />
        </div>
      </div>
    </section>
  )
}
