import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Gauge, Joystick } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  const prefersReducedMotion = useReducedMotion()

  // El mínimo es el mayor entre 2 y el número actual de jugadores
  const minPlayers = Math.max(2, currentPlayersCount)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setMaxPlayers(currentMaxPlayers)
    setGameMode(currentGameMode)
    setError(null)
  }, [isOpen, currentGameMode, currentMaxPlayers])

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
      setError(null)
      onClose()
    }
  }

  const panelMotion = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 26, scale: 0.92, rotateX: -10 },
        animate: { opacity: 1, y: 0, scale: 1, rotateX: 0 },
        transition: {
          type: 'spring' as const,
          stiffness: 260,
          damping: 22,
          mass: 0.9,
        },
      }

  const sectionMotion = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 18 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.35, ease: 'easeOut' as const },
      }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        forceMount
        className="max-w-md overflow-hidden rounded-[28px] border-white/70 bg-white/95 p-0 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.55)] backdrop-blur-xl"
      >
        <motion.div {...panelMotion} className="relative [transform-style:preserve-3d]">
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 top-8 h-28 w-28 rounded-full bg-rose-300/35 blur-2xl"
            animate={prefersReducedMotion ? undefined : { y: [0, -10, 0], x: [0, -6, 0], scale: [1, 1.08, 1] }}
            transition={prefersReducedMotion ? undefined : { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            aria-hidden="true"
            className="pointer-events-none absolute -left-6 bottom-16 h-24 w-24 rounded-full bg-sky-300/30 blur-2xl"
            animate={prefersReducedMotion ? undefined : { y: [0, 8, 0], x: [0, 10, 0], scale: [1, 0.94, 1] }}
            transition={prefersReducedMotion ? undefined : { duration: 5.2, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
          />

          <motion.div
            {...sectionMotion}
            className="rounded-t-[28px] bg-gradient-to-r from-rose-200/80 via-amber-100/80 to-sky-200/80 px-6 pb-5 pt-8"
          >
            <DialogHeader className="space-y-2 text-left">
              <motion.div
                initial={prefersReducedMotion ? undefined : { opacity: 0, scale: 0.92 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, scale: 1 }}
                transition={prefersReducedMotion ? undefined : { delay: 0.08, duration: 0.28, ease: 'easeOut' }}
              >
                <DialogTitle className="text-2xl font-black tracking-tight text-slate-950">
                  {t('roomSettings.title')}
                </DialogTitle>
              </motion.div>
              <DialogDescription className="max-w-sm text-sm leading-6 text-slate-600">
                {t('roomSettings.description')}
              </DialogDescription>
            </DialogHeader>
          </motion.div>

          <div className="space-y-5 px-6 pb-6 pt-5">
            <motion.section
              {...sectionMotion}
              transition={prefersReducedMotion ? undefined : { duration: 0.34, delay: 0.08, ease: 'easeOut' }}
              className="space-y-3 rounded-[24px] border border-slate-200/80 bg-slate-50/85 p-4"
            >
              <div className="flex items-center gap-2 text-slate-900">
                <Gauge className="h-4 w-4" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em]">
                  {t('roomSettings.maxPlayers')}
                </h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxPlayers" className="text-slate-700">
                  {t('roomSettings.maxPlayers')}
                </Label>
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
                  className="h-12 rounded-2xl border-white bg-white"
                />
                <p className="text-xs leading-5 text-slate-500">
                  {currentPlayersCount > 2
                    ? t('roomSettings.rangeHintWithCurrent', { min: minPlayers, current: currentPlayersCount })
                    : t('roomSettings.rangeHint')}
                </p>
              </div>
            </motion.section>

            <motion.section
              {...sectionMotion}
              transition={prefersReducedMotion ? undefined : { duration: 0.34, delay: 0.16, ease: 'easeOut' }}
              className="space-y-3 rounded-[24px] border border-slate-200/80 bg-slate-50/85 p-4"
            >
              <div className="flex items-center gap-2 text-slate-900">
                <Joystick className="h-4 w-4" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em]">
                  {t('roomSettings.gameMode')}
                </h3>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gameMode" className="text-slate-700">
                  {t('roomSettings.gameMode')}
                </Label>
                <select
                  id="gameMode"
                  className="h-12 w-full rounded-2xl border border-white bg-white px-3 text-sm text-slate-900 outline-none transition focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={gameMode}
                  onChange={(e) => setGameMode(e.target.value as GameMode)}
                  disabled={isSaving}
                >
                  <option value="match_target">{t('roomSettings.modeMatchTarget')}</option>
                  <option value="avoid_target">{t('roomSettings.modeAvoidTarget')}</option>
                </select>
                <p className="text-xs leading-5 text-slate-500">
                  {gameMode === 'match_target'
                    ? t('roomSettings.modeMatchTargetHelp')
                    : t('roomSettings.modeAvoidTargetHelp')}
                </p>
              </div>
            </motion.section>

            {error && (
              <motion.div
                initial={prefersReducedMotion ? undefined : { opacity: 0, y: -10, scale: 0.98 }}
                animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                transition={prefersReducedMotion ? undefined : { duration: 0.22, ease: 'easeOut' }}
                className="rounded-2xl border border-destructive/20 bg-destructive/10 p-3"
              >
                <p className="text-sm text-destructive text-center">{error}</p>
              </motion.div>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isSaving}
                className="h-12 rounded-2xl border-white bg-white/85 text-base font-semibold text-slate-800 hover:bg-white"
              >
                {t('roomSettings.cancel')}
              </Button>
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="h-12 rounded-2xl text-base font-semibold"
              >
                {isSaving ? t('roomSettings.saving') : t('roomSettings.save')}
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
