import { useEffect, useRef, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion, LayoutGroup } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'
import type { RoomPlayer } from '@/types/socket.types'
import losePointsSound from '@/sounds/lose-points.wav'

interface ScoringScoreboardProps {
  players: RoomPlayer[]
  scoresByPlayerId: Record<string, number>
  previousScoresByPlayerId: Record<string, number>
  currentPlayerId: string | null
}

interface PlayerRow {
  id: string
  name: string
  score: number
  previousScore: number
  rank: number
  previousRank: number
}

/**
 * Two-phase animated scoreboard:
 *  Phase 1 – rows keep their PREVIOUS order while scores count up (≈ 600 ms)
 *  Phase 2 – rows reorder with a spring layout animation so overtakes are visible
 */
export const ScoringScoreboard = ({ players, scoresByPlayerId, previousScoresByPlayerId, currentPlayerId }: ScoringScoreboardProps) => {
  const { t } = useTranslation()
  const prevScoresRef = useRef<Record<string, number>>({})
  const prevRanksRef = useRef<Record<string, number>>({})
  const loseAudioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    loseAudioRef.current = new Audio(losePointsSound)
  }, [])

  // Play lose sound once on mount if current player didn't score this round
  useEffect(() => {
    if (!currentPlayerId) return
    const currentScore = scoresByPlayerId[currentPlayerId] ?? 0
    const prevScore = previousScoresByPlayerId[currentPlayerId] ?? 0
    if (currentScore === prevScore) {
      loseAudioRef.current?.play().catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Display rows (order changes between phase 1 → 2)
  const [rows, setRows] = useState<PlayerRow[]>([])
  const [phase, setPhase] = useState<'counting' | 'reordering' | 'done'>('counting')

  // Build row data once per scoring entry
  const buildRows = useCallback((): { oldOrder: PlayerRow[]; newOrder: PlayerRow[] } => {
    const prevScores = prevScoresRef.current
    const prevRanks = prevRanksRef.current
    const isFirstRender = Object.keys(prevRanks).length === 0

    const base = players.map((p) => ({
      id: p.id,
      name: p.name,
      score: scoresByPlayerId[p.id] ?? 0,
      previousScore: prevScores[p.id] ?? 0,
      rank: 0,
      previousRank: prevRanks[p.id] ?? 0,
    }))

    // New order (sorted by updated score)
    const newOrder = [...base].sort((a, b) => b.score - a.score)
    newOrder.forEach((r, i) => {
      r.rank = i + 1
    })

    // Old order (sorted by previous score to keep previous positions)
    const oldOrder = [...base].sort((a, b) => b.previousScore - a.previousScore)
    oldOrder.forEach((r) => {
      // Assign new rank from newOrder but keep old visual position
      const match = newOrder.find((n) => n.id === r.id)
      if (match) {
        r.rank = match.rank
        r.previousRank = isFirstRender ? match.rank : r.previousRank
      }
    })

    // If first render, old order = new order (no previous data)
    if (isFirstRender) {
      oldOrder.forEach((r) => {
        r.previousRank = r.rank
      })
    }

    return { oldOrder, newOrder }
  }, [players, scoresByPlayerId])

  useEffect(() => {
    const { oldOrder, newOrder } = buildRows()

    // Phase 1: show rows in old order, scores will count up
    setRows(oldOrder)
    setPhase('counting')

    // Phase 2: after count-up finishes, reorder rows (overtake animation)
    const reorderTimer = setTimeout(() => {
      setPhase('reordering')
      setRows(newOrder)
    }, 800)

    // Phase 3: mark done so rank badges / indicators appear
    const doneTimer = setTimeout(() => {
      setPhase('done')
    }, 1600)

    // Persist scores/ranks for next scoring round
    const newScores: Record<string, number> = {}
    const newRanks: Record<string, number> = {}
    newOrder.forEach((row) => {
      newScores[row.id] = row.score
      newRanks[row.id] = row.rank
    })
    prevScoresRef.current = newScores
    prevRanksRef.current = newRanks

    return () => {
      clearTimeout(reorderTimer)
      clearTimeout(doneTimer)
    }
  }, [buildRows])

  const medalColors: Record<number, string> = {
    1: 'bg-amber-400 text-amber-950',
    2: 'bg-slate-300 text-slate-800',
    3: 'bg-orange-300 text-orange-900',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="w-full space-y-3"
    >

      <div className="relative flex flex-col gap-2">
        {rows.map((row) => {
          const isCurrentPlayer = row.id === currentPlayerId
          const scored = row.score > row.previousScore
          const climbedUp = row.previousRank > row.rank
          const droppedDown = row.previousRank < row.rank
          const showIndicator = phase === 'done' && (climbedUp || droppedDown)

          return (
            <motion.div
              key={row.id}
              layout="position"
              transition={{
                layout: {
                  type: 'spring',
                  stiffness: 200,
                  damping: 24,
                  mass: 0.8,
                },
              }}
              className="relative"
            >
              {/* Glow effect for rows that climbed up */}
              {climbedUp && phase === 'reordering' && (
                <motion.div
                  className="absolute inset-0 z-0 rounded-2xl bg-emerald-400/20"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.6, 0] }}
                  transition={{ duration: 0.8, ease: 'easeInOut' }}
                />
              )}

              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: climbedUp && phase === 'reordering' ? [1, 1.03, 1] : 1,
                }}
                transition={{
                  opacity: { duration: 0.25 },
                  scale: { duration: 0.5, ease: 'easeInOut' },
                }}
                className={`relative z-10 flex items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur transition-colors duration-300 ${
                  isCurrentPlayer
                    ? 'border-sky-300/80 bg-sky-50/90 shadow-md shadow-sky-200/40'
                    : climbedUp && phase !== 'counting'
                      ? 'border-emerald-300/80 bg-emerald-50/60'
                      : droppedDown && phase !== 'counting'
                        ? 'border-rose-200/80 bg-rose-50/40'
                        : 'border-slate-200/80 bg-white/80'
                }`}
              >
                {/* Animated rank badge */}
                <motion.div
                  animate={{
                    scale: phase === 'done' && climbedUp ? [1, 1.25, 1] : 1,
                  }}
                  transition={{ duration: 0.35, delay: 0.1 }}
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm font-black transition-colors duration-300 ${
                    medalColors[row.rank] ?? 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {row.rank}
                </motion.div>

                {/* Name */}
                <div className="min-w-0 flex-1">
                  <p className={`truncate font-semibold ${isCurrentPlayer ? 'text-sky-900' : 'text-slate-800'}`}>
                    {row.name}
                    {isCurrentPlayer && <span className="ml-1.5 text-xs font-medium text-sky-500">({t('room.you')})</span>}
                  </p>
                </div>

                {/* Rank change indicator (appears after reorder) */}
                {showIndicator && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0, y: climbedUp ? 6 : -6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 22 }}
                    className={`flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
                      climbedUp ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}
                  >
                    {climbedUp ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    {Math.abs(row.previousRank - row.rank)}
                  </motion.div>
                )}

                {/* Score + delta */}
                <div className="flex items-center gap-1.5">
                  <AnimatedScore
                    from={row.previousScore}
                    to={row.score}
                    shouldAnimate={phase !== 'counting' || true}
                    isCurrentPlayer={isCurrentPlayer}
                  />
                  {scored && phase !== 'counting' && (
                    <motion.span
                      initial={{ opacity: 0, y: 8, scale: 0.5 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.15, type: 'spring', stiffness: 400, damping: 20 }}
                      className="text-xs font-bold text-emerald-500"
                    >
                      +{row.score - row.previousScore}
                    </motion.span>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ---------- Animated counter sub-component ---------- */

interface AnimatedScoreProps {
  from: number
  to: number
  shouldAnimate: boolean
  isCurrentPlayer: boolean
}

const AnimatedScore = ({ from, to, shouldAnimate, isCurrentPlayer }: AnimatedScoreProps) => {
  const [display, setDisplay] = useState(from)
  const hasAnimated = useRef(false)

  useEffect(() => {
    // Only animate once per scoring phase
    if (hasAnimated.current) return

    if (!shouldAnimate) {
      setDisplay(from)
      return
    }

    const diff = to - from
    if (diff === 0) {
      setDisplay(to)
      return
    }

    hasAnimated.current = true

    // Count up over ~500ms with a slight initial delay
    const totalDuration = 500
    const steps = Math.max(Math.abs(diff), 1)
    const stepDuration = Math.min(totalDuration / steps, 120)
    let current = from
    const startDelay = 100

    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        current += diff > 0 ? 1 : -1
        setDisplay(current)
        if (current === to) clearInterval(interval)
      }, stepDuration)

      return () => clearInterval(interval)
    }, startDelay)

    return () => clearTimeout(timeout)
  }, [from, to, shouldAnimate])

  // Reset flag when props change (new round)
  useEffect(() => {
    hasAnimated.current = false
  }, [from, to])

  return (
    <motion.span
      key={display}
      initial={display !== from ? { scale: 1.35 } : false}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
      className={`min-w-[2ch] text-right text-lg font-black tabular-nums ${isCurrentPlayer ? 'text-sky-900' : 'text-slate-900'}`}
    >
      {display}
    </motion.span>
  )
}
