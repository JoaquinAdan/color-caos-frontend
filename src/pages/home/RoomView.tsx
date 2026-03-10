import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { Crown, DoorOpen, Play, Settings, Trophy, UserMinus, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RoomSettingsModal } from './RoomSettingsModal'
import { getSocket } from '@/lib/socket'
import type { RoomWithPlayers } from '@/types/socket.types'

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
  const [isSavingSettings, setIsSavingSettings] = useState(false)
  const [kickingPlayerId, setKickingPlayerId] = useState<string | null>(null)

  const isHost = playerId === currentRoom.hostId
  const playersNeeded = Math.max(0, 2 - currentRoom.players.length)
  const modeLabel =
    currentRoom.gameConfig.mode === 'match_target'
      ? t('roomSettings.modeMatchTarget')
      : t('roomSettings.modeAvoidTarget')
  const sortedScores = Object.entries(currentRoom.scoresByPlayerId).sort(([, a], [, b]) => b - a)

  const handleSaveSettings = (maxPlayers: number, gameMode: 'match_target' | 'avoid_target') => {
    if (!playerId) return

    const socket = getSocket()
    setIsSavingSettings(true)

    socket.emit('room:update-settings', 
      { roomCode: currentRoom.code, maxPlayers, hostPlayerId: playerId, gameMode }, 
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
    <div className="mx-auto flex min-h-[calc(100vh-4.75rem)] w-full max-w-7xl items-start px-4 pb-8 pt-5 sm:px-6 sm:pb-12 sm:pt-8 lg:items-center">
      <div className="grid w-full gap-5 lg:grid-cols-[0.92fr_1.08fr] lg:gap-8">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="order-1"
        >
          <Card className="relative overflow-hidden rounded-[28px] border-white/70 bg-white/80 p-5 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:rounded-[32px] sm:p-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-rose-200/70 via-amber-100/70 to-sky-200/70 sm:h-32" />
            <div className="pointer-events-none absolute -right-8 top-10 h-32 w-32 rounded-full bg-rose-300/30 blur-3xl" />
            <div className="pointer-events-none absolute -left-8 bottom-12 h-32 w-32 rounded-full bg-sky-300/30 blur-3xl" />

            <div className="relative space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-3">
                  <Badge className="rounded-full border-0 bg-slate-950 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
                    {t('room.lobbyBadge')}
                  </Badge>
                  <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                      {t('room.title')}
                    </h1>
                    <p className="mt-8 text-sm leading-6 text-slate-600">
                      {isHost ? t('room.hostHint') : t('room.guestHint')}
                    </p>
                  </div>
                </div>

                {isHost && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setIsSettingsOpen(true)}
                    title={t('room.settings')}
                    className="h-11 w-11 rounded-2xl border-white bg-white/85 text-slate-800 hover:bg-white"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                )}
              </div>

              <div className="rounded-[26px] bg-slate-950 px-5 py-4 text-white shadow-[0_18px_50px_-30px_rgba(15,23,42,0.95)]">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                  {t('room.code')}
                </p>
                <p className="mt-2 font-mono text-3xl font-black tracking-[0.38em] sm:text-4xl">
                  {currentRoom.code}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[24px] border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {t('room.players')}
                  </p>
                  <p className="mt-2 text-2xl font-black text-slate-950">
                    {currentRoom.players.length} / {currentRoom.maxPlayers}
                  </p>
                </div>

                <div className="rounded-[24px] border border-white/70 bg-white/75 p-4 shadow-sm backdrop-blur">
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {t('room.mode')}
                  </p>
                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {modeLabel}
                  </p>
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

              <div className="space-y-3">
                {isHost ? (
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
                ) : (
                  <div className="rounded-[24px] border border-white/70 bg-white/75 p-4 text-sm leading-6 text-slate-600 shadow-sm backdrop-blur">
                    {t('room.guestHint')}
                  </div>
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

        <motion.section
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08, ease: 'easeOut' }}
          className="order-2 space-y-5"
        >
          <Card className="rounded-[28px] border-white/70 bg-white/80 p-5 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:rounded-[32px] sm:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  {t('room.playersList')}
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
                  {t('room.playersReady', { count: currentRoom.players.length, max: currentRoom.maxPlayers })}
                </h2>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/20">
                <Users className="h-5 w-5" />
              </div>
            </div>

            <div className="space-y-3">
              {currentRoom.players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: 0.08 + index * 0.04, ease: 'easeOut' }}
                  className="flex flex-col gap-3 rounded-[24px] border border-slate-200/80 bg-slate-50/90 p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${player.id === currentRoom.hostId ? 'bg-amber-300 text-slate-950' : 'bg-white text-slate-500'}`}>
                      {player.id === currentRoom.hostId ? <Crown className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold text-slate-950">{player.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {player.id === currentRoom.hostId && (
                          <Badge disableHover className="rounded-full border-0 bg-amber-200 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-950">
                            {t('room.host')}
                          </Badge>
                        )}
                        {player.id === playerId && (
                          <Badge disableHover className="rounded-full border-0 bg-sky-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-900">
                            {t('room.you')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {isHost && player.id !== playerId && player.id !== currentRoom.hostId && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="h-11 rounded-2xl sm:ml-auto"
                      onClick={() => handleKickPlayer(player.id)}
                      disabled={kickingPlayerId !== null}
                    >
                      <span className="flex items-center gap-2">
                        <UserMinus className="h-4 w-4" />
                        {kickingPlayerId === player.id ? t('room.kicking') : t('room.kick')}
                      </span>
                    </Button>
                  )}
                </motion.div>
              ))}
            </div>
          </Card>

          {currentRoom.completedGames > 0 && currentRoom.gameState.phase === 'finished' && sortedScores.length > 0 && (
            <Card className="rounded-[28px] border-white/70 bg-white/80 p-5 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.4)] backdrop-blur-xl sm:rounded-[32px] sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                    {t('room.lastMatch')}
                  </p>
                  <h3 className="text-xl font-black tracking-tight text-slate-950">
                    {t('room.scoreboard')}
                  </h3>
                </div>
              </div>

              <div className="space-y-3">
                {sortedScores.map(([scorePlayerId, score], index) => {
                  const scorePlayer = currentRoom.players.find((player) => player.id === scorePlayerId)
                  return (
                    <div key={scorePlayerId} className="flex items-center justify-between rounded-[20px] border border-slate-200/80 bg-slate-50/90 px-4 py-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-sm font-black text-slate-900">
                          {index + 1}
                        </div>
                        <span className="truncate text-sm font-medium text-slate-700">
                          {scorePlayer?.name ?? `${t('room.playerId')}: ${scorePlayerId.slice(0, 8)}`}
                        </span>
                      </div>
                      <span className="text-lg font-black text-slate-950">{score}</span>
                    </div>
                  )
                })}
              </div>
            </Card>
          )}
        </motion.section>
      </div>

      {/* Modal de configuración */}
      <RoomSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentMaxPlayers={currentRoom.maxPlayers}
        currentGameMode={currentRoom.gameConfig.mode}
        currentPlayersCount={currentRoom.players.length}
        onSave={handleSaveSettings}
        isSaving={isSavingSettings}
      />
    </div>
  )
}
