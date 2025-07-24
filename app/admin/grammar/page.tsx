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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Save, X, Trash2, Edit } from "lucide-react";
import {
  getGrammars,
  createGrammar,
  removeGrammar,
  createGrammarUsage,
  createGrammarExample,
  removeGrammarExample,
  getGrammarExamples,
} from "@/lib/grammar";
import React from "react";
import { renderExample } from "../../../common/utils";

interface Example {
  id: number;
  sentence: string;
  translation: string;
}

interface Usage {
  id: number;
  structure: string;
  meaning: string;
  note?: string;
  examples: Example[];
}

interface GrammarPoint {
  id: number;
  title: string;
  level: string;
  definition: string;
  description: string;
  usages: Usage[];
}

export default function GrammarAdminPage() {
  const [grammarList, setGrammarList] = useState<GrammarPoint[]>([]);
  const [selectedGrammarId, setSelectedGrammarId] = useState<number | null>(
    null
  );
  const [showAddGrammar, setShowAddGrammar] = useState(false);
  const [isAddingGrammar, setIsAddingGrammar] = useState(false);
  const [newGrammar, setNewGrammar] = useState({
    title: "",
    level: "N3",
    definition: "",
    description: "",
  });
  const [showAddUsage, setShowAddUsage] = useState(false);
  const [isAddingUsage, setIsAddingUsage] = useState(false);
  const [editingUsageId, setEditingUsageId] = useState<number | null>(null);
  const [usageForm, setUsageForm] = useState({
    structure: "",
    meaning: "",
    note: "",
  });
  const [showAddExampleUsageId, setShowAddExampleUsageId] = useState<
    number | null
  >(null);
  const [isAddingExample, setIsAddingExample] = useState(false);
  const [editingExample, setEditingExample] = useState<{
    usageId: number;
    exampleId: number;
  } | null>(null);
  const [exampleForm, setExampleForm] = useState({
    sentence: "",
    translation: "",
  });
  const [loading, setLoading] = useState(false);

  // Lấy danh sách ngữ pháp từ API khi load trang
  useEffect(() => {
    loadGrammars();
  }, []);

  // Khi chọn điểm ngữ pháp, load lại usages và ví dụ từ API (nếu cần)
  useEffect(() => {
    if (selectedGrammarId) {
      loadExamplesForGrammar(selectedGrammarId);
    }
  }, [selectedGrammarId]);

  const loadGrammars = async () => {
    setLoading(true);
    try {
      const grammars = await getGrammars();
      setGrammarList(
        (grammars || []).map((g: any) => ({
          ...g,
          usages: (g.usages || []).map((u: any) => ({
            ...u,
            structure: u.structure || "", // nếu có
            meaning: u.meaning,
            note: u.note,
            examples: u.examples || [],
          })),
        }))
      );
    } catch (e) {
      alert("Không thể tải danh sách ngữ pháp");
    } finally {
      setLoading(false);
    }
  };

  const loadExamplesForGrammar = async (grammarId: number) => {
    // Lấy tất cả ví dụ, lọc theo usage thuộc grammar đang chọn
    const grammar = grammarList.find((g) => g.id === grammarId);
    if (!grammar) return;
    try {
      const examples = await getGrammarExamples();
      setGrammarList((prev) =>
        prev.map((g) =>
          g.id === grammarId
            ? {
                ...g,
                usages: g.usages.map((u) => ({
                  ...u,
                  examples: examples.filter((ex: any) => ex.usageId === u.id),
                })),
              }
            : g
        )
      );
    } catch {}
  };

  // Thêm điểm ngữ pháp mới qua API
  const handleAddGrammar = async () => {
    if (!newGrammar.title) {
      alert("Vui lòng nhập tên điểm ngữ pháp");
      return;
    }
    setIsAddingGrammar(true);
    try {
      const created = await createGrammar({
        title: newGrammar.title,
        level: newGrammar.level,
        definition: newGrammar.definition,
        description: newGrammar.description,
      } as any);
      setGrammarList([...grammarList, { ...created, usages: [] }]);
      setNewGrammar({
        title: "",
        level: "N5",
        definition: "",
        description: "",
      });
      setShowAddGrammar(false);
    } catch (e: any) {
      alert("Thêm điểm ngữ pháp thất bại");
    } finally {
      setIsAddingGrammar(false);
    }
  };

  // Xoá điểm ngữ pháp qua API
  const handleDeleteGrammar = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xoá điểm ngữ pháp này?")) return;
    try {
      await removeGrammar(id);
      setGrammarList(grammarList.filter((g) => g.id !== id));
      if (selectedGrammarId === id) setSelectedGrammarId(null);
    } catch (e) {
      alert("Xoá điểm ngữ pháp thất bại");
    }
  };

  // Thêm hoặc sửa usage
  const handleSaveUsage = async () => {
    if (!usageForm.structure || !usageForm.meaning) {
      alert("Vui lòng nhập cấu trúc và ý nghĩa cho cách dùng");
      return;
    }
    setIsAddingUsage(true);
    try {
      if (!selectedGrammarId) throw new Error("Chưa chọn điểm ngữ pháp");
      // Gọi API tạo usage với input mới
      const created = await createGrammarUsage({
        grammarId: selectedGrammarId,
        structure: usageForm.structure,
        meaning: usageForm.meaning,
        note: usageForm.note,
      });
      setGrammarList((prev) =>
        prev.map((g) =>
          g.id === selectedGrammarId
            ? {
                ...g,
                usages: [
                  ...g.usages,
                  {
                    id: created.id,
                    structure: created.structure,
                    meaning: created.meaning,
                    note: created.note,
                    examples: [],
                  },
                ],
              }
            : g
        )
      );
      setUsageForm({ structure: "", meaning: "", note: "" });
      setShowAddUsage(false);
      setEditingUsageId(null);
    } catch (e) {
      alert("Thêm cách dùng thất bại");
    } finally {
      setIsAddingUsage(false);
    }
  };

  // Xoá usage
  const handleDeleteUsage = (usageId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xoá cách dùng này?")) return;
    setGrammarList((prev) =>
      prev.map((g) =>
        g.id === selectedGrammarId
          ? { ...g, usages: g.usages.filter((u) => u.id !== usageId) }
          : g
      )
    );
  };

  // Thêm hoặc sửa ví dụ cho usage
  const handleSaveExample = async (usageId: number) => {
    if (!exampleForm.sentence || !exampleForm.translation) {
      alert("Vui lòng nhập câu ví dụ và dịch nghĩa");
      return;
    }
    setIsAddingExample(true);
    try {
      // Gọi API tạo ví dụ
      const created = await createGrammarExample({
        sentence: exampleForm.sentence,
        translation: exampleForm.translation,
        usageId,
      });
      setGrammarList((prev) =>
        prev.map((g) =>
          g.id === selectedGrammarId
            ? {
                ...g,
                usages: g.usages.map((u) =>
                  u.id === usageId
                    ? {
                        ...u,
                        examples: [...u.examples, created],
                      }
                    : u
                ),
              }
            : g
        )
      );
      setExampleForm({ sentence: "", translation: "" });
      setShowAddExampleUsageId(null);
      setEditingExample(null);
    } catch {
      alert("Thêm ví dụ thất bại");
    } finally {
      setIsAddingExample(false);
    }
  };

  // Xoá ví dụ
  const handleDeleteExample = async (usageId: number, exampleId: number) => {
    try {
      await removeGrammarExample(exampleId);
      setGrammarList((prev) =>
        prev.map((g) =>
          g.id === selectedGrammarId
            ? {
                ...g,
                usages: g.usages.map((u) =>
                  u.id === usageId
                    ? {
                        ...u,
                        examples: u.examples.filter(
                          (ex) => ex.id !== exampleId
                        ),
                      }
                    : u
                ),
              }
            : g
        )
      );
    } catch {
      alert("Xoá ví dụ thất bại");
    }
  };

  const selectedGrammar = grammarList.find((g) => g.id === selectedGrammarId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-pink-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin | Ngữ pháp tiếng Nhật
          </h1>
          <p className="text-gray-600">
            Quản lý các điểm ngữ pháp, nhiều cách dùng và ví dụ minh hoạ cho
            từng cách dùng.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
          {/* Danh sách điểm ngữ pháp */}
          <Card className="flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Điểm ngữ pháp</CardTitle>
                  <CardDescription>Quản lý các điểm ngữ pháp</CardDescription>
                </div>
                <Button onClick={() => setShowAddGrammar(true)} size="sm">
                  <Plus className="h-4 w-4 mr-2" /> Thêm điểm ngữ pháp
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              {showAddGrammar && (
                <div className="mb-4 p-4 border rounded-lg bg-gray-50 flex-shrink-0">
                  <h3 className="font-medium mb-3">Thêm điểm ngữ pháp mới</h3>
                  <div className="space-y-3 max-h-screen overflow-y-auto">
                    <Input
                      placeholder="Tên điểm ngữ pháp (ví dụ: 〜ている)"
                      value={newGrammar.title}
                      onChange={(e) =>
                        setNewGrammar({ ...newGrammar, title: e.target.value })
                      }
                    />
                    <select
                      className="w-full p-2 border rounded"
                      value={newGrammar.level}
                      onChange={(e) =>
                        setNewGrammar({ ...newGrammar, level: e.target.value })
                      }
                    >
                      <option value="N5">N5</option>
                      <option value="N4">N4</option>
                      <option value="N3">N3</option>
                      <option value="N2">N2</option>
                      <option value="N1">N1</option>
                    </select>
                    <Input
                      placeholder="Ý nghĩa tổng quát (definition)"
                      value={newGrammar.definition}
                      onChange={(e) =>
                        setNewGrammar({
                          ...newGrammar,
                          definition: e.target.value,
                        })
                      }
                    />
                    <Input
                      placeholder="Mô tả (không bắt buộc)"
                      value={newGrammar.description}
                      onChange={(e) =>
                        setNewGrammar({
                          ...newGrammar,
                          description: e.target.value,
                        })
                      }
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleAddGrammar}
                        size="sm"
                        disabled={isAddingGrammar}
                      >
                        {isAddingGrammar ? (
                          <span className="animate-spin mr-2">
                            <Save className="h-4 w-4" />
                          </span>
                        ) : (
                          <Save className="h-4 w-4 mr-2" />
                        )}
                        {isAddingGrammar ? "Đang lưu..." : "Lưu"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddGrammar(false)}
                        size="sm"
                      >
                        <X className="h-4 w-4 mr-2" /> Huỷ
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              <div className="overflow-y-auto max-h-screen space-y-3 pr-2">
                {grammarList.map((g) => (
                  <div
                    key={g.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors flex-shrink-0 ${
                      selectedGrammarId === g.id
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                    onClick={() => setSelectedGrammarId(g.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{g.title}</h3>
                        <p className="text-sm text-gray-600">{g.level}</p>
                        <p className="text-xs text-gray-700 mt-1">
                          {g.definition}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {g.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGrammar(g.id);
                        }}
                        title="Xoá điểm ngữ pháp"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Chi tiết điểm ngữ pháp, các cách dùng và ví dụ */}
          <Card className="flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedGrammar
                      ? `Ngữ pháp: ${selectedGrammar.title}`
                      : "Chi tiết điểm ngữ pháp"}
                  </CardTitle>
                  <CardDescription>
                    {selectedGrammar
                      ? "Quản lý các cách dùng và ví dụ minh hoạ"
                      : "Chọn điểm ngữ pháp để xem chi tiết"}
                  </CardDescription>
                </div>
                {selectedGrammar && (
                  <Button
                    onClick={() => {
                      setShowAddUsage(true);
                      setEditingUsageId(null);
                      setUsageForm({ structure: "", meaning: "", note: "" });
                    }}
                    size="sm"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Thêm cách dùng
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {selectedGrammar ? (
                <>
                  {/* Thêm/sửa usage */}
                  {showAddUsage && (
                    <div className="mb-4 p-4 border rounded-lg bg-gray-50 flex-shrink-0">
                      <h3 className="font-medium mb-3">
                        {editingUsageId
                          ? "Sửa cách dùng"
                          : "Thêm cách dùng mới"}
                      </h3>
                      <div className="space-y-3">
                        <Input
                          placeholder="Cấu trúc (ví dụ: Vている)"
                          value={usageForm.structure}
                          onChange={(e) =>
                            setUsageForm({
                              ...usageForm,
                              structure: e.target.value,
                            })
                          }
                        />
                        <Input
                          placeholder="Ý nghĩa (ví dụ: Đang ... )"
                          value={usageForm.meaning}
                          onChange={(e) =>
                            setUsageForm({
                              ...usageForm,
                              meaning: e.target.value,
                            })
                          }
                        />
                        <Input
                          placeholder="Ghi chú (không bắt buộc)"
                          value={usageForm.note}
                          onChange={(e) =>
                            setUsageForm({ ...usageForm, note: e.target.value })
                          }
                        />
                        <div className="flex gap-2">
                          <Button
                            onClick={handleSaveUsage}
                            size="sm"
                            disabled={isAddingUsage}
                          >
                            {isAddingUsage ? (
                              <span className="animate-spin mr-2">
                                <Save className="h-4 w-4" />
                              </span>
                            ) : (
                              <Save className="h-4 w-4 mr-2" />
                            )}
                            {isAddingUsage ? "Đang lưu..." : "Lưu"}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setShowAddUsage(false);
                              setEditingUsageId(null);
                              setUsageForm({
                                structure: "",
                                meaning: "",
                                note: "",
                              });
                            }}
                            size="sm"
                          >
                            <X className="h-4 w-4 mr-2" /> Huỷ
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Danh sách usage */}
                  <div className="space-y-6">
                    {selectedGrammar.usages.length === 0 && (
                      <div className="text-gray-500 text-sm">
                        Chưa có cách dùng nào cho điểm ngữ pháp này.
                      </div>
                    )}
                    {selectedGrammar.usages.map((u, idx) => (
                      <div
                        key={u.id}
                        className="p-4 border rounded-lg bg-yellow-50"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="font-medium mb-1">
                              Cách dùng {idx + 1}
                            </div>
                            {u.structure && (
                              <div className="text-sm text-blue-700 mb-1">
                                Cấu trúc: {u.structure}
                              </div>
                            )}
                            <div className="text-sm text-gray-800 mb-1">
                              Ý nghĩa: {u.meaning}
                            </div>
                            {u.note && (
                              <div className="text-xs text-gray-500 mb-1">
                                Ghi chú: {u.note}
                              </div>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setShowAddUsage(true);
                                setEditingUsageId(u.id);
                                setUsageForm({
                                  structure: u.structure,
                                  meaning: u.meaning,
                                  note: u.note || "",
                                });
                              }}
                              title="Sửa cách dùng"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUsage(u.id)}
                              title="Xoá cách dùng"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {/* Danh sách ví dụ */}
                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium text-sm">
                              Ví dụ minh hoạ
                            </div>
                            <Button
                              onClick={() => {
                                setShowAddExampleUsageId(u.id);
                                setEditingExample(null);
                                setExampleForm({
                                  sentence: "",
                                  translation: "",
                                });
                              }}
                              size="sm"
                            >
                              <Plus className="h-4 w-4 mr-1" /> Thêm ví dụ
                            </Button>
                          </div>
                          {showAddExampleUsageId === u.id && (
                            <div className="mb-2 p-3 border rounded bg-white">
                              <Textarea
                                placeholder="Câu ví dụ tiếng Nhật"
                                value={exampleForm.sentence}
                                onChange={(e) =>
                                  setExampleForm({
                                    ...exampleForm,
                                    sentence: e.target.value,
                                  })
                                }
                                className="mb-2"
                                rows={2}
                              />
                              <Textarea
                                placeholder="Dịch nghĩa tiếng Việt"
                                value={exampleForm.translation}
                                onChange={(e) =>
                                  setExampleForm({
                                    ...exampleForm,
                                    translation: e.target.value,
                                  })
                                }
                                rows={2}
                              />
                              <div className="flex gap-2 mt-2">
                                <Button
                                  onClick={() => handleSaveExample(u.id)}
                                  size="sm"
                                  disabled={isAddingExample}
                                >
                                  {isAddingExample ? (
                                    <span className="animate-spin mr-2">
                                      <Save className="h-4 w-4" />
                                    </span>
                                  ) : (
                                    <Save className="h-4 w-4 mr-2" />
                                  )}
                                  {isAddingExample ? "Đang lưu..." : "Lưu"}
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => {
                                    setShowAddExampleUsageId(null);
                                    setEditingExample(null);
                                    setExampleForm({
                                      sentence: "",
                                      translation: "",
                                    });
                                  }}
                                  size="sm"
                                >
                                  <X className="h-4 w-4 mr-2" /> Huỷ
                                </Button>
                              </div>
                            </div>
                          )}
                          <div className="space-y-2">
                            {u.examples.length === 0 && (
                              <div className="text-gray-500 text-xs">
                                Chưa có ví dụ nào.
                              </div>
                            )}
                            {u.examples.map((ex, exIdx) => (
                              <div
                                key={ex.id}
                                className="p-2 border rounded bg-white flex items-start justify-between"
                              >
                                <div>
                                  <div className="font-medium text-sm">
                                    Ví dụ {exIdx + 1}:{" "}
                                    {renderExample(ex.sentence)}
                                  </div>
                                  <div className="text-xs text-gray-700">
                                    {ex.translation}
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      handleDeleteExample(u.id, ex.id)
                                    }
                                    title="Xoá ví dụ"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>
                    Chọn điểm ngữ pháp để xem chi tiết, quản lý cách dùng và ví
                    dụ
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}