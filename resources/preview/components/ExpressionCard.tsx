import { Check, CircleAlert, Download, Pause, Play } from "lucide-react"
import { useState } from "react"
import { IndependentMotionFigure } from "../../motion/components/IndependentMotionFigure"
import { backgroundClass, type CanvasBackground } from "../canvas"
import type { Expression, ExpressionName } from "../expressions"
import { describeGaze, formatDegrees, formatScale } from "../format"
import { ICON_BUTTON } from "../styles"
import { CHECKS, type EllipseSpec, type ExpressionMetrics } from "../svg-report"
import type { ExpressionFile } from "../useExpressionFiles"
import { CopyButton } from "./CopyButton"
import { ExpressionCanvas } from "./ExpressionCanvas"

interface ExpressionCardProps {
  index: number
  expression: Expression
  file: ExpressionFile
  metrics: ExpressionMetrics | null
  background: CanvasBackground
  ghost: readonly EllipseSpec[] | null
  guides: boolean
  animateAll?: boolean
  activeOnStage?: boolean
  onPreviewOnStage?: (name: ExpressionName) => void
}

export function ExpressionCard({
  index,
  expression,
  file,
  metrics,
  background,
  ghost,
  guides,
  animateAll = false,
  activeOnStage = false,
  onPreviewOnStage,
}: ExpressionCardProps) {
  const markup = file.state === "ready" ? file.markup : undefined
  const [localPlay, setLocalPlay] = useState(false)
  const isAnimating = animateAll || localPlay

  return (
    <article className="flex flex-col overflow-hidden rounded-[22px] bg-white ring-1 ring-line">
      <div className="relative">
        {isAnimating ? (
          <div
            className={`relative aspect-square ${backgroundClass(background)}`}
          >
            <IndependentMotionFigure
              expression={expression}
              playing={isAnimating}
            />
          </div>
        ) : (
          <ExpressionCanvas
            expression={expression}
            background={background}
            ghost={ghost}
            guides={guides}
          />
        )}
        <span
          className={`absolute left-3.5 top-3 font-mono text-[11px] tabular-nums ${
            background === "dark" ? "text-white/45" : "text-ink-3"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <button
          type="button"
          aria-pressed={isAnimating}
          onClick={() => setLocalPlay((v) => !v)}
          title={
            isAnimating
              ? `Pause ${expression.label} card animation`
              : `Preview ${expression.label} animation independently`
          }
          className={`absolute right-3 top-2.5 inline-flex h-7 items-center gap-1 rounded-full px-2.5 font-mono text-[10.5px] transition-colors focus-visible:outline-2 focus-visible:outline-ink ${
            isAnimating
              ? "bg-ink text-paper"
              : "bg-white/85 text-ink-2 ring-1 ring-line hover:text-ink"
          }`}
        >
          {isAnimating ? (
            <>
              <Pause className="size-3" />
              Live
            </>
          ) : (
            <>
              <Play className="size-3" />
              Motion
            </>
          )}
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-[15px] font-medium tracking-[-0.01em]">
            {expression.label}
          </h3>
          <code className="truncate font-mono text-[11px] text-ink-3">
            {expression.file}
          </code>
        </div>
        <p className="mt-1.5 text-[13px] leading-[1.45] text-ink-2">
          {expression.summary}
        </p>
        <MetricRow metrics={metrics} />

        <div className="mt-auto pt-4">
          <div className="flex items-center justify-between gap-2 border-t border-line pt-3">
            <FileStatus file={file} />
            <div className="-mr-1.5 flex items-center">
              {onPreviewOnStage && (
                <button
                  type="button"
                  onClick={() => onPreviewOnStage(expression.name)}
                  className={`mr-1 inline-flex h-7 items-center rounded-full px-2.5 font-mono text-[10.5px] transition-colors focus-visible:outline-2 focus-visible:outline-ink ${
                    activeOnStage
                      ? "bg-ink text-paper"
                      : "bg-paper text-ink-2 hover:text-ink"
                  }`}
                  title={`Send ${expression.label} to the Whyte in Motion stage`}
                >
                  {activeOnStage ? "On stage" : "Stage"}
                </button>
              )}
              <CopyButton
                text={markup}
                label={`Copy ${expression.file} markup`}
              />
              <a
                href={expression.url}
                download={expression.file}
                aria-label={`Download ${expression.file}`}
                title="Download SVG"
                className={ICON_BUTTON}
              >
                <Download className="size-4" strokeWidth={1.75} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </article>
  )
}

function MetricRow({ metrics }: { metrics: ExpressionMetrics | null }) {
  if (!metrics) return <div className="mt-3 h-[22px]" aria-hidden="true" />

  return (
    <div className="mt-3 flex flex-wrap items-center gap-1.5">
      <Metric label="Tilt" value={formatDegrees(metrics.tilt)} />
      <Metric label="Body" value={formatScale(metrics.body)} />
      <Metric label="Eyes" value={formatScale(metrics.eyes)} />
      <GazePad gaze={metrics.gaze} />
    </div>
  )
}

interface MetricProps {
  label: string
  value: string
}

function Metric({ label, value }: MetricProps) {
  return (
    <span className="inline-flex h-[22px] items-center gap-1 rounded-full bg-paper px-2 font-mono text-[10.5px] text-ink-2">
      <span className="text-ink-3">{label}</span>
      {value}
    </span>
  )
}

/** A tiny joystick showing where the eyes are looking, measured from the file. */
function GazePad({ gaze }: { gaze: [number, number] }) {
  const reach = 4.5
  const limit = 12
  const x = Math.max(-1, Math.min(1, gaze[0] / limit)) * reach
  const y = Math.max(-1, Math.min(1, gaze[1] / limit)) * reach
  const direction = describeGaze(gaze)

  return (
    <span
      title={`Eyes look ${direction}`}
      className="inline-flex h-[22px] items-center gap-1.5 rounded-full bg-paper pl-[3px] pr-2 font-mono text-[10.5px] text-ink-2"
    >
      <span className="relative size-4 rounded-full bg-white ring-1 ring-ink/15">
        <span
          className="absolute left-1/2 top-1/2 size-[5px] rounded-full bg-ink"
          style={{
            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
          }}
        />
      </span>
      {direction}
    </span>
  )
}

function FileStatus({ file }: { file: ExpressionFile }) {
  if (file.state === "loading")
    return <span className="text-[11.5px] text-ink-3">Inspecting file…</span>

  const report = file.state === "ready" ? file.report : null
  if (!report) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11.5px] text-guide">
        <CircleAlert className="size-3.5" /> Couldn’t read file
      </span>
    )
  }

  const failed = CHECKS.filter((check) => !report.checks[check.id])
  if (failed.length > 0) {
    return (
      <span
        className="inline-flex items-center gap-1.5 text-[11.5px] text-guide"
        title={failed.map((c) => c.label).join(", ")}
      >
        <CircleAlert className="size-3.5" /> {failed.length} rule
        {failed.length > 1 ? "s" : ""} broken
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11.5px] text-ink-2"
      title={CHECKS.map((c) => c.label).join(" · ")}
    >
      <span className="grid size-4 place-items-center rounded-full bg-ink text-paper">
        <Check className="size-2.5" strokeWidth={3.5} />
      </span>
      3 ellipses · {CHECKS.length}/{CHECKS.length} rules
    </span>
  )
}
