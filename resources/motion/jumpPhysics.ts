export type JumpPhase = "anticipation" | "takeoff" | "float" | "descent" | "landing" | "recovery" | "done"

export interface JumpConfig {
  /** Starting horizontal offset in stage px (0 = stage center). */
  startX: number
  /** Starting vertical offset in stage px (0 = ground level, negative = above ground). */
  startY: number
  /** Target horizontal offset in stage px. */
  targetX: number
  /** Target vertical offset in stage px (usually 0 for ground). */
  targetY: number
  /** Peak height above the higher of startY/targetY, in stage px. */
  height: number
  /** Total air time (takeoff + float + descent) in seconds. */
  airDuration: number
  /** Pre-jump crouch/squash time in seconds. */
  anticipationDuration: number
  /** Share of airDuration spent hovering near the peak (0.08 – 0.45). */
  floatRatio: number
  /** Landing compression time in seconds. */
  landingDuration: number
  /** Post-landing elastic settle time in seconds. */
  recoveryDuration: number
  /** Peak mid-air rotation in degrees (signed). */
  rotation: number
  /** Squash/stretch multiplier (1 = normal, >1 = exaggerated). */
  squashIntensity: number
  /** Landing impact multiplier (1 = normal, >1 = heavier landing squash). */
  landingIntensity: number
}

export interface JumpSample {
  x: number
  y: number
  scaleX: number
  scaleY: number
  rotation: number
  phase: JumpPhase
  /** Normalized progress across the entire jump lifecycle (0..1). */
  progress: number
  /** Normalized progress across the airborne arc only (0..1). */
  airProgress: number
}

export interface TrajectoryPoint {
  x: number
  y: number
  t: number
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v))
}

function smoothstep(t: number): number {
  const c = clamp01(t)
  return c * c * (3 - 2 * c)
}

function easeOutCubic(t: number): number {
  const c = clamp01(t)
  return 1 - Math.pow(1 - c, 3)
}

function easeInQuad(t: number): number {
  const c = clamp01(t)
  return c * c
}

/**
 * Shapes the vertical arc so there is a genuine floating hang-time window
 * around the peak before gravity accelerates the descent.
 * Returns 0 at ground, 1 at peak.
 */
function verticalArcWithFloat(u: number, floatRatio: number): number {
  const f = Math.max(0.06, Math.min(0.45, floatRatio))
  const ascentEnd = 0.5 - f * 0.5
  const floatEnd = 0.5 + f * 0.5

  if (u <= ascentEnd) {
    const p = clamp01(u / ascentEnd)
    // Fast launch decelerating smoothly into the peak
    return 1 - Math.pow(1 - p, 2.3)
  }
  if (u <= floatEnd) {
    // Gentle hovering dome at the apex
    const p = (u - ascentEnd) / Math.max(0.0001, floatEnd - ascentEnd)
    const mid = (p - 0.5) * 2
    return 1 - 0.025 * mid * mid
  }
  const p = clamp01((u - floatEnd) / Math.max(0.0001, 1 - floatEnd))
  // Accelerating descent toward landing
  return 1 - Math.pow(p, 2.15)
}

/** Total duration of a jump including anticipation, air, landing, and recovery. */
export function getTotalJumpDuration(config: JumpConfig): number {
  return (
    config.anticipationDuration +
    config.airDuration +
    config.landingDuration +
    config.recoveryDuration
  )
}

/**
 * Evaluates a jump at elapsed `elapsed` seconds, scaled by user `jumpIntensity`.
 */
