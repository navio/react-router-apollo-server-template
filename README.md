# React Router 7 + Apollo Client SSR

A modern React application demonstrating Server-Side Rendering (SSR) with React Router 7 and Apollo Client for GraphQL data fetching.

## Features

- ✅ **Server-Side Rendering (SSR)** with React Router 7
- ✅ **Apollo Client** for GraphQL data fetching
- ✅ **Vite** for fast development and building
- ✅ **TypeScript** for type safety
- ✅ **Jest** for testing
- ✅ **Rick and Morty API** for demo data

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server with HMR
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run lint` - Lint code
- `npm run typecheck` - Type check

## Project Structure

```
├── app/
│   ├── routes/           # Route components
│   │   ├── home.tsx     # Home page
│   │   ├── characters.tsx # Characters list with SSR
│   │   └── character-detail.tsx # Character detail with SSR
│   ├── lib/             # Utilities and configurations
│   │   ├── apollo.ts    # Apollo Client setup
│   │   ├── apollo-provider.tsx # Apollo Provider wrapper
│   │   └── queries.ts   # GraphQL queries
│   ├── components/      # Reusable components
│   ├── entry.client.tsx # Client-side entry point
│   ├── entry.server.tsx # Server-side entry point
│   ├── load-context.server.ts # Server load context
│   ├── root.tsx         # Root layout component
│   └── routes.ts        # Route configuration
├── tests/               # Test files
├── jest.config.js       # Jest configuration
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
└── package.json         # Dependencies and scripts
```

## SSR Implementation

This app demonstrates proper SSR implementation with:

1. **Data Loading**: GraphQL queries are executed server-side during route loading
2. **State Hydration**: Apollo Client cache is serialized on the server and hydrated on the client
3. **Streaming**: Server streams HTML as components render
4. **SEO Optimization**: Meta tags are generated server-side for each route

## GraphQL Integration

The app uses the [Rick and Morty GraphQL API](https://rickandmortyapi.com/graphql) to demonstrate:

- Server-side data fetching in route loaders
- Client-side cache hydration
- Suspense-ready components
- Pagination with SSR

## Testing

The project includes:

- Unit tests for Apollo Client configuration
- Component tests with React Testing Library
- Mocked GraphQL providers for testing

Run tests with:
```bash
npm test
```

## Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

The built application will be available in the `build/` directory.

## Learn More

- [React Router 7 Documentation](https://reactrouter.com/)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [Vite Documentation](https://vitejs.dev/)
- [Rick and Morty API](https://rickandmortyapi.com/)