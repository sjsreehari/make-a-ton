import {
  ArrowUpRight,
  Gauge,
  Pause,
  Play,
  Repeat,
  RotateCcw,
  Route,
  Zap,
} from "lucide-react"
import { useEffect, useRef, useState, type MouseEvent } from "react"
import {
  EXPRESSIONS,
  EXPRESSION_NAMES,
  type Expression,
  type ExpressionName,
} from "../../preview/expressions"
import { EYEBROW } from "../../preview/styles"
import {
  WhyteAnimationController,
  type AnimationSnapshot,
} from "../animationController"
import { EXPRESSION_BEHAVIOUR_META } from "../expressionBehaviours"

interface WhyteInMotionProps {
  selectedExpression: ExpressionName
  onSelectExpression: (expression: ExpressionName) => void
}

interface PresetOption {
  label: string
  value: number
}

const SPEED_PRESETS: readonly PresetOption[] = [
  { label: "0.5×", value: 0.5 },
  { label: "1×", value: 1 },
  { label: "1.5×", value: 1.5 },
  { label: "2×", value: 2 },
]

const INTENSITY_PRESETS: readonly PresetOption[] = [
  { label: "Soft", value: 0.65 },
  { label: "Normal", value: 1 },
  { label: "Lively", value: 1.35 },
  { label: "Max", value: 1.75 },
]

const EXPRESSION_MAP: Record<ExpressionName, Expression> = Object.fromEntries(
  EXPRESSIONS.map((item) => [item.name, item]),
) as Record<ExpressionName, Expression>

const CHAR_SIZE = 184

