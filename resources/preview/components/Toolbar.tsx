import { Crosshair, Play } from "lucide-react"
import type { ReactNode } from "react"
import { CANVAS_BACKGROUNDS, type CanvasBackground } from "../canvas"

interface ToolbarProps {
  background: CanvasBackground
  onBackgroundChange: (background: CanvasBackground) => void
  ghost: boolean
  onGhostChange: (on: boolean) => void
  guides: boolean
  onGuidesChange: (on: boolean) => void
  animateCards?: boolean
  onAnimateCardsChange?: (on: boolean) => void
}

export function Toolbar({
  background,
  onBackgroundChange,
  ghost,
  onGhostChange,
  guides,
  onGuidesChange,
  animateCards = false,
  onAnimateCardsChange,
}: ToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div
        role="group"
        aria-label="Canvas background"
        className="grid w-full grid-cols-2 gap-1 rounded-[20px] bg-white p-1 ring-1 ring-line sm:inline-flex sm:w-auto sm:gap-0 sm:rounded-full"
      >
        {CANVAS_BACKGROUNDS.map((option) => {
          const active = option.id === background
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={active}
              onClick={() => onBackgroundChange(option.id)}
              className={`inline-flex h-8 items-center gap-2 rounded-full pl-2 pr-3 text-[12.5px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ink ${
                active ? "bg-ink text-paper" : "text-ink-2 hover:text-ink"
              }`}
            >
              <span
                aria-hidden="true"
                className={`size-3.5 rounded-full ring-1 ${
                  active ? "ring-white/30" : "ring-ink/15"
                } ${option.className}`}
                style={
                  option.id === "transparent"
                    ? { backgroundSize: "7px 7px" }
                    : undefined
                }
              />
              {option.label}
            </button>
          )
        })}
      </div>
      <OverlayToggle
        pressed={ghost}
        onPressedChange={onGhostChange}
        icon={<DashedOval />}
      >
        Idle outline
      </OverlayToggle>
      <OverlayToggle
        pressed={guides}
        onPressedChange={onGuidesChange}
        icon={<Crosshair className="size-3.5 text-guide" strokeWidth={2} />}
      >
        Guides
      </OverlayToggle>
      {onAnimateCardsChange && (
        <OverlayToggle
          pressed={animateCards}
          onPressedChange={onAnimateCardsChange}
          icon={<Play className="size-3.5" strokeWidth={2} />}
        >
          Animate cards
        </OverlayToggle>
      )}
    </div>
  )
}

interface OverlayToggleProps {
  pressed: boolean
  onPressedChange: (pressed: boolean) => void
  icon: ReactNode
  children: ReactNode
}

function OverlayToggle({
  pressed,
  onPressedChange,
  icon,
  children,
}: OverlayToggleProps) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => onPressedChange(!pressed)}
      className={`inline-flex h-10 items-center gap-2 rounded-full px-3.5 text-[12.5px] ring-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
        pressed
          ? "bg-ink text-paper ring-ink"
          : "bg-white text-ink-2 ring-line hover:text-ink"
      }`}
    >
      {icon}
      {children}
    </button>
  )
}

/** Legend swatch matching the dashed reference outline drawn on the canvases. */
function DashedOval() {
  return (
    <svg viewBox="0 0 14 14" className="size-3.5" aria-hidden="true">
      <ellipse
        cx={7}
        cy={7}
        rx={4.2}
        ry={6}
        fill="none"
        className="stroke-guide"
        strokeWidth={1.5}
        strokeDasharray="2.2 1.6"
      />
    </svg>
  )
}
