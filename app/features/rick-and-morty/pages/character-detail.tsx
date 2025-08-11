import { useEffect } from 'react'
import { useLoaderData, Link, useParams } from 'react-router'
import type { LoaderFunctionArgs, MetaFunction } from 'react-router'
import {
  useCharactersStore,
  useSelectedCharacter,
  useCharactersLoading,
  useCharactersError,
} from '~/store'
import { GET_CHARACTER } from '../services/apollo-service'
import { createApolloClient } from '~/lib/apollo'

export const meta: MetaFunction = () => {
  return [
    { title: 'Character Details - React Router + Apollo SSR' },
    { name: 'description', content: 'Character details with SSR' },
  ]
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const characterId = params.id

  try {
    // Create Apollo client for SSR
    const client = createApolloClient()
    const { data } = await client.query({
      query: GET_CHARACTER,
      variables: { id: characterId },
      errorPolicy: 'all',
      fetchPolicy: 'cache-first', // Use cache-first to allow proper caching per character ID
    })

    return {
      character: data?.character || null,
      characterId,
      apolloState: client.cache.extract(),
    }
  } catch (error) {
    console.error('Error fetching character:', error)
    // Return empty data instead of throwing to avoid crashes
    return {
      character: null,
      characterId,
      apolloState: {},
    }
  }
}

export default function CharacterDetail() {
  const { character: ssrCharacter, characterId } = useLoaderData<typeof loader>()
  const params = useParams()
  const character = useSelectedCharacter()
  const isLoading = useCharactersLoading()
  const error = useCharactersError()
  const { setSelectedCharacter, clearError } = useCharactersStore()

  // Always prioritize fresh SSR data, only use store as fallback
  const displayCharacter = ssrCharacter || character

  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Always update store with fresh SSR data when character ID changes
      if (ssrCharacter && ssrCharacter.id !== character?.id) {
        setSelectedCharacter(ssrCharacter)
      }
      // Clear store if no character data available
      else if (!ssrCharacter && !character) {
        setSelectedCharacter(null)
      }
    }
  }, [ssrCharacter, character, characterId, setSelectedCharacter])

  if (error) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/characters" style={{ color: '#3b82f6', textDecoration: 'none' }}>
            ← Back to Characters
          </Link>
        </div>
        <div style={{ backgroundColor: '#fef2f2', padding: '1rem', borderRadius: '0.5rem' }}>
          <h2>Error Loading Character</h2>
          <p>{error}</p>
          <button onClick={clearError}>Try Again</button>
        </div>
      </div>
    )
  }

  if (!displayCharacter) {
    return (
      <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <Link to="/characters" style={{ color: '#3b82f6', textDecoration: 'none' }}>
            ← Back to Characters
          </Link>
        </div>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading character...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/characters" style={{ color: '#3b82f6', textDecoration: 'none' }}>
          ← Back to Characters
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
        <div>
          <img
            src={displayCharacter.image}
            alt={displayCharacter.name}
            style={{ width: '100%', borderRadius: '0.5rem' }}
          />
        </div>

        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>{displayCharacter.name}</h1>

          <div style={{ marginBottom: '2rem' }}>
            <span
              style={{
                backgroundColor: displayCharacter.status === 'Alive' ? '#10b981' : '#ef4444',
                color: 'white',
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.875rem',
              }}
            >
              {displayCharacter.status}
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              marginBottom: '2rem',
            }}
          >
            <div>
              <h3>Species</h3>
              <p>{displayCharacter.species}</p>
            </div>
            <div>
              <h3>Gender</h3>
              <p>{displayCharacter.gender}</p>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3>Origin</h3>
            <p>{displayCharacter.origin.name}</p>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3>Current Location</h3>
            <p>{displayCharacter.location.name}</p>
          </div>

          {displayCharacter.episode && displayCharacter.episode.length > 0 && (
            <div>
              <h3>Episodes ({displayCharacter.episode.length})</h3>
              <div
                style={{
                  maxHeight: '200px',
                  overflowY: 'auto',
                  border: '1px solid #ccc',
                  padding: '1rem',
                }}
              >
                {displayCharacter.episode.map((episode, index) => (
                  <div key={episode.id || index} style={{ marginBottom: '0.5rem' }}>
                    <div>
                      <strong>
                        {episode.episode} - {episode.name}
                      </strong>
                    </div>
                    <div style={{ color: '#666', fontSize: '0.875rem' }}>{episode.air_date}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