export function WhyteInMotion({
  selectedExpression,
  onSelectExpression,
}: WhyteInMotionProps) {
  const stageRef = useRef<HTMLDivElement | null>(null)
  const [stageSize, setStageSize] = useState({ width: 760, height: 430 })

  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1)
  const [jumpIntensity, setJumpIntensity] = useState(1)
  const [showTrajectory, setShowTrajectory] = useState(true)
  const [sequenceMode, setSequenceMode] = useState(false)

  const controllerRef = useRef<WhyteAnimationController | null>(null)
  if (!controllerRef.current) {
    controllerRef.current = new WhyteAnimationController({
      initialExpression: selectedExpression,
      maxOffsetX: 210,
    })
  }

  const [snapshot, setSnapshot] = useState<AnimationSnapshot>(() =>
    controllerRef.current!.getSnapshot(),
  )

  // Measure stage dimensions so Whyte's horizontal jumps stay strictly inside the stage
  useEffect(() => {
    const stageEl = stageRef.current
    if (!stageEl) return

    const updateSize = () => {
      const rect = stageEl.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        setStageSize({ width: rect.width, height: rect.height })
        const safeMaxX = Math.max(55, rect.width * 0.5 - CHAR_SIZE * 0.52)
        controllerRef.current?.setStageBound(safeMaxX)
      }
    }

    updateSize()
    const observer = new ResizeObserver(updateSize)
    observer.observe(stageEl)
    return () => observer.disconnect()
  }, [])

  // Sync external expression changes into the controller
  useEffect(() => {
    const controller = controllerRef.current
    if (!controller) return
    if (controller.getExpression() !== selectedExpression) {
      controller.setExpression(selectedExpression, jumpIntensity)
      setSnapshot({ ...controller.getSnapshot() })
    }
  }, [selectedExpression, jumpIntensity])

  // Main requestAnimationFrame loop with delta time
  useEffect(() => {
    let frameId = 0
    let lastTime = performance.now()

    const tick = (now: number) => {
      const rawDt = (now - lastTime) / 1000
      lastTime = now
      const controller = controllerRef.current!
      const next = controller.step(rawDt, {
        playing,
        speed,
        jumpIntensity,
        sequenceMode,
      })
      if (next.expression !== selectedExpression) {
        onSelectExpression(next.expression)
      }
      setSnapshot({ ...next })
      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [
    playing,
    speed,
    jumpIntensity,
    sequenceMode,
    selectedExpression,
    onSelectExpression,
  ])

  const handleSelectExpression = (name: ExpressionName) => {
    setSequenceMode(false)
    onSelectExpression(name)
    controllerRef.current?.setExpression(name, jumpIntensity)
    if (!playing) {
      setPlaying(true)
    }
  }

  const handleRestart = () => {
    controllerRef.current?.restart(jumpIntensity)
    setSnapshot({ ...controllerRef.current!.getSnapshot() })
    if (!playing) {
      setPlaying(true)
    }
  }

  const handleTriggerJump = (targetX?: number) => {
    controllerRef.current?.triggerJump(jumpIntensity, targetX)
    setSnapshot({ ...controllerRef.current!.getSnapshot() })
    if (!playing) {
      setPlaying(true)
    }
  }

  const handleStageClick = (event: MouseEvent<HTMLDivElement>) => {
    // Ignore clicks on buttons overlayed inside the stage
    if ((event.target as HTMLElement).closest("button")) return
    const rect = event.currentTarget.getBoundingClientRect()
    const clickOffsetX = event.clientX - (rect.left + rect.width / 2)
    handleTriggerJump(clickOffsetX)
  }

  const activeExpr = EXPRESSION_MAP[snapshot.expression]
  const prevExpr = snapshot.previousExpression
    ? EXPRESSION_MAP[snapshot.previousExpression]
    : null
  const meta = EXPRESSION_BEHAVIOUR_META[snapshot.expression]

  const centerX = stageSize.width / 2
  const groundY = stageSize.height * 0.79
  // Whyte's body center at rest (y=0) sits 27% of CHAR_SIZE above the ground line
  const bodyCenterRestY = groundY - CHAR_SIZE * 0.27

  const heightAboveGround = Math.max(0, -snapshot.y)
  const shadowScale = Math.max(0.32, 1 - heightAboveGround / 165)

  const displayedJump = snapshot.activeJump ?? snapshot.lastJump
  const arcPath =
    snapshot.trajectoryArc.length > 1
      ? snapshot.trajectoryArc
          .map(
            (pt, index) =>
              `${index === 0 ? "M" : "L"} ${(centerX + pt.x).toFixed(1)} ${(
                bodyCenterRestY + pt.y
              ).toFixed(1)}`,
          )
          .join(" ")
      : ""

  const peakPoint =
    snapshot.trajectoryArc.length > 0
      ? snapshot.trajectoryArc[Math.floor(snapshot.trajectoryArc.length / 2)]
      : null

  const trailPath =
    snapshot.trail.length > 1
      ? snapshot.trail
          .map(
            (pt, index) =>
              `${index === 0 ? "M" : "L"} ${(centerX + pt.x).toFixed(1)} ${(
                bodyCenterRestY + pt.y
              ).toFixed(1)}`,
          )
          .join(" ")
      : ""

  return (
    <section aria-labelledby="motion-title" className="mt-4">
      <div className="flex flex-col gap-4 border-t border-line pt-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className={EYEBROW}>01 · Whyte in Motion</p>
          <h2
            id="motion-title"
            className="mt-3 font-display text-[38px] leading-none tracking-[-0.01em] sm:text-[46px]"
          >
            Expression animation playground.
          </h2>
        </div>
        <p className="max-w-[54ch] text-[14.5px] leading-[1.6] text-ink-2">
          Every expression has its own movement personality and jump physics,
          driven by a delta-time{" "}
          <code className="font-mono text-[13px] text-ink">
            requestAnimationFrame
          </code>{" "}
          controller using the original SVG files untouched.
        </p>
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-12">
        {/* Left: Large interactive animation preview stage */}
        <div className="flex flex-col overflow-hidden rounded-[24px] bg-white ring-1 ring-line lg:col-span-8">
          {/* Stage top bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3 sm:px-5">
            <div className="flex items-center gap-2.5">
              <span
                className={`size-2 rounded-full ${
                  playing ? "bg-ink animate-pulse" : "bg-ink-3"
                }`}
              />
              <span className="font-mono text-[11.5px] font-medium uppercase tracking-[0.08em] text-ink">
                {activeExpr.label}
              </span>
              <span className="text-ink-3">·</span>
              <span className="font-mono text-[11.5px] text-ink-2">
                {snapshot.phaseLabel}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleTriggerJump()}
                className="inline-flex h-7 items-center gap-1 rounded-full bg-paper px-2.5 font-mono text-[11px] text-ink transition-colors hover:bg-stage focus-visible:outline-2 focus-visible:outline-ink"
                title="Trigger a jump using the current expression's jump profile"
              >
                <ArrowUpRight className="size-3.5" />
                Jump now
              </button>
              <button
                type="button"
                aria-pressed={showTrajectory}
                onClick={() => setShowTrajectory((v) => !v)}
                className={`inline-flex h-7 items-center gap-1.5 rounded-full px-2.5 font-mono text-[11px] transition-colors focus-visible:outline-2 focus-visible:outline-ink ${
                  showTrajectory
                    ? "bg-ink text-paper"
                    : "bg-paper text-ink-2 hover:text-ink"
                }`}
              >
                <Route className="size-3" />
                Trajectory
              </button>
            </div>
          </div>

          {/* Stage canvas */}
          <div
            ref={stageRef}
            onClick={handleStageClick}
            role="region"
            aria-label="Whyte animation stage. Click anywhere on the stage to make Whyte jump to that spot."
            className="relative h-[380px] w-full cursor-pointer select-none overflow-hidden bg-stage sm:h-[430px]"
          >
            {/* Stage floor & trajectory SVG overlay */}
            <svg
              viewBox={`0 0 ${stageSize.width} ${stageSize.height}`}
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 size-full"
            >
              {/* Subtle stage floor line */}
              <line
                x1={28}
                y1={groundY}
                x2={stageSize.width - 28}
                y2={groundY}
                stroke="#d6d3c9"
                strokeWidth={1}
              />
              {/* Stage center tick */}
              <line
                x1={centerX}
                y1={groundY - 5}
                x2={centerX}
                y2={groundY + 5}
                stroke="#b8b4a8"
                strokeWidth={1}
              />

              {showTrajectory && displayedJump && (
                <g>
                  {/* Vertical drop-lines from arc start/end to ground takeoff & landing pads */}
                  <line
                    x1={centerX + displayedJump.startX}
                    y1={bodyCenterRestY + displayedJump.startY}
                    x2={centerX + displayedJump.startX}
                    y2={groundY}
                    stroke="#e5484d"
                    strokeOpacity={0.35}
                    strokeDasharray="3 3"
                  />
                  <line
                    x1={centerX + displayedJump.targetX}
                    y1={bodyCenterRestY + displayedJump.targetY}
                    x2={centerX + displayedJump.targetX}
                    y2={groundY}
                    stroke="#e5484d"
                    strokeOpacity={0.35}
                    strokeDasharray="3 3"
                  />

                  {/* Planned / active jump parabolic arc */}
                  {arcPath && (
                    <path
                      d={arcPath}
                      fill="none"
                      stroke="#e5484d"
                      strokeWidth={1.75}
                      strokeDasharray="5 4"
                      strokeOpacity={0.75}
                    />
                  )}

                  {/* Live motion breadcrumb trail */}
                  {trailPath && (
                    <path
                      d={trailPath}
                      fill="none"
                      stroke="#0b0b0b"
                      strokeWidth={1.5}
                      strokeOpacity={0.22}
                      strokeLinecap="round"
                    />
                  )}

                  {/* Takeoff marker on ground */}
                  <circle
                    cx={centerX + displayedJump.startX}
                    cy={groundY}
                    r={3.5}
                    fill="#ffffff"
                    stroke="#e5484d"
                    strokeWidth={1.5}
                  />

                  {/* Landing target marker on ground */}
                  <circle
                    cx={centerX + displayedJump.targetX}
                    cy={groundY}
                    r={4.5}
                    fill="#e5484d"
                  />
                  <circle
                    cx={centerX + displayedJump.targetX}
                    cy={groundY}
                    r={9}
                    fill="none"
                    stroke="#e5484d"
                    strokeWidth={1}
                    strokeOpacity={0.45}
                  />

                  {/* Peak float marker */}
                  {peakPoint && (
                    <g>
                      <circle
                        cx={centerX + peakPoint.x}
                        cy={bodyCenterRestY + peakPoint.y}
                        r={3.5}
                        fill="#e5484d"
                      />
                      <text
                        x={centerX + peakPoint.x}
                        y={bodyCenterRestY + peakPoint.y - 9}
                        textAnchor="middle"
                        fill="#e5484d"
                        fontSize={10}
                        fontFamily="var(--font-mono)"
                      >
                        peak float
                      </text>
                    </g>
                  )}
                </g>
              )}
            </svg>

            {/* Ground contact shadow beneath Whyte */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute rounded-full bg-ink/12"
              style={{
                width: 76,
                height: 14,
                left: centerX,
                top: groundY,
                transform: `translate3d(calc(-50% + ${snapshot.x.toFixed(
                  2,
                )}px), -50%, 0) scaleX(${shadowScale.toFixed(3)})`,
                opacity: Math.max(0.22, shadowScale * 0.85),
              }}
            />

            {/* Whyte character container anchored so the body base (77% of 400px SVG) sits on groundY */}
            <div
              className="pointer-events-none absolute will-change-transform"
              style={{
                width: CHAR_SIZE,
                height: CHAR_SIZE,
                left: centerX - CHAR_SIZE / 2,
                top: groundY - CHAR_SIZE * 0.77,
                transform: `translate3d(${snapshot.x.toFixed(
                  2,
                )}px, ${snapshot.y.toFixed(2)}px, 0)`,
              }}
            >
              {/* Squash & stretch wrapper pivoted at the bottom of Whyte's body (50% 77%) */}
              <div
                className="size-full will-change-transform"
                style={{
                  transformOrigin: "50% 77%",
                  transform: `scale3d(${snapshot.scaleX.toFixed(
                    4,
                  )}, ${snapshot.scaleY.toFixed(4)}, 1)`,
                }}
              >
                {/* Rotation wrapper pivoted at Whyte's lower-middle center of gravity (50% 62%) */}
                <div
                  className="relative size-full will-change-transform"
                  style={{
                    transformOrigin: "50% 62%",
                    transform: `rotate(${snapshot.rotation.toFixed(2)}deg)`,
                  }}
                >
                  {prevExpr && snapshot.expressionBlend < 1 && (
                    <img
                      src={prevExpr.url}
                      alt=""
                      width={400}
                      height={400}
                      draggable={false}
                      className="absolute inset-0 size-full select-none"
                      style={{
                        opacity: Number(
                          (1 - snapshot.expressionBlend).toFixed(3),
                        ),
                      }}
                    />
                  )}
                  <img
                    src={activeExpr.url}
                    alt={`Whyte — ${activeExpr.label}`}
                    width={400}
                    height={400}
                    draggable={false}
                    className="absolute inset-0 size-full select-none"
                    style={{
                      opacity:
                        prevExpr && snapshot.expressionBlend < 1
                          ? Number(snapshot.expressionBlend.toFixed(3))
                          : 1,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Stage corner hint */}
            <div className="pointer-events-none absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] text-ink-3">
              <span>Click anywhere on the stage to jump there</span>
              <span className="hidden font-mono sm:inline">
                x {Math.round(snapshot.x)} px · y {Math.round(-snapshot.y)} px ·{" "}
                {Math.round(snapshot.scaleX * 100)}×
                {Math.round(snapshot.scaleY * 100)}% ·{" "}
                {snapshot.rotation >= 0 ? "+" : "−"}
                {Math.abs(snapshot.rotation).toFixed(1)}°
              </span>
            </div>
          </div>

          {/* Active expression behaviour description bar */}
          <div className="border-t border-line bg-paper/60 px-4 py-3.5 sm:px-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[13.5px] font-medium text-ink">
                  {activeExpr.label}:{" "}
                  <span className="font-normal text-ink-2">{meta.tagline}</span>
                </p>
              </div>
              <span className="shrink-0 font-mono text-[11px] text-ink-3">
                {meta.cadenceLabel}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {meta.motionNotes.map((note) => (
                <span
                  key={note}
                  className="inline-flex items-center rounded-full bg-white px-2.5 py-0.5 font-mono text-[10.5px] text-ink-2 ring-1 ring-line"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Playback, Speed, Jump Intensity & Sequential Controls */}
        <div className="flex flex-col gap-4 rounded-[24px] bg-white p-5 ring-1 ring-line lg:col-span-4">
          <div>
            <p className={EYEBROW}>Transport & Physics</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                aria-pressed={playing}
                onClick={() => setPlaying((p) => !p)}
                className={`inline-flex h-11 items-center justify-center gap-2 rounded-full text-[13px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                  playing
                    ? "bg-ink text-paper hover:bg-ink/90"
                    : "bg-paper text-ink ring-1 ring-line hover:bg-stage"
                }`}
              >
                {playing ? (
                  <>
                    <Pause className="size-4" strokeWidth={2} />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="size-4" strokeWidth={2} />
                    Play
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleRestart}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-paper text-[13px] font-medium text-ink ring-1 ring-line transition-colors hover:bg-stage focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <RotateCcw className="size-4" strokeWidth={1.85} />
                Restart
              </button>
            </div>

            {/* Sequential playback across all 8 expressions */}
            <div className="mt-2.5">
              <button
                type="button"
                aria-pressed={sequenceMode}
                onClick={() => {
                  setSequenceMode((s) => !s)
                  if (!playing) setPlaying(true)
                }}
                className={`flex w-full items-center justify-between rounded-[16px] px-3.5 py-2.5 text-left text-[12.5px] ring-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                  sequenceMode
                    ? "bg-ink text-paper ring-ink"
                    : "bg-paper text-ink ring-line hover:bg-stage"
                }`}
              >
                <span className="inline-flex items-center gap-2 font-medium">
                  <Repeat className="size-3.5" />
                  Play all expressions sequentially
                </span>
                <span
                  className={`font-mono text-[11px] ${
                    sequenceMode ? "text-paper/75" : "text-ink-3"
                  }`}
                >
                  {sequenceMode
                    ? `${snapshot.sequenceIndex + 1}/${EXPRESSION_NAMES.length}`
                    : "Off"}
                </span>
              </button>
              {sequenceMode && (
                <div
                  aria-hidden="true"
                  className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-line"
                >
                  <div
                    className="h-full bg-ink transition-all duration-75"
                    style={{
                      width: `${Math.round(snapshot.sequenceProgress * 100)}%`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Speed control */}
          <div className="border-t border-line pt-4">
            <div className="flex items-center justify-between">
              <label
                htmlFor="whyte-speed-slider"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink"
              >
                <Gauge className="size-3.5 text-ink-3" />
                Animation speed
              </label>
              <span className="font-mono text-[12px] text-ink-2">
                {speed.toFixed(2)}×
              </span>
            </div>
            <input
              id="whyte-speed-slider"
              type="range"
              min={0.4}
              max={2.0}
              step={0.05}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line accent-ink"
            />
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {SPEED_PRESETS.map((preset) => {
                const active = Math.abs(speed - preset.value) < 0.03
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setSpeed(preset.value)}
                    className={`h-7 rounded-full font-mono text-[11px] transition-colors ${
                      active
                        ? "bg-ink text-paper"
                        : "bg-paper text-ink-2 hover:text-ink"
                    }`}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Jump intensity control */}
          <div className="border-t border-line pt-4">
            <div className="flex items-center justify-between">
              <label
                htmlFor="whyte-intensity-slider"
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink"
              >
                <Zap className="size-3.5 text-ink-3" />
                Jump intensity
              </label>
              <span className="font-mono text-[12px] text-ink-2">
                {Math.round(jumpIntensity * 100)}%
              </span>
            </div>
            <input
              id="whyte-intensity-slider"
              type="range"
              min={0.5}
              max={1.8}
              step={0.05}
              value={jumpIntensity}
              onChange={(e) => setJumpIntensity(Number(e.target.value))}
              className="mt-2.5 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-line accent-ink"
            />
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              {INTENSITY_PRESETS.map((preset) => {
                const active = Math.abs(jumpIntensity - preset.value) < 0.04
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setJumpIntensity(preset.value)}
                    className={`h-7 rounded-full font-mono text-[11px] transition-colors ${
                      active
                        ? "bg-ink text-paper"
                        : "bg-paper text-ink-2 hover:text-ink"
                    }`}
                  >
                    {preset.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Trajectory & Jump Physics summary */}
          <div className="mt-auto border-t border-line pt-4">
            <div className="flex items-center justify-between">
              <span className={EYEBROW}>Jump lifecycle</span>
              <span className="font-mono text-[11px] text-ink-2">
                {snapshot.jumpPhase ?? "ambient float"}
              </span>
            </div>
            <div className="mt-2 grid grid-cols-5 gap-1 text-center font-mono text-[10px]">
              {([
                "anticipation",
                "takeoff",
                "float",
                "descent",
                "landing",
              ] as const).map((phase) => {
                const isCurrent = snapshot.jumpPhase === phase
                return (
                  <span
                    key={phase}
                    className={`truncate rounded-md px-1 py-1 capitalize transition-colors ${
                      isCurrent
                        ? "bg-ink text-paper font-medium"
                        : "bg-paper text-ink-3"
                    }`}
                  >
                    {phase === "anticipation" ? "crouch" : phase}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Expression selector strip: all eight expressions displayed as selectable options */}
      <div
        role="radiogroup"
        aria-label="Select Whyte expression animation"
        className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8"
      >
        {EXPRESSIONS.map((expression, index) => {
          const active = expression.name === snapshot.expression
          return (
            <button
              key={expression.name}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => handleSelectExpression(expression.name)}
              className={`group flex flex-col items-center rounded-[18px] p-2.5 text-left ring-1 transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
                active
                  ? "bg-ink text-paper ring-ink"
                  : "bg-white text-ink ring-line hover:bg-paper"
              }`}
            >
              <div className="flex w-full items-center justify-between px-1">
                <span
                  className={`font-mono text-[10px] tabular-nums ${
                    active ? "text-paper/60" : "text-ink-3"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span
                  className={`size-1.5 rounded-full ${
                    active ? "bg-paper" : "bg-transparent group-hover:bg-ink-3"
                  }`}
                />
              </div>
              <div
                className={`mt-1.5 flex size-16 items-center justify-center rounded-[12px] transition-transform group-hover:scale-105 ${
                  active ? "bg-stage" : "bg-paper"
                }`}
              >
                <img
                  src={expression.url}
                  alt=""
                  width={64}
                  height={64}
                  draggable={false}
                  className="size-14 select-none"
                />
              </div>
              <span className="mt-2 text-[13px] font-medium">
                {expression.label}
              </span>
              <span
                className={`mt-0.5 line-clamp-1 font-mono text-[10px] ${
                  active ? "text-paper/65" : "text-ink-3"
                }`}
              >
                {expression.name === "moving"
                  ? "jumps"
                  : expression.name === "happy"
                    ? "high hops"
                    : expression.name === "oops"
                      ? "recoil hop"
                      : expression.name === "talking"
                        ? "bounces"
                        : expression.name === "pointing"
                          ? "cue & hold"
                          : expression.name === "listening"
                            ? "tilt & nod"
                            : expression.name === "thinking"
                              ? "ponder tilt"
                              : "calm float"}
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
