import { Suspense } from "react";
import { useLoaderData, Link } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { GET_CHARACTER } from "~/lib/queries";
import { createApolloClient } from "~/lib/apollo";

interface Episode {
  id: string;
  name: string;
  air_date: string;
  episode: string;
}

interface Character {
  id: string;
  name: string;
  status: string;
  species: string;
  type: string;
  gender: string;
  image: string;
  origin: {
    name: string;
    dimension: string;
  };
  location: {
    name: string;
    dimension: string;
  };
  episode: Episode[];
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data?.character) {
    return [
      { title: "Character Not Found" },
    ];
  }
  
  return [
    { title: `${data.character.name} - React Router + Apollo SSR` },
    { name: "description", content: `Learn about ${data.character.name} from Rick and Morty` },
  ];
};

export async function loader({ params }: LoaderFunctionArgs) {
  const client = createApolloClient();
  const characterId = params.id;

  if (!characterId) {
    throw new Response("Character ID is required", { status: 400 });
  }

  try {
    const { data } = await client.query({
      query: GET_CHARACTER,
      variables: { id: characterId },
    });

    return {
      character: data.character as Character,
      apolloState: client.cache.extract(),
    };
  } catch (error) {
    throw new Response("Character not found", { status: 404 });
  }
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    Alive: "#10b981",
    Dead: "#ef4444",
    unknown: "#6b7280"
  };

  return (
    <span style={{
      backgroundColor: colors[status as keyof typeof colors] || colors.unknown,
      color: "white",
      padding: "0.25rem 0.5rem",
      borderRadius: "0.25rem",
      fontSize: "0.75rem",
      fontWeight: "500"
    }}>
      {status}
    </span>
  );
}

export default function CharacterDetail() {
  const { character } = useLoaderData<typeof loader>();

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link
          to="/characters"
          style={{
            color: "#3b82f6",
            textDecoration: "none",
            fontSize: "0.875rem"
          }}
        >
          ← Back to Characters
        </Link>
      </div>

      <Suspense fallback={
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Loading character details...</p>
        </div>
      }>
        <div style={{
          display: "grid",
          gridTemplateColumns: "300px 1fr",
          gap: "2rem",
          alignItems: "start"
        }}>
          <div>
            <img
              src={character.image}
              alt={character.name}
              style={{
                width: "100%",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}
            />
          </div>

          <div>
            <h1 style={{ fontSize: "2.25rem", fontWeight: "700", marginBottom: "1rem" }}>
              {character.name}
            </h1>

            <div style={{ marginBottom: "2rem" }}>
              <StatusBadge status={character.status} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
              <div>
                <h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>Species</h3>
                <p style={{ color: "#6b7280" }}>{character.species}</p>
              </div>
              <div>
                <h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>Gender</h3>
                <p style={{ color: "#6b7280" }}>{character.gender}</p>
              </div>
              {character.type && (
                <div>
                  <h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>Type</h3>
                  <p style={{ color: "#6b7280" }}>{character.type}</p>
                </div>
              )}
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>Origin</h3>
              <p style={{ color: "#6b7280" }}>{character.origin.name}</p>
              {character.origin.dimension && (
                <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                  Dimension: {character.origin.dimension}
                </p>
              )}
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>Current Location</h3>
              <p style={{ color: "#6b7280" }}>{character.location.name}</p>
              {character.location.dimension && (
                <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                  Dimension: {character.location.dimension}
                </p>
              )}
            </div>

            <div>
              <h3 style={{ fontWeight: "600", marginBottom: "1rem" }}>
                Episodes ({character.episode.length})
              </h3>
              <div style={{ 
                maxHeight: "300px", 
                overflowY: "auto",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
                padding: "1rem"
              }}>
                {character.episode.map((episode) => (
                  <div
                    key={episode.id}
                    style={{
                      padding: "0.75rem",
                      borderBottom: "1px solid #f1f5f9",
                      marginBottom: "0.5rem"
                    }}
                  >
                    <div style={{ fontWeight: "500", marginBottom: "0.25rem" }}>
                      {episode.episode}: {episode.name}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                      {episode.air_date}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Suspense>
    </div>
  );
}