import { Suspense, useEffect } from "react";
import { useLoaderData, Link, useParams } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { RickAndMortyAPI } from "../services/api";
import { 
  useRickAndMortyStore, 
  useCurrentCharacter, 
  useCharacterLoading, 
  useCharacterError 
} from "../store/characters-store";
import { StatusBadge } from "../components";
import type { Character } from "../types";

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
  const characterId = params.id;

  if (!characterId) {
    throw new Response("Character ID is required", { status: 400 });
  }

  try {
    const character = await RickAndMortyAPI.fetchCharacter(characterId);

    return {
      character,
      characterId,
      apolloState: {},
    };
  } catch (error) {
    throw new Response("Character not found", { status: 404 });
  }
}

export default function CharacterDetail() {
  const { character: ssrCharacter, characterId } = useLoaderData<typeof loader>();
  const params = useParams();
  
  // Get Zustand state
  const currentCharacter = useCurrentCharacter();
  const isLoading = useCharacterLoading();
  const error = useCharacterError();
  const { fetchCharacter, clearError } = useRickAndMortyStore();
  
  const id = params.id || characterId;
  
  // Initialize store with SSR data and handle client-side navigation
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    if (!currentCharacter || currentCharacter.id !== id) {
      if (ssrCharacter && ssrCharacter.id === id) {
        // Initialize store with SSR data
        useRickAndMortyStore.setState({
          currentCharacter: ssrCharacter,
        });
      } else if (id) {
        // Client-side navigation - fetch from store
        fetchCharacter(id);
      }
    }
  }, [id, ssrCharacter, currentCharacter, fetchCharacter]);

  // Error display
  if (error) {
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <Link to="/characters" style={{ color: "#3b82f6", textDecoration: "none", fontSize: "0.875rem" }}>
            ← Back to Characters
          </Link>
        </div>
        
        <div style={{ 
          backgroundColor: "#fef2f2", 
          border: "1px solid #fecaca", 
          borderRadius: "0.5rem", 
          padding: "1rem",
          color: "#b91c1c"
        }}>
          <h2 style={{ margin: "0 0 0.5rem 0" }}>Error Loading Character</h2>
          <p style={{ margin: "0 0 1rem 0" }}>{error}</p>
          <button
            onClick={clearError}
            style={{
              backgroundColor: "#dc2626",
              color: "white",
              padding: "0.5rem 1rem",
              border: "none",
              borderRadius: "0.25rem",
              cursor: "pointer"
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const displayCharacter = currentCharacter || ssrCharacter;

  if (!displayCharacter) {
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Loading character details...</p>
        </div>
      </div>
    );
  }

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
          alignItems: "start",
          opacity: isLoading ? 0.5 : 1,
          transition: "opacity 0.2s"
        }}>
          <div>
            <img
              src={displayCharacter.image}
              alt={displayCharacter.name}
              style={{
                width: "100%",
                borderRadius: "0.5rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              }}
            />
          </div>

          <div>
            <h1 style={{ fontSize: "2.25rem", fontWeight: "700", marginBottom: "1rem" }}>
              {displayCharacter.name}
            </h1>

            <div style={{ marginBottom: "2rem" }}>
              <StatusBadge status={displayCharacter.status} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "2rem" }}>
              <div>
                <h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>Species</h3>
                <p style={{ color: "#6b7280" }}>{displayCharacter.species}</p>
              </div>
              <div>
                <h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>Gender</h3>
                <p style={{ color: "#6b7280" }}>{displayCharacter.gender}</p>
              </div>
              {displayCharacter.type && (
                <div>
                  <h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>Type</h3>
                  <p style={{ color: "#6b7280" }}>{displayCharacter.type}</p>
                </div>
              )}
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>Origin</h3>
              <p style={{ color: "#6b7280" }}>{displayCharacter.origin.name}</p>
              {displayCharacter.origin.dimension && (
                <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                  Dimension: {displayCharacter.origin.dimension}
                </p>
              )}
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <h3 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>Current Location</h3>
              <p style={{ color: "#6b7280" }}>{displayCharacter.location.name}</p>
              {displayCharacter.location.dimension && (
                <p style={{ color: "#9ca3af", fontSize: "0.875rem" }}>
                  Dimension: {displayCharacter.location.dimension}
                </p>
              )}
            </div>

            <div>
              <h3 style={{ fontWeight: "600", marginBottom: "1rem" }}>
                Episodes ({displayCharacter.episode?.length || 0})
              </h3>
              <div style={{ 
                maxHeight: "300px", 
                overflowY: "auto",
                border: "1px solid #e2e8f0",
                borderRadius: "0.5rem",
                padding: "1rem"
              }}>
                {(displayCharacter.episode || []).map((episode) => (
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