/**
 * Constants for Admin Dictionary Page
 */

export const JLPT_LEVELS = ["N5", "N4", "N3", "N2", "N1"] as const;

export const WORD_TYPES = [
  { value: "noun", label: "Danh từ (名詞)" },
  { value: "verb", label: "Động từ (動詞)" },
  { value: "adjective", label: "Tính từ (形容詞)" },
  { value: "adverb", label: "Phó từ (副詞)" },
  { value: "conjunction", label: "Liên từ (接続詞)" },
  { value: "interjection", label: "Thán từ (感動詞)" },
] as const;

export const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50] as const;

export const DEFAULT_ITEMS_PER_PAGE = 10;

export const AI_WORD_COUNT_MIN = 1;
export const AI_WORD_COUNT_MAX = 20;
export const DEFAULT_AI_WORD_COUNT = 5;
