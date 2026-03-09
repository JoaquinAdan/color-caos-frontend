import { useState, useMemo, useEffect, useRef } from 'react'
import { getSocket } from '@/lib/socket'
import { usePlayer, useRoom, useRoomActions, LoadingView, RoomView, HomeMenuView, GameView } from './home'
import { useSetNicknameModal } from '@/contexts/SetNicknameContext'

const Home = () => {
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [isJoiningRoom, setIsJoiningRoom] = useState(false)
  const [isStartingGame, setIsStartingGame] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { openSetNicknameModal } = useSetNicknameModal()
  const hasTriedToOpenModalRef = useRef(false)

  // Usar hooks personalizados
  const { nickname, playerId, isRecreatingPlayer } = usePlayer()

  // Abrir el modal automáticamente si no hay nickname (solo una vez)
  useEffect(() => {
    // Si ya hay un nombre en localStorage, no abrir el modal
    const storedNickname = localStorage.getItem('nickname')
    if (storedNickname) {
      // El nickname existe, dejar que usePlayer lo valide
      return
    }

    // Solo abrir el modal si no hay nombre guardado
    if (!hasTriedToOpenModalRef.current) {
      hasTriedToOpenModalRef.current = true
      openSetNicknameModal()
    }
  }, [openSetNicknameModal])

  // Memorizar el objeto actions para evitar re-renders innecesarios
  const roomActions = useMemo(() => ({ setError, setIsCreatingRoom, setIsJoiningRoom }), [setError, setIsCreatingRoom, setIsJoiningRoom])

  const { currentRoom, setCurrentRoom } = useRoom({ playerId, nickname }, roomActions)

  const { createRoom, joinRoom, leaveRoom } = useRoomActions({
    playerId,
    setError,
    setIsCreatingRoom,
    setIsJoiningRoom,
    setCurrentRoom,
  })

  const handleStartGame = () => {
    if (!currentRoom || !playerId) return

    const socket = getSocket()
    setIsStartingGame(true)
    setError(null)

    socket.emit('game:start', { roomCode: currentRoom.code, hostPlayerId: playerId }, (response) => {
      setIsStartingGame(false)
      if (!response.success) {
        setError(response.error || 'Error al iniciar partida')
      }
    })
  }

  const handleSubmitAnswer = (color: string): Promise<boolean> => {
    if (!currentRoom || !playerId) return Promise.resolve(false)

    return new Promise((resolve) => {
      const socket = getSocket()
      socket.emit('game:submit-answer', { roomCode: currentRoom.code, playerId, color }, (response) => {
        if (!response.success) {
          setError(response.error || 'Error al enviar respuesta')
          resolve(false)
          return
        }

        if (!response.accepted) {
          setError('Tu respuesta llegó fuera de tiempo')
          resolve(false)
          return
        }

        resolve(true)
      })
    })
  }

  if (isRecreatingPlayer) {
    return <LoadingView />
  }

  if (currentRoom) {
    if (currentRoom.status === 'in_progress') {
      return <GameView currentRoom={currentRoom} playerId={playerId} onSubmitAnswer={handleSubmitAnswer} />
    }

    return (
      <RoomView
        currentRoom={currentRoom}
        playerId={playerId}
        onStartGame={handleStartGame}
        isStartingGame={isStartingGame}
        onLeaveRoom={() => leaveRoom(currentRoom)}
      />
    )
  }

  return (
    <HomeMenuView
      nickname={nickname}
      playerId={playerId}
      error={error}
      isCreatingRoom={isCreatingRoom}
      isJoiningRoom={isJoiningRoom}
      onCreateRoom={createRoom}
      onJoinRoom={joinRoom}
      onClearError={() => setError(null)}
      onOpenSetNicknameModal={openSetNicknameModal}
    />
  )
}

export default Home
