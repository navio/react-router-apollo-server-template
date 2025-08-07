import type { MetaFunction } from "react-router";
import { Link } from "react-router";

export const meta: MetaFunction = () => {
  return [
    { title: "React Router + Apollo SSR" },
    { name: "description", content: "Welcome to React Router with Apollo GraphQL SSR!" },
  ];
};

export default function Home() {
  return (
    <div style={{ fontFamily: "system-ui, sans-serif", lineHeight: "1.8", padding: "2rem" }}>
      <h1>Welcome to React Router + Apollo SSR</h1>
      <p>
        This is a demo application showcasing server-side rendering with React Router 7 and Apollo Client.
      </p>
      <nav>
        <ul style={{ listStyle: "none", padding: 0 }}>
          <li style={{ marginBottom: "1rem" }}>
            <Link
              to="/characters"
              style={{
                color: "#3b82f6",
                textDecoration: "none",
                fontSize: "1.1rem",
                padding: "0.5rem 1rem",
                border: "1px solid #3b82f6",
                borderRadius: "0.25rem",
                display: "inline-block",
                transition: "all 0.2s",
                marginRight: "1rem"
              }}
            >
              View Rick and Morty Characters
            </Link>
            <Link
              to="/internal"
              style={{
                color: "#10b981",
                textDecoration: "none",
                fontSize: "1.1rem",
                padding: "0.5rem 1rem",
                border: "1px solid #10b981",
                borderRadius: "0.25rem",
                display: "inline-block",
                transition: "all 0.2s",
              }}
            >
              Internal GraphQL API
            </Link>
          </li>
        </ul>
      </nav>
      <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#f8fafc", borderRadius: "0.5rem" }}>
        <h2>Features:</h2>
        <ul>
          <li>✅ Server-Side Rendering (SSR)</li>
          <li>✅ Apollo Client with GraphQL</li>
          <li>✅ React Router 7</li>
          <li>✅ Vite bundler</li>
          <li>✅ TypeScript support</li>
          <li>✅ Jest testing setup</li>
          <li>✅ Zustand global state management</li>
          <li>✅ Feature-based architecture</li>
        </ul>
      </div>
    </div>
  );
}