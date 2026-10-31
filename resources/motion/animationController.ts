import { EXPRESSION_NAMES, type ExpressionName } from "../preview/expressions"
import {
  createExpressionJump,
  EXPRESSION_BEHAVIOUR_META,
  getTotalJumpDuration,
  sampleExpressionAmbient,
  sampleJump,
  type PoseSample,
} from "./jumpPhysicsAndBehaviours"
import {
  sampleJumpTrajectory,
  type JumpConfig,
  type JumpPhase,
  type TrajectoryPoint,
} from "./jumpPhysics"

export interface TrailPoint {
  x: number
  y: number
  age: number
}

export interface AnimationSnapshot {
  expression: ExpressionName
  previousExpression: ExpressionName | null
  /** 0..1 crossfade progress when transitioning between two expressions. */
  expressionBlend: number
  x: number
  y: number
  scaleX: number
  scaleY: number
  rotation: number
  phaseLabel: string
  jumpPhase: JumpPhase | null
  activeJump: JumpConfig | null
  lastJump: JumpConfig | null
  trajectoryArc: TrajectoryPoint[]
  trail: TrailPoint[]
  sequenceIndex: number
  sequenceProgress: number
  elapsedTime: number
}

export interface ControllerOptions {
  initialExpression?: ExpressionName
  maxOffsetX?: number
}

const SEQUENCE_STEP_DURATION = 4.6 // seconds per expression in sequential playback

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function damp(
  current: number,
  target: number,
  lambda: number,
  dt: number,
): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt))
}

/**
 * Stateful animation controller updated via requestAnimationFrame with delta time.
 * Keeps character artwork separate from motion math and guarantees smooth
 * position, scale, and rotation continuity across expression transitions.
 */
export class WhyteAnimationController {
  private expression: ExpressionName
  private previousExpression: ExpressionName | null = null
  private expressionBlend = 1

  private elapsedTime = 0
  private stateTime = 0
  private maxOffsetX: number

  // Anchor X on the stage floor where Whyte currently resides
  private anchorX = 0

  // Smoothed output pose (prevents any discontinuity on state changes)
  private pose: PoseSample = {
    x: 0,
    y: 0,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    phaseLabel: "gentle float",
    jumpPhase: null,
  }

  // Jump state
  private activeJump: JumpConfig | null = null
  private lastJump: JumpConfig | null = null
  private jumpElapsed = 0
  private jumpCount = 0
  private timeUntilNextJump = 1.8
  private trajectoryArc: TrajectoryPoint[] = []
  private cachedTrajectoryIntensity = 1

  // Recent motion breadcrumb trail
  private trail: TrailPoint[] = []
  private trailSampleAccum = 0

  // Sequential playback state
  private sequenceTimer = 0

  constructor(options: ControllerOptions = {}) {
    this.expression = options.initialExpression ?? "idle"
    this.maxOffsetX = options.maxOffsetX ?? 210
    this.scheduleNextJump(true)
    // Seed a preview trajectory so the trajectory toggle immediately shows a curve
    const seedJump = createExpressionJump(
      this.expression,
      0,
      this.maxOffsetX,
      0,
    )
    this.lastJump = seedJump
    this.trajectoryArc = sampleJumpTrajectory(seedJump, 1)
  }

  public getExpression(): ExpressionName {
    return this.expression
  }

  public setStageBound(maxOffsetX: number): void {
    this.maxOffsetX = Math.max(55, maxOffsetX)
    this.anchorX = Math.max(
      -this.maxOffsetX,
      Math.min(this.maxOffsetX, this.anchorX),
    )
    this.pose.x = Math.max(
      -this.maxOffsetX,
      Math.min(this.maxOffsetX, this.pose.x),
    )
  }

  /**
   * Transitions smoothly into `nextExpression` while preserving current position,
   * scale, and rotation.
   */
  public setExpression(
    nextExpression: ExpressionName,
    jumpIntensity = 1,
  ): void {
    if (nextExpression === this.expression) return
    this.previousExpression = this.expression
    this.expression = nextExpression
    this.expressionBlend = 0
    this.stateTime = 0
    this.sequenceTimer = 0

    // Preserve Whyte's current horizontal position as the new anchor
    this.anchorX = Math.max(
      -this.maxOffsetX,
      Math.min(this.maxOffsetX, this.pose.x),
    )

    // If we aren't currently mid-jump, schedule according to the new expression
    if (!this.activeJump) {
      this.scheduleNextJump(true)
      const previewJump = createExpressionJump(
        this.expression,
        this.anchorX,
        this.maxOffsetX,
        this.jumpCount,
      )
      this.lastJump = previewJump
      this.trajectoryArc = sampleJumpTrajectory(previewJump, jumpIntensity)
      this.cachedTrajectoryIntensity = jumpIntensity
    }
  }

