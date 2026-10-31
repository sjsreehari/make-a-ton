import { useEffect, useRef, useState } from "react"
import type { Expression } from "../../preview/expressions"
import { WhyteAnimationController } from "../animationController"

interface IndependentMotionFigureProps {
  expression: Expression
  playing: boolean
  speed?: number
  jumpIntensity?: number
}

/**
 * Runs an isolated animation controller for a single expression card so all
 * eight expressions can be previewed independently side by side.
 */
export function IndependentMotionFigure({
  expression,
  playing,
  speed = 1,
  jumpIntensity = 1,
}: IndependentMotionFigureProps) {
  const controllerRef = useRef<WhyteAnimationController | null>(null)
  if (!controllerRef.current) {
    controllerRef.current = new WhyteAnimationController({
      initialExpression: expression.name,
      maxOffsetX: 34,
    })
  }

  const [pose, setPose] = useState(() => controllerRef.current!.getSnapshot())

  useEffect(() => {
    controllerRef.current?.setExpression(expression.name, jumpIntensity)
  }, [expression.name, jumpIntensity])

  useEffect(() => {
    if (!playing) return
    let frameId = 0
    let lastTime = performance.now()

    const tick = (now: number) => {
      const dt = (now - lastTime) / 1000
      lastTime = now
      const snapshot = controllerRef.current!.step(dt, {
        playing: true,
        speed,
        jumpIntensity,
        sequenceMode: false,
      })
      setPose({ ...snapshot })
      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(frameId)
  }, [playing, speed, jumpIntensity])

  const heightLift = Math.max(0, -pose.y)
  const shadowScale = Math.max(0.42, 1 - heightLift / 120)

  return (
    <div className="relative size-full overflow-hidden">
      {/* Subtle ground contact shadow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[78%] h-2.5 w-16 rounded-full bg-ink/10 transition-opacity"
        style={{
          transform: `translate3d(calc(-50% + ${pose.x * 0.85}px), -50%, 0) scaleX(${shadowScale})`,
          opacity: Math.max(0.25, shadowScale * 0.75),
        }}
      />
      <div
        className="absolute inset-0 size-full will-change-transform"
        style={{
          transform: `translate3d(${pose.x * 0.85}px, ${pose.y * 0.72}px, 0)`,
        }}
      >
        <div
          className="size-full will-change-transform"
          style={{
            transformOrigin: "50% 77%",
            transform: `scale3d(${pose.scaleX}, ${pose.scaleY}, 1)`,
          }}
        >
          <div
            className="size-full will-change-transform"
            style={{
              transformOrigin: "50% 62%",
              transform: `rotate(${pose.rotation}deg)`,
            }}
          >
            <img
              src={expression.url}
              alt={`Whyte, ${expression.label.toLowerCase()} (animated)`}
              width={400}
              height={400}
              draggable={false}
              className="size-full select-none"
            />
          </div>
        </div>
      </div>
      <span className="pointer-events-none absolute bottom-2.5 right-3 rounded-full bg-white/80 px-2 py-0.5 font-mono text-[10px] text-ink-2 ring-1 ring-line backdrop-blur-xs">
        {pose.phaseLabel}
      </span>
    </div>
  )
}
