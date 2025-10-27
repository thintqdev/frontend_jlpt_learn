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
import {
  Plus,
  Save,
  X,
  Trash2,
  Edit,
  Upload,
  Download,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import {
  getGrammars,
  createGrammar,
  removeGrammar,
  createGrammarUsage,
  createGrammarExample,
  removeGrammarExample,
  getGrammarExamples,
  importGrammarJson,
  importGrammarCsv,
  removeGrammarUsage,
  generateGrammar,
} from "@/lib/grammar";
import React from "react";
import { renderExample } from "../../../common/utils";
import AdminNav from "@/components/admin-nav";
import { toast } from "sonner";

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

const GRAMMAR_PAGE_SIZE = 10;

export default function GrammarAdminPage() {
  // Phân trang cho danh sách điểm ngữ pháp
  const [grammarList, setGrammarList] = useState<GrammarPoint[]>([]);
  const [grammarCount, setGrammarCount] = useState(0);
  const [grammarPage, setGrammarPage] = useState(1);
  const [grammarTotalPages, setGrammarTotalPages] = useState(1);

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

  // Import/Export
  const [showImportModal, setShowImportModal] = useState(false);
  const [importText, setImportText] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [showImportCSVModal, setShowImportCSVModal] = useState(false);
  const [csvFile, setCSVFile] = useState<File | null>(null);
  const [isImportingCSV, setIsImportingCSV] = useState(false);

  // AI Generate
  const [isGenerating, setIsGenerating] = useState(false);
  // AI Generate usages
  const [isGeneratingUsages, setIsGeneratingUsages] = useState(false);
  const [generatedUsages, setGeneratedUsages] = useState<any[]>([]);

  // Lấy danh sách ngữ pháp từ API khi load trang hoặc chuyển trang
  useEffect(() => {
    loadGrammars(grammarPage);
  }, [grammarPage]);

  // Khi chọn điểm ngữ pháp, load lại usages và ví dụ từ API (nếu cần)
  useEffect(() => {
    if (selectedGrammarId) {
      loadExamplesForGrammar(selectedGrammarId);
    }
  }, [selectedGrammarId]);

  const loadGrammars = async (page: number = 1) => {
    setLoading(true);
    try {
      const { items, count } = await getGrammars(page, GRAMMAR_PAGE_SIZE);
      setGrammarList(
        (items || []).map((g: any) => ({
          ...g,
          usages: (g.usages || []).map((u: any) => ({
            ...u,
            structure: u.structure || "",
            meaning: u.meaning,
            note: u.note,
            examples: u.examples || [],
          })),
        }))
      );
      setGrammarCount(count || 0);
      setGrammarTotalPages(
        Math.max(1, Math.ceil((count || 0) / GRAMMAR_PAGE_SIZE))
      );
    } catch (e) {
      toast.error("Không thể tải danh sách ngữ pháp");
    } finally {
      setLoading(false);
    }
  };

  const loadExamplesForGrammar = async (grammarId: number) => {
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

  const handleAddGrammar = async () => {
    if (!newGrammar.title) {
      toast.error("Vui lòng nhập tên điểm ngữ pháp");
      return;
    }
    setIsAddingGrammar(true);
    try {
      await createGrammar({
        title: newGrammar.title,
        level: newGrammar.level,
        definition: newGrammar.definition,
        description: newGrammar.description,
      } as any);

      // Refresh lại danh sách ngữ pháp từ server
      await loadGrammars(grammarPage);

      // Reset form
      setNewGrammar({
        title: "",
        level: "N5",
        definition: "",
        description: "",
      });
      setShowAddGrammar(false);

      toast.success("Đã thêm điểm ngữ pháp thành công!");
    } catch (e: any) {
      toast.error("Thêm điểm ngữ pháp thất bại");
    } finally {
      setIsAddingGrammar(false);
    }
  };

  // ----------- Export JSON -----------
  const handleExportJSON = () => {
    if (grammarList.length === 0) {
      toast.error("Không có dữ liệu để export");
      return;
    }

    const exportData = grammarList.map((g) => ({
      title: g.title,
      level: g.level,
      definition: g.definition,
      description: g.description,
      usages: g.usages.map((u) => ({
        structure: u.structure,
        meaning: u.meaning,
        note: u.note,
        examples: u.examples.map((ex) => ({
          sentence: ex.sentence,
          translation: ex.translation,
        })),
      })),
    }));

    const jsonString = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `grammar-export-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ----------- Import JSON -----------
  const handleImportJSON = async () => {
    if (!importText.trim()) {
      toast.error("Vui lòng nhập dữ liệu JSON");
      return;
    }
    setIsImporting(true);
    try {
      // Gửi dữ liệu lên backend qua API importGrammarJson
      const ok = await importGrammarJson(importText);
      if (ok) {
        await loadGrammars(grammarPage);
        toast.success("Đã import ngữ pháp thành công từ JSON!");
        setShowImportModal(false);
        setImportText("");
      } else {
        toast.error("Import JSON thất bại!");
      }
    } catch (error: any) {
      toast.error(`Lỗi import: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  // ----------- Import CSV -----------
  const handleImportCSV = async () => {
    if (!csvFile) {
      toast.error("Vui lòng chọn file CSV");
      return;
    }
    setIsImportingCSV(true);
    try {
      // Gửi file lên backend qua API importGrammarCsv
      const ok = await importGrammarCsv(csvFile);
      if (ok) {
        await loadGrammars(grammarPage);
        toast.success("Đã import ngữ pháp thành công từ CSV!");
        setShowImportCSVModal(false);
        setCSVFile(null);
      } else {
        toast.error("Import CSV thất bại!");
      }
    } catch (error: any) {
      toast.error(`Lỗi import CSV: ${error.message}`);
    } finally {
      setIsImportingCSV(false);
    }
  };

  // ----------- Generate AI -----------
  const handleGenerateGrammar = async () => {
    if (!newGrammar.title.trim()) {
      toast.error("Vui lòng nhập tên điểm ngữ pháp");
      return;
    }
    setIsGenerating(true);
    try {
      const generatedData = await generateGrammar(
        newGrammar.title,
        newGrammar.level
      );

      // Fill data vào form để user kiểm tra và lưu thủ công
      setNewGrammar({
        title: generatedData.title,
        level: generatedData.level,
        definition: generatedData.definition,
        description: generatedData.description,
      });

      toast.success("Đã tạo nội dung với AI! Hãy kiểm tra và lưu thủ công.");
    } catch (error: any) {
      toast.error(`Lỗi generate: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  }; // ----------- Generate Usages AI -----------
  const handleGenerateUsages = async () => {
    if (!selectedGrammar) return;

    setIsGeneratingUsages(true);
    try {
      // Gọi API generate grammar để lấy usages và examples
      const generatedData = await generateGrammar(
        selectedGrammar.title,
        selectedGrammar.level
      );

      // Lưu generated usages vào state để hiển thị trong form
      setGeneratedUsages(generatedData.usages || []);

      // Mở form thêm usage để user có thể xem và chỉnh sửa
      setShowAddUsage(true);
      setEditingUsageId(null);

      toast.success(
        `Đã generate ${generatedData.usages?.length || 0} cách dùng cho "${
          selectedGrammar.title
        }"! Hãy kiểm tra và lưu thủ công.`
      );
    } catch (error: any) {
      toast.error(`Lỗi generate usages: ${error.message}`);
    } finally {
      setIsGeneratingUsages(false);
    }
  };

  const handleDeleteGrammar = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xoá điểm ngữ pháp này?")) return;
    try {
      await removeGrammar(id);
      // Reload trang hiện tại
      loadGrammars(grammarPage);
      if (selectedGrammarId === id) setSelectedGrammarId(null);
    } catch (e) {
      toast.error("Xoá điểm ngữ pháp thất bại");
    }
  };

  const handleSaveUsage = async () => {
    if (!usageForm.structure || !usageForm.meaning) {
      toast.error("Vui lòng nhập cấu trúc và ý nghĩa cho cách dùng");
      return;
    }
    setIsAddingUsage(true);
    try {
      if (!selectedGrammarId) throw new Error("Chưa chọn điểm ngữ pháp");
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
      toast.error("Thêm cách dùng thất bại");
    } finally {
      setIsAddingUsage(false);
    }
  };

  // ----------- ĐÂY LÀ HANDLE USAGE XOÁ CŨ ----------
  // const handleDeleteUsage = (usageId: number) => {
  //   if (!confirm("Bạn có chắc chắn muốn xoá cách dùng này?")) return;
  //   setGrammarList((prev) =>
  //     prev.map((g) =>
  //       g.id === selectedGrammarId
  //         ? { ...g, usages: g.usages.filter((u) => u.id !== usageId) }
  //         : g
  //     )
  //   );
  // };

  // ----------- HANDLE XOÁ SỬ DỤNG API removeGrammarUsage -----------
  const handleDeleteUsage = async (usageId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xoá cách dùng này?")) return;
    setLoading(true);
    try {
      await removeGrammarUsage(usageId);
      setGrammarList((prev) =>
        prev.map((g) =>
          g.id === selectedGrammarId
            ? { ...g, usages: g.usages.filter((u) => u.id !== usageId) }
            : g
        )
      );
    } catch (e) {
      toast.error("Xoá cách dùng thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveExample = async (usageId: number) => {
    if (!exampleForm.sentence || !exampleForm.translation) {
      toast.error("Vui lòng nhập câu ví dụ và dịch nghĩa");
      return;
    }
    setIsAddingExample(true);
    try {
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
      toast.error("Thêm ví dụ thất bại");
    } finally {
      setIsAddingExample(false);
    }
  };

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
      toast.error("Xoá ví dụ thất bại");
    }
  };

  // Phân trang cho điểm ngữ pháp
  const Pagination = ({
    page,
    totalPages,
    onPageChange,
  }: {
    page: number;
    totalPages: number;
    onPageChange: (p: number) => void;
  }) => (
    <div className="flex justify-end items-center gap-2 mt-3">
      <Button
        variant="outline"
        size="sm"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="text-sm font-medium">
        Trang {page} / {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );

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
        <AdminNav />
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Admin | Ngữ pháp tiếng Nhật
          </h1>
          <p className="text-gray-600">
            Quản lý các điểm ngữ pháp, nhiều cách dùng và ví dụ minh hoạ cho
            từng cách dùng.
          </p>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => setShowImportModal(true)}
              variant="outline"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import JSON
            </Button>
            <Button
              onClick={() => setShowImportCSVModal(true)}
              variant="outline"
              className="border-purple-500 text-purple-600 hover:bg-purple-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button
              onClick={handleExportJSON}
              variant="outline"
              className="border-green-500 text-green-600 hover:bg-green-50"
              disabled={grammarList.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </div>
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
                  <Plus className="h-4 w-4 mr-2" /> Thêm
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden">
              {showAddGrammar && (
                <div className="mb-4 p-4 border rounded-lg bg-gray-50 flex-shrink-0">
                  <h3 className="font-medium mb-3">Thêm điểm ngữ pháp mới</h3>

                  {/* Button tạo với AI ở trên cùng */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-3">
                      💡 <strong>Tip:</strong> Nhập tên điểm ngữ pháp và chọn
                      level, sau đó bấm <strong>"Tạo với AI"</strong> để AI tạo
                      nội dung. Bạn có thể chỉnh sửa trước khi lưu!
                    </p>
                    <div className="flex gap-2 mb-4">
                      <Button
                        onClick={handleGenerateGrammar}
                        size="sm"
                        disabled={isGenerating}
                        variant="outline"
                        className="border-pink-500 text-pink-600 hover:bg-pink-50"
                      >
                        {isGenerating ? (
                          <span className="animate-spin mr-2">
                            <Sparkles className="h-4 w-4" />
                          </span>
                        ) : (
                          <Sparkles className="h-4 w-4 mr-2" />
                        )}
                        {isGenerating ? "Đang tạo..." : "Tạo với AI"}
                      </Button>
                    </div>
                  </div>

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
              <div className="space-y-3">
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
                {/* Pagination for grammars */}
                <Pagination
                  page={grammarPage}
                  totalPages={grammarTotalPages}
                  onPageChange={setGrammarPage}
                />
              </div>
            </CardContent>
          </Card>

          {/* Chi tiết điểm ngữ pháp, các cách dùng và ví dụ */}
          <Card className="flex flex-col">
            <CardHeader className="flex-shrink-0">
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
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              {selectedGrammar ? (
                <>
                  {/* Thông tin chi tiết điểm ngữ pháp */}
                  <div className="mb-6 p-4 border-2 border-red-300 rounded-lg bg-red-50">
                    <h3 className="font-semibold text-red-800 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                      Thông tin điểm ngữ pháp
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <span className="font-medium text-red-700 w-20">
                          Tên:
                        </span>
                        <span className="text-red-900">
                          {selectedGrammar.title}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <span className="font-medium text-red-700 w-20">
                          Level:
                        </span>
                        <span className="px-2 py-1 bg-red-200 text-red-800 rounded text-sm font-medium">
                          {selectedGrammar.level}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Buttons điều khiển */}
                  <div className="mb-6 flex gap-3 flex-wrap">
                    <Button
                      onClick={handleGenerateUsages}
                      disabled={isGeneratingUsages}
                      variant="outline"
                      className="border-pink-500 text-pink-600 hover:bg-pink-50"
                    >
                      {isGeneratingUsages ? (
                        <span className="animate-spin mr-2">
                          <Sparkles className="h-4 w-4" />
                        </span>
                      ) : (
                        <Sparkles className="h-4 w-4 mr-2" />
                      )}
                      {isGeneratingUsages
                        ? "Đang tạo..."
                        : "Tạo cách dùng với AI"}
                    </Button>
                    <Button
                      onClick={() => {
                        setShowAddUsage(true);
                        setEditingUsageId(null);
                        setUsageForm({ structure: "", meaning: "", note: "" });
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" /> Thêm cách dùng
                    </Button>
                  </div>
                  {/* Thêm/sửa usage */}
                  {showAddUsage && (
                    <div className="mb-4 p-4 border rounded-lg bg-gray-50 flex-shrink-0">
                      <h3 className="font-medium mb-3">
                        {editingUsageId
                          ? "Sửa cách dùng"
                          : generatedUsages.length > 0
                          ? `Cách dùng được tạo với AI (${generatedUsages.length})`
                          : "Thêm cách dùng mới"}
                      </h3>

                      {generatedUsages.length > 0 ? (
                        // Hiển thị tất cả generated usages để user kiểm tra và lưu
                        <div className="space-y-4">
                          {generatedUsages.map((usage, index) => (
                            <div
                              key={index}
                              className="p-3 border rounded bg-white"
                            >
                              <h4 className="font-medium text-sm mb-2">
                                Cách dùng {index + 1}
                              </h4>
                              <div className="space-y-2">
                                <Input
                                  placeholder="Cấu trúc"
                                  value={usage.structure || ""}
                                  onChange={(e) => {
                                    const newUsages = [...generatedUsages];
                                    newUsages[index].structure = e.target.value;
                                    setGeneratedUsages(newUsages);
                                  }}
                                />
                                <Input
                                  placeholder="Ý nghĩa"
                                  value={usage.meaning || ""}
                                  onChange={(e) => {
                                    const newUsages = [...generatedUsages];
                                    newUsages[index].meaning = e.target.value;
                                    setGeneratedUsages(newUsages);
                                  }}
                                />
                                <Input
                                  placeholder="Ghi chú (không bắt buộc)"
                                  value={usage.note || ""}
                                  onChange={(e) => {
                                    const newUsages = [...generatedUsages];
                                    newUsages[index].note = e.target.value;
                                    setGeneratedUsages(newUsages);
                                  }}
                                />

                                {/* Hiển thị examples */}
                                <div className="mt-3">
                                  <h5 className="text-sm font-medium mb-2">
                                    Ví dụ:
                                  </h5>
                                  <div className="space-y-2">
                                    {usage.examples?.map(
                                      (example: any, exIndex: number) => (
                                        <div
                                          key={exIndex}
                                          className="p-2 bg-gray-50 rounded text-sm"
                                        >
                                          <div className="font-medium">
                                            {example.sentence}
                                          </div>
                                          <div className="text-gray-600">
                                            {example.translation}
                                          </div>
                                        </div>
                                      )
                                    ) || (
                                      <div className="text-gray-500 text-sm">
                                        Không có ví dụ
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}

                          <div className="flex gap-2 mt-4">
                            <Button
                              onClick={async () => {
                                setIsAddingUsage(true);
                                try {
                                  // Lưu tất cả generated usages
                                  for (const usage of generatedUsages) {
                                    const createdUsage =
                                      await createGrammarUsage({
                                        grammarId: selectedGrammarId!,
                                        structure: usage.structure || "",
                                        meaning: usage.meaning || "",
                                        note: usage.note || "",
                                      });

                                    // Lưu examples cho usage này
                                    for (const example of usage.examples ||
                                      []) {
                                      await createGrammarExample({
                                        usageId: createdUsage.id,
                                        sentence: example.sentence,
                                        translation: example.translation,
                                      });
                                    }
                                  }

                                  // Reload data
                                  await loadExamplesForGrammar(
                                    selectedGrammarId!
                                  );

                                  // Reset form
                                  setGeneratedUsages([]);
                                  setShowAddUsage(false);

                                  toast.success(
                                    `Đã lưu thành công ${generatedUsages.length} cách dùng!`
                                  );
                                } catch (error: any) {
                                  toast.error(
                                    `Lỗi lưu cách dùng: ${error.message}`
                                  );
                                } finally {
                                  setIsAddingUsage(false);
                                }
                              }}
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
                              {isAddingUsage
                                ? "Đang lưu..."
                                : `Lưu tất cả (${generatedUsages.length})`}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setGeneratedUsages([]);
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
                      ) : (
                        // Form thêm usage thông thường
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
                              setUsageForm({
                                ...usageForm,
                                note: e.target.value,
                              })
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
                      )}
                    </div>
                  )}
                  {/* Danh sách usage */}
                  <div className="space-y-6">
                    {selectedGrammar?.usages?.length === 0 && (
                      <div className="text-gray-500 text-sm">
                        Chưa có cách dùng nào cho điểm ngữ pháp này.
                      </div>
                    )}
                    {selectedGrammar?.usages?.map((u, idx) => (
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
                            {u.examples?.length === 0 && (
                              <div className="text-gray-500 text-xs">
                                Chưa có ví dụ nào.
                              </div>
                            )}
                            {u.examples?.map((ex, exIdx) => (
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

        {/* Import JSON Modal */}
        {showImportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Import JSON Ngữ pháp
                  </h2>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setShowImportModal(false);
                      setImportText("");
                    }}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Định dạng JSON mẫu:</h3>
                  <div className="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">
                    <pre>{`[
  {
    "title": "〜ている",
    "level": "N5",
    "definition": "Đang ...",
    "description": "Diễn tả hành động đang diễn ra",
    "usages": [
      {
        "structure": "Vている",
        "meaning": "Đang ...",
        "note": "",
        "examples": [
          {
            "sentence": "私は食べている。",
            "translation": "Tôi đang ăn."
          }
        ]
      }
    ]
  }
]`}</pre>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Dán JSON data vào đây:
                  </label>
                  <Textarea
                    value={importText}
                    onChange={(e) => setImportText(e.target.value)}
                    placeholder="Dán JSON data của các điểm ngữ pháp..."
                    rows={12}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Dữ liệu phải là mảng JSON hợp lệ</li>
                    <li>
                      Mỗi điểm ngữ pháp cần có: title, level, definition, usages
                    </li>
                    <li>Mỗi cách dùng cần có: structure, meaning, examples</li>
                    <li>Mỗi ví dụ cần có: sentence, translation</li>
                  </ul>
                </div>
              </div>
              <div className="p-6 border-t bg-gray-50">
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowImportModal(false);
                      setImportText("");
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleImportJSON}
                    disabled={isImporting || !importText.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isImporting ? (
                      <span className="animate-spin mr-2">
                        <Upload className="h-4 w-4" />
                      </span>
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {isImporting ? "Đang import..." : "Import"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {/* Import CSV Modal */}
        {showImportCSVModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b flex items-center justify-between">
                <h2 className="text-xl font-semibold">Import CSV Ngữ pháp</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowImportCSVModal(false);
                    setCSVFile(null);
                  }}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="mb-4">
                  <h3 className="font-medium mb-2">Định dạng file CSV:</h3>
                  <div className="bg-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">
                    <pre>{`title,level,definition,description,structure,meaning,note,sentence,translation
〜ている,N5,Đang ...,Diễn tả hành động đang diễn ra,Vている,Đang ...,,"私は食べている。","Tôi đang ăn."
〜ている,N5,Đang ...,Diễn tả hành động đang diễn ra,Vている,Đang ...,, "彼は走っている。", "Anh ấy đang chạy."`}</pre>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">
                    Chọn file CSV:
                  </label>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setCSVFile(e.target.files?.[0] || null)}
                    className="block"
                  />
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>Dữ liệu phải là file CSV hợp lệ theo mẫu trên</li>
                    <li>
                      Mỗi dòng là một ví dụ thuộc cách dùng của một điểm ngữ
                      pháp
                    </li>
                    <li>
                      Nếu các trường giống nhau thì sẽ được gộp thành cùng 1
                      điểm ngữ pháp/cách dùng
                    </li>
                  </ul>
                </div>
              </div>
              <div className="p-6 border-t bg-gray-50">
                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowImportCSVModal(false);
                      setCSVFile(null);
                    }}
                  >
                    Hủy
                  </Button>
                  <Button
                    onClick={handleImportCSV}
                    disabled={isImportingCSV || !csvFile}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isImportingCSV ? (
                      <span className="animate-spin mr-2">
                        <Upload className="h-4 w-4" />
                      </span>
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {isImportingCSV ? "Đang import..." : "Import CSV"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
