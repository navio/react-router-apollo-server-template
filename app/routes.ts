import type { RouteConfig } from "@react-router/dev/routes";
import { index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("characters", "routes/characters.tsx"),
  route("characters/:id", "routes/character-detail.tsx"),
  route("internal", "routes/internal.tsx"),
] satisfies RouteConfig;