import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RoomSettingsModal } from './RoomSettingsModal'
import { getSocket } from '@/lib/socket'
import type { RoomWithPlayers } from '@/types/socket.types'

interface RoomViewProps {
  currentRoom: RoomWithPlayers
  playerId: string | null
  onLeaveRoom: () => void
}

export const RoomView = ({ currentRoom, playerId, onLeaveRoom }: RoomViewProps) => {
  const { t } = useTranslation()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [kickingPlayerId, setKickingPlayerId] = useState<string | null>(null)
  
  const isHost = playerId === currentRoom.hostId

  const handleSaveSettings = (maxPlayers: number) => {
    const socket = getSocket()
    setIsSavingSettings(true)

    socket.emit('room:update-settings', 
      { roomCode: currentRoom.code, maxPlayers }, 
      (response) => {
        setIsSavingSettings(false)
        if (response.success) {
          setIsSettingsOpen(false)
        } else {
          console.error('Error al actualizar configuración:', response.error)
        }
      }
    )
  }

  const handleKickPlayer = (targetPlayerId: string) => {
    if (!playerId || !isHost) return

    const socket = getSocket()
    setKickingPlayerId(targetPlayerId)

    socket.emit(
      'room:kick',
      { roomCode: currentRoom.code, hostPlayerId: playerId, targetPlayerId },
      (response) => {
        setKickingPlayerId(null)
        if (!response.success) {
          console.error('Error al expulsar jugador:', response.error)
        }
      }
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
      <Card className="w-full max-w-2xl p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold">{t('room.title')}</h1>
            {isHost && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsSettingsOpen(true)}
                title={t('room.settings')}
              >
                <Settings className="h-5 w-5" />
              </Button>
            )}
          </div>
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
            <div key={player.id} className="flex items-center gap-3 p-3 border rounded-md bg-card">
              {/* Indicador de host - cuadrado rojo */}
              {player.id === currentRoom.hostId && (
                <div className="w-4 h-4 bg-red-500 rounded-sm flex-shrink-0" title={t('room.host')} />
              )}
              <span className="text-lg font-medium">{player.name}</span>
              {player.id === playerId && (
                <span className="ml-auto text-sm text-muted-foreground">({t('room.you')})</span>
              )}
              {isHost && player.id !== playerId && player.id !== currentRoom.hostId && (
                <Button
                  variant="destructive"
                  size="sm"
                  className={player.id === playerId ? '' : 'ml-auto'}
                  onClick={() => handleKickPlayer(player.id)}
                  disabled={kickingPlayerId !== null}
                >
                  {kickingPlayerId === player.id ? t('room.kicking') : t('room.kick')}
                </Button>
              )}
            </div>
          ))}
        </div>

        <Button
          onClick={onLeaveRoom}
          variant="outline"
          className="w-full"
        >
          {t('room.leaveRoom')}
        </Button>
      </Card>

      {/* Modal de configuración */}
      <RoomSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentMaxPlayers={currentRoom.maxPlayers}
        currentPlayersCount={currentRoom.players.length}
        onSave={handleSaveSettings}
        isSaving={isSavingSettings}
      />
    </div>
  )
}
