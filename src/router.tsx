import { createRootRoute, createRoute, createRouter, Outlet } from '@tanstack/react-router'
import Home from './pages/Home'

// Root route with layout
const RootComponent = () => {
  return (
    <div className="min-h-screen bg-background">
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

// Create the route tree
const routeTree = rootRoute.addChildren([indexRoute])

// Create and export the router
export const router = createRouter({ routeTree })

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
