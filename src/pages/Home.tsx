import { useState, useMemo } from 'react'
import { getSocket } from '@/lib/socket'
import { usePlayer, useRoom, useRoomActions, LoadingView, RoomView, HomeMenuView, GameView } from './home'

const Home = () => {
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [isJoiningRoom, setIsJoiningRoom] = useState(false)
  const [isStartingGame, setIsStartingGame] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Usar hooks personalizados
  const { nickname, playerId, isRecreatingPlayer } = usePlayer()

  // Memorizar el objeto actions para evitar re-renders innecesarios
  const roomActions = useMemo(
    () => ({ setError, setIsCreatingRoom, setIsJoiningRoom }),
    [setError, setIsCreatingRoom, setIsJoiningRoom]
  )

  const { currentRoom, setCurrentRoom } = useRoom(
    { playerId, nickname },
    roomActions
  )

  const { createRoom, joinRoom, leaveRoom } = useRoomActions({
    playerId,
    setError,
    setIsCreatingRoom,
    setIsJoiningRoom,
    setCurrentRoom
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

  // Renderizado condicional según el estado
  if (!nickname || isRecreatingPlayer) {
    return <LoadingView />
  }

  if (currentRoom) {
    if (currentRoom.status === 'in_progress') {
      return (
        <GameView
          currentRoom={currentRoom}
          playerId={playerId}
          onSubmitAnswer={handleSubmitAnswer}
        />
      )
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
    />
  )
}

export default Home
