import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Plus, Settings2, Sparkles, Users } from 'lucide-react'
import SetNicknameModal from '@/components/SetNicknameModal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
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
}: HomeMenuViewProps) => {
  const [showJoinRoom, setShowJoinRoom] = useState(false)
  const [roomCode, setRoomCode] = useState('')
  const { t } = useTranslation()
  const { isOpen, openSetNicknameModal, closeSetNicknameModal } = useSetNicknameModal()

  const handleJoinClick = () => {
    onJoinRoom(roomCode)
  }

  const handleCancelJoin = () => {
    setShowJoinRoom(false)
    setRoomCode('')
    onClearError()
  }

  return (
    <>
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl items-start px-4 pb-8 pt-24 sm:px-6 sm:pb-12 sm:pt-28 lg:items-center">
        <motion.div
          initial={{ opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="absolute left-4 right-4 top-4 z-20 sm:left-6 sm:right-6 sm:top-6"
        >
          <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 rounded-[28px] border border-white/65 bg-white/70 px-4 py-3 shadow-[0_18px_60px_-30px_rgba(15,23,42,0.45)] backdrop-blur-xl sm:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 shadow-lg shadow-slate-950/20">
                <div className="grid grid-cols-2 gap-1">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </div>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold uppercase tracking-[0.28em] text-slate-500">Color Caos</p>
                <p className="truncate text-sm text-slate-600">{t('home.quickBattles')}</p>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              onClick={openSetNicknameModal}
              className="rounded-full border-white/70 bg-white/80 px-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700 shadow-sm backdrop-blur hover:bg-white sm:px-4"
            >
              <Settings2 className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </div>
        </motion.div>

        <div className="grid w-full mt-6 gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.62fr)] lg:items-center lg:gap-8">
          <motion.section
            initial={{ opacity: 0, x: 24, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.12, ease: 'easeOut' }}
            className="order-1"
          >
            <Card className="relative overflow-hidden rounded-[28px] border-white/70 bg-white/78 p-5 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:rounded-[32px] sm:p-8">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-rose-200/70 via-amber-100/70 to-sky-200/70 sm:h-32" />
              <div className="pointer-events-none absolute -right-10 top-10 h-32 w-32 rounded-full bg-rose-300/30 blur-3xl" />
              <div className="pointer-events-none absolute -left-10 bottom-10 h-32 w-32 rounded-full bg-sky-300/30 blur-3xl" />

              <div className="relative flex  flex-col  gap-6 ">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 self-start rounded-full bg-slate-950 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white sm:text-xs">
                    <Users className="h-3.5 w-3.5" />
                    Multiplayer
                  </div>

                  <div className="max-w-xl space-y-3">
                    <h2 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-[2.8rem] lg:leading-[1]">
                      {t('home.greeting', { nickname })}
                    </h2>
                    <p className="max-w-lg mt-8 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">{t('home.description')}</p>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {error ? (
                    <motion.div
                      key={error}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3"
                    >
                      <p className="text-sm font-medium text-destructive">{error}</p>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                <div className="space-y-3">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
                    <Button
                      onClick={onCreateRoom}
                      variant="default"
                      className="h-13 w-full justify-between rounded-2xl px-5 text-base font-semibold shadow-[0_20px_40px_-20px_rgba(15,23,42,0.7)] sm:h-14"
                      disabled={isCreatingRoom || isJoiningRoom}
                    >
                      <span className="flex items-center gap-3">
                        <Plus className="h-5 w-5" />
                        {isCreatingRoom ? t('home.creatingRoom') : t('home.createRoom')}
                      </span>
                      <ArrowRight className="h-5 w-5" />
                    </Button>

                    {!showJoinRoom ? (
                      <Button
                        onClick={() => setShowJoinRoom(true)}
                        variant="outline"
                        className="h-13 w-full rounded-2xl border-white bg-white/85 text-base font-semibold text-slate-800 hover:bg-white sm:h-14"
                        disabled={isCreatingRoom || isJoiningRoom}
                      >
                        {t('home.joinRoom')}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleCancelJoin}
                        variant="outline"
                        className="h-13 w-full rounded-2xl border-white bg-white/85 text-base font-semibold text-slate-800 hover:bg-white sm:h-14"
                        disabled={isJoiningRoom}
                      >
                        {t('home.cancel')}
                      </Button>
                    )}
                  </div>

                  <AnimatePresence>
                    {showJoinRoom ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: -6 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -6 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-4 rounded-[24px] border border-slate-200/80 bg-slate-50/90 p-4 sm:rounded-[26px]">
                          <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-900">{t('home.joinPanelTitle')}</p>
                            <p className="text-sm text-slate-500">{t('home.joinPanelDescription')}</p>
                          </div>

                          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_140px]">
                            <Input
                              type="text"
                              value={roomCode}
                              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                              placeholder={t('home.roomCodePlaceholder')}
                              className="h-12 rounded-2xl border-white bg-white text-center font-mono text-base tracking-[0.34em] uppercase shadow-inner sm:h-13 sm:text-lg sm:tracking-[0.38em]"
                              maxLength={6}
                              disabled={isJoiningRoom}
                            />

                            <Button
                              onClick={handleJoinClick}
                              variant="default"
                              className="h-12 rounded-2xl text-base font-semibold sm:h-13"
                              disabled={isJoiningRoom || !roomCode.trim()}
                            >
                              {isJoiningRoom ? t('home.joiningRoom') : t('home.join')}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </div>
              </div>
            </Card>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="order-2 flex h-full flex-col justify-center gap-4 lg:gap-6"
          >
            <div className="inline-flex max-w-fit items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-2 text-xs font-medium text-slate-600 shadow-sm backdrop-blur sm:px-4 sm:text-sm">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>{t('home.tagline')}</span>
            </div>

            <div className="space-y-3">
              {playerId && (
                <div className="rounded-[28px] border border-white/70 bg-slate-950 p-4 text-white shadow-[0_18px_50px_-30px_rgba(15,23,42,0.9)]">
                  <p className="text-xs text-center font-semibold uppercase tracking-[0.22em] text-white/60">{t('home.playerIdentity')}</p>
                  <p className="mt-3 break-all text-center font-mono text-[11px] tracking-[0.22em] text-white/90 sm:text-xs sm:tracking-[0.28em]">
                    {playerId}
                  </p>
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </div>
      <SetNicknameModal
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeSetNicknameModal()
          }
        }}
      />
    </>
  )
}
