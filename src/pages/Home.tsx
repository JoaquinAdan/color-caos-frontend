import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Card } from '../components/ui/card'
import { Button } from '@/components/ui/button'
import { getSocket } from '@/lib/socket'
import type { RoomWithPlayers, Player } from '@/types/socket.types'

const Home = () => {
  const [nickname, setNickname] = useState<string | null>(null)
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [currentRoom, setCurrentRoom] = useState<RoomWithPlayers | null>(null)
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [isJoiningRoom, setIsJoiningRoom] = useState(false)
  const [showJoinRoom, setShowJoinRoom] = useState(false)
  const [roomCode, setRoomCode] = useState('')
  const [isRecreatingPlayer, setIsRecreatingPlayer] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recreatePlayerOnceRef = useRef(false)
  const playerCheckKeyRef = useRef<string | null>(null)
  const navigate = useNavigate()
  const { t } = useTranslation()

  // Efecto para verificar y recrear el jugador si es necesario
  useEffect(() => {
    const storedNickname = localStorage.getItem('nickname')
    const storedPlayerId = localStorage.getItem('playerId')
    
    if (!storedNickname) {
      // Si no hay nickname, redirigir a set-nickname
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

      // Si no existe en Redis, crear un nuevo jugador con el mismo nombre
      createPlayer()
    })
  }, [navigate])

  // Efecto para verificar si el usuario estaba en una sala (al recargar la página)
  useEffect(() => {
    if (!playerId) return

    const storedRoomCode = localStorage.getItem('currentRoomCode')
    if (!storedRoomCode) return

    const socket = getSocket()
    console.log(`[Room Recovery] Verificando sala guardada: ${storedRoomCode}`)

    // Verificar si la sala aún existe
    socket.emit('room:get', { roomCode: storedRoomCode }, (response) => {
      if (response.success && response.room) {
        console.log('[Room Recovery] Sala encontrada, reincorporándose...', response.room)
        
        // Verificar si el jugador aún está en la sala
        const isInRoom = response.room.playerIds.includes(playerId)
        
        if (isInRoom) {
          // Si ya está en la lista (no debería pasar, pero por si acaso)
          console.log('[Room Recovery] Jugador ya está en la sala, solo restaurando estado')
          setCurrentRoom(response.room)
        } else {
          // Si no está, reincorporarse
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
        // La sala ya no existe, limpiar localStorage
        localStorage.removeItem('currentRoomCode')
      }
    })
  }, [playerId])

  useEffect(() => {
    if (!nickname) return

    const socket = getSocket()

    // Escuchar el evento room:created del servidor
    const onRoomCreated = (data: { room: RoomWithPlayers }) => {
      console.log('Sala creada exitosamente:', data.room)
      setIsCreatingRoom(false)
      setCurrentRoom(data.room)
      // Guardar en localStorage
      localStorage.setItem('currentRoomCode', data.room.code)
    }

    // Escuchar el evento room:joined del servidor
    const onRoomJoined = (data: { room: RoomWithPlayers }) => {
      console.log('Unido a sala exitosamente:', data.room)
      setIsJoiningRoom(false)
      setShowJoinRoom(false)
      setRoomCode('')
      setCurrentRoom(data.room)
      // Guardar en localStorage
      localStorage.setItem('currentRoomCode', data.room.code)
    }

    // Escuchar actualizaciones de la sala (cuando otros jugadores se unen/salen)
    const onRoomUpdated = (data: { room: RoomWithPlayers }) => {
      console.log('Sala actualizada:', data.room)
      setCurrentRoom(data.room)
    }

    // Escuchar el evento player:created (por si se recrea en segundo plano)
    const onPlayerCreated = (data: { player: Player }) => {
      console.log('Jugador actualizado:', data.player)
      localStorage.setItem('playerId', data.player.id)
      setPlayerId(data.player.id)
    }

    // Escuchar errores del servidor
    const onError = (data: { message: string; code: string }) => {
      console.error('Error del servidor:', data)
      
      if (data.code === 'CREATE_ROOM_ERROR') {
        setError(data.message)
        setIsCreatingRoom(false)
      }
      
      if (data.code === 'JOIN_ROOM_ERROR') {
        setError(data.message)
        setIsJoiningRoom(false)
      }
    }

    socket.on('room:created', onRoomCreated)
    socket.on('room:joined', onRoomJoined)
    socket.on('room:updated', onRoomUpdated)
    socket.on('player:created', onPlayerCreated)
    socket.on('error', onError)

    // Cleanup: remover listeners cuando el componente se desmonte
    return () => {
      socket.off('room:created', onRoomCreated)
      socket.off('room:joined', onRoomJoined)
      socket.off('room:updated', onRoomUpdated)
      socket.off('player:created', onPlayerCreated)
      socket.off('error', onError)
    }
  }, [nickname, t])

  const handleCreateRoom = () => {
    if (!playerId) {
      setError(t('home.playerIdRequired'))
      return
    }

    const socket = getSocket()
    setIsCreatingRoom(true)
    setError(null)

    // Emitir evento room:create al servidor
    socket.emit('room:create', { maxPlayers: 8, playerId }, (response) => {
      if (response.success && response.room) {
        console.log('Respuesta del callback:', response.room)
      } else {
        console.error('Error en callback:', response.error)
        setError(response.error || 'Error desconocido')
        setIsCreatingRoom(false)
      }
    })
  }

  const handleJoinRoom = () => {
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

    // Emitir evento room:join al servidor
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

  const handleLeaveRoom = () => {
    if (!currentRoom || !playerId) return

    const socket = getSocket()

    socket.emit('room:leave', { roomCode: currentRoom.code, playerId }, (response) => {
      if (response.success) {
        console.log('Saliste de la sala exitosamente')
        setCurrentRoom(null)
        // Limpiar localStorage
        localStorage.removeItem('currentRoomCode')
      } else {
        console.error('Error al salir de la sala:', response.error)
        setError(response.error || 'Error al salir de la sala')
      }
    })
  }

  if (!nickname || isRecreatingPlayer) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-md p-6">
          <p className="text-center text-muted-foreground">
            {t('home.loading')}
          </p>
        </Card>
      </div>
    )
  }

  // Vista de sala - cuando el usuario está en una sala
  if (currentRoom) {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
        <Card className="w-full max-w-2xl p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-center mb-2">{t('room.title')}</h1>
            <p className="text-center text-muted-foreground mb-4">
              {t('room.code')}: <span className="font-mono text-2xl font-bold">{currentRoom.code}</span>
            </p>
            <p className="text-center text-sm text-muted-foreground">
              {t('room.players')}: {currentRoom.players.length} / {currentRoom.maxPlayers}
            </p>
          </div>

          <div className="space-y-3 mb-6">
            <h2 className="text-lg font-semibold">{t('room.playersList')}</h2>
            {currentRoom.players.map((player) => (
              <div
                key={player.id}
                className="flex items-center gap-3 p-3 border rounded-md bg-card"
              >
                {/* Indicador de host - cuadrado rojo */}
                {player.id === currentRoom.hostId && (
                  <div className="w-4 h-4 bg-red-500 rounded-sm flex-shrink-0" title={t('room.host')} />
                )}
                <span className="text-lg font-medium">{player.name}</span>
                {player.id === playerId && (
                  <span className="ml-auto text-sm text-muted-foreground">({t('room.you')})</span>
                )}
              </div>
            ))}
          </div>

          <Button
            onClick={handleLeaveRoom}
            variant="outline"
            className="w-full"
          >
            {t('room.leaveRoom')}
          </Button>
        </Card>
      </div>
    )
  }

  // Vista principal - menú de inicio
  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-3xl font-bold text-center mb-4">{t('home.greeting', { nickname })}</h1>
        <p className="text-center text-muted-foreground mb-6">{t('home.welcome')}</p>
        
        {playerId && (
          <p className="text-xs text-center text-muted-foreground mb-4">
            ID: {playerId.substring(0, 12)}...
          </p>
        )}
        
        {error && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive text-center">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <Button 
            onClick={handleCreateRoom} 
            variant="default" 
            className="w-full"
            disabled={isCreatingRoom || isJoiningRoom}
          >
            {isCreatingRoom ? t('home.creatingRoom') : t('home.createRoom')}
          </Button>

          {!showJoinRoom ? (
            <Button 
              onClick={() => setShowJoinRoom(true)} 
              variant="outline" 
              className="w-full"
              disabled={isCreatingRoom || isJoiningRoom}
            >
              {t('home.joinRoom')}
            </Button>
          ) : (
            <div className="space-y-2 p-4 border rounded-md bg-muted/50">
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder={t('home.roomCodePlaceholder')}
                className="w-full px-3 py-2 border rounded-md text-center font-mono text-lg tracking-wider"
                maxLength={6}
                disabled={isJoiningRoom}
              />
              <div className="flex gap-2">
                <Button 
                  onClick={handleJoinRoom} 
                  variant="default" 
                  className="flex-1"
                  disabled={isJoiningRoom || !roomCode.trim()}
                >
                  {isJoiningRoom ? t('home.joiningRoom') : t('home.join')}
                </Button>
                <Button 
                  onClick={() => {
                    setShowJoinRoom(false)
                    setRoomCode('')
                    setError(null)
                  }} 
                  variant="outline" 
                  className="flex-1"
                  disabled={isJoiningRoom}
                >
                  {t('home.cancel')}
                </Button>
              </div>
            </div>
          )}
          
          <Button 
            onClick={() => navigate({ to: '/set-nickname' })} 
            variant="outline" 
            className="w-full"
          >
            {t('home.changeNickname')}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default Home
