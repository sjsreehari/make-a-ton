export type CanvasBackground = "stage" | "white" | "transparent" | "dark"

export const CANVAS_BACKGROUNDS: readonly {
  id: CanvasBackground
  label: string
  className: string
}[] = [
  { id: "stage", label: "Stage", className: "bg-stage" },
  { id: "white", label: "White", className: "bg-white" },
  { id: "transparent", label: "Transparent", className: "bg-checker" },
  { id: "dark", label: "Dark", className: "bg-[#161616]" },
]

export function backgroundClass(id: CanvasBackground): string {
  return (
    CANVAS_BACKGROUNDS.find((option) => option.id === id)?.className ??
    "bg-stage"
  )
}
