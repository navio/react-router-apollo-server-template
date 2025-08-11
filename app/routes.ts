import type { RouteConfig } from '@react-router/dev/routes'
import { baseRoutes } from './router/routes'

/**
 * Main Route Configuration
 *
 * This file exports the route configuration for the application.
 * Routes are now defined programmatically in ./router/routes.tsx
 * providing better developer experience and maintainability.
 *
 * Available configuration options:
 * 1. baseRoutes - Simple flat route structure
 * 2. buildFeatureRoutes() - Feature-organized routes using builder pattern
 * 3. buildAdvancedRoutes() - Grouped routes with prefixes
 * 4. RouteRegistry.getRoutes() - Dynamic route management
 *
 * Current configuration: Using base routes for simplicity
 * Change this to experiment with different route organizations
 */

// Option 1: Use base routes (current)
export default baseRoutes satisfies RouteConfig

// Option 2: Use feature-based builder pattern
// export default buildFeatureRoutes() satisfies RouteConfig;

// Option 3: Use advanced grouping with prefixes
// export default buildAdvancedRoutes() satisfies RouteConfig;

// Option 4: Use dynamic route registry
// export default RouteRegistry.getRoutes() satisfies RouteConfig;