export function sampleJump(
  config: JumpConfig,
  elapsed: number,
  jumpIntensity = 1,
): JumpSample {
  const intensity = Math.max(0.35, Math.min(2.2, jumpIntensity))
  const effectiveHeight = config.height * intensity
  const squashAmp = config.squashIntensity * (0.65 + 0.35 * intensity)
  const landAmp = config.landingIntensity * (0.65 + 0.35 * intensity)

  const tAnt = config.anticipationDuration
  const tAir = config.airDuration
  const tLand = config.landingDuration
  const tRec = config.recoveryDuration
  const total = Math.max(0.001, tAnt + tAir + tLand + tRec)
  const progress = clamp01(elapsed / total)

  const dx = config.targetX - config.startX
  const direction = dx === 0 ? 1 : Math.sign(dx)
  const distanceFactor = Math.min(1, Math.abs(dx) / 140)

  // 1. Anticipation: crouch & squash before takeoff
  if (elapsed < tAnt) {
    const p = clamp01(elapsed / Math.max(0.001, tAnt))
    // Wind up with a smooth crouch curve that peaks right before launch
    const crouch = Math.sin(p * Math.PI * 0.88)
    const squash = 0.14 * squashAmp * crouch
    const preLean = -direction * distanceFactor * 3.5 * smoothstep(p)
    return {
      x: config.startX,
      y: config.startY + crouch * 4 * squashAmp,
      scaleX: 1 + squash * 0.78,
      scaleY: 1 - squash,
      rotation: preLean,
      phase: "anticipation",
      progress,
      airProgress: 0,
    }
  }

  // 2. Airborne: takeoff -> peak float -> descent
  const airElapsed = elapsed - tAnt
  if (airElapsed < tAir) {
    const u = clamp01(airElapsed / Math.max(0.001, tAir))
    const horiz = smoothstep(u)
    const x = config.startX + dx * horiz
    const baseLineY = config.startY + (config.targetY - config.startY) * horiz
    const arc = verticalArcWithFloat(u, config.floatRatio)
    const y = baseLineY - effectiveHeight * arc

    const f = Math.max(0.06, Math.min(0.45, config.floatRatio))
    const ascentEnd = 0.5 - f * 0.5
    const floatEnd = 0.5 + f * 0.5

    let phase: JumpPhase = "takeoff"
    let stretch = 0
    if (u < ascentEnd) {
      phase = "takeoff"
      const p = u / ascentEnd
      // Stretch peaks shortly after liftoff, then relaxes approaching the peak
      stretch = Math.sin(p * Math.PI) * 0.16 * squashAmp
    } else if (u < floatEnd) {
      phase = "float"
      const p = (u - ascentEnd) / Math.max(0.001, floatEnd - ascentEnd)
      // Soft buoyant expansion at the apex
      stretch = -0.025 * Math.sin(p * Math.PI) * squashAmp
    } else {
      phase = "descent"
      const p = (u - floatEnd) / Math.max(0.001, 1 - floatEnd)
      // Progressive vertical stretch as downward speed builds
      stretch = easeInQuad(p) * 0.12 * squashAmp
    }

    // Mid-air rotation: banks into jump direction or uses configured expressive rotation
    const bankAngle =
      config.rotation !== 0
        ? config.rotation * Math.sin(u * Math.PI)
        : direction * distanceFactor * 8 * Math.sin(u * Math.PI)

    return {
      x,
      y,
      scaleX: 1 - stretch * 0.58,
      scaleY: 1 + stretch,
      rotation: bankAngle * (0.75 + 0.25 * intensity),
      phase,
      progress,
      airProgress: u,
    }
  }

  // 3. Landing impact: absorb momentum with grounded squash
  const landElapsed = airElapsed - tAir
  if (landElapsed < tLand) {
    const p = clamp01(landElapsed / Math.max(0.001, tLand))
    // Quick compression peaking at p ~ 0.45, then starting to rise
    const impact = Math.sin(Math.pow(p, 0.75) * Math.PI)
    const squash = 0.19 * landAmp * impact
    const residualTilt =
      (config.rotation !== 0
        ? Math.sign(config.rotation) * 4
        : direction * distanceFactor * 3) *
      (1 - easeOutCubic(p))
    return {
      x: config.targetX,
      y: config.targetY + impact * 5 * landAmp,
      scaleX: 1 + squash * 0.82,
      scaleY: 1 - squash,
      rotation: residualTilt,
      phase: "landing",
      progress,
      airProgress: 1,
    }
  }

  // 4. Recovery: gentle elastic settle back to neutral
  const recElapsed = landElapsed - tLand
  if (recElapsed < tRec) {
    const p = clamp01(recElapsed / Math.max(0.001, tRec))
    const decay = Math.exp(-4.2 * p)
    const wave = Math.sin(p * Math.PI * 2) * decay
    const rebound = 0.06 * landAmp * wave
    return {
      x: config.targetX,
      y: config.targetY - rebound * 14,
      scaleX: 1 - rebound * 0.55,
      scaleY: 1 + rebound,
      rotation: wave * 1.6 * direction,
      phase: "recovery",
      progress,
      airProgress: 1,
    }
  }

  return {
    x: config.targetX,
    y: config.targetY,
    scaleX: 1,
    scaleY: 1,
    rotation: 0,
    phase: "done",
    progress: 1,
    airProgress: 1,
  }
}

/**
 * Samples the airborne curve of a jump for the trajectory overlay.
 */
export function sampleJumpTrajectory(
  config: JumpConfig,
  jumpIntensity = 1,
  steps = 36,
): TrajectoryPoint[] {
  const intensity = Math.max(0.35, Math.min(2.2, jumpIntensity))
  const effectiveHeight = config.height * intensity
  const dx = config.targetX - config.startX
  const points: TrajectoryPoint[] = []

  for (let i = 0; i <= steps; i++) {
    const u = i / steps
    const horiz = smoothstep(u)
    const x = config.startX + dx * horiz
    const baseLineY = config.startY + (config.targetY - config.startY) * horiz
    const arc = verticalArcWithFloat(u, config.floatRatio)
    const y = baseLineY - effectiveHeight * arc
    points.push({ x, y, t: u })
  }

  return points
}

/**
 * Chooses a new horizontal target inside `[-maxOffsetX, maxOffsetX]` that
 * moves a meaningful distance and alternates or varies direction organically.
 */
export function pickStageTargetX(
  currentX: number,
  maxOffsetX: number,
  minStepRatio = 0.28,
  maxStepRatio = 0.72,
  seed = Math.random(),
): number {
  const safeBound = Math.max(40, maxOffsetX)
  const minStep = safeBound * minStepRatio
  const maxStep = safeBound * maxStepRatio
  const step =
    minStep + ((maxStep - minStep) * ((seed * 9301 + 49297) % 233280)) / 233280

  // Prefer jumping toward the side with more room, with occasional shorter hops
  const roomRight = safeBound - currentX
  const roomLeft = currentX + safeBound
  let dir: number
  if (roomRight < minStep * 0.9) {
    dir = -1
  } else if (roomLeft < minStep * 0.9) {
    dir = 1
  } else {
    dir =
      seed > 0.48
        ? roomRight >= roomLeft
          ? 1
          : -1
        : roomRight >= roomLeft
          ? -1
          : 1
  }

  const candidate = currentX + dir * step
  return Math.max(-safeBound, Math.min(safeBound, candidate))
}
