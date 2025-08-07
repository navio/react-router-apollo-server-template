import type { RouteConfig } from "@react-router/dev/routes";
import { index, route } from "@react-router/dev/routes";

export default [
  index("features/home/routes/home.tsx"),
  route("characters", "features/rick-and-morty/routes/characters.tsx"),
  route("characters/:id", "features/rick-and-morty/routes/character-detail.tsx"),
  route("internal", "features/internal-api/routes/internal.tsx"),
] satisfies RouteConfig;