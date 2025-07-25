// Interface cho input khi tạo hội thoại
export interface CreateConversationInput {
    title: string;
    level: string;
    category: string;
    duration?: string;
    conversation: any; // dạng JSON hoặc object[]
  }
  
  // Interface cho hội thoại
  export interface Conversation {
    id: number;
    title: string;
    level: string;
    category: string;
    duration?: string;
    conversation: any;
  }
  
  // Create one conversation
  export async function createConversation(input: CreateConversationInput): Promise<Conversation> {
    const mutation = `
      mutation CreateConversation($input: CreateConversationInput!) {
        createConversation(input: $input) {
          id
          title
          level
          category
          duration
          conversation
        }
      }
    `;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;
  
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
    return result.data.createConversation;
  }
  
// Get all conversations paginated
export async function fetchConversations(
  params?: { search?: string; sort?: "asc" | "desc"; page?: number; pageSize?: number }
): Promise<Conversation[]> {
  const { search = "", sort = "desc", page = 1, pageSize = 100 } = params || {}; // pageSize mặc định lớn hơn

  const query = `
    query Conversations($search: String, $sort: String, $page: Int, $pageSize: Int) {
      conversations(search: $search, sort: $sort, page: $page, pageSize: $pageSize) {
        id
        title
        level
        category
        duration
        conversation
      }
    }
  `;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const response = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query,
      variables: {
        search: search || null,
        sort: sort || null,
        page,
        pageSize,
      },
    }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.conversations;
}
  
  // Get one conversation by ID
  export async function getConversationById(id: number): Promise<Conversation> {
    const query = `
      query($id: Int!) {
        conversation(id: $id) {
          id
          title
          level
          category
          duration
          conversation
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
    return result.data.conversation;
  }
  
  // Update a conversation
  export async function updateConversation(id: number, input: Partial<CreateConversationInput>): Promise<Conversation> {
    const mutation = `
      mutation UpdateConversation($id: Int!, $input: UpdateConversationInput!) {
        updateConversation(id: $id, input: $input) {
          id
          title
          level
          category
          duration
          conversation
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
    return result.data.updateConversation;
  }
  
  // Delete a conversation
  export async function deleteConversation(id: number): Promise<Conversation> {
    const mutation = `
      mutation($id: Int!) {
        removeConversation(id: $id) {
          id
          title
        }
      }
    `;
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
    const response = await fetch(`${apiUrl}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query: mutation, variables: { id } }),
    });
  
    const result = await response.json();
    if (result.errors) throw new Error(result.errors[0].message);
    return result.data.removeConversation;
  }
  
  // Thêm hàm import nhiều hội thoại bằng JSON (dùng mutation createConversationJson)
export async function createConversationJson(jsonString: string): Promise<boolean> {
  const mutation = `
    mutation CreateConversationJson($input: CreateConversationJsonInput!) {
      createConversationJson(input: $input)
    }
  `;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;

  const response = await fetch(`${apiUrl}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      query: mutation,
      variables: { input: { input: jsonString } },
    }),
  });

  const result = await response.json();
  if (result.errors) throw new Error(result.errors[0].message);
  return result.data.createConversationJson;
}