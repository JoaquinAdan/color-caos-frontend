import { useEffect, useState } from "react"

import { Badge } from "@/components/ui/badge"
import type { LogEvent, LogType } from "./types"

const typeStyles: Record<LogType, string> = {
  info: "border-l-blue-500",
  success: "border-l-emerald-500",
  error: "border-l-red-500",
}

const typeBadgeVariant: Record<LogType, "default" | "secondary" | "destructive"> = {
  info: "secondary",
  success: "default",
  error: "destructive",
}

type LogItemProps = {
  log: LogEvent
}

export default function LogItem({ log }: LogItemProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const frameId = requestAnimationFrame(() => setIsVisible(true))
    return () => cancelAnimationFrame(frameId)
  }, [])

  const renderData = () => {
    if (typeof log.data === "string") {
      return <p className="text-sm text-foreground/80">{log.data}</p>
    }

    return (
      <div className="space-y-1 font-mono text-xs text-foreground/80">
        {Object.entries(log.data).map(([key, value]) => (
          <p key={key}>
            <span className="font-semibold text-foreground">{key}: </span>
            <span>{JSON.stringify(value)}</span>
          </p>
        ))}
      </div>
    )
  }

  return (
    <article
      className={`rounded-md border border-border bg-card p-3 border-l-4 ${typeStyles[log.type]} transition-all duration-300 ease-out ${
        isVisible ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0"
      }`}
    >
      <div className="mb-2 flex items-center gap-2">
        <Badge variant={typeBadgeVariant[log.type]}>{log.title}</Badge>
        <span className="ml-auto text-xs text-muted-foreground">{log.timestamp}</span>
      </div>
      {renderData()}
    </article>
  )
}
