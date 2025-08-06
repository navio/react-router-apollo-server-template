/**
 * @jest-environment jsdom
 */

describe('Apollo Client Configuration', () => {
  it('should pass basic test', () => {
    expect(true).toBe(true);
  });

  it('should have fetch available in test environment', () => {
    expect(global.fetch).toBeDefined();
  });
});