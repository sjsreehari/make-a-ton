export const EXPRESSION_NAMES = [
  "idle",
  "listening",
  "thinking",
  "talking",
  "moving",
  "pointing",
  "happy",
  "oops",
] as const

export type ExpressionName = typeof EXPRESSION_NAMES[number]

export interface Expression {
  name: ExpressionName
  label: string
  /** File name inside `public/whyte/expressions/`. */
  file: string
  /** URL the file is served from (respects Vite's base path). */
  url: string
  summary: string
}

/** Folder that holds the standalone SVG files, relative to `public/`. */
export const EXPRESSIONS_PATH = "whyte/expressions/"

const DETAILS: Record<ExpressionName, Pick<Expression, "label" | "summary">> = {
  idle: {
    label: "Idle",
    summary: "Neutral and relaxed. Reference proportions, eyes straight ahead.",
  },
  listening: {
    label: "Listening",
    summary:
      "A touch compressed and leaning in, eyes dropped toward the input.",
  },
  thinking: {
    label: "Thinking",
    summary: "A slight head tilt; eyes drift up and narrow in concentration.",
  },
  talking: {
    label: "Talking",
    summary: "Lifted and expanded mid-word, eyes raised and a little brighter.",
  },
  moving: {
    label: "Moving",
    summary: "Leans and stretches into the move, eyes on the destination.",
  },
  pointing: {
    label: "Pointing",
    summary: "Tilts toward the target with both eyes fixed on it.",
  },
  happy: {
    label: "Happy",
    summary: "Squashed low as if about to hop, eyes rounder and lifted.",
  },
  oops: {
    label: "Oops",
    summary: "Compressed mid-shake, eyes glancing away a little unevenly.",
  },
}

export const EXPRESSIONS: readonly Expression[] = EXPRESSION_NAMES.map(
  (name) => ({
    name,
    ...DETAILS[name],
    file: `whyte-${name}.svg`,
    url: `${import.meta.env.BASE_URL}${EXPRESSIONS_PATH}whyte-${name}.svg`,
  }),
)
