"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Plus, Sparkles, Edit, Trash2, Save, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import AdminNav from "@/components/admin-nav";

type Dictionary = {
  id: string;
  word: string;
  reading: string;
  meanings: string[];
  examples: string;
  type: string;
  level: string;
};

// Fake data cho categories (loại từ)
const fakeCategories = [
  {
    id: "noun",
    name: "Danh từ",
    nameJp: "名詞",
    level: "N5",
    description: "Các danh từ trong tiếng Nhật",
  },
  {
    id: "verb",
    name: "Động từ",
    nameJp: "動詞",
    level: "N5",
    description: "Các động từ trong tiếng Nhật",
  },
  {
    id: "adj-i",
    name: "Tính từ -i",
    nameJp: "形容詞",
    level: "N5",
    description: "Các tính từ kết thúc bằng -i",
  },
  {
    id: "adj-na",
    name: "Tính từ -na",
    nameJp: "形容動詞",
    level: "N5",
    description: "Các tính từ kết thúc bằng -na",
  },
  {
    id: "adv",
    name: "Phó từ",
    nameJp: "副詞",
    level: "N5",
    description: "Các phó từ trong tiếng Nhật",
  },
  {
    id: "conj",
    name: "Liên từ",
    nameJp: "接続詞",
    level: "N5",
    description: "Các liên từ kết nối câu",
  },
  {
    id: "interj",
    name: "Thán từ",
    nameJp: "感動詞",
    level: "N5",
    description: "Các thán từ biểu cảm",
  },
];