  /**
   * Triggers a jump using the current expression's jump profile, optionally
   * to a specific horizontal stage coordinate `targetX`.
   */
  public triggerJump(jumpIntensity = 1, explicitTargetX?: number): void {
    const clampedTarget =
      explicitTargetX !== undefined
        ? Math.max(-this.maxOffsetX, Math.min(this.maxOffsetX, explicitTargetX))
        : undefined
    const startX = Math.max(
      -this.maxOffsetX,
      Math.min(this.maxOffsetX, this.pose.x),
    )
    const jump = createExpressionJump(
      this.expression,
      startX,
      this.maxOffsetX,
      this.jumpCount++,
      clampedTarget,
    )
    this.activeJump = jump
    this.lastJump = jump
    this.jumpElapsed = 0
    this.trajectoryArc = sampleJumpTrajectory(jump, jumpIntensity)
    this.cachedTrajectoryIntensity = jumpIntensity
  }

  /**
   * Resets Whyte cleanly to the center of the stage and restarts the current
   * expression's animation cycle.
   */
  public restart(jumpIntensity = 1): void {
    this.elapsedTime = 0
    this.stateTime = 0
    this.sequenceTimer = 0
    this.anchorX = 0
    this.activeJump = null
    this.jumpElapsed = 0
    this.trail = []
    this.pose = {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      phaseLabel: "restarted",
      jumpPhase: null,
    }
    this.scheduleNextJump(true)
    const seedJump = createExpressionJump(
      this.expression,
      0,
      this.maxOffsetX,
      this.jumpCount,
    )
    this.lastJump = seedJump
    this.trajectoryArc = sampleJumpTrajectory(seedJump, jumpIntensity)
    this.cachedTrajectoryIntensity = jumpIntensity
  }

  private scheduleNextJump(isInitial = false): void {
    const [minRest, maxRest] =
      EXPRESSION_BEHAVIOUR_META[this.expression].restInterval
    if (isInitial) {
      // Expressions centered on jumping begin their first jump promptly
      if (
        this.expression === "moving" ||
        this.expression === "happy" ||
        this.expression === "oops"
      ) {
        this.timeUntilNextJump = 0.16
        return
      }
      if (this.expression === "pointing") {
        this.timeUntilNextJump = 1.15
        return
      }
    }
    const factor = ((this.jumpCount * 7 + 3) % 11) / 11
    this.timeUntilNextJump = minRest + (maxRest - minRest) * factor
  }

