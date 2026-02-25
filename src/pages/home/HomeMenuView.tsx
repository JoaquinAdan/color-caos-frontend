import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface HomeMenuViewProps {
  nickname: string
  playerId: string | null
  error: string | null
  isCreatingRoom: boolean
  isJoiningRoom: boolean
  onCreateRoom: () => void
  onJoinRoom: (roomCode: string) => void
  onClearError: () => void
}

export const HomeMenuView = ({
  nickname,
  playerId,
  error,
  isCreatingRoom,
  isJoiningRoom,
  onCreateRoom,
  onJoinRoom,
  onClearError
}: HomeMenuViewProps) => {
  const [showJoinRoom, setShowJoinRoom] = useState(false)
  const [roomCode, setRoomCode] = useState('')
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleJoinClick = () => {
    onJoinRoom(roomCode)
  }

  const handleCancelJoin = () => {
    setShowJoinRoom(false)
    setRoomCode('')
    onClearError()
  }

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
            onClick={onCreateRoom} 
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
                  onClick={handleJoinClick} 
                  variant="default" 
                  className="flex-1"
                  disabled={isJoiningRoom || !roomCode.trim()}
                >
                  {isJoiningRoom ? t('home.joiningRoom') : t('home.join')}
                </Button>
                <Button 
                  onClick={handleCancelJoin} 
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
