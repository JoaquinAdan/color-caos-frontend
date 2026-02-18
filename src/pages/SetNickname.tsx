import React, { useState, useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Button } from '../components/ui/button'
import { Card } from '../components/ui/card'
import { getSocket } from '@/lib/socket'
import type { Player } from '@/types/socket.types'

const SetNickname = () => {
  const [nickname, setNickname] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { t } = useTranslation()

  useEffect(() => {
    // Conectar al socket cuando el componente se monte
    const socket = getSocket()

    // Escuchar el evento player:created del servidor
    const onPlayerCreated = (data: { player: Player }) => {
      console.log('Jugador creado exitosamente:', data.player)
      setIsCreating(false)

      const existingPlayerId = localStorage.getItem('playerId')
      if (!existingPlayerId) {
        localStorage.setItem('playerId', data.player.id)
      }
    }

    // Escuchar errores del servidor
    const onError = (data: { message: string; code: string }) => {
      if (data.code === 'CREATE_PLAYER_ERROR') {
        console.error('Error del servidor:', data)
        setError(data.message)
        setIsCreating(false)
      }
    }

    socket.on('player:created', onPlayerCreated)
    socket.on('error', onError)

    // Cleanup: remover listeners cuando el componente se desmonte
    return () => {
      socket.off('player:created', onPlayerCreated)
      socket.off('error', onError)
    }
  }, [navigate])

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
          setIsCreating(false)
          navigate({ to: '/' })
          return
        }

        console.error('Error en callback:', response.error)
        setError(response.error || 'Error desconocido')
        setIsCreating(false)
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-80px)]">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-center">{t('setNickname.title')}</h1>
        
        {error && (
          <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <p className="text-sm text-destructive text-center">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium mb-2">
              {t('setNickname.label')}
            </label>
            <input
              id="nickname"
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
      </Card>
    </div>
  )
}

export default SetNickname
