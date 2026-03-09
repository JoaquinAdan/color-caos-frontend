import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import LanguageSelector from '@/components/LanguageSelector'
import SetNicknameModal from '@/components/SetNicknameModal'
import { useSetNicknameModal } from '@/contexts/SetNicknameContext'

interface HomeMenuViewProps {
  nickname: string | null
  playerId: string | null
  error: string | null
  isCreatingRoom: boolean
  isJoiningRoom: boolean
  onCreateRoom: () => void
  onJoinRoom: (roomCode: string) => void
  onClearError: () => void
  onOpenSetNicknameModal: () => void
}

export const HomeMenuView = ({
  nickname,
  playerId,
  error,
  isCreatingRoom,
  isJoiningRoom,
  onCreateRoom,
  onJoinRoom,
  onClearError,
  onOpenSetNicknameModal
}: HomeMenuViewProps) => {
  const [showJoinRoom, setShowJoinRoom] = useState(false)
  const [roomCode, setRoomCode] = useState('')
  const { t } = useTranslation()
  const { isOpen, closeSetNicknameModal } = useSetNicknameModal()

  const handleJoinClick = () => {
    onJoinRoom(roomCode)
  }

  const handleCancelJoin = () => {
    setShowJoinRoom(false)
    setRoomCode('')
    onClearError()
  }
  console.log(nickname)
  return (
    <>
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md p-6">
          <h1 key={nickname} className="text-3xl font-bold text-center mb-4">{t('home.greeting', { nickname })}</h1>
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
              onClick={onOpenSetNicknameModal} 
              variant="outline" 
              className="w-full"
            >
              {t('home.changeNickname')}
            </Button>
          </div>
        </Card>
      </div>
      <SetNicknameModal open={isOpen} onOpenChange={(open) => {
        if (!open) closeSetNicknameModal()
      }} />
    </>
  )
}
