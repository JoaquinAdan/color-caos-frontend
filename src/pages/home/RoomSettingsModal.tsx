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

interface RoomSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  currentMaxPlayers: number
  currentPlayersCount: number
  onSave: (maxPlayers: number) => void
  isSaving?: boolean
}

export const RoomSettingsModal = ({
  isOpen,
  onClose,
  currentMaxPlayers,
  currentPlayersCount,
  onSave,
  isSaving = false
}: RoomSettingsModalProps) => {
  const { t } = useTranslation()
  const [maxPlayers, setMaxPlayers] = useState(currentMaxPlayers)
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
    onSave(maxPlayers)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Al cerrar, resetear valores
      setMaxPlayers(currentMaxPlayers)
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
