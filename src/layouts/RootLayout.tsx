import { Outlet } from '@tanstack/react-router'
import { motion } from 'framer-motion'
import { Settings2 } from 'lucide-react'
import SetNicknameModal from '@/components/SetNicknameModal'
import { Button } from '@/components/ui/button'
import { useSetNicknameModal } from '@/contexts/SetNicknameContext'
import { useTranslation } from 'react-i18next'

const RootLayout = () => {
  const { isOpen, openSetNicknameModal, closeSetNicknameModal } = useSetNicknameModal()
  const { t } = useTranslation()

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-100 via-amber-50 to-sky-100 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.9),_transparent_38%),radial-gradient(circle_at_85%_15%,_rgba(14,165,233,0.15),_transparent_25%),radial-gradient(circle_at_20%_80%,_rgba(244,63,94,0.14),_transparent_30%),radial-gradient(circle_at_80%_85%,_rgba(245,158,11,0.18),_transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.45)_1px,transparent_1px)] [background-size:72px_72px]" />

      <motion.header
        initial={{ opacity: 0, y: -18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-20 px-4 pt-4 sm:px-6 sm:pt-6"
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
      </motion.header>

      <main className="relative z-10">
        <Outlet />
      </main>

      <SetNicknameModal
        open={isOpen}
        onOpenChange={(open) => {
          if (!open) {
            closeSetNicknameModal()
          }
        }}
      />
    </div>
  )
}

export default RootLayout
