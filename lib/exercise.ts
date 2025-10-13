const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  type:
    | "KANJI_SELECTION"
    | "HIRAGANA"
    | "VOCABULARY"
    | "SYNONYMS_ANTONYMS"
    | "CONTEXTUAL_WORDS"
    | "GRAMMAR"
    | "JLPT_FORMAT";
  level: "N1" | "N2" | "N3" | "N4" | "N5";
  explanation?: string;
}

export interface QuestionListResponse {
  data: Question[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export async function getQuestions(
  page = 1,
  pageSize = 5,
  search?: string,
  sortBy?: string,
  sortOrder: "asc" | "desc" = "asc",
  levelFilter?: string[],
  typeFilter?: string[]
) {
  const query = `
    query GetQuestions(
      $page: Int,
      $pageSize: Int,
      $search: String,
      $sortBy: String,
      $sortOrder: String,
      $levelFilter: [String!],
      $typeFilter: [String!]
    ) {
      questions(
        page: $page,
        pageSize: $pageSize,
        search: $search,
        sortBy: $sortBy,
        sortOrder: $sortOrder,
        levelFilter: $levelFilter,
        typeFilter: $typeFilter
      ) {
        data {
          id
          question
          options
          correctAnswer
          type
          level
          explanation
        }
        total
        page
        pageSize
        hasNextPage
        hasPrevPage
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
  return json.data.questions;
}

export async function getQuestion(id: number) {
  const query = `
    query GetQuestion($id: Int!) {
      question(id: $id) {
        id
        question
        options
        correctAnswer
        type
        level
        explanation
      }
    }
  `;
  const variables = { id };
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  return json.data.question;
}

export async function createQuestion(input: Omit<Question, "id">) {
  const query = `
    mutation CreateQuestion($input: CreateQuestionInput!) {
      createQuestion(createQuestionInput: $input) {
        id
        question
        options
        correctAnswer
        type
        level
        explanation
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
  return json.data.createQuestion;
}

export async function updateQuestion(input: Question) {
  const query = `
    mutation UpdateQuestion($input: UpdateQuestionInput!) {
      updateQuestion(updateQuestionInput: $input) {
        id
        question
        options
        correctAnswer
        type
        level
        explanation
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
  return json.data.updateQuestion;
}

export async function removeQuestion(id: number) {
  const query = `
    mutation RemoveQuestion($id: Int!) {
      removeQuestion(id: $id) {
        id
        question
      }
    }
  `;
  const variables = { id };
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  return json.data.removeQuestion;
}

export async function getRandomQuestion(
  level: string,
  count: number,
  typeFilter?: string[]
) {
  const query = `
    query GetRandomQuestion($level: EnumLevel!, $count: Int!, $typeFilter: [String!]) {
      getRandomQuestion(level: $level, count: $count, typeFilter: $typeFilter) {
        id
        question
        options
        correctAnswer
        type
        level
        explanation
      }
    }
  `;
  const variables = { level, count, typeFilter };
  const res = await fetch(`${API_URL}/graphql`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  return json.data.getRandomQuestion;
}

export async function importQuestionCsv(file: File): Promise<string> {
  const formData = new FormData();
  formData.append(
    "operations",
    JSON.stringify({
      query: `mutation ImportCsv($file: Upload!) { importQuestionCsv(file: $file) }`,
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
  if (json.errors) {
    throw new Error(json.errors[0]?.message || "Lỗi không xác định");
  }
  return json.data.importQuestionCsv;
}
