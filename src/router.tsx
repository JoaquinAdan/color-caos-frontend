import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import Home from './pages/Home'
import RootLayout from './layouts/RootLayout'

const rootRoute = createRootRoute({
  component: RootLayout,
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
