import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { RoomWithPlayers } from '@/types/socket.types'

interface GameViewProps {
  currentRoom: RoomWithPlayers
  playerId: string | null
  onSubmitAnswer: (color: string) => Promise<boolean>
}

const colorClassMap: Record<string, string> = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
  purple: 'bg-violet-500',
  cyan: 'bg-cyan-500',
}

const getSecondsLeft = (phaseEndsAt: number | null): number => {
  if (!phaseEndsAt) return 0
  const diffMs = phaseEndsAt - Date.now()
  if (diffMs <= 0) return 0
  return Math.ceil(diffMs / 1000)
}

export const GameView = ({ currentRoom, playerId, onSubmitAnswer }: GameViewProps) => {
  const { t } = useTranslation()
  const [secondsLeft, setSecondsLeft] = useState(getSecondsLeft(currentRoom.gameState.phaseEndsAt))
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [hasTappedThisRound, setHasTappedThisRound] = useState(false)

  useEffect(() => {
    const phaseEndsAt = currentRoom.gameState.phaseEndsAt
    const serverNow = currentRoom.serverNow
    const nowAtClient = Date.now()
    const initialRemainingMs = phaseEndsAt && serverNow ? Math.max(0, phaseEndsAt - serverNow) : 0
    const startedAtClient = nowAtClient

    setSecondsLeft(Math.ceil(initialRemainingMs / 1000))

    const intervalId = window.setInterval(() => {
      const elapsedMs = Date.now() - startedAtClient
      const remainingMs = Math.max(0, initialRemainingMs - elapsedMs)
      setSecondsLeft(Math.ceil(remainingMs / 1000))
    }, 200)

    return () => window.clearInterval(intervalId)
  }, [currentRoom.gameState.phase, currentRoom.gameState.currentRound, currentRoom.gameState.phaseEndsAt, currentRoom.serverNow])

  useEffect(() => {
    setSelectedColor(null)
    setHasTappedThisRound(false)
  }, [currentRoom.gameState.currentRound])

  const alreadyAnswered = useMemo(() => {
    if (!playerId) return false
    return Boolean(currentRoom.gameState.roundAnswers[playerId])
  }, [currentRoom.gameState.roundAnswers, playerId])

  const handleSelectColor = async (color: string) => {
    if (currentRoom.gameState.phase !== 'answering') return
    if (alreadyAnswered || hasTappedThisRound) return

    setHasTappedThisRound(true)
    setSelectedColor(color)
    const accepted = await onSubmitAnswer(color)
    if (!accepted) {
      setSelectedColor(null)
    }
  }

  if (currentRoom.gameState.phase === 'pre_game_countdown') {
    return (
      <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100svh-80px)]">
        <Card className="w-full max-w-xl p-8 text-center space-y-3">
          <h1 className="text-3xl font-bold">{t('game.starting')}</h1>
          <p className="text-muted-foreground">{t('game.matchBeginsIn')}</p>
          <p className="text-6xl font-extrabold">{secondsLeft}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100svh-80px)]">
      <Card className="w-full max-w-3xl p-6">
        <div className="mb-6 text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            {t('game.roundLabel', { current: currentRoom.gameState.currentRound, total: currentRoom.gameConfig.totalRounds })}
          </p>
          <h2 className="text-2xl font-bold">
            {t('game.targetColor')}: <span className="uppercase">{currentRoom.gameState.targetColor ?? '-'}</span>
          </h2>
          <p className="text-muted-foreground">
            {currentRoom.gameState.phase === 'answering'
              ? currentRoom.gameConfig.mode === 'match_target'
                ? t('game.chooseNowMatch')
                : t('game.chooseNowAvoid')
              : t('game.scoringNow')}
          </p>
          <p className="text-4xl font-bold">{secondsLeft}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {currentRoom.gameState.cards.map((color, index) => {
            const isClickable = currentRoom.gameState.phase === 'answering' && !alreadyAnswered && !hasTappedThisRound
            const isSelected = selectedColor === color
            return (
              <button
                key={`${color}-${index}`}
                type="button"
                className={`h-24 rounded-md border-2 ${colorClassMap[color] ?? 'bg-gray-400'} ${
                  isSelected ? 'border-black' : 'border-white/60'
                } ${isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
                onClick={() => handleSelectColor(color)}
                disabled={!isClickable}
                aria-label={color}
              />
            )
          })}
        </div>

        <div className="flex justify-center">
          <Button variant="outline" disabled>
            {alreadyAnswered ? t('game.answerSent') : t('game.waitingAnswer')}
          </Button>
        </div>
      </Card>
    </div>
  )
}
