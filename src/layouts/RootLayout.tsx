import { Outlet } from '@tanstack/react-router'
import { Toaster } from 'sonner'

const RootLayout = () => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-100 via-amber-50 to-sky-100 text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.9),_transparent_38%),radial-gradient(circle_at_85%_15%,_rgba(14,165,233,0.15),_transparent_25%),radial-gradient(circle_at_20%_80%,_rgba(244,63,94,0.14),_transparent_30%),radial-gradient(circle_at_80%_85%,_rgba(245,158,11,0.18),_transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,0.45)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.45)_1px,transparent_1px)] [background-size:72px_72px]" />

      <main className="relative z-10">
        <Outlet />
      </main>

      <Toaster richColors />
    </div>
  )
}

export default RootLayout
