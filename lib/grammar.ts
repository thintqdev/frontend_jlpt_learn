const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function getGrammars() {
  const query = `
    query {
      grammars {
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
  `;
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  return json.data.grammars;
}

export async function createGrammar(input: {
  title: string;
  level: string;
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
  const json = await res.json();
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
        usage
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