// Fake data cho dictionary
const fakeDictionaries: Record<string, Dictionary[]> = {
  noun: [
    {
      id: "1",
      word: "家族",
      reading: "かぞく",
      meanings: ["gia đình"],
      examples: "私の家族は4人です。",
      type: "noun",
      level: "N5",
    },
    {
      id: "2",
      word: "食べ物",
      reading: "たべもの",
      meanings: ["đồ ăn"],
      examples: "日本料理は美味しい食べ物です。",
      type: "noun",
      level: "N5",
    },
    {
      id: "3",
      word: "時間",
      reading: "じかん",
      meanings: ["thời gian"],
      examples: "時間がありません。",
      type: "noun",
      level: "N5",
    },
    {
      id: "4",
      word: "学校",
      reading: "がっこう",
      meanings: ["trường học"],
      examples: "学校に行きます。",
      type: "noun",
      level: "N5",
    },
    {
      id: "5",
      word: "学生",
      reading: "がくせい",
      meanings: ["sinh viên"],
      examples: "私は学生です。",
      type: "noun",
      level: "N5",
    },
  ],
  verb: [
    {
      id: "6",
      word: "食べる",
      reading: "たべる",
      meanings: ["ăn"],
      examples: "ご飯を食べます。",
      type: "verb",
      level: "N5",
    },
    {
      id: "7",
      word: "飲む",
      reading: "のむ",
      meanings: ["uống"],
      examples: "水を飲みます。",
      type: "verb",
      level: "N5",
    },
    {
      id: "8",
      word: "見る",
      reading: "みる",
      meanings: ["nhìn", "xem"],
      examples: "テレビを見ます。",
      type: "verb",
      level: "N5",
    },
    {
      id: "9",
      word: "聞く",
      reading: "きく",
      meanings: ["nghe"],
      examples: "音楽を聞きます。",
      type: "verb",
      level: "N5",
    },
    {
      id: "10",
      word: "話す",
      reading: "はなす",
      meanings: ["nói"],
      examples: "日本語を話します。",
      type: "verb",
      level: "N5",
    },
  ],
  "adj-i": [
    {
      id: "11",
      word: "大きい",
      reading: "おおきい",
      meanings: ["lớn"],
      examples: "大きい家です。",
      type: "adj-i",
      level: "N5",
    },
    {
      id: "12",
      word: "小さい",
      reading: "ちいさい",
      meanings: ["nhỏ"],
      examples: "小さい犬です。",
      type: "adj-i",
      level: "N5",
    },
    {
      id: "13",
      word: "新しい",
      reading: "あたらしい",
      meanings: ["mới"],
      examples: "新しい車です。",
      type: "adj-i",
      level: "N5",
    },
    {
      id: "14",
      word: "古い",
      reading: "ふるい",
      meanings: ["cũ"],
      examples: "古い本です。",
      type: "adj-i",
      level: "N5",
    },
    {
      id: "15",
      word: "良い",
      reading: "よい",
      meanings: ["tốt"],
      examples: "良い天気です。",
      type: "adj-i",
      level: "N5",
    },
  ],
  "adj-na": [
    {
      id: "16",
      word: "きれい",
      reading: "きれい",
      meanings: ["đẹp"],
      examples: "きれいな花です。",
      type: "adj-na",
      level: "N5",
    },
    {
      id: "17",
      word: "静か",
      reading: "しずか",
      meanings: ["yên tĩnh"],
      examples: "静かな部屋です。",
      type: "adj-na",
      level: "N5",
    },
    {
      id: "18",
      word: "便利",
      reading: "べんり",
      meanings: ["tiện lợi"],
      examples: "便利な道具です。",
      type: "adj-na",
      level: "N5",
    },
    {
      id: "19",
      word: "好き",
      reading: "すき",
      meanings: ["thích"],
      examples: "音楽が好きです。",
      type: "adj-na",
      level: "N5",
    },
    {
      id: "20",
      word: "簡単",
      reading: "かんたん",
      meanings: ["đơn giản"],
      examples: "簡単な問題です。",
      type: "adj-na",
      level: "N5",
    },
  ],
  adv: [
    {
      id: "21",
      word: "とても",
      reading: "とても",
      meanings: ["rất"],
      examples: "とても大きいです。",
      type: "adv",
      level: "N5",
    },
    {
      id: "22",
      word: "よく",
      reading: "よく",
      meanings: ["thường"],
      examples: "よく勉強します。",
      type: "adv",
      level: "N5",
    },
    {
      id: "23",
      word: "少し",
      reading: "すこし",
      meanings: ["một chút"],
      examples: "少し待ってください。",
      type: "adv",
      level: "N5",
    },
    {
      id: "24",
      word: "いつも",
      reading: "いつも",
      meanings: ["luôn luôn"],
      examples: "いつもありがとう。",
      type: "adv",
      level: "N5",
    },
    {
      id: "25",
      word: "早く",
      reading: "はやく",
      meanings: ["sớm", "nhanh"],
      examples: "早く来てください。",
      type: "adv",
      level: "N5",
    },
  ],
  conj: [
    {
      id: "26",
      word: "そして",
      reading: "そして",
      meanings: ["và"],
      examples: "勉強して、そして遊びます。",
      type: "conj",
      level: "N5",
    },
    {
      id: "27",
      word: "だから",
      reading: "だから",
      meanings: ["vì vậy"],
      examples: "雨が降る。だから傘を持って行きます。",
      type: "conj",
      level: "N5",
    },
    {
      id: "28",
      word: "しかし",
      reading: "しかし",
      meanings: ["nhưng"],
      examples: "好きですが、しかし買えません。",
      type: "conj",
      level: "N5",
    },
    {
      id: "29",
      word: "それから",
      reading: "それから",
      meanings: ["sau đó"],
      examples: "勉強して、それから遊びます。",
      type: "conj",
      level: "N5",
    },
    {
      id: "30",
      word: "または",
      reading: "または",
      meanings: ["hoặc"],
      examples: "コーヒーまたはお茶をどうぞ。",
      type: "conj",
      level: "N5",
    },
  ],
  interj: [
    {
      id: "31",
      word: "はい",
      reading: "はい",
      meanings: ["vâng"],
      examples: "はい、そうです。",
      type: "interj",
      level: "N5",
    },
    {
      id: "32",
      word: "いいえ",
      reading: "いいえ",
      meanings: ["không"],
      examples: "いいえ、違います。",
      type: "interj",
      level: "N5",
    },
    {
      id: "33",
      word: "わあ",
      reading: "わあ",
      meanings: ["ồ"],
      examples: "わあ、すごい！",
      type: "interj",
      level: "N5",
    },
    {
      id: "34",
      word: "あら",
      reading: "あら",
      meanings: ["ồ (bất ngờ)"],
      examples: "あら、雨が降っています。",
      type: "interj",
      level: "N5",
    },
    {
      id: "35",
      word: "ええ",
      reading: "ええ",
      meanings: ["ừ", "vâng (tiếng Kansai)"],
      examples: "ええ、そうやね。",
      type: "interj",
      level: "N5",
    },
  ],
};

