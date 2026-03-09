import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { getSocket } from '@/lib/socket'

interface SetNicknameModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const SetNicknameModal = ({ open, onOpenChange }: SetNicknameModalProps) => {
  const [nickname, setNickname] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { t } = useTranslation()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (nickname.trim()) {
      const trimmedNickname = nickname.trim()

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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('setNickname.title')}</DialogTitle>
        </DialogHeader>

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive text-center">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nickname-modal" className="block text-sm font-medium mb-2">
              {t('setNickname.label')}
            </label>
            <input
              id="nickname-modal"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t('setNickname.placeholder')}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
              required
              autoFocus
              disabled={isCreating}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isCreating}>
            {isCreating ? t('setNickname.creating') : t('setNickname.save')}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default SetNicknameModal
