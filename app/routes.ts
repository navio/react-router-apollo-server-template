import type { RouteConfig } from "@react-router/dev/routes";
import { index, route } from "@react-router/dev/routes";

export default [
  index("features/home/pages/home.tsx"),
  route("characters", "features/rick-and-morty/pages/characters.tsx"),
  route("characters/:id", "features/rick-and-morty/pages/character-detail.tsx"),
  route("internal", "features/health/pages/internal.tsx"),
] satisfies RouteConfig;