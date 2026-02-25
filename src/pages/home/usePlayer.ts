import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { getSocket } from '@/lib/socket'
import type { Player } from '@/types/socket.types'

export const usePlayer = () => {
  const [nickname, setNickname] = useState<string | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [isRecreatingPlayer, setIsRecreatingPlayer] = useState(false)
  const recreatePlayerOnceRef = useRef(false)
  const playerCheckKeyRef = useRef<string | null>(null)
  const navigate = useNavigate()

  // Efecto para verificar y recrear el jugador si es necesario
  useEffect(() => {
    const storedNickname = localStorage.getItem('nickname')
    const storedPlayerId = localStorage.getItem('playerId')
    
    if (!storedNickname) {
      navigate({ to: '/set-nickname' })
      return
    }

    setNickname(storedNickname)
    setPlayerId(storedPlayerId)

    const checkKey = `${storedNickname}:${storedPlayerId ?? 'no-id'}`
    if (playerCheckKeyRef.current === checkKey) {
      return
    }

    playerCheckKeyRef.current = checkKey

    const socket = getSocket()
    setIsRecreatingPlayer(true)

    const createPlayer = () => {
      if (recreatePlayerOnceRef.current) {
        return
      }

      recreatePlayerOnceRef.current = true

      socket.emit('player:create', { name: storedNickname }, (response) => {
        setIsRecreatingPlayer(false)

        if (response.success && response.player) {
          console.log('Jugador recreado/verificado:', response.player)
          localStorage.setItem('playerId', response.player.id)
          setPlayerId(response.player.id)
        } else {
          console.error('Error al recrear jugador:', response.error)
        }
      })
    }

    if (!storedPlayerId) {
      createPlayer()
      return
    }

    socket.emit('player:get', { playerId: storedPlayerId }, (response) => {
      if (!response.success) {
        console.error('Error al obtener jugador:', response.error)
        setIsRecreatingPlayer(false)
        return
      }

      if (response.exists && response.player) {
        setIsRecreatingPlayer(false)
        setPlayerId(response.player.id)
        return
      }

      createPlayer()
    })
  }, [navigate])

  // Escuchar actualizaciones del jugador
  useEffect(() => {
    const socket = getSocket()

    const onPlayerCreated = (data: { player: Player }) => {
      console.log('Jugador actualizado:', data.player)
      localStorage.setItem('playerId', data.player.id)
      setPlayerId(data.player.id)
    }

    socket.on('player:created', onPlayerCreated)

    return () => {
      socket.off('player:created', onPlayerCreated)
    }
  }, [])

  return {
    nickname,
    playerId,
    isRecreatingPlayer
  }
}
