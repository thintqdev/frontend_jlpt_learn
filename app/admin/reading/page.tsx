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
  BookOpen,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import AdminNav from "@/components/admin-nav";
import SmartPagination from "@/components/smart-pagination";
import {
  getReadings,
  createReading,
  updateReading,
  deleteReading,
} from "@/lib/reading";

interface ReadingPassage {
  id: number;
  title: string;
  textType: "short" | "medium" | "long";
  content: string;
  translation?: string;
  readingQuestions: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  questionExplanations?: string[];
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  explanation?: string;
  vocabulary?: {
    word: string;
    reading: string;
    meaning: string;
    example?: string;
  }[];
  grammar?: {
    pattern: string;
    meaning: string;
    example: string;
  }[];
}

// Fake data for demo
const fakeReadingData: ReadingPassage[] = [
  {
    id: 1,
    title: "Chuyến đi đến Tokyo",
    textType: "short",
    content:
      "昨日、友達と一緒に東京に行きました。朝早く電車に乗って、渋谷に着きました。渋谷はとても賑やかでした。たくさんの人がいて、大きなビルがありました。お昼に美味しいラーメンを食べました。午後は原宿に行って、買い物をしました。とても楽しい一日でした。",
    readingQuestions: [
      {
        question: "筆者は誰と東京に行きましたか？",
        options: ["一人で", "友達と", "家族と", "同僚と"],
        correctAnswer: 1,
      },
      {
        question: "お昼に何を食べましたか？",
        options: ["寿司", "ラーメン", "うどん", "そば"],
        correctAnswer: 1,
      },
    ],
    level: "N4",
    explanation:
      "Đây là bài đọc hiểu về chuyến đi đến Tokyo, tập trung vào từ vựng về giao thông và hoạt động hàng ngày.",
    vocabulary: [
      {
        word: "友達",
        reading: "ともだち",
        meaning: "bạn bè",
        example: "友達と一緒に行きます。",
      },
      {
        word: "電車",
        reading: "でんしゃ",
        meaning: "tàu điện",
        example: "毎日電車で会社に行きます。",
      },
      {
        word: "賑やか",
        reading: "にぎやか",
        meaning: "nhộn nhịp, sôi động",
        example: "渋谷はとても賑やかです。",
      },
    ],
    grammar: [
      {
        pattern: "と一緒に",
        meaning: "cùng với...",
        example: "友達と一緒に東京に行きました。",
      },
      {
        pattern: "〜て、〜",
        meaning: "dạng te nối câu",
        example: "電車に乗って、渋谷に着きました。",
      },
    ],
  },
  {
    id: 2,
    title: "Môi trường và ô nhiễm",
    textType: "long",
    content:
      "近年、環境問題が深刻になっています。特に大気汚染は世界中で大きな問題となっており、多くの国が対策を講じています。工場からの排気ガスや自動車の排出ガスが主な原因とされています。この問題を解決するために、各国政府は新しい法律を制定し、企業に対してより厳しい規制を設けています。また、個人レベルでも環境保護に取り組む必要があります。例えば、公共交通機関を利用したり、リサイクルを心がけたりすることが重要です。",
    readingQuestions: [
      {
        question: "大気汚染の主な原因は何ですか？",
        options: ["森林伐採", "工場と自動車の排気ガス", "海洋汚染", "騒音"],
        correctAnswer: 1,
      },
      {
        question:
          "個人レベルでできる環境保護の例として挙げられていないものは？",
        options: ["公共交通機関の利用", "リサイクル", "工場の建設", "なし"],
        correctAnswer: 2,
      },
    ],
    level: "N2",
    explanation:
      "Bài đọc về vấn đề môi trường và ô nhiễm, yêu cầu hiểu biết về từ vựng chuyên ngành và cấu trúc câu phức tạp.",
    vocabulary: [
      {
        word: "環境問題",
        reading: "かんきょうもんだい",
        meaning: "vấn đề môi trường",
        example: "環境問題が深刻になっています。",
      },
      {
        word: "大気汚染",
        reading: "たいきおせん",
        meaning: "ô nhiễm không khí",
        example: "大気汚染は世界中の問題です。",
      },
      {
        word: "対策",
        reading: "たいさく",
        meaning: "biện pháp đối phó",
        example: "政府は新しい対策を講じています。",
      },
    ],
    grammar: [
      {
        pattern: "〜が深刻になっています",
        meaning: "trở nên nghiêm trọng",
        example: "環境問題が深刻になっています。",
      },
      {
        pattern: "〜に対して",
        meaning: "đối với...",
        example: "企業に対して規制を設けています。",
      },
    ],
  },
  {
    id: 3,
    title: "Thời tiết hôm nay",
    textType: "short",
    content:
      "今日はとても暑いです。気温は35度です。空は青くて、雲が少しあります。風はありません。こんな日は、冷たい飲み物が欲しいです。アイスクリームも食べたいです。",
    readingQuestions: [
      {
        question: "今日の気温は何度ですか？",
        options: ["30度", "35度", "40度", "25度"],
        correctAnswer: 1,
      },
    ],
    level: "N5",
    explanation:
      "Bài đọc đơn giản về thời tiết, phù hợp cho người mới bắt đầu học tiếng Nhật.",
  },
];

