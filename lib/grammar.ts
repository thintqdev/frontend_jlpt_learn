const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

if (!API_URL) {
  console.warn("NEXT_PUBLIC_API_URL is not set!");
}

export async function getGrammars(
  page: number = 1,
  pageSize: number = 10,
  search: string = "",
  sortBy: string = "id",
  sortOrder: "asc" | "desc" = "desc",
  levelFilter?: string[],
  typeFilter?: string[]
) {
  const query = `
    query Grammars(
      $page: Int,
      $pageSize: Int,
      $search: String,
      $sortBy: String,
      $sortOrder: String,
      $levelFilter: [String!],
      $typeFilter: [String!]
    ) {
      grammars(
        page: $page,
        pageSize: $pageSize,
        search: $search,
        sortBy: $sortBy,
        sortOrder: $sortOrder,
        levelFilter: $levelFilter,
        typeFilter: $typeFilter
      ) {
        count
        items {
          id
          title
          level
          definition
          description
          usages {
            id
            meaning
            structure
            note
            examples {
              id
              sentence
              translation
              usageId
            }
          }
        }
      }
    }
  `;
  const variables = {
    page,
    pageSize,
    search,
    sortBy,
    sortOrder,
    levelFilter,
    typeFilter,
  };
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  return json?.data?.grammars || { items: [], count: 0 };
}

export async function createGrammar(input: {
  title: string;
  level: string;
  definition: string;
  description?: string;
}) {
  const query = `
    mutation CreateGrammar($input: CreateGrammarInput!) {
      createGrammar(input: $input) {
        id
        title
        level
        description
      }
    }
  `;
  const variables = { input };
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });

  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  const json = await res.json();
  console.log("createGrammar response:", json);

  if (json.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  }

  if (!json.data || !json.data.createGrammar) {
    throw new Error("Invalid response from createGrammar");
  }

  return json.data.createGrammar;
}

export async function removeGrammar(id: number) {
  const query = `
    mutation {
      removeGrammar(id: ${id}) {
        id
        title
      }
    }
  `;
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  return json.data.removeGrammar;
}

export async function getGrammarUsages() {
  const query = `
    query {
      grammarUsages {
        id
        grammarId
        usage
        example
      }
    }
  `;
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  return json.data.grammarUsages;
}

export async function getGrammarUsage(id: number) {
  const query = `
    query {
      grammarUsage(id: ${id}) {
        id
        grammarId
        usage
        example
      }
    }
  `;
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  return json.data.grammarUsage;
}

export async function createGrammarUsage(input: {
  structure: string;
  meaning: string;
  note?: string;
  grammarId: number;
}) {
  const query = `
    mutation CreateGrammarUsage($input: CreateGrammarUsageInput!) {
      createGrammarUsage(input: $input) {
        id
        structure
        meaning
        note
        grammarId
      }
    }
  `;
  const variables = { input };
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  return json.data.createGrammarUsage;
}

export async function removeGrammarUsage(id: number) {
  const query = `
    mutation {
      removeGrammarUsage(id: ${id}) {
        id
      }
    }
  `;
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  return json.data.removeGrammarUsage;
}

export async function getGrammarExamples() {
  const query = `
    query {
      grammarExamples {
        id
        sentence
        translation
        usageId
      }
    }
  `;
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  return json.data.grammarExamples;
}

export async function createGrammarExample(input: {
  sentence: string;
  translation: string;
  usageId: number;
}) {
  const query = `
    mutation CreateGrammarExample($input: CreateGrammarExampleInput!) {
      createGrammarExample(input: $input) {
        id
        sentence
        translation
        usageId
      }
    }
  `;
  const variables = { input };
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  return json.data.createGrammarExample;
}

export async function removeGrammarExample(id: number) {
  const query = `
    mutation {
      removeGrammarExample(id: ${id}) {
        id
        sentence
      }
    }
  `;
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  return json.data.removeGrammarExample;
}

export async function getGrammar(id: number) {
  const query = `
    query {
      grammar(id: ${id}) {
        id
        title
        level
        description
        definition
        usages {
          id
          meaning
          structure
          note
          examples {
            id
            sentence
            translation
            usageId
          }
        }
      }
    }
  `;
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  return json.data.grammar;
}

/**
 * Import grammar from JSON string
 * @param input JSON string (array of grammars)
 * Returns: boolean (success)
 */
export async function importGrammarJson(input: string): Promise<boolean> {
  const query = `
    mutation ImportGrammarJson($input: String!) {
      importGrammarJson(input: $input)
    }
  `;
  const variables = { input };
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  return json.data.importGrammarJson;
}

/**
 * Import grammar from CSV file
 * @param file File (CSV)
 * Returns: boolean (success)
 */
export async function importGrammarCsv(file: File): Promise<boolean> {
  const query = `
    mutation importGrammarCsv($file: Upload!) {
      importGrammarCsv(file: $file)
    }
  `;
  // Prepare FormData for upload
  const formData = new FormData();
  formData.append(
    "operations",
    JSON.stringify({
      query,
      variables: { file: null },
    })
  );
  formData.append("map", JSON.stringify({ "0": ["variables.file"] }));
  formData.append("0", file);

  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    body: formData,
  });
  const json = await res.json();
  // Note: the mutation returns just a boolean
  return json.data.importGrammarCsv;
}

/**
 * Generate grammar content using AI
 * @param title Grammar point title
 * @param level JLPT level
 * Returns: Generated grammar data
 */
export async function generateGrammar(title: string, level: string) {
  const res = await fetch("/api/generate-grammar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, level }),
  });

  if (!res.ok) {
    throw new Error("Failed to generate grammar");
  }

  const json = await res.json();

  if (!json.success) {
    throw new Error(json.error || "Failed to generate grammar");
  }

  return json.data;
}
