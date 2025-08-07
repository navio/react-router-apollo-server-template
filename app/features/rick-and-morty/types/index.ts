// Rick and Morty API types
export interface Character {
  id: string;
  name: string;
  status: string;
  species: string;
  type?: string;
  gender: string;
  image: string;
  origin: {
    name: string;
    dimension?: string;
  };
  location: {
    name: string;
    dimension?: string;
  };
  episode?: Array<{
    id: string;
    name: string;
    air_date?: string;
    episode?: string;
  }>;
}

export interface CharactersResponse {
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

export interface PaginatedCharacters {
  items: Character[];
  pagination: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}