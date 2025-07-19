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
  Array<{ id: string; name: string; nameJp: string; description: string }>
> {
  const query = `
    query {
      categories {
        count
        items {
          id
          name
          nameJp
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
  return result.data.categories;
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
