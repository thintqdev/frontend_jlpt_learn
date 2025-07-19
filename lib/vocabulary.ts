// API lấy vocabularies theo category
export async function getVocabulariesByCategory(categoryId: number) {
  const query = `
    query($categoryId: Int!) {
      vocabulariesByCategory(categoryId: $categoryId) {
        id
        kanji
        hiragana
        definition
        translation
        category {
          id
          name
        }
      }
    }
  `;
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;
  const response = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { categoryId } }),
  });
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.vocabulariesByCategory;
}

// API lấy tất cả vocabularies
export async function getAllVocabularies() {
  const query = `
    query {
      vocabularies {
        id
        kanji
        hiragana
        definition
        translation
        category {
          id
          name
        }
      }
    }
  `;
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;
  const response = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.vocabularies;
}

// API tạo vocabulary mới
export async function createVocabulary(input: {
  kanji: string;
  hiragana: string;
  definition: string;
  example?: string;
  translation: string;
  categoryId: number;
}) {
  const mutation = `
    mutation CreateVocabulary($input: CreateVocabularyInput!) {
      createVocabulary(input: $input) {
        id
        definition
        translation
      }
    }
  `;
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;
  const response = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: mutation, variables: { input } }),
  });
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.createVocabulary;
}

// API xóa vocabulary
export async function removeVocabulary(id: number) {
  const mutation = `
    mutation RemoveVocabulary($id: Int!) {
      removeVocabulary(id: $id) {
        id
        kanji
        hiragana
        definition
        translation
      }
    }
  `;
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;
  const response = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: mutation, variables: { id } }),
  });
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.removeVocabulary;
}

// API import CSV từ file cho category
export async function importVocabularyCsv(file: File, categoryId: number) {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;
  const query = `
    mutation($file: Upload!, $categoryId: Int!) {
      importVocabularyCsv(file: $file, categoryId: $categoryId)
    }
  `;
  const operations = JSON.stringify({
    query,
    variables: {
      file: null,
      categoryId: Number(categoryId),
    },
  });
  const map = JSON.stringify({
    "0": ["variables.file"],
  });
  const formData = new FormData();
  formData.append("operations", operations);
  formData.append("map", map);
  formData.append("0", file);
  const response = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    body: formData,
  });
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.importVocabularyCsv;
}

// API cập nhật trạng thái đã thuộc của từ vựng
export async function updateVocabularyStatus(input: {
  id: number;
  is_learned: boolean;
}) {
  const mutation = `
    mutation UpdateVocabularyStatus($input: UpdateVocabularyStatusInput!) {
      updateVocabularyStatus(input: $input) {
        id
        is_learned
      }
    }
  `;
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;
  const response = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query: mutation, variables: { input } }),
  });
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.updateVocabularyStatus;
}

// API lấy vocabularies theo nhiều categoryId
export async function fetchVocabulariesByCategoryIds(categoryIds: number[]) {
  const query = `
    query GetVocabularies($categoryIds: [Int!]) {
     vocabulariesByConditions(categoryIds: $categoryIds) {
      id 
      kanji
      hiragana
      definition
      example
      translation 
      is_learned
      category {
       id
       name
      }
      }
    }
  `;
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;
  const response = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: { categoryIds },
    }),
  });
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.vocabulariesByConditions;
}
