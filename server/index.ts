import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import { makeExecutableSchema } from '@graphql-tools/schema';

import { typeDefs } from './schema/typeDefs.js';
import { resolvers } from './resolvers/index.js';

interface MyContext {
  token?: string;
}

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);

  // Create GraphQL schema
  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // Create Apollo Server
  const server = new ApolloServer<MyContext>({
    schema,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    introspection: true,
    csrfPrevention: true,
  });

  await server.start();

  // Apply the Apollo GraphQL middleware and specify the path
  app.use(
    '/graphql',
    cors<cors.CorsRequest>({
      origin: ['http://localhost:3000', 'http://localhost:4000'],
      credentials: true,
    }),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ token: req.headers.token }),
    }),
  );

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({
      status: 'healthy',
      message: 'Apollo Server is running!',
      timestamp: new Date().toISOString(),
    });
  });

  // Basic info endpoint
  app.get('/', (req, res) => {
    res.json({
      message: 'Apollo Server for React Router Apollo SSR',
      graphql: '/graphql',
      health: '/health',
    });
  });

  const PORT = process.env.SERVER_PORT || 4000;
  
  await new Promise<void>((resolve) => 
    httpServer.listen({ port: PORT }, resolve)
  );

  console.log(`🚀 Apollo Server ready at http://localhost:${PORT}/graphql`);
  console.log(`🔍 GraphQL Playground available in development`);
  console.log(`💚 Health check at http://localhost:${PORT}/health`);
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});