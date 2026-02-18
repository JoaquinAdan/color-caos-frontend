export type Stats = {
  itemsCreated: number
  totalItems: number
  lastItem: string
}

export type LogType = "info" | "success" | "error"

export type LogEvent = {
  id: string
  title: string
  data: Record<string, unknown> | string
  type: LogType
  timestamp: string
}

export type SystemConnectedPayload = {
  message?: string
  timestamp?: string
  [key: string]: unknown
}

export type ItemCreatedPayload = {
  createdItem: string
  existingItemsCount: number
  lastCreatedItem?: string
  ttlSeconds: number
}

export type ItemsSummaryPayload = {
  existingItemsCount: number
  lastCreatedItem: string | null
}

export type ServerErrorPayload = {
  message: string
  code?: string
}

export type CreateItemResponse = {
  success: boolean
  error?: string
}
