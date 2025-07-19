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
  Plus,
  Edit,
  Trash2,
  Upload,
  Download,
  FileText,
  Save,
  X,
} from "lucide-react";
import { createCategory } from "@/lib/category";
import {
  getVocabulariesByCategory,
  createVocabulary,
  removeVocabulary,
  importVocabularyCsv,
} from "@/lib/vocabulary";

interface Category {
  id: string;
  name: string;
  nameJp: string;
  level: string;
  description: string;
  wordCount: number;
}

interface Word {
  id: number;
  kanji: string;
  hiragana: string;
  meaning: string;
  example: string;
  exampleMeaning: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export default function AdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddWord, setShowAddWord] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    nameJp: "",
    level: "N5",
    description: "",
  });
  const [newWord, setNewWord] = useState({
    kanji: "",
    hiragana: "",
    meaning: "",
    example: "",
    exampleMeaning: "",
  });
  const [useShortCategoryQuery, setUseShortCategoryQuery] = useState(false);
  const [categoryCount, setCategoryCount] = useState<number>(0);
  const [isImporting, setIsImporting] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isAddingWord, setIsAddingWord] = useState(false);
  const [deletingWordId, setDeletingWordId] = useState<number | null>(null);

  useEffect(() => {
    loadCategories();
  }, [useShortCategoryQuery]);

  const loadCategories = async () => {
    try {
      let query;
      if (useShortCategoryQuery) {
        query = `
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
      } else {
        query = `
          query {
            categories {
              items {
                id
                name
                nameJp
                slug
                level
                description
              }
            }
          }
        `;
      }
      const response = await fetch(`${API_URL}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const result = await response.json();
      if (useShortCategoryQuery) {
        setCategories(result.data.categories.items || []);
        setCategoryCount(result.data.categories.count || 0);
      } else {
        setCategories(result.data.categories.items || []);
        setCategoryCount(result.data.categories.items?.length || 0);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
      alert("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const loadWords = async (categoryId: string) => {
    try {
      const words = await getVocabulariesByCategory(Number(categoryId));
      setWords(
        (words || []).map((w: any) => ({
          id: w.id,
          kanji: w.kanji,
          hiragana: w.hiragana,
          meaning: w.definition,
          example: w.example,
          exampleMeaning: w.translation,
        }))
      );
      setSelectedCategory(categoryId);
    } catch (error) {
      console.error("Failed to load words:", error);
      alert("Failed to load words");
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name || !newCategory.nameJp) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }
    setIsAddingCategory(true);
    try {
      await createCategory({
        name: newCategory.name,
        nameJp: newCategory.nameJp,
        level: newCategory.level,
        description: newCategory.description,
      });
      alert("Thêm nhóm thành công!");
      setNewCategory({
        name: "",
        nameJp: "",
        level: "N5",
        description: "",
      });
      setShowAddCategory(false);
      loadCategories();
    } catch (error: any) {
      alert(`Thêm nhóm thất bại: ${error.message}`);
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleAddWord = async () => {
    if (
      !selectedCategory ||
      !newWord.kanji ||
      !newWord.hiragana ||
      !newWord.meaning
    ) {
      alert("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }
    setIsAddingWord(true);
    try {
      await createVocabulary({
        kanji: newWord.kanji,
        hiragana: newWord.hiragana,
        definition: newWord.meaning,
        example: newWord.example,
        translation: newWord.exampleMeaning,
        categoryId: Number(selectedCategory),
      });
      alert("Thêm từ thành công!");
      setNewWord({
        kanji: "",
        hiragana: "",
        meaning: "",
        example: "",
        exampleMeaning: "",
      });
      setShowAddWord(false);
      loadWords(selectedCategory);
      loadCategories();
    } catch (error: any) {
      alert(`Thêm từ thất bại: ${error.message}`);
    } finally {
      setIsAddingWord(false);
    }
  };

  const handleDeleteWord = async (wordId: number) => {
    if (!selectedCategory || !confirm("Bạn có chắc chắn muốn xoá từ này?")) {
      return;
    }
    setDeletingWordId(wordId);
    try {
      await removeVocabulary(wordId);
      alert("Xoá từ thành công!");
      loadWords(selectedCategory);
      loadCategories();
    } catch (error: any) {
      alert(`Xoá từ thất bại: ${error.message}`);
    } finally {
      setDeletingWordId(null);
    }
  };

  const handleImport = async (categoryId: string, file: File) => {
    setIsImporting(true);
    try {
      await importVocabularyCsv(file, Number(categoryId));
      alert("Nhập từ vựng từ file CSV thành công!");
      loadCategories();
      if (selectedCategory === categoryId) {
        loadWords(categoryId);
      }
    } catch (error: any) {
      alert(`Nhập từ vựng thất bại: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin | Học từ vựng tiếng Nhật
          </h1>
          <p className="text-gray-600">
            Quản lý các nhóm từ vựng và từ vựng trong hệ thống. Bạn có thể thêm,
            sửa, xoá nhóm từ vựng và từ vựng một cách dễ dàng.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Categories Panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Nhóm từ vựng</CardTitle>
                  <CardDescription>Quản lý các nhóm từ vựng</CardDescription>
                </div>
                <div className="flex gap-2 items-center">
                  <Button onClick={() => setShowAddCategory(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm nhóm
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Add Category Form */}
              {showAddCategory && (
                <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-medium mb-3">Thêm nhóm mới</h3>
                  <div className="space-y-3">
                    <Input
                      placeholder="Tên nhóm (ví dụ: Thể thao)"
                      value={newCategory.name}
                      onChange={(e) =>
                        setNewCategory({ ...newCategory, name: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Tên tiếng Nhật (ví dụ: スポーツ)"
                      value={newCategory.nameJp}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          nameJp: e.target.value,
                        })
                      }
                    />
                    <select
                      className="w-full p-2 border rounded"
                      value={newCategory.level}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          level: e.target.value,
                        })
                      }
                    >
                      <option value="N5">N5</option>
                      <option value="N4">N4</option>
                      <option value="N3">N3</option>
                      <option value="N2">N2</option>
                      <option value="N1">N1</option>
                    </select>
                    <Input
                      placeholder="Mô tả (không bắt buộc)"
                      value={newCategory.description}
                      onChange={(e) =>
                        setNewCategory({
                          ...newCategory,
                          description: e.target.value,
                        })
                      }
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddCategory}
                        size="sm"
                        disabled={isAddingCategory}
                      >
                        {isAddingCategory ? (
                          <span className="animate-spin mr-2">
                            <Save className="h-4 w-4" />
                          </span>
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        {isAddingCategory ? "Đang lưu..." : "Lưu"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddCategory(false)}
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Huỷ
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedCategory === category.id
                        ? "border-red-500 bg-red-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => loadWords(category.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-gray-600">
                          {category.nameJp}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{category.level}</Badge>
                          <span className="text-sm text-gray-500">
                            20+ words
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept=".csv"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleImport(category.id, file);
                              e.target.value = "";
                            }
                          }}
                          className="hidden"
                          id={`import-${category.id}`}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            document
                              .getElementById(`import-${category.id}`)
                              ?.click();
                          }}
                          title="Nhập từ CSV"
                          disabled={isImporting}
                        >
                          {isImporting ? (
                            <span className="animate-spin mr-2">
                              <Upload className="h-4 w-4" />
                            </span>
                          ) : (
                            <Upload className="h-4 w-4" />
                          )}
                          {isImporting && (
                            <span className="ml-1 text-xs">Đang nhập...</span>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Words Panel */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedCategory
                      ? `Từ vựng - ${
                          categories.find((c) => c.id === selectedCategory)
                            ?.name
                        }`
                      : "Từ vựng"}
                  </CardTitle>
                  <CardDescription>
                    {selectedCategory
                      ? "Quản lý từ vựng"
                      : "Chọn nhóm để xem từ vựng"}
                  </CardDescription>
                </div>
                {selectedCategory && (
                  <Button onClick={() => setShowAddWord(true)} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm từ
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Add Word Form */}
              {showAddWord && selectedCategory && (
                <div className="mb-4 p-4 border rounded-lg bg-gray-50">
                  <h3 className="font-medium mb-3">Thêm từ mới</h3>
                  <div className="space-y-3">
                    <Input
                      placeholder="Kanji (ví dụ: 犬)"
                      value={newWord.kanji}
                      onChange={(e) =>
                        setNewWord({ ...newWord, kanji: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Hiragana (ví dụ: いぬ)"
                      value={newWord.hiragana}
                      onChange={(e) =>
                        setNewWord({ ...newWord, hiragana: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Nghĩa tiếng Việt (ví dụ: chó)"
                      value={newWord.meaning}
                      onChange={(e) =>
                        setNewWord({ ...newWord, meaning: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Câu ví dụ (không bắt buộc)"
                      value={newWord.example}
                      onChange={(e) =>
                        setNewWord({ ...newWord, example: e.target.value })
                      }
                    />
                    <Input
                      placeholder="Dịch câu ví dụ (không bắt buộc)"
                      value={newWord.exampleMeaning}
                      onChange={(e) =>
                        setNewWord({
                          ...newWord,
                          exampleMeaning: e.target.value,
                        })
                      }
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddWord}
                        size="sm"
                        disabled={isAddingWord}
                      >
                        {isAddingWord ? (
                          <span className="animate-spin mr-2">
                            <Save className="h-4 w-4" />
                          </span>
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        {isAddingWord ? "Đang lưu..." : "Lưu"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddWord(false)}
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Huỷ
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {selectedCategory ? (
                <div className="space-y-3 max-h-screen overflow-y-auto">
                  {words.map((word) => (
                    <div key={word.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{word.kanji}</span>
                            <span className="text-gray-600">
                              ({word.hiragana})
                            </span>
                          </div>
                          <p className="text-sm font-medium">{word.meaning}</p>
                          {word.example && (
                            <div className="mt-2 text-xs text-gray-500">
                              <p>{word.example}</p>
                              <p>{word.exampleMeaning}</p>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteWord(word.id)}
                            title="Xoá từ"
                            disabled={deletingWordId === word.id}
                          >
                            {deletingWordId === word.id ? (
                              <span className="animate-spin">
                                <Trash2 className="h-3 w-3" />
                              </span>
                            ) : (
                              <Trash2 className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Chọn nhóm từ vựng và quản lý từ</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {categoryCount}
                </div>
                <p className="text-sm text-gray-600">Total Categories</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">1800+</div>
                <p className="text-sm text-gray-600">Total Words</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {categories.length}
                </div>
                <p className="text-sm text-gray-600">Categories</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Import Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Hướng dẫn nhập từ vựng</CardTitle>
            <CardDescription>
              Cách nhập dữ liệu từ vựng bằng file CSV
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Định dạng CSV:</h4>
                <code className="text-sm bg-gray-100 p-2 rounded block">
                  kanji,hiragana,meaning,example,exampleMeaning
                  <br />
                  犬,いぬ,inu,chó,犬を nuôi một con chó,Tôi nuôi một con chó
                </code>
              </div>
              <div>
                <h4 className="font-medium mb-2">Định dạng JSON:</h4>
                <code className="text-sm bg-gray-100 p-2 rounded block">
                  {`{"words": [{"kanji": "犬", "hiragana": "いぬ": "inu", "meaning": "chó"}]}`}
                </code>
              </div>
              <p className="text-sm text-gray-600">
                ✅ Tất cả thay đổi sẽ được lưu vĩnh viễn vào hệ thống
                <br />✅ Dữ liệu tồn tại sau khi tải lại trang
                <br />✅ File được cập nhật theo thời gian thực
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
