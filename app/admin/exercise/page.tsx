"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Upload,
  MoreVertical,
  Edit,
  Trash2,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  removeQuestion,
  Question,
  importQuestionCsv,
} from "@/lib/exercise";
import { highlightGrammarInSentence } from "@/common/utils";
import AdminNav from "@/components/admin-nav";
import SmartPagination from "@/components/smart-pagination";

const emptyQuestion: Omit<Question, "id"> = {
  question: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
  type: "VOCABULARY",
  level: "N3",
  explanation: "",
};

const ITEMS_PER_PAGE = 5;

export default function QuestionAdminPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [total, setTotal] = useState(0);
  const [isQuestionDialogOpen, setIsQuestionDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [questionFormData, setQuestionFormData] = useState(emptyQuestion);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [levelDropdownOpen, setLevelDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [isAIGenerateDialogOpen, setIsAIGenerateDialogOpen] = useState(false);
  const [aiFormData, setAiFormData] = useState({
    count: 5,
    level: "N3" as "N1" | "N2" | "N3" | "N4" | "N5",
    type: "VOCABULARY" as
      | "KANJI_SELECTION"
      | "HIRAGANA"
      | "VOCABULARY"
      | "SYNONYMS_ANTONYMS"
      | "CONTEXTUAL_WORDS"
      | "GRAMMAR"
      | "JLPT_FORMAT",
  });
  const [generating, setGenerating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [previewQuestions, setPreviewQuestions] = useState<Question[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [editingPreviewIndex, setEditingPreviewIndex] = useState<number | null>(
    null
  );

  // Fetch questions from API
  const getTypeLabel = (type: string) => {
    const labels = {
      KANJI_SELECTION: "Kanji",
      HIRAGANA: "Hiragana",
      VOCABULARY: "Từ vựng",
      SYNONYMS_ANTONYMS: "Đồng nghĩa",
      CONTEXTUAL_WORDS: "Ngữ cảnh",
      GRAMMAR: "Ngữ pháp",
      JLPT_FORMAT: "(*)",
    };
    return labels[type as keyof typeof labels] || type;
  };

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await getQuestions(
        currentPage,
        ITEMS_PER_PAGE,
        searchTerm,
        undefined,
        "asc",
        levelFilter.length > 0 ? levelFilter : undefined,
        typeFilter.length > 0 ? typeFilter : undefined
      );
      setQuestions(res.data);
      setTotal(res.total);
    } catch (err) {
      alert("Lỗi khi tải danh sách câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line
  }, [currentPage, levelFilter, typeFilter, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [levelFilter, typeFilter, searchTerm]);

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;

  const handleOpenAddDialog = () => {
    setEditingQuestion(null);
    setQuestionFormData(emptyQuestion);
    setIsQuestionDialogOpen(true);
  };

  const handleOpenEditDialog = async (question: Question) => {
    setActionLoading(true);
    try {
      const detail = await getQuestion(question.id);
      setEditingQuestion(detail);
      setQuestionFormData({ ...detail });
      setIsQuestionDialogOpen(true);
    } catch (err) {
      alert("Không lấy được chi tiết câu hỏi");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteQuestion = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xoá câu hỏi này?")) return;
    setActionLoading(true);
    try {
      await removeQuestion(id);
      await fetchQuestions();
    } catch (err) {
      alert("Lỗi khi xoá câu hỏi");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveQuestion = async () => {
    if (
      !questionFormData.question ||
      questionFormData.options.some((o) => !o)
    ) {
      alert("Vui lòng điền đầy đủ câu hỏi và các đáp án.");
      return;
    }
    setActionLoading(true);
    try {
      if (editingQuestion) {
        await updateQuestion({ ...questionFormData, id: editingQuestion.id });
      } else {
        await createQuestion(questionFormData);
      }
      setIsQuestionDialogOpen(false);
      await fetchQuestions();
    } catch (err) {
      alert("Lỗi khi lưu câu hỏi");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormChange = (
    field: keyof typeof questionFormData,
    value: any
  ) => {
    setQuestionFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...questionFormData.options];
    newOptions[index] = value;
    handleFormChange("options", newOptions);
  };

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImportFile(file || null);
    setImportResult(null);
  };

  const handleImportCsv = async () => {
    if (!importFile) {
      setImportResult("Vui lòng chọn file CSV.");
      return;
    }
    setImporting(true);
    setImportResult(null);
    try {
      await importQuestionCsv(importFile);
      setImportResult("Import thành công!");
      setImportFile(null);
      setIsImportDialogOpen(false);
      await fetchQuestions();
    } catch (err: any) {
      setImportResult(
        "Import thất bại: " + (err.message || "Lỗi không xác định")
      );
    } finally {
      setImporting(false);
    }
  };

  const handleAIGenerate = async () => {
    if (aiFormData.count < 1 || aiFormData.count > 20) {
      alert("Số lượng câu hỏi phải từ 1 đến 20.");
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(aiFormData),
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      const data = await response.json();

      if (data.questions && Array.isArray(data.questions)) {
        // Add generated questions to database
        for (const question of data.questions) {
          await createQuestion({
            ...question,
            type: aiFormData.type,
            level: aiFormData.level,
          });
        }

        alert(`Đã tạo thành công ${data.questions.length} câu hỏi!`);
        setIsAIGenerateDialogOpen(false);
        await fetchQuestions();
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Không thể tạo câu hỏi. Vui lòng thử lại.");
    } finally {
      setGenerating(false);
    }
  };

  const handlePreview = async () => {
    if (aiFormData.count < 1 || aiFormData.count > 20) {
      alert("Số lượng câu hỏi phải từ 1 đến 20.");
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch("/api/generate-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(aiFormData),
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      const data = await response.json();

      if (data.questions && Array.isArray(data.questions)) {
        setPreviewQuestions(data.questions);
        setIsPreviewMode(true);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Không thể tạo câu hỏi. Vui lòng thử lại.");
    } finally {
      setGenerating(false);
    }
  };

  const handleConfirmGenerate = async () => {
    setGenerating(true);
    try {
      // Add generated questions to database
      for (const question of previewQuestions) {
        await createQuestion({
          ...question,
          type: aiFormData.type,
          level: aiFormData.level,
        });
      }

      alert(`Đã tạo thành công ${previewQuestions.length} câu hỏi!`);
      setIsAIGenerateDialogOpen(false);
      setIsPreviewMode(false);
      setPreviewQuestions([]);
      setEditingPreviewIndex(null);
      await fetchQuestions();
    } catch (error) {
      console.error("Error saving questions:", error);
      alert("Không thể lưu câu hỏi. Vui lòng thử lại.");
    } finally {
      setGenerating(false);
    }
  };

  const handleEditPreviewQuestion = (
    index: number,
    field: keyof Question,
    value: any
  ) => {
    const updatedQuestions = [...previewQuestions];
    updatedQuestions[index] = { ...updatedQuestions[index], [field]: value };
    setPreviewQuestions(updatedQuestions);
  };

  const handleEditPreviewOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const updatedQuestions = [...previewQuestions];
    const newOptions = [...updatedQuestions[questionIndex].options];
    newOptions[optionIndex] = value;
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: newOptions,
    };
    setPreviewQuestions(updatedQuestions);
  };

  const handleDeletePreviewQuestion = (index: number) => {
    const updatedQuestions = previewQuestions.filter((_, i) => i !== index);
    setPreviewQuestions(updatedQuestions);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <AdminNav />
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Quản lý Ngân hàng Câu hỏi
          </h1>
          <p className="text-gray-500 mt-1">
            Thêm, sửa, xoá và import các câu hỏi trắc nghiệm.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Danh sách câu hỏi</CardTitle>
                <CardDescription>Tìm thấy {total} câu hỏi.</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAIGenerateDialogOpen(true)}
                  disabled={loading || actionLoading}
                  className="bg-purple-50 hover:bg-purple-100 border-purple-200"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Tạo bằng AI
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsImportDialogOpen(true)}
                  disabled={loading || actionLoading}
                >
                  <Upload className="h-4 w-4 mr-2" /> Import
                </Button>
                <Button
                  onClick={handleOpenAddDialog}
                  disabled={loading || actionLoading}
                >
                  <Plus className="h-4 w-4 mr-2" /> Thêm câu hỏi
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-4">
              <Input
                placeholder="Tìm kiếm câu hỏi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
                disabled={loading}
              />
              <DropdownMenu
                open={levelDropdownOpen}
                onOpenChange={setLevelDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[180px] justify-between"
                    disabled={loading}
                  >
                    {levelFilter.length > 0
                      ? `${levelFilter.length} selected`
                      : "Lọc theo trình độ"}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {["N5", "N4", "N3", "N2", "N1"].map((level) => (
                    <DropdownMenuItem
                      key={level}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Checkbox
                        checked={levelFilter.includes(level)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setLevelFilter([...levelFilter, level]);
                          } else {
                            setLevelFilter(
                              levelFilter.filter((l) => l !== level)
                            );
                          }
                        }}
                      />
                      <span className="ml-2">{level}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu
                open={typeDropdownOpen}
                onOpenChange={setTypeDropdownOpen}
              >
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-[180px] justify-between"
                    disabled={loading}
                  >
                    {typeFilter.length > 0
                      ? `${typeFilter.length} selected`
                      : "Lọc theo loại"}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  {[
                    { value: "KANJI_SELECTION", label: "Kanji" },
                    { value: "HIRAGANA", label: "Hiragana" },
                    { value: "VOCABULARY", label: "Từ vựng" },
                    { value: "SYNONYMS_ANTONYMS", label: "Đồng/trái nghĩa" },
                    { value: "CONTEXTUAL_WORDS", label: "Ngữ cảnh" },
                    { value: "GRAMMAR", label: "Ngữ pháp" },
                    { value: "JLPT_FORMAT", label: "JLPT (*)" },
                  ].map((type) => (
                    <DropdownMenuItem
                      key={type.value}
                      onSelect={(e) => e.preventDefault()}
                    >
                      <Checkbox
                        checked={typeFilter.includes(type.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setTypeFilter([...typeFilter, type.value]);
                          } else {
                            setTypeFilter(
                              typeFilter.filter((t) => t !== type.value)
                            );
                          }
                        }}
                      />
                      <span className="ml-2">{type.label}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-10 text-center text-gray-500">
                Đang tải dữ liệu...
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">ID</TableHead>
                      <TableHead>Câu hỏi</TableHead>
                      <TableHead>Loại</TableHead>
                      <TableHead>Đáp án đúng</TableHead>
                      <TableHead>Trình độ</TableHead>
                      <TableHead className="w-[50px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((q) => (
                      <TableRow key={q.id}>
                        <TableCell className="font-medium">{q.id}</TableCell>
                        <TableCell>
                          {q.type !== "VOCABULARY" &&
                          q.type !== "GRAMMAR" &&
                          q.type !== "JLPT_FORMAT"
                            ? highlightGrammarInSentence(q.question)
                            : q.question}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getTypeLabel(q.type)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-green-600 font-semibold">
                          {q.options[q.correctAnswer]}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{q.level}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                disabled={actionLoading}
                              >
                                <span className="sr-only">Mở menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleOpenEditDialog(q)}
                                disabled={actionLoading}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Sửa</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteQuestion(q.id)}
                                className="text-red-600"
                                disabled={actionLoading}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                <span>Xoá</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {totalPages > 1 && (
                  <SmartPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    disabled={loading}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog for Add/Edit Question */}
      <Dialog
        open={isQuestionDialogOpen}
        onOpenChange={setIsQuestionDialogOpen}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion ? "Chỉnh sửa câu hỏi" : "Tạo câu hỏi mới"}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin chi tiết cho câu hỏi trắc nghiệm.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Textarea
              placeholder="Nội dung câu hỏi"
              value={questionFormData.question}
              onChange={(e) => handleFormChange("question", e.target.value)}
              rows={3}
              disabled={actionLoading}
            />
            <div className="grid grid-cols-2 gap-3">
              {questionFormData.options.map((opt, idx) => (
                <Input
                  key={idx}
                  placeholder={`Đáp án ${idx + 1}`}
                  value={opt}
                  onChange={(e) => handleOptionChange(idx, e.target.value)}
                  disabled={actionLoading}
                />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select
                value={questionFormData.type}
                onValueChange={(val) => handleFormChange("type", val)}
                disabled={actionLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại bài tập" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KANJI_SELECTION">
                    Chọn chữ kanji
                  </SelectItem>
                  <SelectItem value="HIRAGANA">Bài tập hiragana</SelectItem>
                  <SelectItem value="VOCABULARY">Từ vựng</SelectItem>
                  <SelectItem value="SYNONYMS_ANTONYMS">
                    Đồng/trái nghĩa
                  </SelectItem>
                  <SelectItem value="CONTEXTUAL_WORDS">
                    Từ phù hợp ngữ cảnh
                  </SelectItem>
                  <SelectItem value="GRAMMAR">Ngữ pháp</SelectItem>
                  <SelectItem value="JLPT_FORMAT">
                    Định dạng JLPT (*)
                  </SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={questionFormData.level}
                onValueChange={(val) => handleFormChange("level", val)}
                disabled={actionLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trình độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="N5">N5</SelectItem>
                  <SelectItem value="N4">N4</SelectItem>
                  <SelectItem value="N3">N3</SelectItem>
                  <SelectItem value="N2">N2</SelectItem>
                  <SelectItem value="N1">N1</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Textarea
              placeholder="Giải thích đáp án (không bắt buộc)"
              value={questionFormData.explanation}
              onChange={(e) => handleFormChange("explanation", e.target.value)}
              rows={2}
              disabled={actionLoading}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsQuestionDialogOpen(false)}
              disabled={actionLoading}
            >
              Huỷ
            </Button>
            <Button onClick={handleSaveQuestion} disabled={actionLoading}>
              {actionLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Import */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import câu hỏi</DialogTitle>
            <DialogDescription>
              Tải lên tệp CSV để thêm hàng loạt câu hỏi.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-2">
              Định dạng tệp hỗ trợ: CSV.
            </p>
            <Input
              type="file"
              accept=".csv"
              onChange={handleImportFileChange}
              disabled={loading || actionLoading || importing}
            />
            {importFile && (
              <div className="text-sm text-gray-700 mt-2">
                Đã chọn:{" "}
                <span className="font-semibold">{importFile.name}</span>
              </div>
            )}
            {importResult && (
              <div
                className={`mt-2 text-sm font-medium ${
                  importResult.includes("thành công")
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {importResult}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsImportDialogOpen(false)}
              disabled={loading || actionLoading || importing}
            >
              Đóng
            </Button>
            <Button
              onClick={handleImportCsv}
              disabled={importing || !importFile}
              className="bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 py-2 rounded-lg shadow"
            >
              {importing ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    ></path>
                  </svg>
                  Đang import...
                </span>
              ) : (
                "Import"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for AI Generate */}
      <Dialog
        open={isAIGenerateDialogOpen}
        onOpenChange={(open) => {
          setIsAIGenerateDialogOpen(open);
          if (!open) {
            setIsPreviewMode(false);
            setPreviewQuestions([]);
            setEditingPreviewIndex(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {isPreviewMode ? "Xem trước câu hỏi" : "Tạo câu hỏi bằng AI"}
            </DialogTitle>
            <DialogDescription>
              {isPreviewMode
                ? "Xem trước các câu hỏi sẽ được tạo. Nhấn 'Tạo câu hỏi' để lưu vào cơ sở dữ liệu."
                : "Sử dụng AI để tạo câu hỏi trắc nghiệm theo định dạng JLPT."}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Số lượng câu hỏi
                </label>
                <Input
                  type="number"
                  min={1}
                  max={20}
                  value={aiFormData.count}
                  onChange={(e) =>
                    setAiFormData((prev) => ({
                      ...prev,
                      count: Number(e.target.value),
                    }))
                  }
                  disabled={generating || isPreviewMode}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Trình độ
                </label>
                <Select
                  value={aiFormData.level}
                  onValueChange={(val: any) =>
                    setAiFormData((prev) => ({ ...prev, level: val }))
                  }
                  disabled={generating || isPreviewMode}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="N5">N5</SelectItem>
                    <SelectItem value="N4">N4</SelectItem>
                    <SelectItem value="N3">N3</SelectItem>
                    <SelectItem value="N2">N2</SelectItem>
                    <SelectItem value="N1">N1</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">
                Loại bài tập
              </label>
              <Select
                value={aiFormData.type}
                onValueChange={(val: any) =>
                  setAiFormData((prev) => ({ ...prev, type: val }))
                }
                disabled={generating || isPreviewMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KANJI_SELECTION">
                    Chọn chữ kanji (kanji → hiragana)
                  </SelectItem>
                  <SelectItem value="HIRAGANA">Bài tập hiragana</SelectItem>
                  <SelectItem value="VOCABULARY">Từ vựng</SelectItem>
                  <SelectItem value="SYNONYMS_ANTONYMS">
                    Đồng/trái nghĩa
                  </SelectItem>
                  <SelectItem value="CONTEXTUAL_WORDS">
                    Từ phù hợp ngữ cảnh
                  </SelectItem>
                  <SelectItem value="GRAMMAR">Ngữ pháp</SelectItem>
                  <SelectItem value="JLPT_FORMAT">Dấu *</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isPreviewMode && previewQuestions.length > 0 && (
            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium">
                  Câu hỏi sẽ được tạo ({previewQuestions.length}):
                </h4>
                <div className="text-xs text-gray-500">
                  Click vào từng câu hỏi để chỉnh sửa
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto space-y-3">
                {previewQuestions.map((question, index) => (
                  <div
                    key={index}
                    className={`bg-gray-50 p-3 rounded-lg cursor-pointer transition-colors ${
                      editingPreviewIndex === index
                        ? "ring-2 ring-blue-500 bg-blue-50"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() =>
                      setEditingPreviewIndex(
                        editingPreviewIndex === index ? null : index
                      )
                    }
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        {editingPreviewIndex === index ? (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-medium text-blue-600">
                                Đang chỉnh sửa
                              </span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingPreviewIndex(null);
                                }}
                                className="text-xs h-6 px-2"
                              >
                                Xong
                              </Button>
                            </div>
                            <Textarea
                              value={question.question}
                              onChange={(e) =>
                                handleEditPreviewQuestion(
                                  index,
                                  "question",
                                  e.target.value
                                )
                              }
                              onClick={(e) => e.stopPropagation()}
                              className="text-sm mb-2"
                              rows={2}
                            />
                          </div>
                        ) : (
                          <div className="font-medium text-sm mb-2">
                            Câu {index + 1}:{" "}
                            {highlightGrammarInSentence(question.question)}
                          </div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeletePreviewQuestion(index);
                        }}
                        className="text-red-500 hover:text-red-700 ml-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-2 rounded ${
                            optIndex === question.correctAnswer
                              ? "bg-green-100 text-green-800 font-medium border-2 border-green-300"
                              : "bg-white border"
                          }`}
                        >
                          {editingPreviewIndex === index ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="radio"
                                name={`correct-${index}`}
                                checked={optIndex === question.correctAnswer}
                                onChange={() =>
                                  handleEditPreviewQuestion(
                                    index,
                                    "correctAnswer",
                                    optIndex
                                  )
                                }
                                onClick={(e) => e.stopPropagation()}
                                className="w-3 h-3"
                              />
                              <Input
                                value={option}
                                onChange={(e) =>
                                  handleEditPreviewOption(
                                    index,
                                    optIndex,
                                    e.target.value
                                  )
                                }
                                onClick={(e) => e.stopPropagation()}
                                className="text-xs h-6"
                                placeholder={`Đáp án ${optIndex + 1}`}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span
                                className={`w-3 h-3 rounded-full border-2 ${
                                  optIndex === question.correctAnswer
                                    ? "bg-green-500 border-green-500"
                                    : "border-gray-300"
                                }`}
                              />
                              <span>
                                {optIndex + 1}. {option}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {editingPreviewIndex === index ? (
                      <Textarea
                        value={question.explanation || ""}
                        onChange={(e) =>
                          handleEditPreviewQuestion(
                            index,
                            "explanation",
                            e.target.value
                          )
                        }
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs mt-2"
                        rows={1}
                        placeholder="Giải thích (không bắt buộc)"
                      />
                    ) : (
                      question.explanation && (
                        <div className="text-xs text-gray-600 mt-2">
                          <strong>Giải thích:</strong> {question.explanation}
                        </div>
                      )
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <DialogFooter>
            {isPreviewMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsPreviewMode(false);
                    setPreviewQuestions([]);
                    setEditingPreviewIndex(null);
                  }}
                  disabled={generating}
                >
                  Quay lại
                </Button>
                <Button onClick={handleConfirmGenerate} disabled={generating}>
                  {generating ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        ></path>
                      </svg>
                      Đang lưu...
                    </span>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Tạo câu hỏi ({previewQuestions.length})
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setIsAIGenerateDialogOpen(false)}
                  disabled={generating}
                >
                  Huỷ
                </Button>
                <Button onClick={handlePreview} disabled={generating}>
                  {generating ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8z"
                        ></path>
                      </svg>
                      Đang sinh...
                    </span>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Sinh câu hỏi
                    </>
                  )}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
