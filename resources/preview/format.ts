const MINUS = "\u2212"

export function formatDegrees(degrees: number): string {
  if (degrees === 0) return "0°"
  return `${
    degrees > 0 ? "+" : MINUS
  }${Math.abs(Math.round(degrees * 10) / 10)}°`
}

export function formatScale([width, height]: [number, number]): string {
  const w = Math.round(width * 100)
  const h = Math.round(height * 100)
  return w === h ? `${w}%` : `${w}×${h}%`
}

const DIRECTIONS = [
  "right",
  "down-right",
  "down",
  "down-left",
  "left",
  "up-left",
  "up",
  "up-right",
] as const

export function describeGaze([x, y]: [number, number]): string {
  if (Math.hypot(x, y) < 2) return "ahead"
  const sector = Math.round(Math.atan2(y, x) / (Math.PI / 4))
  return DIRECTIONS[(sector + 8) % 8]
}

export function formatBytes(bytes: number): string {
  return bytes < 1024 ? `${bytes} B` : `${(bytes / 1024).toFixed(1)} KB`
}
