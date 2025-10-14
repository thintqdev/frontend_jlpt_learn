// Types
export type DictionaryMeaning = {
  meaning: string;
  example: string;
  translation: string;
};

export type Dictionary = {
  id: string;
  word: string;
  reading: string;
  meanings: DictionaryMeaning[];
  type: string;
  level: string;
  createdAt?: string;
  updatedAt?: string;
};

export type DictionaryListResult = {
  items: Dictionary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type FilterDictionaryInput = {
  levels?: string[];
  types?: string[];
};

export type CreateDictionaryInput = {
  word: string;
  reading: string;
  meanings: DictionaryMeaning[];
  type: string;
  level: string;
};

export type UpdateDictionaryInput = {
  word?: string;
  reading?: string;
  meanings?: DictionaryMeaning[];
  type?: string;
  level?: string;
};

// API Functions

/**
 * Get paginated list of dictionaries with optional filters
 */
export async function getDictionaries(
  page: number = 1,
  limit: number = 20,
  filter?: FilterDictionaryInput
): Promise<DictionaryListResult> {
  const query = `
    query GetDictionaries($page: Int, $limit: Int, $filter: FilterDictionaryInput) {
      dictionaries(page: $page, limit: $limit, filter: $filter) {
        items {
          id
          word
          reading
          meanings {
            meaning
            example
            translation
          }
          type
          level
          createdAt
          updatedAt
        }
        total
        page
        limit
        totalPages
      }
    }
  `;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const response = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { page, limit, filter: filter || null },
    }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.dictionaries;
}

/**
 * Get a single dictionary by ID
 */
export async function getDictionary(id: string): Promise<Dictionary | null> {
  const query = `
    query GetDictionary($id: String!) {
      dictionary(id: $id) {
        id
        word
        reading
        meanings {
          meaning
          example
          translation
        }
        type
        level
        createdAt
        updatedAt
      }
    }
  `;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const response = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { id } }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.dictionary;
}

/**
 * Find dictionary by exact word match (kanji or hiragana)
 * Useful for dictionary lookup
 */
export async function getDictionaryByWord(
  word: string
): Promise<Dictionary | null> {
  const query = `
    query GetDictionaryByWord($word: String!) {
      dictionaryByWord(word: $word) {
        id
        word
        reading
        meanings {
          meaning
          example
          translation
        }
        type
        level
        createdAt
        updatedAt
      }
    }
  `;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const response = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { word } }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.dictionaryByWord;
}

/**
 * Find dictionaries by dictionary form
 * Automatically finds the dictionary form from conjugated forms
 * Example: "食べた" -> finds "食べる"
 */
export async function getDictionaryByDictionaryForm(
  word: string
): Promise<Dictionary[]> {
  const query = `
    query GetDictionaryByDictionaryForm($word: String!) {
      dictionaryByDictionaryForm(word: $word) {
        id
        word
        reading
        meanings {
          meaning
          example
          translation
        }
        type
        level
        createdAt
        updatedAt
      }
    }
  `;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const response = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { word } }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.dictionaryByDictionaryForm;
}

/**
 * Search dictionaries by word, reading, or meanings
 */
export async function searchDictionaries(
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<DictionaryListResult> {
  const graphqlQuery = `
    query SearchDictionaries($query: String!, $page: Int, $limit: Int) {
      searchDictionaries(query: $query, page: $page, limit: $limit) {
        items {
          id
          word
          reading
          meanings {
            meaning
            example
            translation
          }
          type
          level
          createdAt
          updatedAt
        }
        total
        page
        limit
        totalPages
      }
    }
  `;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const response = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: graphqlQuery,
      variables: { query, page, limit },
    }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.searchDictionaries;
}

/**
 * Create a new dictionary entry
 */
export async function createDictionary(
  input: CreateDictionaryInput
): Promise<Dictionary> {
  const mutation = `
    mutation CreateDictionary($input: CreateDictionaryInput!) {
      createDictionary(input: $input) {
        id
        word
        reading
        meanings {
          meaning
          example
          translation
        }
        type
        level
        createdAt
        updatedAt
      }
    }
  `;
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;

  const response = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: mutation,
      variables: { input },
    }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.createDictionary;
}

/**
 * Create multiple dictionary entries at once
 * Useful for AI-generated words or bulk import
 */
export async function createDictionaries(
  input: CreateDictionaryInput[]
): Promise<Dictionary[]> {
  const mutation = `
    mutation CreateDictionaries($input: [CreateDictionaryInput!]!) {
      createDictionaries(input: $input) {
        id
        word
        reading
        meanings {
          meaning
          example
          translation
        }
        type
        level
        createdAt
        updatedAt
      }
    }
  `;
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;

  const response = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: mutation,
      variables: { input },
    }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.createDictionaries;
}

/**
 * Update an existing dictionary entry
 */
export async function updateDictionary(
  id: string,
  input: UpdateDictionaryInput
): Promise<Dictionary> {
  const mutation = `
    mutation UpdateDictionary($id: String!, $input: UpdateDictionaryInput!) {
      updateDictionary(id: $id, input: $input) {
        id
        word
        reading
        meanings {
          meaning
          example
          translation
        }
        type
        level
        createdAt
        updatedAt
      }
    }
  `;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const response = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: mutation,
      variables: { id, input },
    }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.updateDictionary;
}

/**
 * Delete a dictionary entry
 */
export async function removeDictionary(id: string): Promise<Dictionary> {
  const mutation = `
    mutation RemoveDictionary($id: String!) {
      removeDictionary(id: $id) {
        id
        word
        reading
        meanings {
          meaning
          example
          translation
        }
      }
    }
  `;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const response = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: mutation,
      variables: { id },
    }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.removeDictionary;
}

/**
 * Smart lookup function that tries multiple search strategies
 * 1. Try exact match first
 * 2. If not found, try dictionary form lookup
 * 3. Return the most relevant result
 */
export async function smartLookup(word: string): Promise<Dictionary | null> {
  // Try exact match first
  const exact = await getDictionaryByWord(word);
  if (exact) return exact;

  // Try dictionary form lookup
  const dictionaryForms = await getDictionaryByDictionaryForm(word);
  if (dictionaryForms && dictionaryForms.length > 0) {
    // Return the first (most relevant) result
    return dictionaryForms[0];
  }

  return null;
}
