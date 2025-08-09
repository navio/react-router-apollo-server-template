import type { RouteConfig, RouteConfigEntry } from "@react-router/dev/routes";
import { index, route, layout, prefix } from "@react-router/dev/routes";

/**
 * Programmatic Router Configuration for React Router v7
 * 
 * This approach provides:
 * - Centralized route configuration in code rather than file-system based
 * - Full TypeScript support for route definitions
 * - Programmatic route generation and manipulation
 * - Dynamic route registration capabilities
 * - Better IDE intellisense for route structure
 * - Route metadata and navigation utilities
 * 
 * Architecture Decision: Configuration over Convention
 * - Explicit route definitions instead of file-system based routing
 * - Better control over route hierarchy and nested layouts
 * - Easier to implement dynamic routing and route guards
 * - More familiar pattern for developers from other React Router projects
 */

/**
 * Base route configuration
 * Maps URL paths to component file locations
 */
export const baseRoutes: RouteConfigEntry[] = [
  index("features/home/pages/home.tsx"),
  route("characters", "features/rick-and-morty/pages/characters.tsx"),
  route("characters/:id", "features/rick-and-morty/pages/character-detail.tsx"),
  route("internal", "features/health/pages/internal.tsx"),
  route("campaign-builder", "features/campaign-builder/pages/campaign-builder.tsx"),
];

/**
 * Route Registry for Dynamic Route Management
 * 
 * Utility class for managing routes programmatically.
 * Useful for adding routes dynamically based on user permissions,
 * feature flags, or other runtime conditions.
 */
export class RouteRegistry {
  private static routes: RouteConfigEntry[] = [...baseRoutes];

  /**
   * Get all registered routes
   */
  static getRoutes(): RouteConfigEntry[] {
    return [...this.routes];
  }

  /**
   * Add a new route dynamically
   */
  static addRoute(newRoute: RouteConfigEntry): void {
    this.routes.push(newRoute);
  }

  /**
   * Remove a route by checking its pattern/path
   */
  static removeRoute(pathOrId: string): void {
    this.routes = this.routes.filter(routeItem => {
      // Handle different route types - this is complex due to React Router's type system
      // In practice, you'd implement proper route matching here
      return true; // Simplified for demo
    });
  }

  /**
   * Reset routes to default configuration
   */
  static reset(): void {
    this.routes = [...baseRoutes];
  }

  /**
   * Get routes as array for use in other configurations
   */
  static toArray(): RouteConfigEntry[] {
    return this.getRoutes();
  }
}

/**
 * Route definitions with metadata for enhanced functionality
 * Useful for navigation menus, breadcrumbs, and route guards
 */
export interface RouteMetadata {
  title: string;
  description?: string;
  requiresAuth?: boolean;
  roles?: string[];
  icon?: string;
  hidden?: boolean;
  component?: string; // File path to component
}

export const routeMetadata: Record<string, RouteMetadata> = {
  '/': {
    title: 'Home',
    description: 'Apollo GraphQL with React Router SSR Demo',
    icon: '🏠',
    component: 'features/home/pages/home.tsx',
  },
  '/characters': {
    title: 'Characters',
    description: 'Browse Rick and Morty characters',
    icon: '👥',
    component: 'features/rick-and-morty/pages/characters.tsx',
  },
  '/characters/:id': {
    title: 'Character Details',
    description: 'View character information',
    hidden: true, // Don't show in navigation
    component: 'features/rick-and-morty/pages/character-detail.tsx',
  },
  '/internal': {
    title: 'Internal Health',
    description: 'Server health and internal data',
    icon: '⚕️',
    component: 'features/health/pages/internal.tsx',
  },
  '/campaign-builder': {
    title: 'Campaign Builder',
    description: 'Create and manage marketing campaigns',
    icon: '📊',
    component: 'features/campaign-builder/pages/campaign-builder.tsx',
  },
};

/**
 * Get route metadata by path
 */
export function getRouteMetadata(path: string): RouteMetadata | undefined {
  return routeMetadata[path];
}

/**
 * Get all routes with their metadata for navigation purposes
 */
export function getNavigationRoutes(): Array<{ path: string; metadata: RouteMetadata }> {
  return Object.entries(routeMetadata)
    .filter(([, metadata]) => !metadata.hidden)
    .map(([path, metadata]) => ({
      path,
      metadata,
    }));
}

/**
 * Route builder utility for creating dynamic routes
 */
export class RouteBuilder {
  private routes: RouteConfigEntry[] = [];

  /**
   * Add an index route
   */
  addIndex(file: string): RouteBuilder {
    this.routes.push(index(file));
    return this;
  }

  /**
   * Add a regular route
   */
  addRoute(path: string, file: string): RouteBuilder {
    this.routes.push(route(path, file));
    return this;
  }

  /**
   * Add a layout route
   */
  addLayout(file: string, children: RouteConfigEntry[]): RouteBuilder {
    this.routes.push(layout(file, children));
    return this;
  }

  /**
   * Add routes with a common prefix (simplified - adds individual routes with prefix)
   */
  addPrefix(pathPrefix: string, children: RouteConfigEntry[]): RouteBuilder {
    // For simplicity, we'll add each child route with the prefix
    children.forEach(child => {
      // This is a simplified approach - in a real implementation you'd handle this more robustly
      this.routes.push(child);
    });
    return this;
  }

  /**
   * Build the final route configuration
   */
  build(): RouteConfigEntry[] {
    return this.routes;
  }

  /**
   * Reset the builder
   */
  reset(): RouteBuilder {
    this.routes = [];
    return this;
  }
}

/**
 * Feature-based route builder
 * Organizes routes by application features
 */
export function buildFeatureRoutes(): RouteConfigEntry[] {
  const builder = new RouteBuilder();

  // Home feature
  builder.addIndex("features/home/pages/home.tsx");

  // Rick and Morty feature
  builder
    .addRoute("characters", "features/rick-and-morty/pages/characters.tsx")
    .addRoute("characters/:id", "features/rick-and-morty/pages/character-detail.tsx");

  // Health monitoring feature
  builder.addRoute("internal", "features/health/pages/internal.tsx");

  // Campaign builder feature
  builder.addRoute("campaign-builder", "features/campaign-builder/pages/campaign-builder.tsx");

  return builder.build();
}

/**
 * Advanced route configuration with nested layouts and groups
 */
export function buildAdvancedRoutes(): RouteConfigEntry[] {
  return [
    // Home page
    index("features/home/pages/home.tsx"),
    
    // Character routes
    route("characters", "features/rick-and-morty/pages/characters.tsx"),
    route("characters/:id", "features/rick-and-morty/pages/character-detail.tsx"),
    
    // Admin routes 
    route("admin/internal", "features/health/pages/internal.tsx"),
    
    // Tools routes
    route("tools/campaign-builder", "features/campaign-builder/pages/campaign-builder.tsx"),
  ];
}

// Export the default route configuration
// This will be used in app/routes.ts
export default baseRoutes;