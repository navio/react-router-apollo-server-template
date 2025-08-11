import { Suspense, useEffect } from 'react'
import { useLoaderData, Link, useSearchParams } from 'react-router'
import type { LoaderFunctionArgs, MetaFunction } from 'react-router'
import { GET_CHARACTERS } from '../services/apollo-service'
import { createApolloClient } from '~/lib/apollo'
import {
  useCharactersStore,
  useCharacters,
  useCharactersLoading,
  useCharactersError,
} from '~/store'

export const meta: MetaFunction = () => {
  return [
    { title: 'Characters - React Router + Apollo SSR' },
    { name: 'description', content: 'Browse Rick and Morty characters with SSR' },
  ]
}

interface Character {
  id: string
  name: string
  status: string
  species: string
  gender: string
  image: string
  origin: {
    name: string
  }
  location: {
    name: string
  }
}

interface CharactersData {
  characters: {
    results: Character[]
    info: {
      count: number
      pages: number
      next: number | null
      prev: number | null
    }
  }
}

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url)
  const page = parseInt(url.searchParams.get('page') || '1')

  try {
    // Create Apollo client for SSR
    const client = createApolloClient()
    const { data } = await client.query({
      query: GET_CHARACTERS,
      variables: { page },
      errorPolicy: 'all',
    })

    return {
      characters: data?.characters?.results || [],
      info: data?.characters?.info || { count: 0, pages: 1, next: null, prev: null },
      currentPage: page,
      apolloState: client.cache.extract(),
    }
  } catch (error) {
    console.error('Error fetching characters:', error)
    // Return empty data instead of throwing to avoid crashes
    return {
      characters: [],
      info: { count: 0, pages: 1, next: null, prev: null },
      currentPage: page,
      apolloState: {},
    }
  }
}

function CharacterCard({ character }: { character: Character }) {
  return (
    <div
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: '0.5rem',
        padding: '1rem',
        backgroundColor: 'white',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      }}
    >
      <Link to={`/characters/${character.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <img
          src={character.image}
          alt={character.name}
          style={{
            width: '100%',
            height: '200px',
            objectFit: 'cover',
            borderRadius: '0.25rem',
            marginBottom: '0.5rem',
          }}
        />
        <h3 style={{ margin: '0.5rem 0', fontSize: '1.1rem', fontWeight: '600' }}>
          {character.name}
        </h3>
        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
          <p style={{ margin: '0.25rem 0' }}>
            <span style={{ fontWeight: '500' }}>Status:</span> {character.status}
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            <span style={{ fontWeight: '500' }}>Species:</span> {character.species}
          </p>
          <p style={{ margin: '0.25rem 0' }}>
            <span style={{ fontWeight: '500' }}>Location:</span> {character.location.name}
          </p>
        </div>
      </Link>
    </div>
  )
}

function Pagination({ info, currentPage }: { info: any; currentPage: number }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
      {info.prev && (
        <Link
          to={`/characters?page=${currentPage - 1}`}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.25rem',
          }}
        >
          Previous
        </Link>
      )}
      <span style={{ padding: '0.5rem 1rem' }}>
        Page {currentPage} of {info.pages}
      </span>
      {info.next && (
        <Link
          to={`/characters?page=${currentPage + 1}`}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '0.25rem',
          }}
        >
          Next
        </Link>
      )}
    </div>
  )
}

export default function Characters() {
  const {
    characters: ssrCharacters,
    info: ssrInfo,
    currentPage: ssrPage,
  } = useLoaderData<typeof loader>()
  const [searchParams] = useSearchParams()

  // Get Zustand state
  const characters = useCharacters()
  const isLoading = useCharactersLoading()
  const error = useCharactersError()
  const { fetchCharacters, clearError } = useCharactersStore()

  // Get current page from URL
  const currentPage = parseInt(searchParams.get('page') || '1')

  // Initialize store with SSR data and handle client-side navigation
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    if (characters.length === 0) {
      // Use SSR data for initial load
      if (ssrCharacters && ssrCharacters.length > 0) {
        // Initialize store with SSR data
        useCharactersStore.setState({
          characters: ssrCharacters,
          loading: false,
          error: null,
        })
      }
    }
  }, [currentPage, ssrCharacters, ssrPage, characters.length])

  // Error display
  if (error) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.875rem' }}>
            ← Back to Home
          </Link>
        </div>

        <div
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.5rem',
            padding: '1rem',
            color: '#b91c1c',
          }}
        >
          <h2 style={{ margin: '0 0 0.5rem 0' }}>Error Loading Characters</h2>
          <p style={{ margin: '0 0 1rem 0' }}>{error}</p>
          <button
            onClick={clearError}
            style={{
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '0.5rem 1rem',
              border: 'none',
              borderRadius: '0.25rem',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const displayData = characters.length > 0 ? characters : ssrCharacters || []

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link
          to="/"
          style={{
            color: '#3b82f6',
            textDecoration: 'none',
            fontSize: '0.875rem',
          }}
        >
          ← Back to Home
        </Link>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
        }}
      >
        <h1 style={{ margin: 0 }}>Rick and Morty Characters</h1>
        {isLoading && <div style={{ color: '#6b7280', fontSize: '0.875rem' }}>Loading...</div>}
      </div>

      <Suspense
        fallback={
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>Loading characters...</p>
          </div>
        }
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1.5rem',
            opacity: isLoading ? 0.5 : 1,
            transition: 'opacity 0.2s',
          }}
        >
          {displayData.map((character: Character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>

        <Pagination
          info={{
            pages: ssrInfo.pages || 1,
            next: ssrInfo.next ? currentPage + 1 : null,
            prev: ssrInfo.prev ? currentPage - 1 : null,
          }}
          currentPage={currentPage}
        />
      </Suspense>
    </div>
  )
}
