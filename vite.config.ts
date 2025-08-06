import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    reactRouter(),
    tsconfigPaths(),
  ],
  server: {
    port: 3000,
    proxy: {
      '/api/graphql': {
        target: 'http://localhost:4000/graphql',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/graphql/, '/graphql'),
      },
    },
  },
  ssr: {
    noExternal: [
      '@apollo/client',
    ],
  },
});