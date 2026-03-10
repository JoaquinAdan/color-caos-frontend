import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Copy, DoorOpen, Play, Settings, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RoomSettingsModal } from './RoomSettingsModal'
import { getSocket } from '@/lib/socket'
import type { RoomWithPlayers } from '@/types/socket.types'
import { RoomPlayersModal } from './RoomPlayersModal'

interface RoomViewProps {
  currentRoom: RoomWithPlayers
  playerId: string | null
  onStartGame: () => void
  isStartingGame: boolean
  onLeaveRoom: () => void
}

export const RoomView = ({ currentRoom, playerId, onStartGame, isStartingGame, onLeaveRoom }: RoomViewProps) => {
  const { t } = useTranslation()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isPlayersOpen, setIsPlayersOpen] = useState(false)
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(currentRoom.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isHost = playerId === currentRoom.hostId
  const playersNeeded = Math.max(0, 2 - currentRoom.players.length)
  const modeLabel = currentRoom.gameConfig.mode === 'match_target' ? t('roomSettings.modeMatchTarget') : t('roomSettings.modeAvoidTarget')

  const handleSaveSettings = (maxPlayers: number, gameMode: 'match_target' | 'avoid_target') => {
    if (!playerId) return

    const socket = getSocket()
    setIsSavingSettings(true)

    socket.emit('room:update-settings', { roomCode: currentRoom.code, maxPlayers, hostPlayerId: playerId, gameMode }, (response) => {
      setIsSavingSettings(false)
      if (response.success) {
        setIsSettingsOpen(false)
      } else {
        console.error('Error al actualizar configuración:', response.error)
      }
    })
  }

  return (
    <div className="mx-auto flex min-h-[calc(100svh-4.75rem)] w-full max-w-5xl items-center px-4 py-5 sm:px-6 sm:py-8">
      <motion.section
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full"
      >
        <Card className="relative overflow-hidden rounded-[28px] border-white/70 bg-white/80 p-5 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:rounded-[32px] sm:p-8">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-rose-200/70 via-amber-100/70 to-sky-200/70 sm:h-32" />
          <div className="pointer-events-none absolute -right-8 top-10 h-32 w-32 rounded-full bg-rose-300/30 blur-3xl" />
          <div className="pointer-events-none absolute -left-8 bottom-12 h-32 w-32 rounded-full bg-sky-300/30 blur-3xl" />

          <div className="relative flex min-h-[calc(100svh-11rem)] flex-col justify-between gap-5 sm:min-h-[640px] lg:min-h-[600px]">
            <div className="space-y-5">
              <div className="flex flex-col items-start justify-between gap-1">
                <div className="space-y-3">
                  <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">{t('room.title')}</h1>
                  </div>
                </div>

                <div className="flex w-full justify-between gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsPlayersOpen(true)}
                    title={t('room.playersList')}
                    className="h-11 rounded-2xl cursor-pointer border-sky-200 bg-white/90 px-4 font-semibold text-sky-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 hover:text-sky-800 hover:shadow-[0_14px_30px_-18px_rgba(14,165,233,0.6)] active:translate-y-0 active:scale-[0.99]"
                  >
                    {t('room.playersButton')} {currentRoom.players.length} / {currentRoom.maxPlayers} <Users className="h-5 w-5" />
                  </Button>
                  {isHost && (
                    <Button
                      variant="outline"
                      onClick={() => setIsSettingsOpen(true)}
                      title={t('room.settings')}
                      className="h-11 rounded-2xl cursor-pointer border-amber-200 bg-white/90 px-4 font-semibold text-amber-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:bg-amber-50 hover:text-amber-800 hover:shadow-[0_14px_30px_-18px_rgba(245,158,11,0.6)] active:translate-y-0 active:scale-[0.99]"
                    >
                      {t('room.configureButton')} <Settings className="h-5 w-5" />
                    </Button>
                  )}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">{isHost ? t('room.hostHint') : t('room.guestHint')}</p>
              </div>

              <div className="rounded-[26px] bg-slate-950 px-5 py-4 text-white shadow-[0_18px_50px_-30px_rgba(15,23,42,0.95)]">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">{t('room.code')}</p>
                  <button
                    onClick={handleCopyCode}
                    title={t('room.copyCode')}
                    className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-white/60 transition-all duration-200 hover:bg-white/10 hover:text-white active:scale-95"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {copied ? (
                        <motion.span
                          key="check"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-1.5 text-emerald-400"
                        >
                          <Check className="h-4 w-4" />
                          {t('room.copied')}
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy"
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.5, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="flex items-center gap-1.5"
                        >
                          <Copy className="h-4 w-4" />
                          {t('room.copy')}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </div>
                <p className="mt-2 font-mono text-3xl font-black tracking-[0.38em] sm:text-4xl">{currentRoom.code}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[24px] border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{t('room.mode')}</p>
                  <p className="mt-2 text-sm font-bold text-slate-900">{modeLabel}</p>
                </div>

                <div className="rounded-[24px] border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {isHost ? t('room.host') : t('room.status')}
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {playersNeeded > 0 ? t('room.waitingPlayers', { count: playersNeeded }) : t('room.readyToStart')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {isHost && (
                <Button
                  onClick={onStartGame}
                  className="h-13 w-full justify-between rounded-2xl px-5 text-base font-semibold shadow-[0_20px_40px_-20px_rgba(15,23,42,0.7)] sm:h-14"
                  disabled={isStartingGame || currentRoom.players.length < 2}
                >
                  <span className="flex items-center gap-3">
                    <Play className="h-5 w-5" />
                    {isStartingGame ? t('room.startingGame') : t('room.startGame')}
                  </span>
                  <span className="text-xs uppercase tracking-[0.18em] text-white/70">
                    {playersNeeded > 0 ? t('room.playersNeeded', { count: playersNeeded }) : t('room.readyLabel')}
                  </span>
                </Button>
              )}

              <Button
                onClick={onLeaveRoom}
                variant="outline"
                className="h-12 w-full rounded-2xl border-rose-200 bg-white/90 cursor-pointer text-base font-semibold text-rose-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800 hover:shadow-[0_14px_30px_-18px_rgba(225,29,72,0.55)] active:translate-y-0 active:scale-[0.99]"
              >
                <span className="flex items-center gap-2">
                  <DoorOpen className="h-4 w-4" />
                  {t('room.leaveRoom')}
                </span>
              </Button>
            </div>
          </div>
        </Card>
      </motion.section>
      <RoomSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentMaxPlayers={currentRoom.maxPlayers}
        currentGameMode={currentRoom.gameConfig.mode}
        currentPlayersCount={currentRoom.players.length}
        onSave={handleSaveSettings}
        isSaving={isSavingSettings}
      />
      <RoomPlayersModal
        isOpen={isPlayersOpen}
        onClose={() => setIsPlayersOpen(false)}
        currentRoom={currentRoom}
        playerId={playerId}
        isHost={isHost}
      />
    </div>
  )
}
