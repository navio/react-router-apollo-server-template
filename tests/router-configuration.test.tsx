import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { route } from '@react-router/dev/routes'
import {
  baseRoutes,
  buildFeatureRoutes,
  buildAdvancedRoutes,
  RouteRegistry,
  RouteBuilder,
  getRouteMetadata,
  getNavigationRoutes,
  routeMetadata,
} from '../app/router/routes'
import { Navigation } from '../app/components/navigation'

describe('Router Configuration', () => {
  beforeEach(() => {
    // Reset route registry before each test
    RouteRegistry.reset()
  })

  describe('Route Configuration', () => {
    it('provides base routes configuration', () => {
      expect(baseRoutes).toBeDefined()
      expect(Array.isArray(baseRoutes)).toBe(true)
      expect(baseRoutes.length).toBeGreaterThan(0)
    })

    it('builds feature-based routes', () => {
      const featureRoutes = buildFeatureRoutes()
      expect(featureRoutes).toBeDefined()
      expect(Array.isArray(featureRoutes)).toBe(true)
      expect(featureRoutes.length).toBeGreaterThan(0)
    })

    it('builds advanced routes with prefixes', () => {
      const advancedRoutes = buildAdvancedRoutes()
      expect(advancedRoutes).toBeDefined()
      expect(Array.isArray(advancedRoutes)).toBe(true)
      expect(advancedRoutes.length).toBeGreaterThan(0)
    })
  })

  describe('Route Registry', () => {
    it('provides access to routes', () => {
      const routes = RouteRegistry.getRoutes()
      expect(routes).toBeDefined()
      expect(Array.isArray(routes)).toBe(true)
    })

    it('allows adding routes dynamically', () => {
      const initialLength = RouteRegistry.getRoutes().length

      // Add a mock route using the route helper from React Router
      RouteRegistry.addRoute(route('test', 'test-component.tsx'))

      const newLength = RouteRegistry.getRoutes().length
      expect(newLength).toBe(initialLength + 1)
    })

    it('can be reset to default configuration', () => {
      RouteRegistry.addRoute(route('test', 'test-component.tsx'))

      const expandedLength = RouteRegistry.getRoutes().length
      RouteRegistry.reset()
      const resetLength = RouteRegistry.getRoutes().length

      expect(resetLength).toBeLessThan(expandedLength)
    })
  })

  describe('Route Builder', () => {
    it('builds routes using builder pattern', () => {
      const routes = new RouteBuilder().addIndex('home.tsx').addRoute('about', 'about.tsx').build()

      expect(routes).toBeDefined()
      expect(Array.isArray(routes)).toBe(true)
      expect(routes.length).toBe(2)
    })

    it('can be reset and reused', () => {
      const builder = new RouteBuilder().addIndex('home.tsx').addRoute('about', 'about.tsx')

      const firstBuild = builder.build()
      expect(firstBuild.length).toBe(2)

      const secondBuild = builder.reset().addIndex('different.tsx').build()
      expect(secondBuild.length).toBe(1)
    })
  })

  describe('Route Metadata', () => {
    it('provides metadata for all routes', () => {
      expect(routeMetadata).toBeDefined()
      expect(typeof routeMetadata).toBe('object')

      // Check that home route has metadata
      expect(routeMetadata['/']).toBeDefined()
      expect(routeMetadata['/'].title).toBeDefined()
    })

    it('gets route metadata by path', () => {
      const homeMetadata = getRouteMetadata('/')
      expect(homeMetadata).toBeDefined()
      expect(homeMetadata?.title).toBe('Home')
      expect(homeMetadata?.icon).toBe('🏠')
    })

    it('returns undefined for non-existent routes', () => {
      const nonExistentMetadata = getRouteMetadata('/non-existent')
      expect(nonExistentMetadata).toBeUndefined()
    })

    it('provides navigation routes (excludes hidden)', () => {
      const navRoutes = getNavigationRoutes()
      expect(navRoutes).toBeDefined()
      expect(Array.isArray(navRoutes)).toBe(true)

      // Should not include hidden routes
      const hiddenRoute = navRoutes.find((route) => route.metadata.hidden)
      expect(hiddenRoute).toBeUndefined()

      // Should include visible routes
      const homeRoute = navRoutes.find((route) => route.path === '/')
      expect(homeRoute).toBeDefined()
    })
  })

  describe('Navigation Component Integration', () => {
    it('renders navigation based on route metadata', () => {
      render(
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      )

      // Should render navigation items based on metadata
      expect(screen.getByText('Home')).toBeInTheDocument()
      expect(screen.getByText('Characters')).toBeInTheDocument()
      expect(screen.getByText('Campaign Builder')).toBeInTheDocument()
    })

    it('shows icons from route metadata', () => {
      render(
        <MemoryRouter>
          <Navigation />
        </MemoryRouter>
      )

      // Check for emoji icons (they should be present in the navigation)
      const navElement = screen.getByRole('navigation')
      expect(navElement.textContent).toContain('🏠') // Home icon
      expect(navElement.textContent).toContain('👥') // Characters icon
      expect(navElement.textContent).toContain('📊') // Campaign Builder icon
    })

    it('highlights active route', () => {
      render(
        <MemoryRouter initialEntries={['/characters']}>
          <Navigation />
        </MemoryRouter>
      )

      const charactersLink = screen.getByText('Characters').closest('a')
      expect(charactersLink).toHaveAttribute('aria-current', 'page')
    })
  })

  describe('Route Structure Validation', () => {
    it('has consistent route metadata for all base routes', () => {
      const expectedPaths = ['/', '/characters', '/internal', '/campaign-builder']

      expectedPaths.forEach((path) => {
        const metadata = getRouteMetadata(path)
        expect(metadata).toBeDefined()
        expect(metadata?.title).toBeDefined()
        expect(typeof metadata?.title).toBe('string')
        expect(metadata?.component).toBeDefined()
      })
    })

    it('route metadata matches expected structure', () => {
      Object.entries(routeMetadata).forEach(([path, metadata]) => {
        expect(typeof path).toBe('string')
        expect(typeof metadata.title).toBe('string')
        expect(typeof metadata.component).toBe('string')

        if (metadata.description) {
          expect(typeof metadata.description).toBe('string')
        }
        if (metadata.icon) {
          expect(typeof metadata.icon).toBe('string')
        }
        if (metadata.hidden !== undefined) {
          expect(typeof metadata.hidden).toBe('boolean')
        }
      })
    })
  })
})