const emptyReading: Omit<ReadingPassage, "id"> = {
  title: "",
  textType: "short",
  content: "",
  translation: "",
  readingQuestions: [
    {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    },
  ],
  questionExplanations: [],
  level: "N3",
  explanation: "",
  vocabulary: [],
  grammar: [],
};

const ITEMS_PER_PAGE = 5;

export default function ReadingAdminPage() {
  const [readings, setReadings] = useState<ReadingPassage[]>([]);
  const [total, setTotal] = useState(0);
  const [isReadingDialogOpen, setIsReadingDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [editingReading, setEditingReading] = useState<ReadingPassage | null>(
    null
  );
  const [readingFormData, setReadingFormData] = useState(emptyReading);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [textTypeFilter, setTextTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);
  const [importFile, setImportFile] = useState<File | null>(null);

  // Since filtering is done server-side, we use readings directly
  const totalPages = Math.ceil(total / ITEMS_PER_PAGE) || 1;
  const paginatedReadings = readings;

  useEffect(() => {
    setCurrentPage(1);
  }, [levelFilter, textTypeFilter, searchTerm]);

  // Load readings from API
  useEffect(() => {
    const loadReadings = async () => {
      try {
        setLoading(true);
        const level = levelFilter === "all" ? undefined : levelFilter;
        const textType = textTypeFilter === "all" ? undefined : textTypeFilter;
        const result = await getReadings(
          currentPage,
          ITEMS_PER_PAGE,
          level,
          textType
        );
        setReadings(result.items);
        setTotal(result.count);
      } catch (error) {
        console.error("Failed to load readings:", error);
        alert("Không thể tải danh sách bài đọc. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    loadReadings();
  }, [currentPage, levelFilter, textTypeFilter]);

  const handleOpenAddDialog = () => {
    setEditingReading(null);
    setReadingFormData(emptyReading);
    setIsReadingDialogOpen(true);
  };

  const handleOpenEditDialog = (reading: ReadingPassage) => {
    setEditingReading(reading);
    // Only copy the fields that are editable in the form
    setReadingFormData({
      title: reading.title,
      textType: reading.textType,
      content: reading.content,
      translation: reading.translation || "",
      readingQuestions: reading.readingQuestions,
      questionExplanations: reading.questionExplanations || [],
      level: reading.level,
      explanation: reading.explanation || "",
      vocabulary: reading.vocabulary || [],
      grammar: reading.grammar || [],
    });
    setIsReadingDialogOpen(true);
  };

  const handleDeleteReading = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xoá bài đọc này?")) return;

    try {
      setActionLoading(true);
      await deleteReading(id);
      // Reload data
      const level = levelFilter === "all" ? undefined : levelFilter;
      const textType = textTypeFilter === "all" ? undefined : textTypeFilter;
      const result = await getReadings(
        currentPage,
        ITEMS_PER_PAGE,
        level,
        textType
      );
      setReadings(result.items);
      setTotal(result.count);
    } catch (error) {
      console.error("Failed to delete reading:", error);
      alert("Không thể xoá bài đọc. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveReading = async () => {
    if (!readingFormData.title || !readingFormData.content) {
      alert("Vui lòng điền đầy đủ tiêu đề và nội dung.");
      return;
    }

    try {
      setActionLoading(true);
      if (editingReading) {
        // Update existing reading - filter out only updatable fields
        const allowedFields = [
          "title",
          "textType",
          "content",
          "translation",
          "readingQuestions",
          "questionExplanations",
          "level",
          "explanation",
          "vocabulary",
          "grammar",
        ];
        const updateData = {
          id: editingReading.id,
        };
        allowedFields.forEach((field) => {
          if (readingFormData.hasOwnProperty(field)) {
            (updateData as any)[field] = (readingFormData as any)[field];
          }
        });

        await updateReading(updateData);
      } else {
        // Create new reading
        await createReading(readingFormData);
      }

      // Reload data
      const level = levelFilter === "all" ? undefined : levelFilter;
      const textType = textTypeFilter === "all" ? undefined : textTypeFilter;
      const result = await getReadings(
        currentPage,
        ITEMS_PER_PAGE,
        level,
        textType
      );
      setReadings(result.items);
      setTotal(result.count);

      setIsReadingDialogOpen(false);
      setReadingFormData(emptyReading);
      setEditingReading(null);
    } catch (error) {
      console.error("Failed to save reading:", error);
      alert("Không thể lưu bài đọc. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormChange = (
    field: keyof typeof readingFormData,
    value: any
  ) => {
    setReadingFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleQuestionChange = (
    questionIndex: number,
    field: string,
    value: any
  ) => {
    const newQuestions = [...readingFormData.readingQuestions];
    if (field === "options") {
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        options: value,
      };
    } else {
      newQuestions[questionIndex] = {
        ...newQuestions[questionIndex],
        [field]: value,
      };
    }
    handleFormChange("readingQuestions", newQuestions);
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    const newQuestions = [...readingFormData.readingQuestions];
    const newOptions = [...newQuestions[questionIndex].options];
    newOptions[optionIndex] = value;
    newQuestions[questionIndex] = {
      ...newQuestions[questionIndex],
      options: newOptions,
    };
    handleFormChange("readingQuestions", newQuestions);
  };

  const addQuestion = () => {
    const newQuestion = {
      question: "",
      options: ["", "", "", ""],
      correctAnswer: 0,
    };
    handleFormChange("readingQuestions", [
      ...readingFormData.readingQuestions,
      newQuestion,
    ]);
  };

  const removeQuestion = (index: number) => {
    if (readingFormData.readingQuestions.length <= 1) {
      alert("Phải có ít nhất một câu hỏi.");
      return;
    }
    const newQuestions = readingFormData.readingQuestions.filter(
      (_: any, i: number) => i !== index
    );
    handleFormChange("readingQuestions", newQuestions);

    // Also remove corresponding question explanation
    if (
      readingFormData.questionExplanations &&
      readingFormData.questionExplanations.length > index
    ) {
      const newExplanations = readingFormData.questionExplanations.filter(
        (_: any, i: number) => i !== index
      );
      handleFormChange("questionExplanations", newExplanations);
    }
  };

  const addQuestionExplanation = () => {
    const currentExplanations = readingFormData.questionExplanations || [];
    handleFormChange("questionExplanations", [...currentExplanations, ""]);
  };

  const removeQuestionExplanation = (index: number) => {
    if (!readingFormData.questionExplanations) return;
    const newExplanations = readingFormData.questionExplanations.filter(
      (_: any, i: number) => i !== index
    );
    handleFormChange("questionExplanations", newExplanations);
  };

  const handleQuestionExplanationChange = (index: number, value: string) => {
    if (!readingFormData.questionExplanations) return;
    const newExplanations = [...readingFormData.questionExplanations];
    newExplanations[index] = value;
    handleFormChange("questionExplanations", newExplanations);
  };

  const handleGenerateQuestions = async () => {
    if (!readingFormData.content.trim()) {
      alert("Vui lòng nhập nội dung bài đọc trước khi generate câu hỏi.");
      return;
    }

    try {
      setActionLoading(true);

      const response = await fetch("/api/generate-reading-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: readingFormData.content,
          level: readingFormData.level,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      const data = await response.json();

      if (data.questions && Array.isArray(data.questions)) {
        handleFormChange("readingQuestions", data.questions);

        // Auto-populate translation if available
        if (data.translation) {
          handleFormChange("translation", data.translation);
        }

        // Auto-populate question explanations if available
        if (
          data.questionExplanations &&
          Array.isArray(data.questionExplanations)
        ) {
          handleFormChange("questionExplanations", data.questionExplanations);
        }

        // Auto-populate vocabulary if available
        if (data.vocabulary && Array.isArray(data.vocabulary)) {
          handleFormChange("vocabulary", data.vocabulary);
        }

        // Auto-populate grammar if available
        if (data.grammar && Array.isArray(data.grammar)) {
          handleFormChange("grammar", data.grammar);
        }

        alert(
          `Đã generate thành công ${data.questions.length} câu hỏi${
            data.translation ? ", bản dịch" : ""
          }${
            data.questionExplanations
              ? `, ${data.questionExplanations.length} giải thích`
              : ""
          }${data.vocabulary ? `, ${data.vocabulary.length} từ vựng` : ""}${
            data.grammar ? `, ${data.grammar.length} ngữ pháp` : ""
          }!`
        );
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Không thể generate câu hỏi. Vui lòng thử lại.");
    } finally {
      setActionLoading(false);
    }
  };

  // Vocabulary handlers
  const addVocabulary = () => {
    const newVocab = {
      word: "",
      reading: "",
      meaning: "",
      example: "",
    };
    handleFormChange("vocabulary", [
      ...(readingFormData.vocabulary || []),
      newVocab,
    ]);
  };

  const removeVocabulary = (index: number) => {
    const newVocabulary = (readingFormData.vocabulary || []).filter(
      (_: any, i: number) => i !== index
    );
    handleFormChange("vocabulary", newVocabulary);
  };

  const handleVocabChange = (index: number, field: string, value: string) => {
    const newVocabulary = [...(readingFormData.vocabulary || [])];
    newVocabulary[index] = { ...newVocabulary[index], [field]: value };
    handleFormChange("vocabulary", newVocabulary);
  };

  // Grammar handlers
  const addGrammar = () => {
    const newGrammar = {
      pattern: "",
      meaning: "",
      example: "",
    };
    handleFormChange("grammar", [
      ...(readingFormData.grammar || []),
      newGrammar,
    ]);
  };

  const removeGrammar = (index: number) => {
    const newGrammar = (readingFormData.grammar || []).filter(
      (_: any, i: number) => i !== index
    );
    handleFormChange("grammar", newGrammar);
  };

  const handleGrammarChange = (index: number, field: string, value: string) => {
    const newGrammar = [...(readingFormData.grammar || [])];
    newGrammar[index] = { ...newGrammar[index], [field]: value };
    handleFormChange("grammar", newGrammar);
  };

  const getTextTypeColor = (type: string) => {
    switch (type) {
      case "short":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "long":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTextTypeLabel = (type: string) => {
    switch (type) {
      case "short":
        return "Văn bản ngắn";
      case "medium":
        return "Văn bản trung";
      case "long":
        return "Văn bản dài";
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <AdminNav />
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <BookOpen className="h-8 w-8" />
            Quản lý Bài đọc JLPT
          </h1>
          <p className="text-gray-500 mt-1">
            Thêm, sửa, xoá và import các bài đọc hiểu JLPT.
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Danh sách bài đọc</CardTitle>
                <CardDescription>Tìm thấy {total} bài đọc.</CardDescription>
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
                  <Plus className="h-4 w-4 mr-2" /> Thêm bài đọc
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-4 pt-4 flex-wrap">
              <Input
                placeholder="Tìm kiếm bài đọc..."
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
              <Select
                value={textTypeFilter}
                onValueChange={setTextTypeFilter}
                disabled={loading}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Lọc theo loại văn bản" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả loại</SelectItem>
                  <SelectItem value="short">Văn bản ngắn</SelectItem>
                  <SelectItem value="medium">Văn bản trung</SelectItem>
                  <SelectItem value="long">Văn bản dài</SelectItem>
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
                      <TableHead>Tiêu đề</TableHead>
                      <TableHead>Loại văn bản</TableHead>
                      <TableHead>Nội dung</TableHead>
                      <TableHead>Số câu hỏi</TableHead>
                      <TableHead>Trình độ</TableHead>
                      <TableHead className="w-[50px] text-right">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedReadings.map((reading) => (
                      <TableRow key={reading.id}>
                        <TableCell className="font-medium">
                          {reading.id}
                        </TableCell>
                        <TableCell className="font-semibold max-w-[200px] truncate">
                          {reading.title}
                        </TableCell>
                        <TableCell>
                          <Badge className={getTextTypeColor(reading.textType)}>
                            {getTextTypeLabel(reading.textType)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[300px] truncate text-sm text-gray-600">
                          {reading.content}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {reading.readingQuestions.length} câu
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{reading.level}</Badge>
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
                                onClick={() => handleOpenEditDialog(reading)}
                                disabled={actionLoading}
                              >
                                <Edit className="mr-2 h-4 w-4" />
                                <span>Sửa</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteReading(reading.id)}
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

      {/* Dialog for Add/Edit Reading */}
      <Dialog open={isReadingDialogOpen} onOpenChange={setIsReadingDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingReading ? "Chỉnh sửa bài đọc" : "Tạo bài đọc mới"}
            </DialogTitle>
            <DialogDescription>
              Điền thông tin chi tiết cho bài đọc hiểu JLPT.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Input
              placeholder="Tiêu đề bài đọc"
              value={readingFormData.title}
              onChange={(e) => handleFormChange("title", e.target.value)}
              disabled={actionLoading}
            />

            <div className="grid grid-cols-2 gap-3">
              <Select
                value={readingFormData.textType}
                onValueChange={(val) => handleFormChange("textType", val)}
                disabled={actionLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Loại văn bản" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Văn bản ngắn</SelectItem>
                  <SelectItem value="medium">Văn bản trung</SelectItem>
                  <SelectItem value="long">Văn bản dài</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={readingFormData.level}
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
              placeholder="Nội dung bài đọc (tiếng Nhật)"
              value={readingFormData.content}
              onChange={(e) => handleFormChange("content", e.target.value)}
              rows={8}
              disabled={actionLoading}
              className="font-japanese"
            />

            <Textarea
              placeholder="Bản dịch tiếng Việt"
              value={readingFormData.translation || ""}
              onChange={(e) => handleFormChange("translation", e.target.value)}
              rows={6}
              disabled={actionLoading}
            />

            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Câu hỏi</h3>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={handleGenerateQuestions}
                  variant="outline"
                  size="sm"
                  disabled={actionLoading || !readingFormData.content.trim()}
                  className="bg-purple-50 hover:bg-purple-100 border-purple-200"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Generate Questions
                </Button>
                <Button
                  type="button"
                  onClick={addQuestion}
                  variant="outline"
                  size="sm"
                  disabled={actionLoading}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm câu hỏi
                </Button>
              </div>
            </div>

            {readingFormData.readingQuestions.map((q: any, qIndex: number) => (
              <Card key={qIndex} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium">Câu hỏi {qIndex + 1}</h4>
                  {readingFormData.readingQuestions.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => removeQuestion(qIndex)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                      disabled={actionLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <Textarea
                  placeholder="Nội dung câu hỏi"
                  value={q.question}
                  onChange={(e) =>
                    handleQuestionChange(qIndex, "question", e.target.value)
                  }
                  rows={2}
                  disabled={actionLoading}
                  className="mb-3"
                />

                <div className="grid grid-cols-2 gap-2 mb-3">
                  {q.options.map((option: any, oIndex: number) => (
                    <Input
                      key={oIndex}
                      placeholder={`Đáp án ${oIndex + 1}`}
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(qIndex, oIndex, e.target.value)
                      }
                      disabled={actionLoading}
                    />
                  ))}
                </div>

                <Select
                  value={String(q.correctAnswer)}
                  onValueChange={(val) =>
                    handleQuestionChange(qIndex, "correctAnswer", Number(val))
                  }
                  disabled={actionLoading}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn đáp án đúng" />
                  </SelectTrigger>
                  <SelectContent>
                    {q.options.map((opt: any, idx: number) => (
                      <SelectItem key={idx} value={String(idx)} disabled={!opt}>
                        Đáp án {idx + 1}
                        {opt ? `: ${opt}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Card>
            ))}

            {/* Question Explanations Section */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Giải thích câu hỏi</h3>
              {(readingFormData.questionExplanations || []).map(
                (explanation, index) => (
                  <div key={index} className="flex gap-2 items-start">
                    <span className="text-sm font-medium mt-2 min-w-[100px]">
                      Câu {index + 1}:
                    </span>
                    <Textarea
                      placeholder={`Giải thích cho câu hỏi ${index + 1}`}
                      value={explanation}
                      onChange={(e) =>
                        handleQuestionExplanationChange(index, e.target.value)
                      }
                      rows={2}
                      disabled={actionLoading}
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      onClick={() => removeQuestionExplanation(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800 mt-1"
                      disabled={actionLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )
              )}
              <Button
                type="button"
                onClick={addQuestionExplanation}
                variant="outline"
                size="sm"
                disabled={actionLoading}
              >
                <Plus className="h-4 w-4 mr-1" />
                Thêm giải thích
              </Button>
            </div>

            <Textarea
              placeholder="Giải thích bài đọc (không bắt buộc)"
              value={readingFormData.explanation}
              onChange={(e) => handleFormChange("explanation", e.target.value)}
              rows={3}
              disabled={actionLoading}
            />

            {/* Vocabulary Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Từ vựng quan trọng</h3>
                <Button
                  type="button"
                  onClick={addVocabulary}
                  variant="outline"
                  size="sm"
                  disabled={actionLoading}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm từ vựng
                </Button>
              </div>

              {(readingFormData.vocabulary || []).map((vocab, index) => (
                <Card key={index} className="p-3">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">Từ vựng {index + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => removeVocabulary(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                      disabled={actionLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <Input
                      placeholder="Từ vựng (漢字)"
                      value={vocab.word}
                      onChange={(e) =>
                        handleVocabChange(index, "word", e.target.value)
                      }
                      disabled={actionLoading}
                    />
                    <Input
                      placeholder="Cách đọc (ひらがな)"
                      value={vocab.reading}
                      onChange={(e) =>
                        handleVocabChange(index, "reading", e.target.value)
                      }
                      disabled={actionLoading}
                    />
                  </div>
                  <Input
                    placeholder="Nghĩa tiếng Việt"
                    value={vocab.meaning}
                    onChange={(e) =>
                      handleVocabChange(index, "meaning", e.target.value)
                    }
                    disabled={actionLoading}
                    className="mb-2"
                  />
                  <Input
                    placeholder="Ví dụ (không bắt buộc)"
                    value={vocab.example || ""}
                    onChange={(e) =>
                      handleVocabChange(index, "example", e.target.value)
                    }
                    disabled={actionLoading}
                  />
                </Card>
              ))}
            </div>

            {/* Grammar Section */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Ngữ pháp quan trọng</h3>
                <Button
                  type="button"
                  onClick={addGrammar}
                  variant="outline"
                  size="sm"
                  disabled={actionLoading}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Thêm ngữ pháp
                </Button>
              </div>

              {(readingFormData.grammar || []).map((gram, index) => (
                <Card key={index} className="p-3">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">Ngữ pháp {index + 1}</h4>
                    <Button
                      type="button"
                      onClick={() => removeGrammar(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-800"
                      disabled={actionLoading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Cấu trúc ngữ pháp"
                    value={gram.pattern}
                    onChange={(e) =>
                      handleGrammarChange(index, "pattern", e.target.value)
                    }
                    disabled={actionLoading}
                    className="mb-2"
                  />
                  <Input
                    placeholder="Nghĩa tiếng Việt"
                    value={gram.meaning}
                    onChange={(e) =>
                      handleGrammarChange(index, "meaning", e.target.value)
                    }
                    disabled={actionLoading}
                    className="mb-2"
                  />
                  <Input
                    placeholder="Ví dụ"
                    value={gram.example}
                    onChange={(e) =>
                      handleGrammarChange(index, "example", e.target.value)
                    }
                    disabled={actionLoading}
                  />
                </Card>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsReadingDialogOpen(false)}
              disabled={actionLoading}
            >
              Huỷ
            </Button>
            <Button onClick={handleSaveReading} disabled={actionLoading}>
              {actionLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for Import */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import bài đọc</DialogTitle>
            <DialogDescription>
              Tải lên tệp CSV để thêm hàng loạt bài đọc.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-500 mb-2">
              Định dạng tệp hỗ trợ: CSV.
            </p>
            <Input
              type="file"
              accept=".csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
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
              onClick={() => {
                if (!importFile) {
                  setImportResult("Vui lòng chọn file CSV.");
                  return;
                }
                setImporting(true);
                // Fake import process
                setTimeout(() => {
                  setImportResult("Import thành công!");
                  setImporting(false);
                  setImportFile(null);
                  setIsImportDialogOpen(false);
                }, 2000);
              }}
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
