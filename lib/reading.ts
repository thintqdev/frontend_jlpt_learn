// API functions for Reading operations

// Get all readings with pagination and filters
export async function getReadings(
  page = 1,
  limit = 10,
  level?: string,
  textType?: string
) {
  const query = `
    query($page: Int!, $limit: Int!, $level: String, $textType: String) {
      readings(page: $page, limit: $limit, level: $level, textType: $textType) {
        count
        items {
          id
          title
          textType
          content
          translation
          readingQuestions {
            question
            options
            correctAnswer
          }
          questionExplanations
          level
          explanation
          vocabulary {
            word
            reading
            meaning
            example
          }
          grammar {
            pattern
            meaning
            example
          }
          createdAt
          updatedAt
        }
      }
    }
  `;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;
  const response = await fetch(`${apiUrl}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: { page, limit, level, textType }
    }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.readings;
}

// Get single reading by ID
export async function getReading(id: number) {
  const query = `
    query($id: Int!) {
      reading(id: $id) {
        id
        title
        textType
        content
        translation
        readingQuestions {
          question
          options
          correctAnswer
        }
        questionExplanations
        level
        explanation
        vocabulary {
          word
          reading
          meaning
          example
        }
        grammar {
          pattern
          meaning
          example
        }
        createdAt
        updatedAt
      }
    }
  `;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;
  const response = await fetch(`${apiUrl}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { id } }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.reading;
}

// Get readings by level
export async function getReadingsByLevel(level: string) {
  const query = `
    query($level: String!) {
      readingsByLevel(level: $level) {
        id
        title
        textType
        content
        readingQuestions {
          question
          options
          correctAnswer
        }
        level
        explanation
        vocabulary {
          word
          reading
          meaning
          example
        }
        grammar {
          pattern
          meaning
          example
        }
        createdAt
        updatedAt
      }
    }
  `;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;
  const response = await fetch(`${apiUrl}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { level } }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.readingsByLevel;
}

// Get readings by text type
export async function getReadingsByTextType(textType: string) {
  const query = `
    query($textType: String!) {
      readingsByTextType(textType: $textType) {
        id
        title
        textType
        content
        readingQuestions {
          question
          options
          correctAnswer
        }
        level
        explanation
        vocabulary {
          word
          reading
          meaning
          example
        }
        grammar {
          pattern
          meaning
          example
        }
        createdAt
        updatedAt
      }
    }
  `;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;
  const response = await fetch(`${apiUrl}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { textType } }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.readingsByTextType;
}

// Search readings
export async function searchReadings(searchText: string) {
  const query = `
    query($searchText: String!) {
      searchReadings(searchText: $searchText) {
        id
        title
        textType
        content
        readingQuestions {
          question
          options
          correctAnswer
        }
        level
        explanation
        vocabulary {
          word
          reading
          meaning
          example
        }
        grammar {
          pattern
          meaning
          example
        }
        createdAt
        updatedAt
      }
    }
  `;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;
  const response = await fetch(`${apiUrl}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { searchText } }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.searchReadings;
}

// Create new reading
export async function createReading(input: {
  title: string;
  textType: string;
  content: string;
  readingQuestions: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  level: string;
  explanation?: string;
  vocabulary?: {
    word: string;
    reading: string;
    meaning: string;
    example?: string;
  }[];
  grammar?: {
    pattern: string;
    meaning: string;
    example: string;
  }[];
}) {
  const mutation = `
    mutation CreateReading($input: CreateReadingInput!) {
      createReading(input: $input) {
        id
        title
        textType
        content
        readingQuestions {
          question
          options
          correctAnswer
        }
        level
        explanation
        vocabulary {
          word
          reading
          meaning
          example
        }
        grammar {
          pattern
          meaning
          example
        }
        createdAt
        updatedAt
      }
    }
  `;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;
  const response = await fetch(`${apiUrl}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: mutation, variables: { input } }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.createReading;
}

// Update reading
export async function updateReading(input: {
  id: number;
  title?: string;
  textType?: string;
  content?: string;
  translation?: string;
  readingQuestions?: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  questionExplanations?: string[];
  level?: string;
  explanation?: string;
  vocabulary?: {
    word: string;
    reading: string;
    meaning: string;
    example?: string;
  }[];
  grammar?: {
    pattern: string;
    meaning: string;
    example: string;
  }[];
}) {
  const mutation = `
    mutation UpdateReading($input: UpdateReadingInput!) {
      updateReading(input: $input) {
        id
        title
        textType
        content
        translation
        readingQuestions {
          question
          options
          correctAnswer
        }
        questionExplanations
        level
        explanation
        vocabulary {
          word
          reading
          meaning
          example
        }
        grammar {
          pattern
          meaning
          example
        }
        createdAt
        updatedAt
      }
    }
  `;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;
  const response = await fetch(`${apiUrl}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: mutation, variables: { input } }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.updateReading;
}

// Delete reading
export async function deleteReading(id: number) {
  const mutation = `
    mutation RemoveReading($id: Int!) {
      removeReading(id: $id) {
        id
        title
      }
    }
  `;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;
  const response = await fetch(`${apiUrl}/graphql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: mutation, variables: { id } }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.removeReading;
}