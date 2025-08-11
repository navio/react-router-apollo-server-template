import {
  ApolloClient,
  InMemoryCache,
  gql,
  type ApolloQueryResult,
  useApolloClient,
} from '@apollo/client'
import { useCharactersStore, useInternalStore } from '~/store'

// GraphQL queries
export const GET_CHARACTERS = gql`
  query GetCharacters($page: Int) {
    characters(page: $page) {
      info {
        count
        pages
        next
        prev
      }
      results {
        id
        name
        status
        species
        gender
        origin {
          name
        }
        location {
          name
        }
        image
        episode {
          id
          name
          air_date
          episode
        }
      }
    }
  }
`

export const GET_CHARACTER = gql`
  query GetCharacter($id: ID!) {
    character(id: $id) {
      id
      name
      status
      species
      gender
      origin {
        name
      }
      location {
        name
      }
      image
      episode {
        id
        name
        air_date
        episode
      }
    }
  }
`

export const GET_HEALTH = gql`
  query GetHealth {
    health {
      status
      message
      timestamp
    }
  }
`

// Apollo Service class
export class ApolloService {
  private client: ApolloClient<any>

  constructor(client: ApolloClient<any>) {
    this.client = client
  }

  async getCharacters(page: number = 1) {
    const { setLoading, setCharacters, setError } = useCharactersStore.getState()

    try {
      setLoading(true)
      setError(null)

      const result: ApolloQueryResult<any> = await this.client.query({
        query: GET_CHARACTERS,
        variables: { page },
        fetchPolicy: 'cache-first',
      })

      if (result.data?.characters?.results) {
        setCharacters(result.data.characters.results)
      }

      return result.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch characters'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  async getCharacter(id: string) {
    const { setLoading, setSelectedCharacter, setError } = useCharactersStore.getState()

    try {
      setLoading(true)
      setError(null)

      const result: ApolloQueryResult<any> = await this.client.query({
        query: GET_CHARACTER,
        variables: { id },
        fetchPolicy: 'cache-first',
      })

      if (result.data?.character) {
        setSelectedCharacter(result.data.character)
      }

      return result.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch character'
      setError(errorMessage)
      throw error
    } finally {
      setLoading(false)
    }
  }

  async getHealth() {
    const { setHealthLoading, setHealth, setError } = useInternalStore.getState()

    try {
      setHealthLoading(true)
      setError(null)

      const result: ApolloQueryResult<any> = await this.client.query({
        query: GET_HEALTH,
        fetchPolicy: 'no-cache',
      })

      if (result.data?.health) {
        setHealth(result.data.health)
      }

      return result.data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch health status'
      setError(errorMessage)
      throw error
    } finally {
      setHealthLoading(false)
    }
  }
}

// Hook to get the service instance using the current Apollo client from context
export const useApolloService = () => {
  const client = useApolloClient()
  return new ApolloService(client)
}
