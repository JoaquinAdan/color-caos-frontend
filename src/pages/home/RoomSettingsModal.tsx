import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { GameMode } from '@/types/socket.types'

interface RoomSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  currentMaxPlayers: number
  currentGameMode: GameMode
  currentPlayersCount: number
  onSave: (maxPlayers: number, gameMode: GameMode) => void
  isSaving?: boolean
}

export const RoomSettingsModal = ({
  isOpen,
  onClose,
  currentMaxPlayers,
  currentGameMode,
  currentPlayersCount,
  onSave,
  isSaving = false
}: RoomSettingsModalProps) => {
  const { t } = useTranslation()
  const [maxPlayers, setMaxPlayers] = useState(currentMaxPlayers)
  const [gameMode, setGameMode] = useState<GameMode>(currentGameMode)
  const [error, setError] = useState<string | null>(null)

  // El mínimo es el mayor entre 2 y el número actual de jugadores
  const minPlayers = Math.max(2, currentPlayersCount)

  const handleSave = () => {
    // Validar rango
    if (maxPlayers < minPlayers || maxPlayers > 20) {
      setError(t('roomSettings.invalidRange', { min: minPlayers }))
      return
    }

    setError(null)
    onSave(maxPlayers, gameMode)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Al cerrar, resetear valores
      setMaxPlayers(currentMaxPlayers)
      setGameMode(currentGameMode)
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('roomSettings.title')}</DialogTitle>
          <DialogDescription>
            {t('roomSettings.description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="maxPlayers">{t('roomSettings.maxPlayers')}</Label>
            <Input
              id="maxPlayers"
              type="number"
              min={minPlayers}
              max={20}
              value={maxPlayers}
              onChange={(e) => {
                const value = parseInt(e.target.value)
                setMaxPlayers(value)
                setError(null)
              }}
              disabled={isSaving}
            />
            <p className="text-xs text-muted-foreground">
              {currentPlayersCount > 2 
                ? t('roomSettings.rangeHintWithCurrent', { min: minPlayers, current: currentPlayersCount })
                : t('roomSettings.rangeHint')
              }
            </p>
            {error && (
              <p className="text-xs text-destructive">{error}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="gameMode">{t('roomSettings.gameMode')}</Label>
            <select
              id="gameMode"
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value as GameMode)}
              disabled={isSaving}
            >
              <option value="match_target">{t('roomSettings.modeMatchTarget')}</option>
              <option value="avoid_target">{t('roomSettings.modeAvoidTarget')}</option>
            </select>
            <p className="text-xs text-muted-foreground">
              {gameMode === 'match_target'
                ? t('roomSettings.modeMatchTargetHelp')
                : t('roomSettings.modeAvoidTargetHelp')}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}
          >
            {t('roomSettings.cancel')}
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? t('roomSettings.saving') : t('roomSettings.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
