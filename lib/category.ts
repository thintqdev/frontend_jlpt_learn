// Interface cho input của mutation createCategory
export interface CreateCategoryInput {
  name: string;
  nameJp: string;
  slug: string;
  level: string;
  description: string;
}

// Interface cho output của mutation createCategory
export interface Category {
  id: string;
  name: string;
  nameJp: string;
  slug: string;
}

import { categoryCache } from "./cache";

export async function createCategory(input: {
  name: string;
  nameJp: string;
  level: string;
  description: string;
}) {
  const slug = input.name.toLowerCase().replace(/\s+/g, "-");
  const mutation = `
    mutation CreateCategory($input: CreateCategoryInput!) {
      createCategory(input: $input) {
        name
        nameJp
        slug
        level
        description
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
      variables: {
        input: {
          name: input.name,
          nameJp: input.nameJp,
          slug: slug,
          level: input.level,
          description: input.description,
        },
      },
    }),
  });
  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data.createCategory;
}

// Lấy danh sách category rút gọn (id, name, nameJp, description)
export async function fetchShortCategories(): Promise<
  Array<{
    id: string;
    name: string;
    nameJp: string;
    level: string;
    description: string;
  }>
> {
  const cacheKey = "categories_short";

  // Check cache first
  const cached = categoryCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const query = `
    query {
      categories {
        count
        items {
          id
          name
          nameJp
          level
          description
        }
      }
    }
  `;
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const result = await response.json();
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }

  const data = result.data.categories;
  categoryCache.set(cacheKey, data.items);
  return data.items;
}
// ... existing code ...

export async function getCategoryById(categoryId: string | number) {
  const query = `
    query($id: Int!) {
      category(id: $id) {
        id
        name
        nameJp
        level
        description
        words {
          id
          kanji
          hiragana
          definition
          translation
          example
          is_learned
        }
      }
    }
  `;
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;
  const response = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { id: Number(categoryId) } }),
  });
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.category;
}

export async function importCategoryJson(jsonData: string) {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;
  const mutation = `
    mutation ImportVocabularyJson($input: String!) {
      importVocabularyJson(input: $input)
    }
  `;
  const response = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: mutation,
      variables: { input: jsonData },
    }),
  });
  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.importVocabularyJson;
}

export async function importCategoryCsv(file: File) {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;
  const query = `
    mutation($file: Upload!) {
      importCategoryCsv(file: $file)
    }
  `;
  const operations = JSON.stringify({
    query,
    variables: {
      file: null,
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
  return result.data.importCategoryCsv;
}

export async function removeCategory(id: number) {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;
  const mutation = `
    mutation RemoveCategory($id: Int!) {
      removeCategory(id: $id) {
        id
        name
        nameJp
        level
        description
      }
    }
  `;
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
  return result.data.removeCategory;
}
