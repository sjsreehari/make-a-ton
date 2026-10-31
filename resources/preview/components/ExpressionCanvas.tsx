import { backgroundClass, type CanvasBackground } from "../canvas"
import type { Expression } from "../expressions"
import type { EllipseSpec } from "../svg-report"

interface ExpressionCanvasProps {
  expression: Expression
  background?: CanvasBackground
  /** Reference outline drawn above the file for comparison. */
  ghost?: readonly EllipseSpec[] | null
  /** Centre lines plus the shared base line (y 308). */
  guides?: boolean
  className?: string
}

/** Shows the real SVG file, untouched, with optional comparison overlays drawn above it. */
export function ExpressionCanvas({
  expression,
  background = "stage",
  ghost = null,
  guides = false,
  className = "",
}: ExpressionCanvasProps) {
  const hasOverlay = guides || (ghost !== null && ghost.length > 0)

  return (
    <div
      className={`relative aspect-square ${backgroundClass(background)} ${className}`}
    >
      <img
        src={expression.url}
        alt={`Whyte, ${expression.label.toLowerCase()}`}
        width={400}
        height={400}
        draggable={false}
        className="absolute inset-0 size-full select-none"
      />
      {hasOverlay && (
        <svg
          viewBox="0 0 400 400"
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 size-full"
        >
          {guides && (
            <g className="stroke-guide" opacity={0.55}>
              <line
                x1={200}
                y1={0}
                x2={200}
                y2={400}
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1={0}
                y1={200}
                x2={400}
                y2={200}
                vectorEffect="non-scaling-stroke"
              />
              <line
                x1={0}
                y1={308}
                x2={400}
                y2={308}
                strokeDasharray="3 3"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          )}
          {ghost?.map((shape, index) => (
            <ellipse
              key={index}
              cx={shape.cx}
              cy={shape.cy}
              rx={shape.rx}
              ry={shape.ry}
              transform={
                shape.rotate
                  ? `rotate(${shape.rotate} ${shape.cx} ${shape.cy})`
                  : undefined
              }
              fill="none"
              className="stroke-guide"
              strokeWidth={1.5}
              strokeDasharray="5 4"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>
      )}
    </div>
  )
}
