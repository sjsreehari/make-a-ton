import { useEffect, useState } from "react"
import { EXPRESSIONS, type ExpressionName } from "./expressions"
import { inspectSvg, type SvgReport } from "./svg-report"

export type ExpressionFile = { state: "loading" } | { state: "error" } | {
  state: "ready"
  markup: string
  report: SvgReport | null
}

export type ExpressionFiles = Record<ExpressionName, ExpressionFile>

const INITIAL = Object.fromEntries(
  EXPRESSIONS.map((expression) => [expression.name, { state: "loading" }]),
) as ExpressionFiles

/** Loads every expression file so the preview inspects, copies and bundles the real assets. */
export function useExpressionFiles(): ExpressionFiles {
  const [files, setFiles] = useState<ExpressionFiles>(INITIAL)

  useEffect(() => {
    const controller = new AbortController()
    const update = (name: ExpressionName, file: ExpressionFile) =>
      setFiles((current) => ({ ...current, [name]: file }))

    for (const expression of EXPRESSIONS) {
      fetch(expression.url, { signal: controller.signal })
        .then((response) => {
          if (!response.ok)
            throw new Error(`${response.status} ${response.statusText}`)
          return response.text()
        })
        .then((markup) =>
          update(expression.name, {
            state: "ready",
            markup,
            report: inspectSvg(markup),
          }),
        )
        .catch(() => {
          if (!controller.signal.aborted)
            update(expression.name, { state: "error" })
        })
    }
    return () => controller.abort()
  }, [])

  return files
}
