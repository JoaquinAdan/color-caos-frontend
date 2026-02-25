import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getSocket } from '@/lib/socket'
import type { RoomWithPlayers } from '@/types/socket.types'

interface UseRoomProps {
  playerId: string | null
  nickname: string | null
}

interface UseRoomActions {
  setError: (error: string | null) => void
  setIsCreatingRoom: (value: boolean) => void
  setIsJoiningRoom: (value: boolean) => void
}

export const useRoom = ({ playerId, nickname }: UseRoomProps, actions: UseRoomActions) => {
  const [currentRoom, setCurrentRoom] = useState<RoomWithPlayers | null>(null)
  const { t } = useTranslation()

  // Efecto para verificar si el usuario estaba en una sala (al recargar la página)
  useEffect(() => {
    if (!playerId) return

    const storedRoomCode = localStorage.getItem('currentRoomCode')
    if (!storedRoomCode) return

    const socket = getSocket()
    console.log(`[Room Recovery] Verificando sala guardada: ${storedRoomCode}`)

    socket.emit('room:get', { roomCode: storedRoomCode, playerId }, (response) => {
      if (response.success && response.room) {
        console.log('[Room Recovery] Sala encontrada, reincorporándose...', response.room)
        
        const isInRoom = response.room.playerIds.includes(playerId)
        
        if (isInRoom) {
          console.log('[Room Recovery] Jugador ya está en la sala, solo restaurando estado')
          setCurrentRoom(response.room)
        } else {
          console.log('[Room Recovery] Reincorporándose a la sala')
          socket.emit('room:join', { roomCode: storedRoomCode, playerId }, (joinResponse) => {
            if (joinResponse.success && joinResponse.room) {
              console.log('[Room Recovery] Reincorporación exitosa')
              setCurrentRoom(joinResponse.room)
            } else {
              console.error('[Room Recovery] Error al reincorporarse:', joinResponse.error)
              localStorage.removeItem('currentRoomCode')
              setCurrentRoom(null)
            }
          })
        }
      } else {
        console.log('[Room Recovery] Sala no encontrada, limpiando localStorage')
        localStorage.removeItem('currentRoomCode')
      }
    })
  }, [playerId])

  // Escuchar eventos de socket relacionados con salas
  useEffect(() => {
    if (!nickname) return

    const socket = getSocket()

    const onRoomCreated = (data: { room: RoomWithPlayers }) => {
      console.log('Sala creada exitosamente:', data.room)
      actions.setIsCreatingRoom(false)
      setCurrentRoom(data.room)
      localStorage.setItem('currentRoomCode', data.room.code)
    }

    const onRoomJoined = (data: { room: RoomWithPlayers }) => {
      console.log('Unido a sala exitosamente:', data.room)
      actions.setIsJoiningRoom(false)
      setCurrentRoom(data.room)
      localStorage.setItem('currentRoomCode', data.room.code)
    }

    const onRoomUpdated = (data: { room: RoomWithPlayers }) => {
      console.log('Sala actualizada:', data.room)
      setCurrentRoom(data.room)
    }

    const onError = (data: { message: string; code: string }) => {
      console.error('Error del servidor:', data)
      
      if (data.code === 'CREATE_ROOM_ERROR') {
        actions.setError(data.message)
        actions.setIsCreatingRoom(false)
      }
      
      if (data.code === 'JOIN_ROOM_ERROR') {
        actions.setError(data.message)
        actions.setIsJoiningRoom(false)
      }
    }

    const onRoomKicked = (data: { roomCode: string; message: string }) => {
      console.warn(`[useRoom] Jugador expulsado de sala ${data.roomCode}`)
      setCurrentRoom(null)
      localStorage.removeItem('currentRoomCode')
      actions.setError(data.message || t('room.kickedMessage'))
      actions.setIsCreatingRoom(false)
      actions.setIsJoiningRoom(false)
    }

    socket.on('room:created', onRoomCreated)
    socket.on('room:joined', onRoomJoined)
    socket.on('room:updated', onRoomUpdated)
    socket.on('room:kicked', onRoomKicked)
    socket.on('error', onError)

    console.log('[useRoom] Socket listeners registrados')

    return () => {
      socket.off('room:created', onRoomCreated)
      socket.off('room:joined', onRoomJoined)
      socket.off('room:updated', onRoomUpdated)
      socket.off('room:kicked', onRoomKicked)
      socket.off('error', onError)
      console.log('[useRoom] Socket listeners removidos')
    }
  }, [nickname, actions, t])

  return {
    currentRoom,
    setCurrentRoom
  }
}
