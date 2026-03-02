import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { getSocket } from '@/lib/socket'
import type { Player } from '@/types/socket.types'

const REQUEST_TIMEOUT_MS = 6000

export const usePlayer = () => {
  const [nickname, setNickname] = useState<string | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [isRecreatingPlayer, setIsRecreatingPlayer] = useState(false)
  const isCreatingPlayerRef = useRef(false)
  const createPlayerTimeoutRef = useRef<number | null>(null)
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

    const clearCreatePlayerTimeout = () => {
      if (createPlayerTimeoutRef.current !== null) {
        window.clearTimeout(createPlayerTimeoutRef.current)
        createPlayerTimeoutRef.current = null
      }
    }

    const createPlayer = () => {
      if (isCreatingPlayerRef.current) {
        return
      }

      isCreatingPlayerRef.current = true

      createPlayerTimeoutRef.current = window.setTimeout(() => {
        console.error('Timeout recreando jugador; se cancela estado de carga para evitar bloqueo')
        isCreatingPlayerRef.current = false
        setIsRecreatingPlayer(false)
      }, REQUEST_TIMEOUT_MS)

      socket.emit('player:create', { name: storedNickname }, (response) => {
        clearCreatePlayerTimeout()
        isCreatingPlayerRef.current = false
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

    const getPlayerTimeoutId = window.setTimeout(() => {
      console.error('Timeout consultando jugador; se intentará recrear')
      createPlayer()
    }, REQUEST_TIMEOUT_MS)

    socket.emit('player:get', { playerId: storedPlayerId }, (response) => {
      window.clearTimeout(getPlayerTimeoutId)

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

    return () => {
      window.clearTimeout(getPlayerTimeoutId)
      clearCreatePlayerTimeout()
      isCreatingPlayerRef.current = false
    }
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
