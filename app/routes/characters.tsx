import { Suspense } from "react";
import { useLoaderData, Link } from "react-router";
import { useQuery } from "@apollo/client";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { GET_CHARACTERS } from "~/lib/queries";
import { createApolloClient } from "~/lib/apollo";

export const meta: MetaFunction = () => {
  return [
    { title: "Characters - React Router + Apollo SSR" },
    { name: "description", content: "Browse Rick and Morty characters with SSR" },
  ];
};

interface Character {
  id: string;
  name: string;
  status: string;
  species: string;
  gender: string;
  image: string;
  origin: {
    name: string;
  };
  location: {
    name: string;
  };
}

interface CharactersData {
  characters: {
    results: Character[];
    info: {
      count: number;
      pages: number;
      next: number | null;
      prev: number | null;
    };
  };
}

export async function loader({ request }: LoaderFunctionArgs) {
  const client = createApolloClient();
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");

  try {
    const { data } = await client.query({
      query: GET_CHARACTERS,
      variables: { page },
    });

    return {
      characters: data.characters,
      apolloState: client.cache.extract(),
      currentPage: page,
    };
  } catch (error) {
    throw new Response("Failed to fetch characters", { status: 500 });
  }
}

function CharacterCard({ character }: { character: Character }) {
  return (
    <div style={{
      border: "1px solid #e2e8f0",
      borderRadius: "0.5rem",
      padding: "1rem",
      backgroundColor: "white",
      boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
    }}>
      <Link
        to={`/characters/${character.id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <img
          src={character.image}
          alt={character.name}
          style={{
            width: "100%",
            height: "200px",
            objectFit: "cover",
            borderRadius: "0.25rem",
            marginBottom: "0.5rem"
          }}
        />
        <h3 style={{ margin: "0.5rem 0", fontSize: "1.1rem", fontWeight: "600" }}>
          {character.name}
        </h3>
        <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
          <p style={{ margin: "0.25rem 0" }}>
            <span style={{ fontWeight: "500" }}>Status:</span> {character.status}
          </p>
          <p style={{ margin: "0.25rem 0" }}>
            <span style={{ fontWeight: "500" }}>Species:</span> {character.species}
          </p>
          <p style={{ margin: "0.25rem 0" }}>
            <span style={{ fontWeight: "500" }}>Location:</span> {character.location.name}
          </p>
        </div>
      </Link>
    </div>
  );
}

function Pagination({ info, currentPage }: { info: any; currentPage: number }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "1rem", marginTop: "2rem" }}>
      {info.prev && (
        <Link
          to={`/characters?page=${currentPage - 1}`}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#3b82f6",
            color: "white",
            textDecoration: "none",
            borderRadius: "0.25rem"
          }}
        >
          Previous
        </Link>
      )}
      <span style={{ padding: "0.5rem 1rem" }}>
        Page {currentPage} of {info.pages}
      </span>
      {info.next && (
        <Link
          to={`/characters?page=${currentPage + 1}`}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "#3b82f6",
            color: "white",
            textDecoration: "none",
            borderRadius: "0.25rem"
          }}
        >
          Next
        </Link>
      )}
    </div>
  );
}

export default function Characters() {
  const { characters, currentPage } = useLoaderData<typeof loader>();

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
      
      <h1 style={{ marginBottom: "2rem" }}>Rick and Morty Characters</h1>
      
      <Suspense fallback={
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Loading characters...</p>
        </div>
      }>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "1.5rem"
        }}>
          {characters.results.map((character: Character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>

        <Pagination info={characters.info} currentPage={currentPage} />
      </Suspense>
    </div>
  );
}