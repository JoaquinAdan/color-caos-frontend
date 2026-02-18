import { createRootRoute, createRoute, createRouter, Link, Outlet, useNavigate } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import RedisExample from './pages/RedisExample'
import About from './pages/About'
import Home from './pages/Home'
import SetNickname from './pages/SetNickname'
import LanguageSelector from './components/LanguageSelector'
import { Button } from './components/ui/button'

// Root route with layout
const RootComponent = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex gap-6">
            <Link to="/" className="text-sm font-medium transition-colors hover:text-primary" activeProps={{ className: 'text-primary' }}>
              {t('nav.home')}
            </Link>
            <Link
              to="/redis-example"
              className="text-sm font-medium transition-colors hover:text-primary"
              activeProps={{ className: 'text-primary' }}
            >
              {t('nav.redisExample')}
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium transition-colors hover:text-primary"
              activeProps={{ className: 'text-primary' }}
            >
              {t('nav.about')}
            </Link>
          </div>
          <div className="flex gap-4 items-center">
            <Button
              onClick={() => navigate({ to: '/set-nickname' })}
              variant="outline"
              size="sm"
            >
              {t('home.changeNickname')}
            </Button>
            <LanguageSelector />
          </div>
        </div>
      </nav>
      <Outlet />
    </div>
  )
}

const rootRoute = createRootRoute({
  component: RootComponent,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

// Set Nickname route
const setNicknameRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/set-nickname',
  component: SetNickname,
})

// Redis Example route
const redisExampleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/redis-example',
  component: RedisExample,
})

// About route
const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: About,
})

// Create the route tree
const routeTree = rootRoute.addChildren([indexRoute, setNicknameRoute, redisExampleRoute, aboutRoute])

// Create and export the router
export const router = createRouter({ routeTree })

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
