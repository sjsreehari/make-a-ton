import type { ExpressionName } from "../preview/expressions"
import {
  getTotalJumpDuration,
  pickStageTargetX,
  sampleJump,
  type JumpConfig,
  type JumpPhase,
} from "./jumpPhysics"

export interface PoseSample {
  x: number
  y: number
  scaleX: number
  scaleY: number
  rotation: number
  phaseLabel: string
  jumpPhase: JumpPhase | null
}

export interface ExpressionBehaviourMeta {
  name: ExpressionName
  tagline: string
  motionNotes: readonly string[]
  cadenceLabel: string
  /** Default rest interval between autonomous jumps (seconds). */
  restInterval: [number, number]
}

export const EXPRESSION_BEHAVIOUR_META: Record<ExpressionName, ExpressionBehaviourMeta> =
  {
    idle: {
      name: "idle",
      tagline: "Gentle continuous floating, calm breathing, and soft pauses",
      motionNotes: [
        "Continuous multi-harmonic hover",
        "Subtle breathing scale (1.5%)",
        "Occasional calm weight-shift hop",
      ],
      cadenceLabel: "Calm · 3.6s breath cycle",
      restInterval: [5.2, 7.4],
    },
    listening: {
      name: "listening",
      tagline: "Attentive directional lean, low float, and small nod reactions",
      motionNotes: [
        "Directional tilt toward input",
        "Double-nod acknowledgment cues",
        "Small attentive adjustment hops",
      ],
      cadenceLabel: "Attentive · 2.4s nod cycle",
      restInterval: [3.8, 5.2],
    },
    thinking: {
      name: "thinking",
      tagline: "Slow contemplative float with pondering tilts and still pauses",
      motionNotes: [
        "Slow high hover with mid-thought pauses",
        "Contemplative pendulum rotation",
        "Unhurried reposition hops",
      ],
      cadenceLabel: "Contemplative · 4.4s drift",
      restInterval: [4.8, 6.6],
    },
    talking: {
      name: "talking",
      tagline: "Rhythmic syllable bounces grouped into natural speech phrases",
      motionNotes: [
        "Syllable-cadence vertical bouncing",
        "Varied bounce emphasis + breath pauses",
        "Expressive mid-phrase hop accents",
      ],
      cadenceLabel: "Conversational · ~4.5 Hz syllables",
      restInterval: [3.2, 4.6],
    },
    moving: {
      name: "moving",
      tagline: "Continuous locomotion through curved, multi-directional jumps",
      motionNotes: [
        "Anticipation crouch → stretch takeoff",
        "Curved arc with peak hang-time",
        "Grounded landing squash & recovery",
      ],
      cadenceLabel: "Locomotion · continuous jumps",
      restInterval: [0.32, 0.68],
    },
    pointing: {
      name: "pointing",
      tagline:
        "Small anticipatory bounce, deliberate directional hop, and settle",
      motionNotes: [
        "Preparatory cue bounce",
        "Confident short float toward target",
        "Deliberate directional tilt & hold",
      ],
      cadenceLabel: "Deliberate · cue & hold cycle",
      restInterval: [1.9, 2.8],
    },
    happy: {
      name: "happy",
      tagline:
        "High celebratory jumps, exaggerated squash & stretch, playful landings",
      motionNotes: [
        "High-arc energetic jumps",
        "Exaggerated squash & stretch",
        "Playful mid-air tilt & double-hop",
      ],
      cadenceLabel: "Exuberant · high-arc hops",
      restInterval: [0.55, 1.15],
    },
    oops: {
      name: "oops",
      tagline:
        "Sudden reaction jump, awkward tilt, heavy landing squash & delayed recovery",
      motionNotes: [
        "Startled upward reaction pop",
        "Off-kilter wobble & heavy landing squash",
        "Delayed sheepish recovery into rest",
      ],
      cadenceLabel: "Reactive · startle & slow recovery",
      restInterval: [2.2, 3.3],
    },
  }

