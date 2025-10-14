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
import SmartPagination from "@/components/smart-pagination";
import {
  type Dictionary,
  type DictionaryMeaning,
  type FilterDictionaryInput,
  getDictionaries,
  createDictionary,
  createDictionaries,
  updateDictionary,
  removeDictionary,
  searchDictionaries,
} from "@/lib/dictionary";
import {
  JLPT_LEVELS,
  WORD_TYPES,
  ITEMS_PER_PAGE_OPTIONS,
  DEFAULT_ITEMS_PER_PAGE,
  DEFAULT_AI_WORD_COUNT,
  AI_WORD_COUNT_MIN,
  AI_WORD_COUNT_MAX,
} from "@/constants/admin-dictionary";

export default function AdminDictionaryPage() {
  const [filterType, setFilterType] = useState("all");
  const [filterLevel, setFilterLevel] = useState("all");
  const [search, setSearch] = useState("");
  const [dictionaries, setDictionaries] = useState<Dictionary[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [newMeanings, setNewMeanings] = useState<DictionaryMeaning[]>([
    { meaning: "", example: "", translation: "" },
  ]);
  const [newReading, setNewReading] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingWord, setEditingWord] = useState<Dictionary | null>(null);
  const [wordType, setWordType] = useState("noun");
  const [level, setLevel] = useState("N5");
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiWordCount, setAiWordCount] = useState(DEFAULT_AI_WORD_COUNT);
  const [aiTopic, setAiTopic] = useState("");
  const [showAIPreviewModal, setShowAIPreviewModal] = useState(false);
  const [aiGeneratedWords, setAiGeneratedWords] = useState<Dictionary[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_ITEMS_PER_PAGE);

  // Load dictionaries from API
  const loadDictionaries = async () => {
    setLoading(true);
    try {
      // Build filter
      const filter: FilterDictionaryInput = {};
      if (filterLevel !== "all") {
        filter.levels = [filterLevel];
      }
      if (filterType !== "all") {
        filter.types = [filterType];
      }

      let result;
      if (search) {
        // Use search API if search query exists
        result = await searchDictionaries(search, currentPage, itemsPerPage);
      } else {
        // Use getDictionaries with filter
        result = await getDictionaries(
          currentPage,
          itemsPerPage,
          Object.keys(filter).length > 0 ? filter : undefined
        );
      }

      setDictionaries(result.items);
      setTotalCount(result.total);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Failed to load dictionaries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDictionaries();
  }, [currentPage, itemsPerPage, filterType, filterLevel]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage === 1) {
        loadDictionaries();
      } else {
        setCurrentPage(1); // Reset to page 1 when search changes
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const handleAddDictionary = async () => {
    if (!newWord || newMeanings.filter((m) => m.meaning.trim()).length === 0)
      return;
    setLoading(true);

    try {
      await createDictionary({
        word: newWord,
        reading: newReading,
        meanings: newMeanings.filter((m) => m.meaning.trim()),
        type: wordType,
        level,
      });

      // Reload dictionaries
      await loadDictionaries();

      // Reset form
      resetForm();
      setShowAddForm(false);
    } catch (error) {
      console.error("Failed to create dictionary:", error);
      alert("Lỗi khi thêm từ vựng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleAIGenerate = async () => {
    if (!level || !wordType || !aiWordCount) return;
    setAiLoading(true);

    try {
      // Get existing words to avoid duplicates
      const existingWordsResult = await getDictionaries(1, 1000, {
        types: [wordType],
        levels: [level],
      });
      const existingWords = existingWordsResult.items.map((item) => item.word);

      // Call AI API to generate vocabulary
      const response = await fetch("/api/generate-vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wordType,
          level,
          count: aiWordCount,
          topic: aiTopic.trim() || undefined,
          existingWords,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate vocabulary");
      }

      const data = await response.json();

      // Filter out any words that still match existing ones (extra safety)
      const filteredWords = data.words.filter(
        (w: any) => !existingWords.includes(w.word)
      );

      if (filteredWords.length === 0) {
        alert(
          "Không thể tạo từ mới. Có thể tất cả các từ trong chủ đề này đã tồn tại."
        );
        return;
      }

      // Convert AI response to Dictionary format
      const generatedWords: Dictionary[] = filteredWords.map(
        (w: any, i: number) => ({
          id: `ai-${Date.now()}-${i}`,
          word: w.word,
          reading: w.reading,
          meanings: w.meanings || [],
          type: w.type || wordType,
          level: w.level || level,
        })
      );

      // Show preview modal
      setAiGeneratedWords(generatedWords);
      setShowAIModal(false);
      setShowAIPreviewModal(true);
    } catch (error) {
      console.error("Failed to generate AI vocabulary:", error);
      alert("Lỗi khi tạo từ vựng bằng AI. Vui lòng thử lại.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleEditWord = (word: Dictionary) => {
    setEditingWord(word);
    setNewWord(word.word);
    setNewReading(word.reading);
    setNewMeanings([...word.meanings]);
    setWordType(word.type);
    setLevel(word.level);
    setShowAddForm(true);
  };

  const handleUpdateWord = async () => {
    if (
      !editingWord ||
      !newWord ||
      newMeanings.filter((m) => m.meaning.trim()).length === 0
    )
      return;
    setLoading(true);

    try {
      await updateDictionary(editingWord.id, {
        word: newWord,
        reading: newReading,
        meanings: newMeanings.filter((m) => m.meaning.trim()),
        type: wordType,
        level,
      });

      // Reload dictionaries
      await loadDictionaries();

      setShowAddForm(false);
      setEditingWord(null);
      resetForm();
    } catch (error) {
      console.error("Failed to update dictionary:", error);
      alert("Lỗi khi cập nhật từ vựng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDictionary = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa từ vựng này?")) return;

    setLoading(true);
    try {
      await removeDictionary(id);
      // Reload dictionaries
      await loadDictionaries();
    } catch (error) {
      console.error("Failed to delete dictionary:", error);
      alert("Lỗi khi xóa từ vựng. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAIGeneratedWords = async () => {
    setLoading(true);
    try {
      await createDictionaries(
        aiGeneratedWords.map((w) => ({
          word: w.word,
          reading: w.reading,
          meanings: w.meanings,
          type: w.type,
          level: w.level,
        }))
      );

      // Reload dictionaries
      await loadDictionaries();

      setShowAIPreviewModal(false);
      setAiGeneratedWords([]);
    } catch (error) {
      console.error("Failed to create AI generated dictionaries:", error);
      alert("Lỗi khi thêm từ vựng AI. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewWord("");
    setNewMeanings([{ meaning: "", example: "", translation: "" }]);
    setNewReading("");
    setWordType("noun");
    setLevel("N5");
    setAiTopic("");
  };

  // Note: Filtering and pagination is now handled by the backend API
  // We display dictionaries directly from the API response

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
                  <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Tạo từ vựng bằng AI</DialogTitle>
                      <DialogDescription>
                        AI sẽ tạo từ vựng phù hợp theo yêu cầu và tránh trùng
                        lặp
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
                              {JLPT_LEVELS.map((l) => (
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
                          Chủ đề (tùy chọn)
                        </label>
                        <Input
                          type="text"
                          value={aiTopic}
                          onChange={(e) => setAiTopic(e.target.value)}
                          placeholder="VD: Thể thao, Ẩm thực, Du lịch..."
                          className="font-medium"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Để trống để tạo từ ngẫu nhiên theo loại từ và cấp độ
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Số từ muốn tạo
                        </label>
                        <Input
                          type="number"
                          min={AI_WORD_COUNT_MIN}
                          max={AI_WORD_COUNT_MAX}
                          value={aiWordCount}
                          onChange={(e) =>
                            setAiWordCount(
                              parseInt(e.target.value) || DEFAULT_AI_WORD_COUNT
                            )
                          }
                          placeholder={`Nhập số từ (${AI_WORD_COUNT_MIN}-${AI_WORD_COUNT_MAX})`}
                        />
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800">
                          <strong>💡 Lưu ý:</strong> AI sẽ tự động tránh tạo các
                          từ đã có trong database. Quá trình có thể mất 30-60
                          giây.
                        </p>
                      </div>
                      <div className="flex gap-2 pt-2">
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
                    {JLPT_LEVELS.map((l) => (
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
                    Nghĩa và ví dụ
                  </label>
                  <div className="space-y-3">
                    {newMeanings.map((meaningObj, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg space-y-2 bg-gray-50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium text-gray-600">
                            Nghĩa #{index + 1}
                          </span>
                          {newMeanings.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
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
                        <Input
                          placeholder="Nghĩa tiếng Việt"
                          value={meaningObj.meaning}
                          onChange={(e) => {
                            const updated = [...newMeanings];
                            updated[index].meaning = e.target.value;
                            setNewMeanings(updated);
                          }}
                        />
                        <Input
                          placeholder="Ví dụ (tiếng Nhật)"
                          value={meaningObj.example}
                          onChange={(e) => {
                            const updated = [...newMeanings];
                            updated[index].example = e.target.value;
                            setNewMeanings(updated);
                          }}
                          className="font-japanese"
                        />
                        <Input
                          placeholder="Dịch ví dụ (tiếng Việt)"
                          value={meaningObj.translation}
                          onChange={(e) => {
                            const updated = [...newMeanings];
                            updated[index].translation = e.target.value;
                            setNewMeanings(updated);
                          }}
                        />
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setNewMeanings([
                          ...newMeanings,
                          { meaning: "", example: "", translation: "" },
                        ])
                      }
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
                      {JLPT_LEVELS.map((l) => (
                        <SelectItem key={l} value={l}>
                          {l}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
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
              <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                <p>
                  <strong>Loại từ:</strong>{" "}
                  {WORD_TYPES.find((t) => t.value === wordType)?.label}
                </p>
                <p>
                  <strong>Cấp độ:</strong> {level}
                </p>
                {aiTopic && (
                  <p>
                    <strong>Chủ đề:</strong> {aiTopic}
                  </p>
                )}
                <p>
                  <strong>Số từ:</strong> {aiGeneratedWords.length}
                </p>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {aiGeneratedWords.map((word, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium text-gray-900 font-japanese">
                        {word.word}
                      </span>
                      <span className="text-gray-600 font-japanese">
                        ({word.reading})
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {WORD_TYPES.find((t) => t.value === word.type)?.label}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {word.level}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      {word.meanings.map((m, idx) => (
                        <div key={idx} className="text-sm">
                          <div className="font-medium text-gray-900">
                            • {m.meaning}
                          </div>
                          {m.example && (
                            <div className="text-xs text-gray-600 mt-1 ml-4 font-japanese">
                              例: {m.example}
                            </div>
                          )}
                          {m.translation && (
                            <div className="text-xs text-gray-500 ml-4">
                              → {m.translation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
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
              Danh sách từ vựng ({totalCount} từ - Trang {currentPage}/
              {totalPages})
            </h3>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                <p className="mt-2 text-gray-500">Đang tải...</p>
              </div>
            ) : dictionaries.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">📚</div>
                <p>Không tìm thấy từ vựng nào</p>
                <p className="text-sm mt-2">
                  Hãy thử thay đổi bộ lọc hoặc thêm từ mới
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {dictionaries.map((vocab) => (
                  <div
                    key={vocab.id}
                    className="flex items-center justify-between py-3 px-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900 font-japanese">
                          {vocab.word}
                        </span>
                        <span className="text-gray-600 text-sm font-japanese">
                          ({vocab.reading})
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {WORD_TYPES.find((t) => t.value === vocab.type)
                            ?.label || vocab.type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {vocab.level}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-700 mt-1 space-y-1">
                        {vocab.meanings.map((m, idx) => (
                          <div key={idx}>• {m.meaning}</div>
                        ))}
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
                  {totalCount}
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
                  {JLPT_LEVELS.length}
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
