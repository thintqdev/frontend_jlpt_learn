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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Plus, Upload, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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

const emptyQuestion: Omit<Question, "id"> = {
  question: "",
  options: ["", "", "", ""],
  correctAnswer: 0,
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
  const [levelFilter, setLevelFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);

  // Fetch questions from API
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await getQuestions(currentPage, ITEMS_PER_PAGE);
      let filtered = res.data;
      // Filter by level (client-side, unless backend supports it)
      if (levelFilter !== "all") {
        filtered = filtered.filter((q: Question) => q.level === levelFilter);
      }
      // Search (client-side)
      if (searchTerm.trim()) {
        filtered = filtered.filter((q: Question) =>
          q.question.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      setQuestions(filtered);
      setTotal(
        // Nếu có filter/search thì total là số lượng sau filter, còn không thì lấy từ API
        levelFilter !== "all" || searchTerm.trim() ? filtered.length : res.total
      );
    } catch (err) {
      alert("Lỗi khi tải danh sách câu hỏi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line
  }, [currentPage, levelFilter, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [levelFilter, searchTerm]);

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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
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
              <Select
                value={levelFilter}
                onValueChange={setLevelFilter}
                disabled={loading}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo trình độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả trình độ</SelectItem>
                  <SelectItem value="N5">N5</SelectItem>
                  <SelectItem value="N4">N4</SelectItem>
                  <SelectItem value="N3">N3</SelectItem>
                  <SelectItem value="N2">N2</SelectItem>
                  <SelectItem value="N1">N1</SelectItem>
                </SelectContent>
              </Select>
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
                          {highlightGrammarInSentence(q.question)}
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
                  <div className="pt-6">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage((prev) => Math.max(prev - 1, 1));
                            }}
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : undefined
                            }
                          />
                        </PaginationItem>
                        {[...Array(totalPages)].map((_, i) => (
                          <PaginationItem key={i}>
                            <PaginationLink
                              href="#"
                              isActive={currentPage === i + 1}
                              onClick={(e) => {
                                e.preventDefault();
                                setCurrentPage(i + 1);
                              }}
                            >
                              {i + 1}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage((prev) =>
                                Math.min(prev + 1, totalPages)
                              );
                            }}
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : undefined
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
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
                value={String(questionFormData.correctAnswer)}
                onValueChange={(val) =>
                  handleFormChange("correctAnswer", Number(val))
                }
                disabled={actionLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn đáp án đúng" />
                </SelectTrigger>
                <SelectContent>
                  {questionFormData.options.map((opt, idx) => (
                    <SelectItem key={idx} value={String(idx)} disabled={!opt}>
                      Đáp án {idx + 1}
                      {opt ? `: ${opt}` : ""}
                    </SelectItem>
                  ))}
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
    </div>
  );
}