/**
 * Builds an expression-appropriate JumpConfig from `currentX` to `targetX`.
 */
export function createExpressionJump(
  expression: ExpressionName,
  currentX: number,
  maxOffsetX: number,
  cycleIndex: number,
  explicitTargetX?: number,
): JumpConfig {
  const seed = ((cycleIndex + 1) * 0.6180339887) % 1

  switch (expression) {
    case "moving": {
      const targetX =
        explicitTargetX ??
        pickStageTargetX(currentX, maxOffsetX, 0.34, 0.78, seed)
      const dist = Math.abs(targetX - currentX)
      const dir = targetX >= currentX ? 1 : -1
      return {
        startX: currentX,
        startY: 0,
        targetX,
        targetY: 0,
        height: 68 + Math.min(48, dist * 0.22) + (cycleIndex % 3) * 10,
        airDuration: 0.56 + Math.min(0.22, dist * 0.0009),
        anticipationDuration: 0.16,
        floatRatio: 0.22,
        landingDuration: 0.15,
        recoveryDuration: 0.22,
        rotation: dir * (8 + (cycleIndex % 2) * 3),
        squashIntensity: 1.15,
        landingIntensity: 1.15,
      }
    }

    case "happy": {
      // Alternates between a big celebratory travel jump and a joyful hop near the spot
      const isBig = cycleIndex % 2 === 0
      const targetX =
        explicitTargetX ??
        (isBig
          ? pickStageTargetX(currentX, maxOffsetX * 0.85, 0.22, 0.55, seed)
          : Math.max(
              -maxOffsetX,
              Math.min(maxOffsetX, currentX + (seed > 0.5 ? 1 : -1) * 28),
            ))
      const dir = targetX >= currentX ? 1 : -1
      return {
        startX: currentX,
        startY: 0,
        targetX,
        targetY: 0,
        height: isBig ? 112 : 84,
        airDuration: isBig ? 0.68 : 0.52,
        anticipationDuration: 0.18,
        floatRatio: 0.3,
        landingDuration: 0.17,
        recoveryDuration: 0.28,
        rotation: dir * (isBig ? 11 : -8),
        squashIntensity: 1.45,
        landingIntensity: 1.4,
      }
    }

    case "oops": {
      // Sudden startled recoil jump, awkward rotation, heavy landing squash, long recovery
      const recoilStep =
        (cycleIndex % 2 === 0 ? -1 : 1) * (36 + (cycleIndex % 3) * 14)
      const targetX =
        explicitTargetX ??
        Math.max(
          -maxOffsetX * 0.85,
          Math.min(maxOffsetX * 0.85, currentX + recoilStep),
        )
      return {
        startX: currentX,
        startY: 0,
        targetX,
        targetY: 0,
        height: 64,
        airDuration: 0.46,
        anticipationDuration: 0.08, // sudden startle!
        floatRatio: 0.28, // brief frozen hang at the peak
        landingDuration: 0.26, // heavy landing compression
        recoveryDuration: 0.85, // delayed sheepish recovery
        rotation: cycleIndex % 2 === 0 ? -12 : 10,
        squashIntensity: 1.4,
        landingIntensity: 1.65,
      }
    }

    case "pointing": {
      // Deliberate hop toward the left/target side (or explicit target), then confident settle
      const defaultTarget =
        currentX > -maxOffsetX * 0.35
          ? Math.max(
              -maxOffsetX * 0.72,
              currentX - (54 + (cycleIndex % 2) * 24),
            )
          : Math.min(maxOffsetX * 0.35, currentX + 68)
      const targetX = explicitTargetX ?? defaultTarget
      return {
        startX: currentX,
        startY: 0,
        targetX,
        targetY: 0,
        height: 44,
        airDuration: 0.44,
        anticipationDuration: 0.17,
        floatRatio: 0.26,
        landingDuration: 0.14,
        recoveryDuration: 0.3,
        rotation: -7,
        squashIntensity: 0.95,
        landingIntensity: 0.95,
      }
    }

    case "talking": {
      const step = (cycleIndex % 2 === 0 ? 1 : -1) * 34
      const targetX =
        explicitTargetX ??
        Math.max(
          -maxOffsetX * 0.75,
          Math.min(maxOffsetX * 0.75, currentX + step),
        )
      return {
        startX: currentX,
        startY: 0,
        targetX,
        targetY: 0,
        height: 48,
        airDuration: 0.44,
        anticipationDuration: 0.13,
        floatRatio: 0.18,
        landingDuration: 0.13,
        recoveryDuration: 0.2,
        rotation: step > 0 ? 5 : -5,
        squashIntensity: 1.0,
        landingIntensity: 0.95,
      }
    }

    case "listening": {
      const step = (cycleIndex % 2 === 0 ? -1 : 1) * 30
      const targetX =
        explicitTargetX ??
        Math.max(-maxOffsetX * 0.7, Math.min(maxOffsetX * 0.7, currentX + step))
      return {
        startX: currentX,
        startY: 0,
        targetX,
        targetY: 0,
        height: 38,
        airDuration: 0.42,
        anticipationDuration: 0.15,
        floatRatio: 0.22,
        landingDuration: 0.14,
        recoveryDuration: 0.24,
        rotation: -5,
        squashIntensity: 0.9,
        landingIntensity: 0.9,
      }
    }

    case "thinking": {
      const step = (cycleIndex % 2 === 0 ? 1 : -1) * 42
      const targetX =
        explicitTargetX ??
        Math.max(-maxOffsetX * 0.7, Math.min(maxOffsetX * 0.7, currentX + step))
      return {
        startX: currentX,
        startY: 0,
        targetX,
        targetY: 0,
        height: 46,
        airDuration: 0.56,
        anticipationDuration: 0.2,
        floatRatio: 0.34,
        landingDuration: 0.16,
        recoveryDuration: 0.32,
        rotation: -6,
        squashIntensity: 0.85,
        landingIntensity: 0.85,
      }
    }

    case "idle":
    default: {
      const step = (cycleIndex % 2 === 0 ? 1 : -1) * 26
      const targetX =
        explicitTargetX ??
        Math.max(
          -maxOffsetX * 0.65,
          Math.min(maxOffsetX * 0.65, currentX + step),
        )
      return {
        startX: currentX,
        startY: 0,
        targetX,
        targetY: 0,
        height: 40,
        airDuration: 0.48,
        anticipationDuration: 0.16,
        floatRatio: 0.26,
        landingDuration: 0.14,
        recoveryDuration: 0.26,
        rotation: step > 0 ? 4 : -4,
        squashIntensity: 0.85,
        landingIntensity: 0.85,
      }
    }
  }
}