  /**
   * Advances the simulation by `rawDt` seconds.
   */
  public step(
    rawDt: number,
    options: {
      playing: boolean
      speed: number
      jumpIntensity: number
      sequenceMode: boolean
    },
  ): AnimationSnapshot {
    const clampedDt = Math.max(0, Math.min(0.05, rawDt))
    const dt = options.playing ? clampedDt * options.speed : 0

    if (
      this.lastJump &&
      Math.abs(this.cachedTrajectoryIntensity - options.jumpIntensity) > 0.02
    ) {
      this.trajectoryArc = sampleJumpTrajectory(
        this.activeJump ?? this.lastJump,
        options.jumpIntensity,
      )
      this.cachedTrajectoryIntensity = options.jumpIntensity
    }

    if (dt > 0) {
      this.elapsedTime += dt
      this.stateTime += dt

      // Advance expression SVG crossfade (~220ms)
      if (this.expressionBlend < 1) {
        this.expressionBlend = Math.min(
          1,
          this.expressionBlend + clampedDt * 4.6,
        )
        if (this.expressionBlend >= 1) {
          this.previousExpression = null
        }
      }

      // Sequential playback across all 8 expressions
      if (options.sequenceMode) {
        this.sequenceTimer +=
          clampedDt * Math.max(0.75, Math.min(1.5, options.speed))
        if (this.sequenceTimer >= SEQUENCE_STEP_DURATION) {
          const currentIdx = EXPRESSION_NAMES.indexOf(this.expression)
          const nextIdx = (currentIdx + 1) % EXPRESSION_NAMES.length
          this.setExpression(EXPRESSION_NAMES[nextIdx], options.jumpIntensity)
        }
      } else {
        this.sequenceTimer = 0
      }

      // Evaluate active jump or ambient expression behaviour
      let targetPose: PoseSample
      if (this.activeJump) {
        this.jumpElapsed += dt
        const totalJumpTime = getTotalJumpDuration(this.activeJump)
        const sample = sampleJump(
          this.activeJump,
          this.jumpElapsed,
          options.jumpIntensity,
        )
        this.anchorX = sample.x

        if (this.jumpElapsed >= totalJumpTime || sample.phase === "done") {
          this.anchorX = this.activeJump.targetX
          this.activeJump = null
          this.scheduleNextJump(false)
          targetPose = sampleExpressionAmbient(
            this.expression,
            this.stateTime,
            this.anchorX,
            options.jumpIntensity,
          )
        } else {
          // Layer subtle expression character onto the jump
          let extraRot = 0
          if (this.expression === "oops" && sample.phase === "landing") {
            extraRot = Math.sin(this.jumpElapsed * 28) * 5
          } else if (this.expression === "happy" && sample.phase === "float") {
            extraRot = Math.sin(this.jumpElapsed * 18) * 4
          }
          targetPose = {
            x: sample.x,
            y: sample.y,
            scaleX: sample.scaleX,
            scaleY: sample.scaleY,
            rotation: sample.rotation + extraRot,
            phaseLabel: `jump · ${sample.phase}`,
            jumpPhase: sample.phase,
          }
        }
      } else {
        this.timeUntilNextJump -= dt
        if (this.timeUntilNextJump <= 0) {
          this.triggerJump(options.jumpIntensity)
        }
        targetPose = sampleExpressionAmbient(
          this.expression,
          this.stateTime,
          this.anchorX,
          options.jumpIntensity,
        )
      }

      // Keep horizontal position strictly within stage boundaries
      targetPose.x = Math.max(
        -this.maxOffsetX,
        Math.min(this.maxOffsetX, targetPose.x),
      )

      // Smoothly damp pose channels so transitions between expressions or jump phases never snap
      const posLambda = this.activeJump ? 28 : 16
      const scaleLambda = 22
      const rotLambda = 18
      this.pose = {
        x: damp(this.pose.x, targetPose.x, posLambda, clampedDt),
        y: damp(this.pose.y, targetPose.y, posLambda, clampedDt),
        scaleX: damp(
          this.pose.scaleX,
          targetPose.scaleX,
          scaleLambda,
          clampedDt,
        ),
        scaleY: damp(
          this.pose.scaleY,
          targetPose.scaleY,
          scaleLambda,
          clampedDt,
        ),
        rotation: damp(
          this.pose.rotation,
          targetPose.rotation,
          rotLambda,
          clampedDt,
        ),
        phaseLabel: targetPose.phaseLabel,
        jumpPhase: targetPose.jumpPhase,
      }

      // Record breadcrumb trail for trajectory visualization
      this.trailSampleAccum += clampedDt
      if (this.trailSampleAccum >= 0.032) {
        this.trailSampleAccum = 0
        this.trail.push({ x: this.pose.x, y: this.pose.y, age: 0 })
        if (this.trail.length > 42) {
          this.trail.shift()
        }
      }
      for (const pt of this.trail) {
        pt.age += clampedDt
      }
    }

    return this.getSnapshot()
  }

  public getSnapshot(): AnimationSnapshot {
    const seqIdx = EXPRESSION_NAMES.indexOf(this.expression)
    return {
      expression: this.expression,
      previousExpression: this.previousExpression,
      expressionBlend: this.expressionBlend,
      x: this.pose.x,
      y: this.pose.y,
      scaleX: this.pose.scaleX,
      scaleY: this.pose.scaleY,
      rotation: this.pose.rotation,
      phaseLabel: this.pose.phaseLabel,
      jumpPhase: this.pose.jumpPhase,
      activeJump: this.activeJump,
      lastJump: this.lastJump,
      trajectoryArc: this.trajectoryArc,
      trail: this.trail,
      sequenceIndex: seqIdx >= 0 ? seqIdx : 0,
      sequenceProgress: Math.min(
        1,
        this.sequenceTimer / SEQUENCE_STEP_DURATION,
      ),
      elapsedTime: this.elapsedTime,
    }
  }
}
