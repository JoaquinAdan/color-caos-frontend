import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { ScoringScoreboard } from './ScoringScoreboard'
import { Check, Circle, Clock, Crosshair, ShieldOff, Trophy, Zap } from 'lucide-react'
import type { RoomWithPlayers } from '@/types/socket.types'

interface GameViewProps {
  currentRoom: RoomWithPlayers
  playerId: string | null
  onSubmitAnswer: (color: string) => Promise<boolean>
}

/* ─── Color utilities ─── */

const colorStyleMap: Record<string, { bg: string; ring: string; shadow: string; glow: string }> = {
  red:    { bg: 'bg-red-500',    ring: 'ring-red-400',    shadow: 'shadow-red-500/40',    glow: 'from-red-400/30' },
  blue:   { bg: 'bg-blue-500',   ring: 'ring-blue-400',   shadow: 'shadow-blue-500/40',   glow: 'from-blue-400/30' },
  green:  { bg: 'bg-emerald-500',ring: 'ring-emerald-400',shadow: 'shadow-emerald-500/40',glow: 'from-emerald-400/30' },
  yellow: { bg: 'bg-yellow-400', ring: 'ring-yellow-300', shadow: 'shadow-yellow-400/40', glow: 'from-yellow-300/30' },
  orange: { bg: 'bg-orange-500', ring: 'ring-orange-400', shadow: 'shadow-orange-500/40', glow: 'from-orange-400/30' },
  pink:   { bg: 'bg-pink-500',   ring: 'ring-pink-400',   shadow: 'shadow-pink-500/40',   glow: 'from-pink-400/30' },
  purple: { bg: 'bg-violet-500', ring: 'ring-violet-400', shadow: 'shadow-violet-500/40', glow: 'from-violet-400/30' },
  cyan:   { bg: 'bg-cyan-500',   ring: 'ring-cyan-400',   shadow: 'shadow-cyan-500/40',   glow: 'from-cyan-400/30' },
}

const fallbackStyle = { bg: 'bg-gray-400', ring: 'ring-gray-300', shadow: 'shadow-gray-400/40', glow: 'from-gray-300/30' }

/* ─── Timer ─── */

