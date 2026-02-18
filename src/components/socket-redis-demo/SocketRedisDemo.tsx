import { useCallback, useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { useTranslation } from "react-i18next"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import LogItem from "./LogItem"
import type {
  CreateItemResponse,
  ItemCreatedPayload,
  ItemsSummaryPayload,
  LogEvent,
  ServerErrorPayload,
  Stats,
  SystemConnectedPayload,
} from "./types"
import { Badge } from "@/components/ui/badge"

const SERVER_URL = "http://localhost:4000"
const MAX_LOGS = 20

type ServerToClientEvents = {
  connect: () => void
  disconnect: (reason: Socket.DisconnectReason) => void
  "system:connected": (data: SystemConnectedPayload) => void
  "items:summary": (data: ItemsSummaryPayload) => void
  "item-created": (data: ItemCreatedPayload) => void
  error: (data: ServerErrorPayload) => void
}

type ClientToServerEvents = {
  "create-item": (callback: (response: CreateItemResponse) => void) => void
}

export default function SocketRedisDemo() {
  const { t } = useTranslation()
  const [stats, setStats] = useState<Stats>({
    itemsCreated: 0,
    totalItems: 0,
    lastItem: "-",
  })
  const [logs, setLogs] = useState<LogEvent[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [socketId, setSocketId] = useState("")

  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)

  const addLogEvent = useCallback(
    (title: string, data: Record<string, unknown> | string, type: "info" | "success" | "error" = "info") => {
      const nextLog: LogEvent = {
        id: crypto.randomUUID(),
        title,
        data,
        type,
        timestamp: new Date().toLocaleTimeString(),
      }

      setLogs((previousLogs) => [nextLog, ...previousLogs].slice(0, MAX_LOGS))
    },
    []
  )

  const handleClearLog = useCallback(() => {
    setLogs([])
  }, [])

  const handleCreateItem = useCallback(() => {
    if (!socketRef.current || !isConnected) {
      return
    }

    addLogEvent(t('socketDemo.events.requestSent'), { [t('socketDemo.fields.event')]: "create-item" }, "info")

    socketRef.current.emit("create-item", (response) => {
      if (response.success) {
        addLogEvent(t('socketDemo.events.confirmationReceived'), { [t('socketDemo.fields.success')]: true }, "success")
        return
      }

      addLogEvent(t('socketDemo.events.callbackError'), { [t('socketDemo.fields.error')]: response.error ?? t('socketDemo.fields.na') }, "error")
    })
  }, [addLogEvent, isConnected, t])

  useEffect(() => {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL)
    socketRef.current = socket

    const onConnect = () => {
      const nextSocketId = socket.id ?? ""
      setIsConnected(true)
      setSocketId(nextSocketId)
      addLogEvent(t('socketDemo.events.connectionEstablished'), { [t('socketDemo.fields.socketId')]: nextSocketId }, "success")
    }

    const onDisconnect = (reason: Socket.DisconnectReason) => {
      setIsConnected(false)
      setSocketId("")
      addLogEvent(t('socketDemo.events.disconnection'), { [t('socketDemo.fields.reason')]: reason }, "error")
    }

    const onSystemConnected = (data: SystemConnectedPayload) => {
      addLogEvent(t('socketDemo.events.systemReady'), data, "success")
    }

    const onItemsSummary = (data: ItemsSummaryPayload) => {
      setStats((previousStats) => ({
        ...previousStats,
        totalItems: data.existingItemsCount,
        lastItem: data.lastCreatedItem ?? "-",
      }))

      addLogEvent(
        t('socketDemo.events.initialState'),
        {
          [t('socketDemo.fields.total')]: data.existingItemsCount,
          [t('socketDemo.fields.last')]: data.lastCreatedItem ?? t('socketDemo.fields.none'),
        },
        "info"
      )
    }

    const onItemCreated = (data: ItemCreatedPayload) => {
      setStats((previousStats) => ({
        itemsCreated: previousStats.itemsCreated + 1,
        totalItems: data.existingItemsCount + 1,
        lastItem: data.createdItem,
      }))

      addLogEvent(
        t('socketDemo.events.itemCreated'),
        {
          [t('socketDemo.fields.item')]: data.createdItem,
          [t('socketDemo.fields.last')]: data.lastCreatedItem ?? t('socketDemo.fields.none'),
          [t('socketDemo.fields.ttl')]: `${data.ttlSeconds}s`,
          [t('socketDemo.fields.total')]: data.existingItemsCount + 1,
        },
        "success"
      )
    }

    const onError = (data: ServerErrorPayload) => {
      addLogEvent(
        t('socketDemo.events.serverError'),
        {
          [t('socketDemo.fields.message')]: data.message,
          [t('socketDemo.fields.code')]: data.code ?? t('socketDemo.fields.na'),
        },
        "error"
      )
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("system:connected", onSystemConnected)
    socket.on("items:summary", onItemsSummary)
    socket.on("item-created", onItemCreated)
    socket.on("error", onError)

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("system:connected", onSystemConnected)
      socket.off("items:summary", onItemsSummary)
      socket.off("item-created", onItemCreated)
      socket.off("error", onError)
      socket.disconnect()
      socketRef.current = null
    }
  }, [addLogEvent, t])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space" && isConnected) {
        event.preventDefault()
        handleCreateItem()
      }

      if (event.code === "KeyC" && event.ctrlKey) {
        event.preventDefault()
        handleClearLog()
      }
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [handleClearLog, handleCreateItem, isConnected])

  return (
    <div className="min-h-[calc(100vh-65px)] bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-700 px-4 py-10">
      <div className="mx-auto max-w-2xl">
        <Card className="rounded-2xl bg-card/95 shadow-xl backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl">{t('socketDemo.title')}</CardTitle>
            <p className="text-sm text-muted-foreground">{t('socketDemo.subtitle')}</p>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex items-center justify-center rounded-md border px-4 py-3">
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? t('socketDemo.connected', { socketId }) : t('socketDemo.disconnected')}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Card className="bg-muted/70 p-3 text-center shadow-none">
                <p className="text-2xl font-bold text-primary">{stats.itemsCreated}</p>
                <p className="text-xs text-muted-foreground">{t('socketDemo.itemsCreated')}</p>
              </Card>
              <Card className="bg-muted/70 p-3 text-center shadow-none">
                <p className="text-2xl font-bold text-primary">{stats.totalItems}</p>
                <p className="text-xs text-muted-foreground">{t('socketDemo.totalInRedis')}</p>
              </Card>
              <Card className="bg-muted/70 p-3 text-center shadow-none">
                <p className="truncate text-2xl font-bold text-primary">{stats.lastItem}</p>
                <p className="text-xs text-muted-foreground">{t('socketDemo.lastItem')}</p>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button disabled={!isConnected} onClick={handleCreateItem}>
                {t('socketDemo.createItem')}
              </Button>
              <Button variant="outline" onClick={handleClearLog}>
                {t('socketDemo.clearLog')}
              </Button>
            </div>

            <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-md border bg-muted/40 p-3">
              {logs.length === 0 ? (
                <p className="py-8 text-center text-sm italic text-muted-foreground">
                  {t('socketDemo.noEvents')}
                </p>
              ) : (
                logs.map((log) => <LogItem key={log.id} log={log} />)
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
