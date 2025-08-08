/**
 * @jest-environment node
 */

describe('Apollo Server Integration', () => {
  it('should have correct server configuration', () => {
    // Test server files exist
    const fs = require('fs');
    const path = require('path');
    
    const serverJsPath = path.join(__dirname, '..', 'server.js');
    const schemaPath = path.join(__dirname, '..', 'server', 'schema', 'typeDefs.ts');
    const resolversPath = path.join(__dirname, '..', 'server', 'resolvers', 'index.ts');
    
    expect(fs.existsSync(serverJsPath)).toBe(true);
    expect(fs.existsSync(schemaPath)).toBe(true);
    expect(fs.existsSync(resolversPath)).toBe(true);
  });

  it('should have proper package.json scripts', () => {
    const packageJson = require('../package.json');
    
    expect(packageJson.scripts['dev']).toContain('npm run build:server && node server.js');
    expect(packageJson.scripts['build:server']).toContain('tsc --project server/tsconfig.json');
  });

  it('should have Apollo Server dependencies', () => {
    const packageJson = require('../package.json');
    
    expect(packageJson.dependencies['@apollo/server']).toBeDefined();
    expect(packageJson.dependencies['express']).toBeDefined();
    expect(packageJson.dependencies['cors']).toBeDefined();
    expect(packageJson.devDependencies['@types/express']).toBeDefined();
    expect(packageJson.devDependencies['@types/cors']).toBeDefined();
    expect(packageJson.devDependencies['concurrently']).toBeDefined();
  });
});