const useCountdown = (phaseEndsAt: number | null, serverNow: number | undefined, deps: unknown[]) => {
  const [secondsLeft, setSecondsLeft] = useState(0)

  useEffect(() => {
    const nowAtClient = Date.now()
    const initialRemainingMs = phaseEndsAt && serverNow ? Math.max(0, phaseEndsAt - serverNow) : 0
    const startedAtClient = nowAtClient
    setSecondsLeft(Math.ceil(initialRemainingMs / 1000))

    const id = window.setInterval(() => {
      const elapsed = Date.now() - startedAtClient
      const remaining = Math.max(0, initialRemainingMs - elapsed)
      setSecondsLeft(Math.ceil(remaining / 1000))
    }, 200)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return secondsLeft
}

/* ─── Component ─── */

export const GameView = ({ currentRoom, playerId, onSubmitAnswer }: GameViewProps) => {
  const { t } = useTranslation()
  const { gameState, gameConfig } = currentRoom

  const secondsLeft = useCountdown(
    gameState.phaseEndsAt,
    currentRoom.serverNow,
    [gameState.phase, gameState.currentRound, gameState.phaseEndsAt, currentRoom.serverNow],
  )

  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [hasTappedThisRound, setHasTappedThisRound] = useState(false)

  useEffect(() => {
    setSelectedColor(null)
    setHasTappedThisRound(false)
  }, [gameState.currentRound])

  // Keep a snapshot of scores from the answering phase so ScoringScoreboard
  // can tell if the current player scored this round
  const scoresBeforeScoringRef = useRef<Record<string, number>>(currentRoom.scoresByPlayerId)
  useEffect(() => {
    if (gameState.phase === 'answering') {
      scoresBeforeScoringRef.current = currentRoom.scoresByPlayerId
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.phase])

  const alreadyAnswered = useMemo(() => {
    if (!playerId) return false
    return Boolean(gameState.roundAnswers[playerId])
  }, [gameState.roundAnswers, playerId])

  const handleSelectColor = async (color: string) => {
    if (gameState.phase !== 'answering') return
    if (alreadyAnswered || hasTappedThisRound) return

    setHasTappedThisRound(true)
    setSelectedColor(color)
    const accepted = await onSubmitAnswer(color)
    if (!accepted) {
      setSelectedColor(null)
      setHasTappedThisRound(false)
    }
  }

  const targetStyle = colorStyleMap[gameState.targetColor ?? ''] ?? fallbackStyle
  const isMatchMode = gameConfig.mode === 'match_target'
  const roundProgress = gameConfig.totalRounds > 0 ? (gameState.currentRound / gameConfig.totalRounds) * 100 : 0

  /* ─── Pre-game countdown ─── */
  if (gameState.phase === 'pre_game_countdown') {
    return (
      <div className="mx-auto flex min-h-[calc(100svh-4.75rem)] w-full max-w-5xl items-center justify-center px-4 py-5 sm:px-6 sm:py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-lg"
        >
          <Card className="relative overflow-hidden rounded-[32px] border-white/70 bg-white/80 p-8 text-center shadow-[0_30px_90px_-40px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:p-12">
            {/* Decorative gradient */}
            <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-r from-violet-200/70 via-fuchsia-100/70 to-sky-200/70" />
            <div className="pointer-events-none absolute -right-10 top-8 h-36 w-36 rounded-full bg-fuchsia-300/25 blur-3xl" />
            <div className="pointer-events-none absolute -left-10 bottom-8 h-36 w-36 rounded-full bg-sky-300/25 blur-3xl" />

            <div className="relative space-y-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-950 text-white shadow-lg"
              >
                <Zap className="h-7 w-7" />
              </motion.div>

              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
                  {t('game.starting')}
                </h1>
                <p className="mt-2 text-sm text-slate-500">{t('game.matchBeginsIn')}</p>
              </div>

              <motion.div
                key={secondsLeft}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="text-8xl font-black text-slate-950 sm:text-9xl"
              >
                {secondsLeft}
              </motion.div>

              {/* Pulsing ring */}
              <motion.div
                animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.12, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="mx-auto h-4 w-32 rounded-full bg-slate-950/20"
              />
            </div>
          </Card>
        </motion.div>
      </div>
    )
  }

  /* ─── Main game view (answering + scoring) ─── */
  return (
    <div className="mx-auto flex min-h-[calc(100svh-4.75rem)] w-full max-w-5xl items-center justify-center px-4 py-5 sm:px-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-2xl"
      >
        <Card className="relative overflow-hidden rounded-[28px] border-white/70 bg-white/80 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:rounded-[32px]">
          {/* Top gradient stripe */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-rose-200/70 via-amber-100/70 to-sky-200/70 sm:h-32" />
          <div className="pointer-events-none absolute -right-8 top-10 h-32 w-32 rounded-full bg-rose-300/30 blur-3xl" />
          <div className="pointer-events-none absolute -left-8 bottom-12 h-32 w-32 rounded-full bg-sky-300/30 blur-3xl" />

          <div className="relative p-5 sm:p-8">
            {/* ── Header: Round info + Timer ── */}
            <div className="mb-6 space-y-4">
              {/* Round progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  <span>{t('game.roundLabel', { current: gameState.currentRound, total: gameConfig.totalRounds })}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {secondsLeft}s
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200/60">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-slate-800 to-slate-600"
                    initial={{ width: 0 }}
                    animate={{ width: `${roundProgress}%` }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Target color display */}
              <motion.div
                key={gameState.targetColor}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35 }}
                className="flex items-center justify-center gap-4 rounded-[24px] bg-slate-950 px-5 py-4 text-white shadow-[0_18px_50px_-30px_rgba(15,23,42,0.95)]"
              >
                <div className="space-y-1 text-center">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">
                    {t('game.targetColor')}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <motion.div
                      key={gameState.targetColor}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                      className={`h-10 w-10 rounded-2xl ${targetStyle.bg} shadow-lg ${targetStyle.shadow} ring-2 ring-white/30`}
                    />
                    <span className="text-2xl font-black uppercase tracking-wider sm:text-3xl">
                      {gameState.targetColor ?? '-'}
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Instruction */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={gameState.phase}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="text-center"
                >
                  {gameState.phase === 'answering' ? (
                    <div className="flex items-center justify-center gap-2 text-sm font-semibold text-slate-700">
                      {isMatchMode ? (
                        <>
                          <Crosshair className="h-4 w-4 text-emerald-500" />
                          {t('game.chooseNowMatch')}
                        </>
                      ) : (
                        <>
                          <ShieldOff className="h-4 w-4 text-rose-500" />
                          {t('game.chooseNowAvoid')}
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-slate-500">{t('game.scoringNow')}</p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Color cards grid ── */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {gameState.cards.map((color, index) => {
                const style = colorStyleMap[color] ?? fallbackStyle
                const isClickable = gameState.phase === 'answering' && !alreadyAnswered && !hasTappedThisRound
                const isSelected = selectedColor === color
                const isScoring = gameState.phase === 'scoring'

                return (
                  <motion.button
                    key={`${color}`}
                    type="button"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: isScoring && !isSelected ? 0.5 : 1,
                      scale: 1,
                    }}
                    whileHover={isClickable ? { scale: 1.06, y: -3 } : undefined}
                    whileTap={isClickable ? { scale: 0.93 } : undefined}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 25,
                      delay: index * 0.04,
                    }}
                    onClick={() => handleSelectColor(color)}
                    disabled={!isClickable}
                    aria-label={color}
                    className={`relative h-[5.5rem] rounded-[20px] ${style.bg} shadow-lg ${style.shadow} transition-all duration-200 sm:h-24 ${
                      isSelected
                        ? `ring-4 ${style.ring} ring-offset-2 ring-offset-white/80`
                        : 'ring-0'
                    } ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    {/* Selected check */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-md">
                            <Check className="h-5 w-5 text-slate-900" />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Shine effect on hover */}
                    {isClickable && (
                      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[20px]">
                        <div className="absolute -left-full top-0 h-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-all duration-700 group-hover:left-full" />
                      </div>
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* ── Bottom section: status badge ── */}
            <div className="flex justify-center">
              <motion.div
                animate={alreadyAnswered ? {} : { scale: [1, 1.03, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className={`flex items-center gap-2 rounded-2xl border px-5 py-3 text-sm font-semibold backdrop-blur ${
                  alreadyAnswered
                    ? 'border-emerald-200 bg-emerald-50/80 text-emerald-700'
                    : 'border-slate-200 bg-white/70 text-slate-600'
                }`}
              >
                {alreadyAnswered ? (
                  <>
                    <Check className="h-4 w-4" />
                    {t('game.answerSent')}
                  </>
                ) : (
                  <>
                    <Circle className="h-4 w-4 animate-pulse" />
                    {t('game.waitingAnswer')}
                  </>
                )}
              </motion.div>
            </div>

            {/* ── Scoring Dialog ── */}
            <Dialog open={gameState.phase === 'scoring'}>
              <DialogContent
                hideCloseButton
                onEscapeKeyDown={(e) => e.preventDefault()}
                onPointerDownOutside={(e) => e.preventDefault()}
                onInteractOutside={(e) => e.preventDefault()}
                className="max-w-md rounded-[28px] border-white/70 bg-white/90 p-6 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.55)] backdrop-blur-xl sm:max-w-lg sm:rounded-[32px] sm:p-8"
              >
                {/* Decorative gradient */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 rounded-t-[28px] bg-gradient-to-r from-amber-200/60 via-rose-100/60 to-violet-200/60 sm:rounded-t-[32px]" />
                <div className="pointer-events-none absolute -right-6 top-6 h-28 w-28 rounded-full bg-amber-300/25 blur-3xl" />
                <div className="pointer-events-none absolute -left-6 bottom-6 h-28 w-28 rounded-full bg-violet-300/25 blur-3xl" />

                <div className="relative">
                  <div className="mb-4 flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      <DialogTitle className="text-lg font-black uppercase tracking-widest text-slate-800">
                        {t('game.scoreboard')}
                      </DialogTitle>
                    </div>
                    <DialogDescription className="text-xs font-medium text-slate-400">
                      {t('game.roundLabel', { current: gameState.currentRound, total: gameConfig.totalRounds })}
                    </DialogDescription>
                  </div>

                  <ScoringScoreboard
                    players={currentRoom.players}
                    scoresByPlayerId={currentRoom.scoresByPlayerId}
                    previousScoresByPlayerId={scoresBeforeScoringRef.current}
                    currentPlayerId={playerId}
                  />
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </motion.div>
    </div>
  )
}
