import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { getSocket } from '@/lib/socket'
import type { RoomWithPlayers } from '@/types/socket.types'
import { Crown, Trophy, UserMinus, Users } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

interface RoomSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  currentRoom: RoomWithPlayers
  playerId: string | null
  isHost: boolean
}

export const RoomPlayersModal = ({ isOpen, onClose, currentRoom, playerId, isHost }: RoomSettingsModalProps) => {
  const [kickingPlayerId, setKickingPlayerId] = useState<string | null>(null)
  const { t } = useTranslation()

  const sortedScores = Object.entries(currentRoom.scoresByPlayerId).sort(([, a], [, b]) => b - a)
  const handleKickPlayer = (targetPlayerId: string) => {
    if (!playerId || !isHost) return

    const socket = getSocket()
    setKickingPlayerId(targetPlayerId)

    socket.emit('room:kick', { roomCode: currentRoom.code, hostPlayerId: playerId, targetPlayerId }, (response) => {
      setKickingPlayerId(null)
      if (!response.success) {
        console.error('Error al expulsar jugador:', response.error)
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl overflow-hidden rounded-[28px] border-white/70 bg-white/95 p-0 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.55)] backdrop-blur-xl">
        <div className="rounded-t-[28px] bg-gradient-to-r from-rose-200/80 via-amber-100/80 to-sky-200/80 px-6 pb-5 pt-8">
          <DialogHeader className="space-y-2 text-left">
            <DialogTitle className="text-2xl font-black tracking-tight text-slate-950">{t('room.playersList')}</DialogTitle>
            <DialogDescription className="max-w-md text-sm leading-6 text-slate-600">
              {t('room.playersReady', { count: currentRoom.players.length, max: currentRoom.maxPlayers })}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="max-h-[70vh] space-y-5 overflow-y-auto px-6 pb-6 pt-5">
          <section className="space-y-3 rounded-[24px] border border-slate-200/80 bg-slate-50/85 p-4">
            {currentRoom.players.map((player) => (
              <div
                key={player.id}
                className="flex flex-col gap-3 rounded-[20px] border border-slate-200/80 bg-white/90 p-4 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${player.id === currentRoom.hostId ? 'bg-amber-300 text-slate-950' : 'bg-slate-950 text-white'}`}
                  >
                    {player.id === currentRoom.hostId ? <Crown className="h-5 w-5" /> : <Users className="h-5 w-5" />}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-slate-950">{player.name}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {player.id === currentRoom.hostId && (
                        <Badge
                          disableHover
                          className="rounded-full border-0 bg-amber-200 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-amber-950"
                        >
                          {t('room.host')}
                        </Badge>
                      )}
                      {player.id === playerId && (
                        <Badge
                          disableHover
                          className="rounded-full border-0 bg-sky-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sky-900"
                        >
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
              </div>
            ))}
          </section>

          {currentRoom.completedGames > 0 && currentRoom.gameState.phase === 'finished' && sortedScores.length > 0 && (
            <section className="space-y-3 rounded-[24px] border border-slate-200/80 bg-slate-50/85 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{t('room.lastMatch')}</p>
                  <h3 className="text-xl font-black tracking-tight text-slate-950">{t('room.scoreboard')}</h3>
                </div>
              </div>

              <div className="space-y-3">
                {sortedScores.map(([scorePlayerId, score], index) => {
                  const scorePlayer = currentRoom.players.find((player) => player.id === scorePlayerId)
                  return (
                    <div
                      key={scorePlayerId}
                      className="flex items-center justify-between rounded-[20px] border border-slate-200/80 bg-white/90 px-4 py-3"
                    >
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
            </section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
