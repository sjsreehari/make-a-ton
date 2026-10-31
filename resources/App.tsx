import { Download } from "lucide-react"
import { useState } from "react"
import { WhyteInMotion } from "./motion/components/WhyteInMotion"
import type { CanvasBackground } from "./preview/canvas"
import { ConsistencySection } from "./preview/components/ConsistencySection"
import { ExpressionCard } from "./preview/components/ExpressionCard"
import { ScaleSection } from "./preview/components/ScaleSection"
import { Toolbar } from "./preview/components/Toolbar"
import { UsageSection } from "./preview/components/UsageSection"
import {
  EXPRESSIONS,
  EXPRESSIONS_PATH,
  type ExpressionName,
} from "./preview/expressions"
import { formatBytes } from "./preview/format"
import { EYEBROW } from "./preview/styles"
import { compareToReference } from "./preview/svg-report"
import { useExpressionFiles } from "./preview/useExpressionFiles"
import { createZip, downloadBlob } from "./preview/zip"

const SPECS = [
  { label: "Canvas", value: "400 × 400" },
  { label: "Outline", value: "4 px · #000" },
  { label: "Body", value: "#FFFFFF" },
  { label: "Background", value: "Transparent" },
] as const

const encoder = new TextEncoder()

export default function App() {
  const files = useExpressionFiles()
  const [selectedExpression, setSelectedExpression] =
    useState<ExpressionName>("moving")
  const [background, setBackground] = useState<CanvasBackground>("stage")
  const [ghost, setGhost] = useState(false)
  const [guides, setGuides] = useState(false)
  const [animateCards, setAnimateCards] = useState(false)

  const reference = files.idle.state === "ready" ? files.idle.report : null
  const ghostShapes =
    ghost && reference
      ? [reference.body, reference.left, reference.right]
      : null
  const loaded = EXPRESSIONS.flatMap((expression) => {
    const file = files[expression.name]
    return file.state === "ready" ? [{ expression, markup: file.markup }] : []
  })
  const allLoaded = loaded.length === EXPRESSIONS.length
  const totalBytes = loaded.reduce(
    (sum, { markup }) => sum + encoder.encode(markup).length,
    0,
  )

  const downloadAll = () => {
    const entries = loaded.map(({ expression, markup }) => ({
      path: `${EXPRESSIONS_PATH}${expression.file}`,
      content: markup,
    }))
    downloadBlob(createZip(entries), "whyte-expressions.zip")
  }

  const handlePreviewOnStage = (name: ExpressionName) => {
    setSelectedExpression(name)
    document
      .getElementById("motion-playground")
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="min-h-screen">
      <header className="mx-auto flex max-w-[1280px] items-center justify-between gap-4 px-5 py-5 sm:px-8 lg:px-10">
        <a
          href="#top"
          className="flex items-center gap-3 rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
        >
          <img
            src={EXPRESSIONS[0].url}
            alt=""
            width={44}
            height={44}
            className="-my-2 -ml-2 size-11"
          />
          <span className="font-display text-[26px] leading-none">Whyte</span>
          <span
            aria-hidden="true"
            className="hidden h-4 w-px bg-line sm:block"
          />
          <span className={`hidden sm:block ${EYEBROW}`}>
            Animation Playground & Expression System
          </span>
        </a>
        <div className="flex items-center gap-2 sm:gap-4">
          <nav
            aria-label="Page sections"
            className="hidden items-center gap-4 text-[13px] text-ink-2 md:flex"
          >
            <a href="#motion-playground" className="hover:text-ink">
              Whyte in Motion
            </a>
            <a href="#expression-gallery" className="hover:text-ink">
              Expression Gallery
            </a>
            <a href="#consistency-title" className="hover:text-ink">
              Consistency
            </a>
          </nav>
          <button
            type="button"
            onClick={downloadAll}
            disabled={!allLoaded}
            className="inline-flex h-10 items-center gap-2 rounded-full bg-ink pl-3.5 pr-4 text-[13px] font-medium text-paper transition-colors hover:bg-ink/85 disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <Download className="size-4" strokeWidth={1.75} />
            Download all
            <span className="hidden font-mono text-[11px] font-normal text-paper/50 sm:inline">
              .zip
            </span>
          </button>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
        <section className="grid gap-8 pb-12 pt-8 sm:pt-12 lg:grid-cols-12 lg:items-end lg:gap-10 lg:pb-16 lg:pt-16">
          <div className="lg:col-span-7">
            <p className={EYEBROW}>
              Whyte / animation playground & 08 expressions
            </p>
            <h1 className="mt-5 font-display text-[54px] leading-[0.94] tracking-[-0.02em] sm:text-[76px] lg:text-[88px]">
              Eight expressions.
              <br />
              <em className="text-ink-3">Alive in motion.</em>
            </h1>
          </div>
          <div className="lg:col-span-5">
            <p className="max-w-[46ch] text-[15px] leading-[1.6] text-ink-2">
              Each expression is a standalone SVG built from the same three
              ellipses: one body and two eyes. Watch Whyte float, tilt, bounce,
              and jump with expression-specific physics—while keeping every SVG
              artwork file untouched.
            </p>
            <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[16px] bg-line ring-1 ring-line sm:grid-cols-4">
              {SPECS.map((spec) => (
                <div key={spec.label} className="bg-paper px-3.5 py-3">
                  <dt className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-ink-3">
                    {spec.label}
                  </dt>
                  <dd className="mt-1 text-[13px] font-medium">{spec.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <div id="motion-playground">
          <WhyteInMotion
            selectedExpression={selectedExpression}
            onSelectExpression={setSelectedExpression}
          />
        </div>

        <section
          id="expression-gallery"
          aria-labelledby="set-title"
          className="mt-24"
        >
          <div className="flex flex-col gap-5 border-t border-line pt-6 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <p className={EYEBROW}>02 · The set</p>
              <h2
                id="set-title"
                className="mt-3 font-display text-[38px] leading-none tracking-[-0.01em] sm:text-[46px]"
              >
                Side by side.
              </h2>
            </div>
            <Toolbar
              background={background}
              onBackgroundChange={setBackground}
              ghost={ghost}
              onGhostChange={setGhost}
              guides={guides}
              onGuidesChange={setGuides}
              animateCards={animateCards}
              onAnimateCardsChange={setAnimateCards}
            />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 min-[520px]:grid-cols-2 lg:grid-cols-4">
            {EXPRESSIONS.map((expression, index) => {
              const file = files[expression.name]
              const report = file.state === "ready" ? file.report : null
              return (
                <ExpressionCard
                  key={expression.name}
                  index={index}
                  expression={expression}
                  file={file}
                  metrics={
                    report && reference
                      ? compareToReference(report, reference)
                      : null
                  }
                  background={background}
                  ghost={ghostShapes}
                  guides={guides}
                  animateAll={animateCards}
                  activeOnStage={selectedExpression === expression.name}
                  onPreviewOnStage={handlePreviewOnStage}
                />
              )
            })}
          </div>
        </section>

        <ConsistencySection files={files} />
        <ScaleSection />
        <UsageSection
          idleMarkup={
            files.idle.state === "ready" ? files.idle.markup : undefined
          }
        />
      </main>

      <footer className="mt-24 border-t border-line">
        <div className="mx-auto flex max-w-[1280px] flex-col gap-2 px-5 py-8 text-[12.5px] text-ink-3 sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10">
          <p>
            <span className="font-display text-[19px] text-ink">Whyte</span> —
            one oval body, two oval eyes. Nothing else.
          </p>
          <p className="font-mono text-[11px]">
            public/{EXPRESSIONS_PATH} · {EXPRESSIONS.length} files
            {allLoaded ? ` · ${formatBytes(totalBytes)}` : ""}
          </p>
        </div>
      </footer>
    </div>
  )
}
