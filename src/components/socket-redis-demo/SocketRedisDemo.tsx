import { useCallback, useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import LogItem from "./LogItem"
import type {
  CreateItemResponse,
  ItemCreatedPayload,
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
  "item-created": (data: ItemCreatedPayload) => void
  error: (data: ServerErrorPayload) => void
}

type ClientToServerEvents = {
  "create-item": (callback: (response: CreateItemResponse) => void) => void
}

export default function SocketRedisDemo() {
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

    addLogEvent("Solicitud enviada", { evento: "create-item" }, "info")

    socketRef.current.emit("create-item", (response) => {
      if (response.success) {
        addLogEvent("Confirmación recibida", { success: true }, "success")
        return
      }

      addLogEvent("Error en callback", { error: response.error ?? "N/A" }, "error")
    })
  }, [addLogEvent, isConnected])

  useEffect(() => {
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SERVER_URL)
    socketRef.current = socket

    const onConnect = () => {
      const nextSocketId = socket.id ?? ""
      setIsConnected(true)
      setSocketId(nextSocketId)
      addLogEvent("Conexión establecida", { socketId: nextSocketId }, "success")
    }

    const onDisconnect = (reason: Socket.DisconnectReason) => {
      setIsConnected(false)
      setSocketId("")
      addLogEvent("Desconexión", { reason }, "error")
    }

    const onSystemConnected = (data: SystemConnectedPayload) => {
      addLogEvent("Sistema listo", data, "success")
    }

    const onItemCreated = (data: ItemCreatedPayload) => {
      setStats((previousStats) => ({
        itemsCreated: previousStats.itemsCreated + 1,
        totalItems: data.existingItemsCount + 1,
        lastItem: data.createdItem,
      }))

      addLogEvent(
        "Item Creado",
        {
          item: data.createdItem,
          último: data.lastCreatedItem ?? "ninguno",
          TTL: `${data.ttlSeconds}s`,
          total: data.existingItemsCount + 1,
        },
        "success"
      )
    }

    const onError = (data: ServerErrorPayload) => {
      addLogEvent(
        "Error del Servidor",
        {
          mensaje: data.message,
          código: data.code ?? "N/A",
        },
        "error"
      )
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)
    socket.on("system:connected", onSystemConnected)
    socket.on("item-created", onItemCreated)
    socket.on("error", onError)

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
      socket.off("system:connected", onSystemConnected)
      socket.off("item-created", onItemCreated)
      socket.off("error", onError)
      socket.disconnect()
      socketRef.current = null
    }
  }, [addLogEvent])

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
            <CardTitle className="text-3xl">🔌 Socket.IO + Redis Demo</CardTitle>
            <p className="text-sm text-muted-foreground">Cliente de prueba para eventos en tiempo real</p>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="flex items-center justify-center rounded-md border px-4 py-3">
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? `✅ Conectado (${socketId})` : "⚠️ Desconectado"}
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Card className="bg-muted/70 p-3 text-center shadow-none">
                <p className="text-2xl font-bold text-primary">{stats.itemsCreated}</p>
                <p className="text-xs text-muted-foreground">Items Creados</p>
              </Card>
              <Card className="bg-muted/70 p-3 text-center shadow-none">
                <p className="text-2xl font-bold text-primary">{stats.totalItems}</p>
                <p className="text-xs text-muted-foreground">Total en Redis</p>
              </Card>
              <Card className="bg-muted/70 p-3 text-center shadow-none">
                <p className="truncate text-2xl font-bold text-primary">{stats.lastItem}</p>
                <p className="text-xs text-muted-foreground">Último Item</p>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button disabled={!isConnected} onClick={handleCreateItem}>
                Crear Item
              </Button>
              <Button variant="outline" onClick={handleClearLog}>
                Limpiar Log
              </Button>
            </div>

            <div className="max-h-[420px] space-y-2 overflow-y-auto rounded-md border bg-muted/40 p-3">
              {logs.length === 0 ? (
                <p className="py-8 text-center text-sm italic text-muted-foreground">
                  Los eventos aparecerán aquí...
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
