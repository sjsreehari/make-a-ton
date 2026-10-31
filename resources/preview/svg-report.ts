/** Geometry of one ellipse exactly as written in an expression file. */
export interface EllipseSpec {
  cx: number
  cy: number
  rx: number
  ry: number
  rotate: number
}

export type CheckId = "elements" | "canvas" | "stroke" | "fill" | "clean"

export interface CheckDefinition {
  id: CheckId
  label: string
}

export const CHECKS: readonly CheckDefinition[] = [
  { id: "elements", label: "3 ellipses" },
  { id: "canvas", label: "400 × 400" },
  { id: "stroke", label: "Stroke 4 · #000" },
  { id: "fill", label: "Fill #FFF" },
  { id: "clean", label: "No extras" },
]

export interface SvgReport {
  body: EllipseSpec
  left: EllipseSpec
  right: EllipseSpec
  checks: Record<CheckId, boolean>
  passed: boolean
}

const DRAWABLE =
  "path, rect, circle, ellipse, line, polyline, polygon, text, image, use, foreignObject"
const EXTRAS =
  "g, defs, style, script, filter, linearGradient, radialGradient, pattern, mask, clipPath, symbol, marker"

/** Parses an expression file and verifies it against Whyte's character rules. */
export function inspectSvg(markup: string): SvgReport | null {
  const doc = new DOMParser().parseFromString(markup, "image/svg+xml")
  const svg = doc.documentElement
  if (
    svg.localName !== "svg" ||
    doc.getElementsByTagName("parsererror").length > 0
  )
    return null

  const parts = ["body", "eye-left", "eye-right"].map((id) =>
    svg.querySelector(`[id="${id}"]`),
  )
  if (parts.some((el) => el?.localName !== "ellipse")) return null
  const [body, left, right] = parts.map((el) => readEllipse(el as Element))

  const ellipses = Array.from(svg.querySelectorAll("ellipse"))
  const color = (el: Element, name: string) =>
    el.getAttribute(name)?.toUpperCase()
  const checks: Record<CheckId, boolean> = {
    elements:
      ellipses.length === 3 && svg.querySelectorAll(DRAWABLE).length === 3,
    canvas:
      svg.getAttribute("viewBox") === "0 0 400 400" &&
      svg.getAttribute("width") === "400" &&
      svg.getAttribute("height") === "400",
    stroke: ellipses.every(
      (el) =>
        el.getAttribute("stroke-width") === "4" &&
        color(el, "stroke") === "#000000",
    ),
    fill: ellipses.every((el) => color(el, "fill") === "#FFFFFF"),
    clean: svg.querySelectorAll(EXTRAS).length === 0,
  }
  return {
    body,
    left,
    right,
    checks,
    passed: Object.values(checks).every(Boolean),
  }
}

function readEllipse(el: Element): EllipseSpec {
  const num = (name: string) => Number(el.getAttribute(name) ?? 0)
  const rotation = /rotate\(\s*(-?[\d.]+)/.exec(
    el.getAttribute("transform") ?? "",
  )
  return {
    cx: num("cx"),
    cy: num("cy"),
    rx: num("rx"),
    ry: num("ry"),
    rotate: rotation ? Number(rotation[1]) : 0,
  }
}

export interface ExpressionMetrics {
  /** Body rotation in degrees; positive leans right. */
  tilt: number
  /** Body width and height relative to the reference. */
  body: [number, number]
  /** Eye width and height relative to the reference. */
  eyes: [number, number]
  /** How far the eyes moved from their resting spot on the body, in canvas px. */
  gaze: [number, number]
}

/** Describes an expression relative to the reference (idle) file, measured from the markup. */
export function compareToReference(
  report: SvgReport,
  reference: SvgReport,
): ExpressionMetrics {
  const sx = report.body.rx / reference.body.rx
  const sy = report.body.ry / reference.body.ry
  const eyeMidpoint = (r: SvgReport) => ({
    x: (r.left.cx + r.right.cx) / 2 - r.body.cx,
    y: (r.left.cy + r.right.cy) / 2 - r.body.cy,
  })
  // Where the eyes would sit on this (scaled, tilted) body if they weren't looking anywhere.
  const rest = eyeMidpoint(reference)
  const angle = (report.body.rotate * Math.PI) / 180
  const restX = rest.x * sx * Math.cos(angle) - rest.y * sy * Math.sin(angle)
  const restY = rest.x * sx * Math.sin(angle) + rest.y * sy * Math.cos(angle)
  const eyes = eyeMidpoint(report)
  return {
    tilt: report.body.rotate,
    body: [sx, sy],
    eyes: [
      report.left.rx / reference.left.rx,
      report.left.ry / reference.left.ry,
    ],
    gaze: [eyes.x - restX, eyes.y - restY],
  }
}
