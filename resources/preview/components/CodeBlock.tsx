import { Check, Copy } from "lucide-react"
import type { ReactNode } from "react"
import { CopyButton } from "./CopyButton"

const TOKEN = /(\/\/[^\n]*|<!--[\s\S]*?-->)|('[^'\n]*'|"[^"\n]*"|`[^`]*`)/g

/** Quiet, monochrome tinting: comments recede, strings warm slightly. */
function tint(code: string): ReactNode[] {
  const parts: ReactNode[] = []
  let last = 0
  for (const match of code.matchAll(TOKEN)) {
    const index = match.index ?? 0
    if (index > last) parts.push(code.slice(last, index))
    parts.push(
      <span
        key={index}
        className={match[1] ? "text-paper/40" : "text-[#ddd3b8]"}
      >
        {match[0]}
      </span>,
    )
    last = index + match[0].length
  }
  parts.push(code.slice(last))
  return parts
}

interface CodeBlockProps {
  title: string
  code: string | undefined
  className?: string
}

export function CodeBlock({ title, code, className = "" }: CodeBlockProps) {
  return (
    <figure
      className={`flex min-w-0 flex-col overflow-hidden rounded-[20px] bg-ink text-paper ${className}`}
    >
      <figcaption className="flex items-center justify-between border-b border-white/10 py-2 pl-5 pr-2">
        <span className="font-mono text-[11px] text-paper/55">{title}</span>
        <CopyButton
          text={code}
          label={`Copy ${title}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] text-paper/70 transition-colors hover:bg-white/10 hover:text-paper disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-paper"
        >
          {(copied) =>
            copied ? (
              <>
                <Check className="size-3.5" strokeWidth={2} /> Copied
              </>
            ) : (
              <>
                <Copy className="size-3.5" strokeWidth={1.75} /> Copy
              </>
            )
          }
        </CopyButton>
      </figcaption>
      <pre className="flex-1 overflow-x-auto p-5 font-mono text-[12.5px] leading-[1.75] text-paper/90">
        <code>{code ? tint(code) : "Loading…"}</code>
      </pre>
    </figure>
  )
}
