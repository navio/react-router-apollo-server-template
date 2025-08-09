/**
 * @jest-environment jsdom
 */
import { baseRoutes, getNavigationRoutes, getRouteMetadata, RouteBuilder } from '../app/router/routes';

describe('Router Configuration', () => {
  it('provides base routes configuration', () => {
    expect(baseRoutes).toBeDefined();
    expect(baseRoutes.length).toBeGreaterThan(0);
  });

  it('provides route metadata', () => {
    const homeMetadata = getRouteMetadata('/');
    expect(homeMetadata).toBeDefined();
    expect(homeMetadata?.title).toBe('Home');
    expect(homeMetadata?.icon).toBe('🏠');
  });

  it('provides navigation routes excluding hidden ones', () => {
    const navRoutes = getNavigationRoutes();
    expect(navRoutes.length).toBeGreaterThan(0);
    
    // Check that hidden routes (like character detail) are excluded
    const hiddenRoute = navRoutes.find(route => route.path === '/characters/:id');
    expect(hiddenRoute).toBeUndefined();
    
    // Check that visible routes are included
    const homeRoute = navRoutes.find(route => route.path === '/');
    expect(homeRoute).toBeDefined();
  });

  it('route builder creates routes programmatically', () => {
    const builder = new RouteBuilder();
    const routes = builder
      .addIndex('test-home.tsx')
      .addRoute('test', 'test-component.tsx')
      .build();
    
    expect(routes.length).toBe(2);
  });

  it('configuration-based routing is working', () => {
    // This test verifies our configuration-based routing system is functional
    // by checking that our route metadata and configuration work correctly
    expect(baseRoutes.length).toBeGreaterThan(0);
    expect(getNavigationRoutes().length).toBeGreaterThan(0);
    
    // Verify specific routes exist
    const charactersMetadata = getRouteMetadata('/characters');
    expect(charactersMetadata).toBeDefined();
    expect(charactersMetadata?.title).toBe('Characters');
  });
});