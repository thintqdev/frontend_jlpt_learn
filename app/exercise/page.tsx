"use client";
import { useState } from "react";
import { getRandomQuestion, Question } from "@/lib/exercise";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import AppLayout from "@/components/app-layout";
import SmartPagination from "@/components/smart-pagination";
import PageHeader from "@/components/page-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { X, CheckCircle2, XCircle, FileText, ChevronDown } from "lucide-react";
import { highlightGrammarInSentence } from "@/common/utils";

const LEVELS = [
  { label: "N5", value: "N5" },
  { label: "N4", value: "N4" },
  { label: "N3", value: "N3" },
  { label: "N2", value: "N2" },
  { label: "N1", value: "N1" },
];

export default function ExercisePage() {
  const [level, setLevel] = useState("N5");
  const [count, setCount] = useState(5);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [levelDropdownOpen, setLevelDropdownOpen] = useState(false);
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState("");
  const [answers, setAnswers] = useState<{ [id: number]: number | null }>({});
  const [showResult, setShowResult] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setShowResult(false);
    setAnswers({});
    try {
      const data = await getRandomQuestion(
        level,
        count,
        typeFilter.length > 0 ? typeFilter : undefined
      );
      setQuestions(data);
    } catch (err) {
      setError("Có lỗi xảy ra khi lấy câu hỏi.");
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (qid: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [qid]: Number(value) }));
  };

  const handleCheck = () => {
    setShowResult(true);
  };

  const handleClear = () => {
    setQuestions([]);
    setAnswers({});
    setShowResult(false);
    setError("");
  };

  const correctCount = questions.filter(
    (q) => answers[q.id] === q.correctAnswer
  ).length;

  return (
    <AppLayout>
      <PageHeader
        title="Bài tập ngẫu nhiên"
        subtitle="Luyện tập với các câu hỏi trắc nghiệm ngẫu nhiên"
        icon={<FileText className="h-8 w-8 text-rose-400" />}
        badge={
          questions.length > 0
            ? {
                text: `${questions.length} câu hỏi`,
                className: "bg-rose-100 text-rose-700",
              }
            : undefined
        }
        actions={
          <div className="flex items-center justify-center space-x-2">
            {questions.length > 0 && (
              <Button
                onClick={handleClear}
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-gray-700 px-2 py-1 rounded-full border border-gray-200 shadow-none"
              >
                <X className="h-4 w-4 mr-1" />
                Làm lại
              </Button>
            )}
            {showResult && (
              <Badge
                variant="default"
                className="bg-rose-500 text-white px-5 py-2 rounded-full text-base font-bold shadow-lg flex items-center gap-2"
              >
                <CheckCircle2 className="h-5 w-5 text-white" />
                Đúng {correctCount}/{questions.length}
              </Badge>
            )}
          </div>
        }
      />

      {/* Filter Form */}
      <div className="px-6 pb-6 flex items-center justify-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-7xl bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mt-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Chọn level
              </label>
              <Select value={level} onValueChange={setLevel}>
                <SelectTrigger className="rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-gray-300">
                  <SelectValue placeholder="Chọn level" />
                </SelectTrigger>
                <SelectContent>
                  {LEVELS.map((l) => (
                    <SelectItem key={l.value} value={l.value}>
                      {l.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">
                Số câu hỏi
              </label>
              <Input
                type="number"
                min={1}
                max={20}
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="rounded-lg border-gray-200 shadow-sm focus:ring-2 focus:ring-gray-300"
              />
            </div>
            <DropdownMenu
              open={typeDropdownOpen}
              onOpenChange={setTypeDropdownOpen}
            >
              <DropdownMenuTrigger asChild>
                <div className="w-full">
                  <label className="block mb-1 font-medium text-gray-700">
                    Lọc theo loại
                  </label>
                  <Button
                    variant="outline"
                    className="w-full justify-between rounded-lg border-gray-200 shadow-sm"
                    disabled={loading}
                  >
                    {typeFilter.length > 0
                      ? `${typeFilter.length} loại đã chọn`
                      : "Tất cả loại"}
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </div>
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
            <Button
              type="submit"
              disabled={loading}
              className="h-10 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 shadow"
            >
              {loading ? "Đang lấy..." : "Bắt đầu"}
            </Button>
          </div>
        </form>
      </div>
      {/* Nội dung */}
      <div className="px-2 md:px-6 py-8 max-w-7xl mx-auto">
        {loading && (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-32 bg-gray-200 "></div>
              ))}
            </div>
          </div>
        )}
        {error && (
          <div className="text-red-500 mb-4 text-center text-base font-medium">
            {error}
          </div>
        )}
        {!loading && questions.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📝</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có bài tập nào
            </h3>
            <p className="text-gray-600 mb-4">
              Hãy chọn level và số câu hỏi rồi nhấn Bắt đầu để luyện tập!
            </p>
          </div>
        )}
        <div className="space-y-8 ">
          {questions.length > 0 && (
            <Card className="rounded-xl border border-gray-200 shadow-xl bg-white/90">
              <CardContent className="p-8">
                <div className="space-y-12">
                  {questions.map((q, idx) => (
                    <div
                      key={q.id}
                      className="border-b border-gray-100 pb-8 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl japanese-text font-semibold text-gray-900 flex flex-col md:flex-row md:items-center gap-1 md:gap-2">
                          <span className="text-rose-400 font-bold">
                            Câu {idx + 1}:
                          </span>
                          <span className="md:ml-1">
                            {q.type !== "VOCABULARY" &&
                            q.type !== "GRAMMAR" &&
                            q.type !== "JLPT_FORMAT"
                              ? highlightGrammarInSentence(q.question)
                              : q.question}
                          </span>
                        </h3>
                        <Badge
                          variant="secondary"
                          className={
                            q.level === "N5"
                              ? "bg-green-100 text-green-700"
                              : q.level === "N4"
                              ? "bg-blue-100 text-blue-700"
                              : q.level === "N3"
                              ? "bg-yellow-100 text-yellow-700"
                              : q.level === "N2"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700"
                          }
                        >
                          {q.level}
                        </Badge>
                      </div>
                      <RadioGroup
                        value={
                          answers[q.id] !== undefined && answers[q.id] !== null
                            ? String(answers[q.id])
                            : undefined
                        }
                        onValueChange={(val) => handleAnswer(q.id, val)}
                        className="space-y-3"
                        disabled={showResult}
                      >
                        {q.options.map((opt, i) => {
                          const isSelected = answers[q.id] === i;
                          const isCorrect = q.correctAnswer === i;
                          const isWrong =
                            showResult && isSelected && !isCorrect;
                          return (
                            <div
                              key={i}
                              role="button"
                              tabIndex={0}
                              aria-checked={isSelected}
                              className={`flex items-center gap-3 px-4 py-3 border transition-colors text-base font-medium select-none cursor-pointer outline-none
                                  ${
                                    showResult && isSelected
                                      ? isCorrect
                                        ? "bg-green-50 border-green-400 text-green-700"
                                        : "bg-red-50 border-red-400 text-red-700"
                                      : isSelected
                                      ? "border-rose-400 bg-rose-50"
                                      : "border-gray-200 hover:bg-gray-50"
                                  }
                                `}
                              onClick={() =>
                                !showResult && handleAnswer(q.id, String(i))
                              }
                              onKeyDown={(e) => {
                                if (
                                  !showResult &&
                                  (e.key === "Enter" || e.key === " ")
                                )
                                  handleAnswer(q.id, String(i));
                              }}
                            >
                              <RadioGroupItem
                                value={String(i)}
                                id={`q${q.id}_opt${i}`}
                                className="h-7 w-7"
                              />
                              <label
                                htmlFor={`q${q.id}_opt${i}`}
                                className="cursor-pointer select-none w-full"
                              >
                                {opt}
                              </label>
                              {showResult && isCorrect && (
                                <CheckCircle2 className="ml-2 text-green-500 h-5 w-5" />
                              )}
                              {isWrong && (
                                <XCircle className="ml-2 text-red-500 h-5 w-5" />
                              )}
                            </div>
                          );
                        })}
                      </RadioGroup>
                      {showResult && answers[q.id] !== q.correctAnswer && (
                        <div className="text-red-500 mt-3 text-sm flex items-center gap-2">
                          <XCircle className="h-4 w-4" />
                          Sai. Đáp án đúng là:{" "}
                          <span className="font-semibold">
                            {q.options[q.correctAnswer]}
                          </span>
                        </div>
                      )}
                      {showResult && (
                        <Accordion type="single" collapsible className="mt-4">
                          <AccordionItem value={`explain-${q.id}`}>
                            <AccordionTrigger className="text-base font-medium text-gray-700">
                              Giải thích
                            </AccordionTrigger>
                            <AccordionContent className="text-gray-700 text-sm leading-relaxed">
                              {q.explanation || "Không có giải thích."}
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        {questions.length > 0 && !showResult && (
          <Button
            className="mt-10 w-full bg-rose-500 hover:bg-rose-600 text-white font-semibold py-3 shadow-lg tracking-wide"
            onClick={handleCheck}
            disabled={Object.keys(answers).length !== questions.length}
          >
            Kiểm tra kết quả
          </Button>
        )}
      </div>
    </AppLayout>
  );
}
