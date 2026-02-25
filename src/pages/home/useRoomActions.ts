import { useTranslation } from 'react-i18next'
import { getSocket } from '@/lib/socket'
import type { RoomWithPlayers } from '@/types/socket.types'

interface UseRoomActionsProps {
  playerId: string | null
  setError: (error: string | null) => void
  setIsCreatingRoom: (value: boolean) => void
  setIsJoiningRoom: (value: boolean) => void
  setCurrentRoom: (room: RoomWithPlayers | null) => void
}

export const useRoomActions = ({
  playerId,
  setError,
  setIsCreatingRoom,
  setIsJoiningRoom,
  setCurrentRoom
}: UseRoomActionsProps) => {
  const { t } = useTranslation()

  const createRoom = () => {
    if (!playerId) {
      setError(t('home.playerIdRequired'))
      return
    }

    const socket = getSocket()
    setIsCreatingRoom(true)
    setError(null)

    socket.emit('room:create', { maxPlayers: 2, playerId }, (response) => {
      if (response.success && response.room) {
        console.log('Respuesta del callback:', response.room)
      } else {
        console.error('Error en callback:', response.error)
        setError(response.error || 'Error desconocido')
        setIsCreatingRoom(false)
      }
    })
  }

  const joinRoom = (roomCode: string) => {
    if (!roomCode.trim()) {
      setError(t('home.roomCodeRequired'))
      return
    }

    if (!playerId) {
      setError(t('home.playerIdRequired'))
      return
    }

    const socket = getSocket()
    setIsJoiningRoom(true)
    setError(null)

    socket.emit('room:join', { roomCode: roomCode.trim().toUpperCase(), playerId }, (response) => {
      if (response.success && response.room) {
        console.log('Respuesta del callback:', response.room)
      } else {
        console.error('Error en callback:', response.error)
        setError(response.error || 'Error desconocido')
        setIsJoiningRoom(false)
      }
    })
  }

  const leaveRoom = (currentRoom: RoomWithPlayers | null) => {
    if (!currentRoom || !playerId) return

    const socket = getSocket()

    socket.emit('room:leave', { roomCode: currentRoom.code, playerId }, (response) => {
      if (response.success) {
        console.log('Saliste de la sala exitosamente')
        setCurrentRoom(null)
        localStorage.removeItem('currentRoomCode')
      } else {
        console.error('Error al salir de la sala:', response.error)
        setError(response.error || 'Error al salir de la sala')
      }
    })
  }

  return {
    createRoom,
    joinRoom,
    leaveRoom
  }
}