/**
 * Evaluates the continuous ambient behaviour of an expression when not mid-jump,
 * OR layers subtle expression nuances onto an active jump.
 */
export function sampleExpressionAmbient(
  expression: ExpressionName,
  time: number,
  anchorX: number,
  jumpIntensity: number,
): PoseSample {
  const amp = Math.max(0.45, Math.min(1.9, jumpIntensity))

  switch (expression) {
    case "idle": {
      // Calm continuous floating with occasional soft pause at the top of the breath
      const rawSin = Math.sin(time * 1.75)
      const harmonic = Math.sin(time * 0.85 + 0.8) * 0.35
      // Soft plateau pause every ~5.5s
      const pauseGate = 0.72 + 0.28 * Math.cos(time * 0.55)
      const floatY = -10 + (rawSin + harmonic) * 7.5 * pauseGate
      const swayX = Math.sin(time * 0.62) * 5.5 * pauseGate
      const breath = Math.sin(time * 1.75 - 0.4) * 0.018 * pauseGate
      const tilt = Math.sin(time * 0.62 + 0.5) * 1.6 * pauseGate
      return {
        x: anchorX + swayX,
        y: floatY,
        scaleX: 1 - breath * 0.45,
        scaleY: 1 + breath,
        rotation: tilt,
        phaseLabel: pauseGate < 0.58 ? "calm pause" : "gentle float",
        jumpPhase: null,
      }
    }

    case "listening": {
      // Slight directional tilting, gentle low hover, periodic double-nod reaction
      const cycle = time % 3.2
      let nodY = 0
      let nodScale = 0
      let nodRot = 0
      let label = "attentive float"
      if (cycle > 2.1 && cycle < 2.95) {
        // Subtle double-nod reaction
        const p = (cycle - 2.1) / 0.85
        const nodWave = Math.sin(p * Math.PI * 2) * Math.sin(p * Math.PI)
        nodY = Math.abs(nodWave) * 6.5 * amp
        nodScale = Math.abs(nodWave) * 0.045 * amp
        nodRot = -nodWave * 3.5 * amp
        label = "attentive nod"
      }
      const floatY = -6 + Math.sin(time * 2.1) * 4.5 + nodY
      const driftX = -4 + Math.sin(time * 0.9) * 3.5
      const baseTilt = -3.8 + Math.sin(time * 1.35) * 2.4 + nodRot
      return {
        x: anchorX + driftX,
        y: floatY,
        scaleX: 1 + nodScale * 0.75 + Math.sin(time * 2.1) * 0.01,
        scaleY: 1 - nodScale - Math.sin(time * 2.1) * 0.012,
        rotation: baseTilt,
        phaseLabel: label,
        jumpPhase: null,
      }
    }

    case "thinking": {
      // Slow floating, contemplative rotation with distinct thoughtful pauses
      const period = 4.6
      const phase = (time % period) / period
      // Smooth step between two pondering angles with still pauses in between
      let ponderAngle: number
      let label = "contemplating"
      if (phase < 0.32) {
        ponderAngle = -5.5 * Math.cos((phase / 0.32) * Math.PI)
      } else if (phase < 0.5) {
        ponderAngle = 5.5
        label = "holding thought"
      } else if (phase < 0.82) {
        ponderAngle = 5.5 * Math.cos(((phase - 0.5) / 0.32) * Math.PI)
      } else {
        ponderAngle = -5.5
        label = "holding thought"
      }
      const floatY = -16 + Math.sin(time * 1.15) * 7 + Math.cos(time * 0.55) * 3
      const driftX = Math.sin(time * 0.58) * 7
      const breath = Math.sin(time * 1.15) * 0.015
      return {
        x: anchorX + driftX,
        y: floatY,
        scaleX: 1 - breath * 0.5,
        scaleY: 1 + breath,
        rotation: ponderAngle + Math.sin(time * 1.7) * 0.9,
        phaseLabel: label,
        jumpPhase: null,
      }
    }

    case "talking": {
      // Rhythmic vertical bouncing organized into conversational phrases with pauses
      const phrasePeriod = 2.9
      const phrasePos = (time % phrasePeriod) / phrasePeriod
      const speaking = phrasePos < 0.76
      if (!speaking) {
        // Short breath between sentences
        const p = (phrasePos - 0.76) / 0.24
        const inhale = Math.sin(p * Math.PI)
        return {
          x: anchorX + Math.sin(time * 0.9) * 3,
          y: -5 - inhale * 4,
          scaleX: 1 - inhale * 0.018,
          scaleY: 1 + inhale * 0.028,
          rotation: Math.sin(time * 1.1) * 1.5,
          phaseLabel: "breath pause",
          jumpPhase: null,
        }
      }
      // Syllable cadence (~4.4 bounces per second) with varied stress
      const syllableClock = time * 4.4 * Math.PI
      const syllableBounce = Math.abs(Math.sin(syllableClock))
      const stress = 0.65 + 0.35 * Math.sin(time * 6.3) * Math.cos(time * 2.7)
      const bounceAmp = syllableBounce * stress * amp
      const y = -bounceAmp * 16
      const stretch = (syllableBounce - 0.38) * 0.095 * stress * amp
      const talkTilt = Math.sin(time * 5.5) * 2.8 * stress
      return {
        x: anchorX + Math.sin(time * 1.6) * 4,
        y,
        scaleX: 1 - stretch * 0.62,
        scaleY: 1 + stretch,
        rotation: talkTilt,
        phaseLabel: stress > 0.8 ? "stressed syllable" : "speaking rhythm",
        jumpPhase: null,
      }
    }

    case "pointing": {
      // Small anticipatory bounce -> short floating movement -> confident directional tilt settle
      const cycle = time % 2.4
      if (cycle < 0.32) {
        // Small anticipatory bounce crouch
        const p = cycle / 0.32
        const crouch = Math.sin(p * Math.PI)
        return {
          x: anchorX,
          y: crouch * 3 * amp,
          scaleX: 1 + crouch * 0.07 * amp,
          scaleY: 1 - crouch * 0.08 * amp,
          rotation: 2 * crouch,
          phaseLabel: "anticipatory bounce",
          jumpPhase: null,
        }
      }
      if (cycle < 1.05) {
        // Short floating movement toward the pointed target on the left
        const p = (cycle - 0.32) / 0.73
        const arc = Math.sin(p * Math.PI)
        const nudgeX = -Math.sin(p * Math.PI * 0.85) * 16 * amp
        const stretch = Math.sin(p * Math.PI * 2) * 0.055 * amp
        return {
          x: anchorX + nudgeX,
          y: -arc * 22 * amp,
          scaleX: 1 - stretch * 0.55,
          scaleY: 1 + stretch,
          rotation: -6.5 * Math.sin(p * Math.PI * 0.75),
          phaseLabel: "pointing float",
          jumpPhase: null,
        }
      }
      // Confident settle holding the directional cue
      const p = (cycle - 1.05) / 1.35
      const settle = Math.exp(-3.5 * p) * Math.sin(p * Math.PI * 3)
      const hover = Math.sin(p * Math.PI) * 3.5
      return {
        x: anchorX - 6 * (1 - p * 0.7),
        y: -hover + settle * 4,
        scaleX: 1 - settle * 0.03,
        scaleY: 1 + settle * 0.03,
        rotation: -4.2 * (1 - p * 0.45) + settle * 2,
        phaseLabel: "confident hold",
        jumpPhase: null,
      }
    }

    case "happy": {
      // Buoyant excited hover between high celebratory jumps
      const bounce = Math.abs(Math.sin(time * 5.2))
      const squash = Math.cos(time * 10.4) * 0.055 * amp
      return {
        x: anchorX + Math.sin(time * 2.6) * 5,
        y: -bounce * 14 * amp,
        scaleX: 1 + squash * 0.75,
        scaleY: 1 - squash,
        rotation: Math.sin(time * 2.6) * 4.5,
        phaseLabel: "playful bounce",
        jumpPhase: null,
      }
    }

    case "oops": {
      // Sheepish compressed settle with tiny nervous wobble between startle jumps
      const wobble = Math.sin(time * 6.8) * Math.exp(-((time % 2.2) * 1.4))
      const shrink = 0.045 + Math.sin(time * 1.8) * 0.015
      return {
        x: anchorX + wobble * 5,
        y: 2 + Math.sin(time * 1.8) * 2,
        scaleX: 1 + shrink * 0.75,
        scaleY: 1 - shrink,
        rotation: 3.5 + wobble * 5.5,
        phaseLabel: "sheepish recovery",
        jumpPhase: null,
      }
    }

    case "moving":
    default: {
      // Brief springy readiness between locomotion jumps
      const pulse = Math.sin(time * 4.2)
      return {
        x: anchorX,
        y: -Math.abs(pulse) * 5,
        scaleX: 1 + pulse * 0.025,
        scaleY: 1 - pulse * 0.025,
        rotation: 0,
        phaseLabel: "ready to jump",
        jumpPhase: null,
      }
    }
  }
}

export { getTotalJumpDuration, sampleJump }
