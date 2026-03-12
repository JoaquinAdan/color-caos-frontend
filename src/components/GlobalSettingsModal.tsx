import React, { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { Globe, UserRound } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import LanguageSelector from './LanguageSelector'
import { getSocket } from '@/lib/socket'
import { toast } from 'sonner'

interface GlobalSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const GlobalSettingsModal = ({ open, onOpenChange }: GlobalSettingsModalProps) => {
  const [nickname, setNickname] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation()
  const prefersReducedMotion = useReducedMotion()

  useEffect(() => {
    if (!open) {
      return
    }

    setNickname(localStorage.getItem('nickname') ?? '')
    setError(null)
  }, [open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (nickname.trim()) {
      const trimmedNickname = nickname.trim()
      const storedNickname = localStorage.getItem('nickname')
      const storedPlayerId = localStorage.getItem('playerId')

      if (storedNickname === trimmedNickname && storedPlayerId) {
        onOpenChange(false)
        return
      }

      // Guardar en localStorage
      localStorage.setItem('nickname', trimmedNickname)

      // Crear jugador en el backend
      setIsCreating(true)
      setError(null)

      const socket = getSocket()
      socket.emit('player:create', { name: trimmedNickname }, (response) => {
        if (response.success && response.player) {
          console.log('Respuesta del callback:', response.player)
          localStorage.setItem('playerId', response.player.id)
          window.dispatchEvent(
            new CustomEvent('player:local-updated', {
              detail: { player: response.player },
            })
          )
          setIsCreating(false)
          setNickname('')
          toast.success(t('settings.profileSaved'))
          // Cerrar el modal
          onOpenChange(false)
          return
        }

        console.error('Error en callback:', response.error)
        setError(response.error || 'Error desconocido')
        setIsCreating(false)
      })
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setNickname('')
      setError(null)
    }
    onOpenChange(newOpen)
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        forceMount
        className="max-w-md overflow-hidden rounded-[28px] border-white/70 bg-white/95 p-0 shadow-[0_30px_90px_-40px_rgba(15,23,42,0.55)] backdrop-blur-xl"
      >
        <motion.div
          {...panelMotion}
          className="relative [transform-style:preserve-3d]"
        >
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
              {t('settings.title')}
            </DialogTitle>
              </motion.div>
            <DialogDescription className="max-w-sm text-sm leading-6 text-slate-600">
              {t('settings.description')}
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
                <Globe className="h-4 w-4" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em]">
                  {t('settings.languageTitle')}
                </h3>
              </div>

              <LanguageSelector />
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

            <motion.section
              {...sectionMotion}
              transition={prefersReducedMotion ? undefined : { duration: 0.34, delay: 0.16, ease: 'easeOut' }}
              className="space-y-3 rounded-[24px] border border-slate-200/80 bg-slate-50/85 p-4"
            >
              <div className="flex items-center gap-2 text-slate-900">
                <UserRound className="h-4 w-4" />
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em]">
                  {t('settings.profileTitle')}
                </h3>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 10 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={prefersReducedMotion ? undefined : { delay: 0.22, duration: 0.28, ease: 'easeOut' }}
                >
                  <label htmlFor="nickname-modal" className="mb-2 block text-sm font-medium text-slate-700">
                    {t('setNickname.label')}
                  </label>
                  <Input
                    id="nickname-modal"
                    type="text"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    placeholder={t('setNickname.placeholder')}
                    className="h-12 rounded-2xl border-white bg-white"
                    required
                    disabled={isCreating}
                  />
                </motion.div>

                <motion.div
                  initial={prefersReducedMotion ? undefined : { opacity: 0, y: 12 }}
                  animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
                  transition={prefersReducedMotion ? undefined : { delay: 0.28, duration: 0.28, ease: 'easeOut' }}
                >
                  <Button type="submit" className="h-12 w-full rounded-2xl" disabled={isCreating}>
                    {isCreating ? t('setNickname.creating') : t('settings.saveProfile')}
                  </Button>
                </motion.div>
              </form>
            </motion.section>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}

export default GlobalSettingsModal
