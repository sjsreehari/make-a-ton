import { Check, Copy } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"
import { copyText } from "../clipboard"
import { ICON_BUTTON } from "../styles"

interface CopyButtonProps {
  text: string | undefined
  label: string
  className?: string
  /** Custom content; receives whether the text was just copied. */
  children?: (copied: boolean) => ReactNode
}

export function CopyButton({
  text,
  label,
  className = ICON_BUTTON,
  children,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = window.setTimeout(() => setCopied(false), 1400)
    return () => window.clearTimeout(timer)
  }, [copied])

  return (
    <button
      type="button"
      className={className}
      disabled={!text}
      aria-label={label}
      title={copied ? "Copied" : label}
      onClick={async () => {
        if (text && (await copyText(text))) setCopied(true)
      }}
    >
      {children ? (
        children(copied)
      ) : copied ? (
        <Check className="size-4" strokeWidth={2} />
      ) : (
        <Copy className="size-4" strokeWidth={1.75} />
      )}
    </button>
  )
}
