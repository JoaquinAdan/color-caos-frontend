import { createRootRoute, createRoute, createRouter, Link, Outlet } from '@tanstack/react-router'
import Home from './pages/Home'
import About from './pages/About'

// Root route with layout
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex gap-6">
          <Link 
            to="/" 
            className="text-sm font-medium transition-colors hover:text-primary"
            activeProps={{ className: 'text-primary' }}
          >
            Home
          </Link>
          <Link 
            to="/about"
            className="text-sm font-medium transition-colors hover:text-primary"
            activeProps={{ className: 'text-primary' }}
          >
            About
          </Link>
        </div>
      </nav>
      <Outlet />
    </div>
  ),
})

// Home route
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Home,
})

// About route
const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: About,
})

// Create the route tree
const routeTree = rootRoute.addChildren([indexRoute, aboutRoute])

// Create and export the router
export const router = createRouter({ routeTree })

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
