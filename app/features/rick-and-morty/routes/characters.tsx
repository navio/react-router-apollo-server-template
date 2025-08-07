import { Suspense, useEffect } from "react";
import { useLoaderData, Link, useSearchParams } from "react-router";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { RickAndMortyAPI } from "../services/api";
import { 
  useRickAndMortyStore, 
  useCharacters, 
  useCharactersLoading, 
  useCharactersError 
} from "../store/characters-store";
import { CharacterCard, Pagination } from "../components";
import type { Character } from "../types";

export const meta: MetaFunction = () => {
  return [
    { title: "Characters - React Router + Apollo SSR" },
    { name: "description", content: "Browse Rick and Morty characters with SSR" },
  ];
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");

  try {
    const data = await RickAndMortyAPI.fetchCharacters(page);

    return {
      characters: data.characters,
      currentPage: page,
      apolloState: {},
    };
  } catch (error) {
    throw new Response("Failed to fetch characters", { status: 500 });
  }
}

export default function Characters() {
  const { characters: ssrCharacters, currentPage: ssrPage } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  
  // Get Zustand state
  const characters = useCharacters();
  const isLoading = useCharactersLoading();
  const error = useCharactersError();
  const { fetchCharacters, clearError } = useRickAndMortyStore();
  
  // Get current page from URL
  const currentPage = parseInt(searchParams.get("page") || "1");
  
  // Initialize store with SSR data and handle client-side navigation
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    if (characters.items.length === 0 || characters.pagination.currentPage !== currentPage) {
      // Use SSR data for initial load, then fetch for subsequent navigations
      if (characters.items.length === 0 && ssrCharacters) {
        // Initialize store with SSR data
        useRickAndMortyStore.setState({
          characters: {
            items: ssrCharacters.results,
            pagination: {
              currentPage: ssrPage,
              totalPages: ssrCharacters.info.pages,
              hasNext: ssrCharacters.info.next !== null,
              hasPrev: ssrCharacters.info.prev !== null,
            },
          },
        });
      } else {
        // Client-side navigation - fetch from store
        fetchCharacters(currentPage);
      }
    }
  }, [currentPage, ssrCharacters, ssrPage, characters.items.length, fetchCharacters]);

  // Error display
  if (error) {
    return (
      <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
        <div style={{ marginBottom: "2rem" }}>
          <Link to="/" style={{ color: "#3b82f6", textDecoration: "none", fontSize: "0.875rem" }}>
            ← Back to Home
          </Link>
        </div>
        
        <div style={{ 
          backgroundColor: "#fef2f2", 
          border: "1px solid #fecaca", 
          borderRadius: "0.5rem", 
          padding: "1rem",
          color: "#b91c1c"
        }}>
          <h2 style={{ margin: "0 0 0.5rem 0" }}>Error Loading Characters</h2>
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

  const displayData = characters.items.length > 0 ? characters : { 
    items: ssrCharacters?.results || [], 
    pagination: characters.pagination 
  };

  return (
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "2rem" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link
          to="/"
          style={{
            color: "#3b82f6",
            textDecoration: "none",
            fontSize: "0.875rem"
          }}
        >
          ← Back to Home
        </Link>
      </div>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ margin: 0 }}>Rick and Morty Characters</h1>
        {isLoading && (
          <div style={{ color: "#6b7280", fontSize: "0.875rem" }}>
            Loading...
          </div>
        )}
      </div>
      
      <Suspense fallback={
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Loading characters...</p>
        </div>
      }>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.5rem",
          opacity: isLoading ? 0.5 : 1,
          transition: "opacity 0.2s"
        }}>
          {displayData.items.map((character: Character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>

        <Pagination 
          currentPage={currentPage}
          totalPages={characters.pagination.totalPages}
          hasNext={characters.pagination.hasNext}
          hasPrev={characters.pagination.hasPrev}
        />
      </Suspense>
    </div>
  );
}