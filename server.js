import { createRequestHandler } from '@react-router/express'
import { ApolloServer } from '@apollo/server'
import { expressMiddleware } from '@as-integrations/express4'
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer'
import { makeExecutableSchema } from '@graphql-tools/schema'
import compression from 'compression'
import express from 'express'
import http from 'http'
import cors from 'cors'
import morgan from 'morgan'

// Import GraphQL schema and resolvers from built server files
const { typeDefs } = await import('./build/server/server/schema/typeDefs.js')
const { resolvers } = await import('./build/server/server/resolvers/index.js')

const viteDevServer =
  process.env.NODE_ENV === 'production'
    ? undefined
    : await import('vite').then((vite) =>
        vite.createServer({
          server: { middlewareMode: true },
        })
      )

const reactRouterHandler = createRequestHandler({
  build: viteDevServer
    ? () => viteDevServer.ssrLoadModule('virtual:react-router/server-build')
    : await import('./build/client/index.js'),
})

const app = express()
const httpServer = http.createServer(app)

// Create GraphQL schema
const schema = makeExecutableSchema({ typeDefs, resolvers })

// Create Apollo Server
const server = new ApolloServer({
  schema,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  introspection: true,
  csrfPrevention: true,
})

await server.start()

app.use(compression())
app.disable('x-powered-by')

// Handle asset requests
if (viteDevServer) {
  app.use(viteDevServer.middlewares)
} else {
  // Vite fingerprints its assets so we can cache forever
  app.use('/assets', express.static('build/client/assets', { immutable: true, maxAge: '1y' }))
}

// Everything else (like favicon.ico) is cached for an hour
app.use(express.static('build/client', { maxAge: '1h' }))

app.use(morgan('tiny'))

// GraphQL endpoint with CORS
app.use(
  '/graphql',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:4000'],
    credentials: true,
  }),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
  })
)

// Legacy API endpoint for backward compatibility
app.use(
  '/api/graphql',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:4000'],
    credentials: true,
  }),
  express.json(),
  expressMiddleware(server, {
    context: async ({ req }) => ({ token: req.headers.token }),
  })
)

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Unified Apollo + React Router Server is running!',
    timestamp: new Date().toISOString(),
  })
})

// Handle all other routes with React Router SSR
app.all('*', reactRouterHandler)

const port = process.env.PORT || 3000

await new Promise((resolve) => httpServer.listen({ port }, resolve))
console.log(`🚀 Unified server started at http://localhost:${port}`)
console.log(`🚀 GraphQL endpoint: http://localhost:${port}/graphql`)
console.log(`💚 Health check: http://localhost:${port}/health`)

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  process.exit(0)
})
