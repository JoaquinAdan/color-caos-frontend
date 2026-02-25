import { useState, useMemo } from 'react'
import { usePlayer, useRoom, useRoomActions, LoadingView, RoomView, HomeMenuView } from './home'

const Home = () => {
  const [isCreatingRoom, setIsCreatingRoom] = useState(false)
  const [isJoiningRoom, setIsJoiningRoom] = useState(false)
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

  // Renderizado condicional según el estado
  if (!nickname || isRecreatingPlayer) {
    return <LoadingView />
  }

  if (currentRoom) {
    return (
      <RoomView
        currentRoom={currentRoom}
        playerId={playerId}
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
