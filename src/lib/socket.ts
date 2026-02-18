import { io, Socket } from 'socket.io-client'
import type { ClientToServerEvents, ServerToClientEvents } from '../types/socket.types'

const SERVER_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:4000'

// Singleton para mantener una única conexión de socket
let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null

export const getSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> => {
  if (!socket) {
    socket = io(SERVER_URL, {
      autoConnect: true,
    })
  }
  return socket
}

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