export default function AdminDictionaryPage() {
  const LEVELS = ["N5", "N4", "N3", "N2", "N1"];
  const WORD_TYPES = [
    { value: "noun", label: "Danh từ (名詞)" },
    { value: "verb", label: "Động từ (動詞)" },
    { value: "adj-i", label: "Tính từ -i (形容詞)" },
    { value: "adj-na", label: "Tính từ -na (形容動詞)" },
    { value: "adv", label: "Phó từ (副詞)" },
    { value: "conj", label: "Liên từ (接続詞)" },
    { value: "interj", label: "Thán từ (感動詞)" },
  ];
  const [categories, setCategories] = useState(fakeCategories);
  const [filterType, setFilterType] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [search, setSearch] = useState("");
  const [dictionaries, setDictionaries] = useState<Dictionary[]>([]);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [newMeanings, setNewMeanings] = useState<string[]>([""]);
  const [newReading, setNewReading] = useState("");
  const [newExamples, setNewExamples] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWord, setEditingWord] = useState<Dictionary | null>(null);
  const [wordType, setWordType] = useState("noun");
  const [level, setLevel] = useState("N5");
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiWordCount, setAiWordCount] = useState(5);
  const [showAIPreviewModal, setShowAIPreviewModal] = useState(false);
  const [aiGeneratedWords, setAiGeneratedWords] = useState<Dictionary[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    // Load all dictionaries
    setLoading(true);
    setTimeout(() => {
      const allDictionaries = Object.values(fakeDictionaries).flat();
      setDictionaries(allDictionaries);
      setLoading(false);
    }, 500);
  }, []);

  const handleAddDictionary = async () => {
    if (!newWord || newMeanings.filter((m) => m.trim()).length === 0) return;
    setLoading(true);

    // Simulate adding dictionary
    const newDict = {
      id: Date.now().toString(),
      word: newWord,
      reading: newReading,
      meanings: newMeanings.filter((m) => m.trim()),
      examples: newExamples,
      type: wordType,
      level,
    };

    setTimeout(() => {
      setDictionaries((prev) => [...prev, newDict]);
      setNewWord("");
      setNewMeanings([""]);
      setNewReading("");
      setNewExamples("");
      setLoading(false);
    }, 500);
  };

  const handleAIGenerate = async () => {
    if (!level || !wordType || !aiWordCount) return;
    setAiLoading(true);

    // Simulate AI generation
    setTimeout(() => {
      const aiWords = {
        noun: [
          { word: "学校", reading: "がっこう", meaning: "trường học" },
          { word: "学生", reading: "がくせい", meaning: "sinh viên" },
          { word: "先生", reading: "せんせい", meaning: "giáo viên" },
          { word: "会社", reading: "かいしゃ", meaning: "công ty" },
          { word: "友達", reading: "ともだち", meaning: "bạn bè" },
          { word: "本", reading: "ほん", meaning: "sách" },
          { word: "水", reading: "みず", meaning: "nước" },
          { word: "食べ物", reading: "たべもの", meaning: "đồ ăn" },
        ],
        verb: [
          { word: "行く", reading: "いく", meaning: "đi" },
          { word: "来る", reading: "くる", meaning: "đến" },
          { word: "する", reading: "する", meaning: "làm" },
          { word: "見る", reading: "みる", meaning: "nhìn" },
          { word: "食べる", reading: "たべる", meaning: "ăn" },
          { word: "飲む", reading: "のむ", meaning: "uống" },
          { word: "話す", reading: "はなす", meaning: "nói" },
          { word: "聞く", reading: "きく", meaning: "nghe" },
        ],
        "adj-i": [
          { word: "高い", reading: "たかい", meaning: "cao/đắt" },
          { word: "低い", reading: "ひくい", meaning: "thấp" },
          { word: "速い", reading: "はやい", meaning: "nhanh" },
          { word: "遅い", reading: "おそい", meaning: "chậm" },
          { word: "大きい", reading: "おおきい", meaning: "lớn" },
          { word: "小さい", reading: "ちいさい", meaning: "nhỏ" },
          { word: "新しい", reading: "あたらしい", meaning: "mới" },
          { word: "古い", reading: "ふるい", meaning: "cũ" },
        ],
        "adj-na": [
          { word: "きれい", reading: "きれい", meaning: "đẹp" },
          { word: "静か", reading: "しずか", meaning: "yên tĩnh" },
          { word: "便利", reading: "べんり", meaning: "tiện lợi" },
          { word: "好き", reading: "すき", meaning: "thích" },
          { word: "簡単", reading: "かんたん", meaning: "đơn giản" },
          { word: "難しい", reading: "むずかしい", meaning: "khó" },
          { word: "有名", reading: "ゆうめい", meaning: "nổi tiếng" },
          { word: "必要", reading: "ひつよう", meaning: "cần thiết" },
        ],
        adv: [
          { word: "とても", reading: "とても", meaning: "rất" },
          { word: "よく", reading: "よく", meaning: "thường" },
          { word: "少し", reading: "すこし", meaning: "một chút" },
          { word: "いつも", reading: "いつも", meaning: "luôn luôn" },
          { word: "早く", reading: "はやく", meaning: "sớm/nhanh" },
          { word: "ゆっくり", reading: "ゆっくり", meaning: "chậm rãi" },
          { word: "すぐ", reading: "すぐ", meaning: "ngay lập tức" },
          { word: "まだ", reading: "まだ", meaning: "vẫn còn" },
        ],
        conj: [
          { word: "そして", reading: "そして", meaning: "và" },
          { word: "だから", reading: "だから", meaning: "vì vậy" },
          { word: "しかし", reading: "しかし", meaning: "nhưng" },
          { word: "それから", reading: "それから", meaning: "sau đó" },
          { word: "または", reading: "または", meaning: "hoặc" },
          { word: "でも", reading: "でも", meaning: "nhưng" },
          { word: "それとも", reading: "それとも", meaning: "hay là" },
          { word: "つまり", reading: "つまり", meaning: "tức là" },
        ],
        interj: [
          { word: "はい", reading: "はい", meaning: "vâng" },
          { word: "いいえ", reading: "いいえ", meaning: "không" },
          { word: "わあ", reading: "わあ", meaning: "ồ" },
          { word: "あら", reading: "あら", meaning: "ồ (bất ngờ)" },
          { word: "ええ", reading: "ええ", meaning: "ừ/vâng (tiếng Kansai)" },
          { word: "あれ", reading: "あれ", meaning: "ồ (ngạc nhiên)" },
          { word: "すごい", reading: "すごい", meaning: "tuyệt vời" },
          { word: "まあ", reading: "まあ", meaning: "thôi/thế nào" },
        ],
      };

      const wordPool = aiWords[wordType as keyof typeof aiWords] || [];
      const generatedWords: Dictionary[] = [];
      const usedWords = new Set();

      // Generate unique words up to the requested count
      for (let i = 0; i < aiWordCount && wordPool.length > 0; i++) {
        let randomWord;
        let attempts = 0;
        do {
          randomWord = wordPool[Math.floor(Math.random() * wordPool.length)];
          attempts++;
        } while (usedWords.has(randomWord.word) && attempts < wordPool.length);

        if (!usedWords.has(randomWord.word)) {
          usedWords.add(randomWord.word);
          generatedWords.push({
            id: `ai-${Date.now()}-${i}`,
            word: randomWord.word,
            reading: randomWord.reading,
            meanings: [randomWord.meaning],
            examples: `例: ${randomWord.word}は${randomWord.meaning}です。`,
            type: wordType,
            level,
          });
        }
      }

      // Show preview modal instead of adding directly
      setAiGeneratedWords(generatedWords);
      setShowAIModal(false);
      setShowAIPreviewModal(true);
      setAiLoading(false);
    }, 1500);
  };

  const handleEditWord = (word: Dictionary) => {
    setEditingWord(word);
    setNewWord(word.word);
    setNewReading(word.reading);
    setNewMeanings([...word.meanings]);
    setNewExamples(word.examples);
    setWordType(word.type);
    setLevel(word.level);
    setShowAddForm(true);
  };

  const handleUpdateWord = async () => {
    if (
      !editingWord ||
      !newWord ||
      newMeanings.filter((m) => m.trim()).length === 0
    )
      return;
    setLoading(true);

    // Simulate updating dictionary
    setTimeout(() => {
      setDictionaries((prev) =>
        prev.map((v) =>
          v.id === editingWord.id
            ? {
                ...v,
                word: newWord,
                reading: newReading,
                meanings: newMeanings.filter((m) => m.trim()),
                examples: newExamples,
                type: wordType,
                level,
              }
            : v
        )
      );
      setShowAddForm(false);
      setEditingWord(null);
      resetForm();
      setLoading(false);
    }, 500);
  };

  const handleDeleteDictionary = async (id: string) => {
    setLoading(true);

    // Simulate deleting dictionary
    setTimeout(() => {
      setDictionaries((prev) => prev.filter((v) => v.id !== id));
      setLoading(false);
    }, 500);
  };

  const handleConfirmAIGeneratedWords = async () => {
    setLoading(true);
    // Simulate adding AI generated words
    setTimeout(() => {
      setDictionaries((prev) => [...prev, ...aiGeneratedWords]);
      setShowAIPreviewModal(false);
      setAiGeneratedWords([]);
      setLoading(false);
    }, 500);
  };

  const resetForm = () => {
    setNewWord("");
    setNewMeanings([""]);
    setNewReading("");
    setNewExamples("");
    setWordType("noun");
    setLevel("N5");
  };

  const filteredDictionaries = dictionaries.filter((v) => {
    const matchesSearch = search
      ? v.word.includes(search) ||
        v.meanings.some((m) => m.includes(search)) ||
        v.reading.includes(search)
      : true;
    const matchesType = filterType === "all" || v.type === filterType;
    const matchesLevel = filterLevel === "all" || v.level === filterLevel;
    return matchesSearch && matchesType && matchesLevel;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredDictionaries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDictionaries = filteredDictionaries.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterType, filterLevel]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        <AdminNav />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin | Từ điển tiếng Nhật
          </h1>
          <p className="text-gray-600">
            Quản lý từ vựng theo loại từ và cấp độ JLPT. Hỗ trợ AI tạo từ vựng
            tự động và quản lý danh mục chuyên nghiệp.
          </p>
        </div>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Bộ lọc và tìm kiếm</CardTitle>
                <CardDescription>
                  Lọc từ vựng theo loại từ và cấp độ JLPT
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm từ
                </Button>
                <Dialog open={showAIModal} onOpenChange={setShowAIModal}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Sparkles className="w-4 h-4 mr-2" />
                      AI tạo từ
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Tạo từ vựng bằng AI</DialogTitle>
                      <DialogDescription>
                        Chọn loại từ, cấp độ và số lượng từ muốn tạo
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Loại từ
                          </label>
                          <Select value={wordType} onValueChange={setWordType}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {WORD_TYPES.map((t) => (
                                <SelectItem key={t.value} value={t.value}>
                                  {t.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Cấp độ
                          </label>
                          <Select value={level} onValueChange={setLevel}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {LEVELS.map((l) => (
                                <SelectItem key={l} value={l}>
                                  {l}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Số từ muốn tạo
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="20"
                          value={aiWordCount}
                          onChange={(e) =>
                            setAiWordCount(parseInt(e.target.value) || 1)
                          }
                          placeholder="Nhập số từ (1-20)"
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button
                          onClick={handleAIGenerate}
                          disabled={aiLoading}
                          className="flex-1"
                        >
                          {aiLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Đang tạo...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              Tạo {aiWordCount} từ
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowAIModal(false)}
                        >
                          Hủy
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-64">
                <label className="text-sm font-medium mb-2 block">
                  Tìm kiếm
                </label>
                <Input
                  placeholder="Tìm theo từ vựng, nghĩa hoặc cách đọc..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="min-w-32">
                <label className="text-sm font-medium mb-2 block">
                  Loại từ
                </label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại từ</SelectItem>
                    {WORD_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-24">
                <label className="text-sm font-medium mb-2 block">Cấp độ</label>
                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả cấp</SelectItem>
                    {LEVELS.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Add/Edit Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingWord ? "Sửa từ vựng" : "Thêm từ mới"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <Input
                  placeholder="Từ vựng (Kanji/Kana)"
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                />
                <Input
                  placeholder="Cách đọc (hiragana/katakana)"
                  value={newReading}
                  onChange={(e) => setNewReading(e.target.value)}
                />
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-2 block">
                    Nghĩa tiếng Việt
                  </label>
                  <div className="space-y-2">
                    {newMeanings.map((meaning, index) => (
                      <div key={index} className="flex gap-2">
                        <Input
                          placeholder={`Nghĩa ${index + 1}`}
                          value={meaning}
                          onChange={(e) => {
                            const updated = [...newMeanings];
                            updated[index] = e.target.value;
                            setNewMeanings(updated);
                          }}
                        />
                        {newMeanings.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const updated = newMeanings.filter(
                                (_, i) => i !== index
                              );
                              setNewMeanings(updated);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setNewMeanings([...newMeanings, ""])}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm nghĩa
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={wordType} onValueChange={setWordType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WORD_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Input
                placeholder="Ví dụ (không bắt buộc)"
                value={newExamples}
                onChange={(e) => setNewExamples(e.target.value)}
                className="mb-4"
              />
              <div className="flex gap-2">
                <Button
                  onClick={editingWord ? handleUpdateWord : handleAddDictionary}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="animate-spin mr-2">
                      <Save className="h-4 w-4" />
                    </span>
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {loading ? "Đang lưu..." : "Lưu"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingWord(null);
                    resetForm();
                  }}
                >
                  <X className="h-4 w-4 mr-2" />
                  Huỷ
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Preview Modal */}
        <Dialog open={showAIPreviewModal} onOpenChange={setShowAIPreviewModal}>
          <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Xem trước từ vựng được tạo</DialogTitle>
              <DialogDescription>
                Xem và xác nhận các từ vựng được tạo bởi AI trước khi thêm vào
                danh sách
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                <p>
                  <strong>Loại từ:</strong>{" "}
                  {WORD_TYPES.find((t) => t.value === wordType)?.label}
                </p>
                <p>
                  <strong>Cấp độ:</strong> {level}
                </p>
                <p>
                  <strong>Số từ:</strong> {aiGeneratedWords.length}
                </p>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {aiGeneratedWords.map((word, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-gray-900">
                        {word.word}
                      </span>
                      <span className="text-gray-600">({word.reading})</span>
                      <Badge variant="outline" className="text-xs">
                        {WORD_TYPES.find((t) => t.value === word.type)?.label}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {word.level}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-700">
                      {word.meanings.join(", ")}
                    </div>
                    {word.examples && (
                      <div className="text-xs text-gray-500 mt-1 bg-white p-2 rounded">
                        {word.examples}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-4 border-t">
                <Button
                  onClick={handleConfirmAIGeneratedWords}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm vào danh sách ({aiGeneratedWords.length} từ)
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowAIPreviewModal(false);
                    setAiGeneratedWords([]);
                  }}
                >
                  Hủy
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dictionary List */}
        <div className="bg-white rounded-lg border">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold">
              Danh sách từ vựng ({filteredDictionaries.length} từ - Trang{" "}
              {currentPage}/{totalPages})
            </h3>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                <p className="mt-2 text-gray-500">Đang tải...</p>
              </div>
            ) : currentDictionaries.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">📚</div>
                <p>Không tìm thấy từ vựng nào</p>
                <p className="text-sm mt-2">
                  Hãy thử thay đổi bộ lọc hoặc thêm từ mới
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentDictionaries.map((vocab) => (
                  <div
                    key={vocab.id}
                    className="flex items-center justify-between py-3 px-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">
                          {vocab.word}
                        </span>
                        <span className="text-gray-600 text-sm">
                          ({vocab.reading})
                        </span>
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                          {vocab.level}
                        </span>
                      </div>
                      <div className="text-sm text-gray-700 mt-1">
                        {vocab.meanings.join(", ")}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditWord(vocab)}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDictionary(vocab.id)}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">
                    Số từ mỗi trang:
                  </label>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(parseInt(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5</SelectItem>
                      <SelectItem value="10">10</SelectItem>
                      <SelectItem value="20">20</SelectItem>
                      <SelectItem value="50">50</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    Đầu
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Trước
                  </Button>
                  <span className="text-sm">
                    Trang {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Sau
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    Cuối
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {dictionaries.length}
                </div>
                <p className="text-sm text-gray-600">Tổng từ vựng</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {WORD_TYPES.length}
                </div>
                <p className="text-sm text-gray-600">Loại từ hỗ trợ</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {LEVELS.length}
                </div>
                <p className="text-sm text-gray-600">Cấp độ JLPT</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
