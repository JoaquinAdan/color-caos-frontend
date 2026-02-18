import type { Socket } from 'socket.io-client'

// ============================================
// TIPOS DE EVENTOS: CLIENTE → SERVIDOR
// ============================================
export interface ClientToServerEvents {
  'room:create': (
    payload: { maxPlayers?: number; playerId: string },
    callback: (response: RoomCreateResponse) => void
  ) => void
  'room:get': (
    payload: { roomCode: string },
    callback: (response: RoomGetResponse) => void
  ) => void
  'room:join': (
    payload: { roomCode: string; playerId: string },
    callback: (response: RoomJoinResponse) => void
  ) => void
  'room:leave': (
    payload: { roomCode: string; playerId: string },
    callback: (response: RoomLeaveResponse) => void
  ) => void
  'player:create': (
    payload: { name: string },
    callback: (response: PlayerCreateResponse) => void
  ) => void
  'player:get': (
    payload: { playerId: string },
    callback: (response: PlayerGetResponse) => void
  ) => void
}

// ============================================
// TIPOS DE EVENTOS: SERVIDOR → CLIENTE
// ============================================
export interface ServerToClientEvents {
  'room:created': (data: { room: RoomWithPlayers }) => void
  'room:joined': (data: { room: RoomWithPlayers }) => void
  'room:updated': (data: { room: RoomWithPlayers }) => void
  'player:created': (data: { player: Player }) => void
  error: (data: { message: string; code: string }) => void
}

// ============================================
// TIPOS DE DATOS
// ============================================
export interface Room {
  code: string
  hostSocketId: string
  maxPlayers: number
  players: string[]
  createdAt: number
  expiresAt: number
}

export interface RoomPlayer {
  id: string
  name: string
}

export interface RoomWithPlayers {
  id: string
  code: string
  status: 'waiting' | 'in_progress' | 'finished'
  hostId: string | null
  playerIds: string[]
  players: RoomPlayer[]
  maxPlayers: number
  createdAt: number
  startedAt: number | null
}

export interface Player {
  id: string
  name: string
  currentRoomCode: string | null
  createdAt: number
  expiresAt: number
}

export interface RoomCreateResponse {
  success: boolean
  room?: RoomWithPlayers
  error?: string
}

export interface RoomGetResponse {
  success: boolean
  room?: RoomWithPlayers | null
  error?: string
}

export interface RoomJoinResponse {
  success: boolean
  room?: RoomWithPlayers
  error?: string
}

export interface RoomLeaveResponse {
  success: boolean
  wasDeleted?: boolean
  error?: string
}

export interface PlayerCreateResponse {
  success: boolean
  player?: Player
  error?: string
}

export interface PlayerGetResponse {
  success: boolean
  exists: boolean
  player?: Player | null
  error?: string
}

// ============================================
// TIPO DE SOCKET TIPADO
// ============================================
export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>
