"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  Play,
  CheckCircle,
  XCircle,
  Brain,
  Target,
  Award,
  RefreshCw,
} from "lucide-react";
import AppLayout from "@/components/app-layout";
import { getGrammar } from "@/lib/grammar";
import { parseFurigana, renderJapaneseText } from "@/common/utils";

interface Question {
  id: number;
  type: "multiple_choice" | "translation_jp_vn" | "translation_vn_jp";
  question: string;
  options?: string[];
  correctAnswer?: number;
  userAnswer?: number | string;
  correctTranslation?: string;
  explanation?: string;
  isCorrect?: boolean;
}

interface Grammar {
  id: number;
  title: string;
  level: string;
  description: string;
  definition: string;
  usages: {
    id: number;
    meaning: string;
    structure: string;
    note?: string;
    examples: {
      id: number;
      sentence: string;
      translation: string;
    }[];
  }[];
}

export default function GrammarPracticePage() {
  const params = useParams();
  const router = useRouter();
  const grammarId = parseInt(params.id as string);

  const [grammar, setGrammar] = useState<Grammar | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showSettings, setShowSettings] = useState(true);
  const [exerciseSettings, setExerciseSettings] = useState({
    questionCount: 5,
    questionType: "mixed", // "multiple_choice", "translation_jp_vn", "translation_vn_jp", "mixed"
  });
  const [userInput, setUserInput] = useState("");
  const [checking, setChecking] = useState(false);
  const [feedback, setFeedback] = useState<{
    show: boolean;
    message: string;
    isCorrect: boolean;
  }>({ show: false, message: "", isCorrect: false });

  useEffect(() => {
    fetchGrammar();
  }, [grammarId]);

  const fetchGrammar = async () => {
    try {
      setLoading(true);
      const data = await getGrammar(grammarId);
      setGrammar(data);
    } catch (error) {
      console.error("Failed to fetch grammar:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateQuestions = async () => {
    if (!grammar) return;

    setGenerating(true);
    try {
      const response = await fetch("/api/generate-grammar-practice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grammar: {
            title: grammar.title,
            definition: grammar.definition,
            level: grammar.level,
            usages: grammar.usages.map((u) => ({
              structure: u.structure,
              meaning: u.meaning,
              examples: u.examples.slice(0, 3), // Limit examples for context
            })),
          },
          settings: exerciseSettings,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      const data = await response.json();
      const generatedQuestions = data.questions.map(
        (q: any, index: number) => ({
          ...q,
          id: index + 1,
        })
      );

      setQuestions(generatedQuestions);
      setCurrentQuestionIndex(0);
      setShowSettings(false);
      setShowResults(false);
      setUserInput("");
      setChecking(false);
      setFeedback({ show: false, message: "", isCorrect: false });
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Không thể tạo câu hỏi. Vui lòng thử lại sau.");
    } finally {
      setGenerating(false);
    }
  };

  const handleAnswer = async (answer: number | string) => {
    const currentQuestion = questions[currentQuestionIndex];
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer: answer,
    };
    setQuestions(updatedQuestions);

    // Get AI feedback
    setChecking(true);
    try {
      const response = await fetch("/api/check-grammar-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion,
          userAnswer: answer,
          grammar: {
            title: grammar?.title,
            definition: grammar?.definition,
          },
        }),
      });

      const data = await response.json();
      updatedQuestions[currentQuestionIndex] = {
        ...updatedQuestions[currentQuestionIndex],
        isCorrect: data.isCorrect,
        explanation: data.explanation,
      };
      setQuestions(updatedQuestions);

      setFeedback({
        show: true,
        message: data.explanation,
        isCorrect: data.isCorrect,
      });
    } catch (error) {
      console.error("Error checking answer:", error);
      setFeedback({
        show: true,
        message: "Không thể kiểm tra câu trả lời. Vui lòng thử lại.",
        isCorrect: false,
      });
    } finally {
      setChecking(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setUserInput("");
      setChecking(false);
      setFeedback({ show: false, message: "", isCorrect: false });
    } else {
      setShowResults(true);
    }
  };

  const resetPractice = () => {
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setShowSettings(true);
    setShowResults(false);
    setUserInput("");
    setChecking(false);
    setFeedback({ show: false, message: "", isCorrect: false });
  };

  const currentQuestion = questions[currentQuestionIndex];
  const correctAnswers = questions.filter((q) => q.isCorrect).length;
  const totalQuestions = questions.length;
  const score =
    totalQuestions > 0
      ? Math.round((correctAnswers / totalQuestions) * 100)
      : 0;

  if (loading) {
    return (
      <AppLayout>
        <div className="px-6 pt-12 pb-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!grammar) {
    return (
      <AppLayout>
        <div className="px-6 pt-12 pb-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Không tìm thấy ngữ pháp</h1>
          <Button onClick={() => router.back()}>Quay lại</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-6 pt-12 pb-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Luyện tập ngữ pháp</h1>
              <p className="text-gray-600">
                {grammar.title} - {grammar.level}
              </p>
            </div>
          </div>
          {questions.length > 0 && !showSettings && (
            <Badge variant="outline" className="text-lg px-3 py-1">
              {currentQuestionIndex + 1} / {questions.length}
            </Badge>
          )}
        </div>

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Cài đặt bài luyện tập
              </DialogTitle>
              <DialogDescription>
                Tùy chỉnh số lượng câu hỏi và loại bài tập
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Số câu hỏi
                </label>
                <Select
                  value={exerciseSettings.questionCount.toString()}
                  onValueChange={(value) =>
                    setExerciseSettings({
                      ...exerciseSettings,
                      questionCount: parseInt(value),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3 câu</SelectItem>
                    <SelectItem value="5">5 câu</SelectItem>
                    <SelectItem value="10">10 câu</SelectItem>
                    <SelectItem value="15">15 câu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Loại bài tập
                </label>
                <Select
                  value={exerciseSettings.questionType}
                  onValueChange={(value) =>
                    setExerciseSettings({
                      ...exerciseSettings,
                      questionType: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mixed">Trộn lẫn</SelectItem>
                    <SelectItem value="multiple_choice">Trắc nghiệm</SelectItem>
                    <SelectItem value="translation_jp_vn">
                      Dịch Nhật → Việt
                    </SelectItem>
                    <SelectItem value="translation_vn_jp">
                      Dịch Việt → Nhật
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={generateQuestions}
                disabled={generating}
                className="w-full"
              >
                {generating ? (
                  <>
                    <Brain className="h-4 w-4 mr-2 animate-spin" />
                    Đang tạo câu hỏi...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Bắt đầu luyện tập
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Question Display */}
        {currentQuestion && !showResults && (
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {currentQuestion.type === "multiple_choice" ? (
                    <Target className="h-5 w-5" />
                  ) : (
                    <Brain className="h-5 w-5" />
                  )}
                  {currentQuestion.type === "multiple_choice"
                    ? "Trắc nghiệm"
                    : currentQuestion.type === "translation_jp_vn"
                    ? "Dịch Nhật → Việt"
                    : "Dịch Việt → Nhật"}
                </CardTitle>
                <Badge variant="secondary">
                  Câu {currentQuestionIndex + 1}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-lg font-medium">
                {parseFurigana(currentQuestion.question)}
              </div>

              {currentQuestion.type === "multiple_choice" ? (
                <div className="space-y-3">
                  {currentQuestion.options?.map((option, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start text-left h-auto p-4"
                      onClick={() => handleAnswer(index)}
                      disabled={feedback.show || checking}
                    >
                      <span className="font-semibold mr-3">
                        {String.fromCharCode(65 + index)}.
                      </span>
                      {option}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <Textarea
                    placeholder={
                      currentQuestion.type === "translation_jp_vn"
                        ? "Nhập bản dịch tiếng Việt..."
                        : "Nhập bản dịch tiếng Nhật..."
                    }
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    rows={3}
                    disabled={feedback.show || checking}
                    className={
                      currentQuestion.type === "translation_vn_jp"
                        ? "font-japanese text-lg"
                        : ""
                    }
                  />
                  <Button
                    onClick={() => handleAnswer(userInput)}
                    disabled={!userInput.trim() || feedback.show || checking}
                    className="w-full"
                  >
                    {checking ? "Đang kiểm tra..." : "Kiểm tra đáp án"}
                  </Button>
                </div>
              )}

              {/* Feedback */}
              {feedback.show && (
                <div
                  className={`p-6 rounded-xl border-2 ${
                    feedback.isCorrect
                      ? "bg-green-50 border-green-200"
                      : "bg-red-50 border-red-200"
                  }`}
                >
                  <div className="space-y-4">
                    {/* Status Header */}
                    <div className="flex items-center gap-3">
                      {feedback.isCorrect ? (
                        <CheckCircle className="h-7 w-7 text-green-600" />
                      ) : (
                        <XCircle className="h-7 w-7 text-red-600" />
                      )}
                      <h4
                        className={`text-xl font-bold ${
                          feedback.isCorrect ? "text-green-800" : "text-red-800"
                        }`}
                      >
                        {feedback.isCorrect ? "Chính xác!" : "Chưa chính xác"}
                      </h4>
                    </div>

                    {/* Answer Comparison */}
                    <div className="grid gap-4">
                      {/* User Answer */}
                      <div className="bg-white/70 p-4 rounded-lg border">
                        <h5 className="font-semibold text-gray-800 mb-2">
                          Câu trả lời của bạn:
                        </h5>
                        <div className="text-lg">
                          {currentQuestion.type === "multiple_choice" ? (
                            <span className="font-medium">
                              {String.fromCharCode(
                                65 + (currentQuestion.userAnswer as number)
                              )}
                              .{" "}
                              {
                                currentQuestion.options?.[
                                  currentQuestion.userAnswer as number
                                ]
                              }
                            </span>
                          ) : (
                            <div
                              className={
                                currentQuestion.type === "translation_vn_jp"
                                  ? "font-japanese"
                                  : ""
                              }
                            >
                              {currentQuestion.type === "translation_jp_vn" ||
                              currentQuestion.type === "translation_vn_jp"
                                ? renderJapaneseText(
                                    currentQuestion.userAnswer as string
                                  )
                                : (currentQuestion.userAnswer as string)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Correct Answer */}
                      <div className="bg-white/70 p-4 rounded-lg border border-green-300">
                        <h5 className="font-semibold text-green-800 mb-2">
                          Câu trả lời mẫu:
                        </h5>
                        <div className="text-lg">
                          {currentQuestion.type === "multiple_choice" ? (
                            <span className="font-medium text-green-700">
                              {String.fromCharCode(
                                65 + (currentQuestion.correctAnswer as number)
                              )}
                              .{" "}
                              {
                                currentQuestion.options?.[
                                  currentQuestion.correctAnswer as number
                                ]
                              }
                            </span>
                          ) : (
                            <div
                              className={
                                currentQuestion.type === "translation_vn_jp"
                                  ? "font-japanese text-green-700"
                                  : "text-green-700"
                              }
                            >
                              {currentQuestion.type === "translation_jp_vn" ||
                              currentQuestion.type === "translation_vn_jp"
                                ? renderJapaneseText(
                                    currentQuestion.correctTranslation || ""
                                  )
                                : currentQuestion.correctTranslation}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="bg-white/70 p-4 rounded-lg border">
                      <h5 className="font-semibold text-gray-800 mb-2">
                        Nhận xét:
                      </h5>
                      <p className="text-gray-700 leading-relaxed">
                        {feedback.message}
                      </p>
                    </div>

                    <Button
                      onClick={nextQuestion}
                      className="w-full mt-4"
                      size="lg"
                    >
                      {currentQuestionIndex < questions.length - 1
                        ? "Câu tiếp theo"
                        : "Xem kết quả"}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {showResults && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2 text-2xl">
                <Award className="h-8 w-8 text-yellow-500" />
                Kết quả luyện tập
              </CardTitle>
              <div className="text-4xl font-bold mt-4">
                <span
                  className={
                    score >= 80
                      ? "text-green-600"
                      : score >= 60
                      ? "text-yellow-600"
                      : "text-red-600"
                  }
                >
                  {score}%
                </span>
              </div>
              <p className="text-gray-600">
                {correctAnswers}/{totalQuestions} câu đúng
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <Badge
                  variant="secondary"
                  className={`px-4 py-2 text-lg ${
                    score >= 80
                      ? "bg-green-100 text-green-800"
                      : score >= 60
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {score >= 80
                    ? "Xuất sắc!"
                    : score >= 60
                    ? "Khá tốt!"
                    : "Cần cải thiện"}
                </Badge>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Chi tiết từng câu:</h4>
                {questions.map((question, index) => (
                  <div
                    key={question.id}
                    className={`p-3 rounded-lg border ${
                      question.isCorrect
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {question.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">Câu {index + 1}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {question.question}
                        </p>
                        {question.explanation && (
                          <p
                            className={`text-sm mt-2 ${
                              question.isCorrect
                                ? "text-green-700"
                                : "text-red-700"
                            }`}
                          >
                            {question.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={resetPractice}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Luyện tập lại
                </Button>
                <Button onClick={() => router.back()} className="flex-1">
                  Quay lại ngữ pháp
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grammar Context Card */}
        {!showResults && questions.length === 0 && (
          <Card className="max-w-2xl mx-auto mt-6">
            <CardHeader>
              <CardTitle>Thông tin ngữ pháp</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg">{grammar.title}</h4>
                <Badge variant="secondary" className="mt-1">
                  {grammar.level}
                </Badge>
              </div>
              <p className="text-gray-700">{grammar.definition}</p>
              {grammar.description && (
                <p className="text-sm text-gray-600">{grammar.description}</p>
              )}

              <Button
                onClick={() => setShowSettings(true)}
                className="w-full mt-4"
              >
                <Play className="h-4 w-4 mr-2" />
                Bắt đầu luyện tập
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
