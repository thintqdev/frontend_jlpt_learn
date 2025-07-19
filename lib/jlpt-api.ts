const API_BASE_URL = "https://jlpt-vocab-api.vercel.app/api";

export interface JLPTWord {
  word: string;
  meaning: string;
  furigana: string;
  level: number;
}

export class JLPTApi {
  static async getAllWords(level?: number): Promise<JLPTWord[]> {
    try {
      const url = level
        ? `${API_BASE_URL}/words/all?level=${level}`
        : `${API_BASE_URL}/words/all`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch words");
      return await response.json();
    } catch (error) {
      console.error("Error fetching all words:", error);
      return [];
    }
  }

  static async getWords(params?: {
    word?: string;
    level?: number;
    offset?: number;
    limit?: number;
  }): Promise<JLPTWord[]> {
    try {
      const searchParams = new URLSearchParams();
      if (params?.word) searchParams.append("word", params.word);
      if (params?.level) searchParams.append("level", params.level.toString());
      if (params?.offset)
        searchParams.append("offset", params.offset.toString());
      if (params?.limit) searchParams.append("limit", params.limit.toString());

      const url = `${API_BASE_URL}/words${
        searchParams.toString() ? "?" + searchParams.toString() : ""
      }`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch words");
      return await response.json();
    } catch (error) {
      console.error("Error fetching words:", error);
      return [];
    }
  }

  static async getRandomWords(level?: number, count = 10): Promise<JLPTWord[]> {
    try {
      const words: JLPTWord[] = [];
      for (let i = 0; i < count; i++) {
        const url = level
          ? `${API_BASE_URL}/words/random?level=${level}`
          : `${API_BASE_URL}/words/random`;
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch random word");
        const word = await response.json();
        words.push(word);
      }
      return words;
    } catch (error) {
      console.error("Error fetching random words:", error);
      return [];
    }
  }

  static async searchWord(word: string): Promise<JLPTWord[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/words?word=${encodeURIComponent(word)}`
      );
      if (!response.ok) throw new Error("Failed to search word");
      const result = await response.json();
      return Array.isArray(result) ? result : [result];
    } catch (error) {
      console.error("Error searching word:", error);
      return [];
    }
  }

  // Helper functions for level mapping
  static getLevelName(level: number): string {
    // API: level 1 = N1, level 2 = N2, level 3 = N3, level 4 = N4, level 5 = N5
    switch (level) {
      case 1:
        return "N1";
      case 2:
        return "N2";
      case 3:
        return "N3";
      case 4:
        return "N4";
      case 5:
        return "N5";
      default:
        return `Level ${level}`;
    }
  }

  static getLevelColor(level: number): string {
    switch (level) {
      case 1:
        return "bg-red-100 text-red-700"; // N1 - Cao cấp
      case 2:
        return "bg-orange-100 text-orange-700"; // N2 - Trung cao
      case 3:
        return "bg-yellow-100 text-yellow-700"; // N3 - Trung cấp
      case 4:
        return "bg-blue-100 text-blue-700"; // N4 - Sơ cấp
      case 5:
        return "bg-green-100 text-green-700"; // N5 - Cơ bản
      default:
        return "bg-gray-100 text-gray-700";
    }
  }

  static getLevelDescription(level: number): string {
    switch (level) {
      case 1:
        return "Cao cấp";
      case 2:
        return "Trung cao";
      case 3:
        return "Trung cấp";
      case 4:
        return "Sơ cấp";
      case 5:
        return "Cơ bản";
      default:
        return "Không xác định";
    }
  }
}
