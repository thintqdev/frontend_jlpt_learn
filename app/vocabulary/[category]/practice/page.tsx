"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  RotateCcw,
  Trophy,
  BookOpen,
  Settings,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import AppLayout from "@/components/app-layout";
import { getCategoryById } from "@/lib/category";

interface Question {
  id: string;
  type: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  wordData: any;
}

export default function VocabularyPracticePage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.category;
  const [category, setCategory] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [settings, setSettings] = useState({
    questionCount: 10,
    questionTypes: ["fill-in-blank"],
  });
  const [hasStarted, setHasStarted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (!categoryId) {
      setLoading(false);
      return;
    }

    async function fetchCategory() {
      try {
        const categoryData = await getCategoryById(Number(categoryId));
        setCategory(categoryData);
      } catch (error) {
        console.error("Error loading category:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategory();
  }, [categoryId]);

  const generateQuestions = async (words: any[]) => {
    if (!words || words.length === 0) return;

    setGeneratingQuestions(true);
    try {
      // Chọn từ vựng ngẫu nhiên theo số lượng câu hỏi
      const shuffledWords = [...words].sort(() => Math.random() - 0.5);
      const selectedWords = shuffledWords.slice(0, settings.questionCount);

      const response = await fetch("/api/generate-vocabulary-practice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          words: selectedWords,
          allWords: words, // Để tạo distractor options
          questionCount: settings.questionCount,
          questionTypes: settings.questionTypes,
        }),
      });

      // Handle 429 Too Many Requests explicitly with a friendly UI
      if (response.status === 429) {
        // try to read Retry-After header if provided
        const retryHeader = response.headers.get("Retry-After");
        const retrySeconds = retryHeader ? parseInt(retryHeader, 10) : null;
        setRetryAfterSeconds(
          retrySeconds && !isNaN(retrySeconds) ? retrySeconds : null
        );
        setRateLimitMessage(
          "Máy AI đang quá bận — nó vừa bị yêu cầu uống quá nhiều cà phê. Hãy đợi một chút và thử lại nhé!"
        );
        setRateLimited(true);
        setGeneratingQuestions(false);
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to generate questions");
      }

      const data = await response.json();
      setQuestions(data.questions);
      setAnswers(new Array(data.questions.length).fill(null));
    } catch (error) {
      console.error("Error generating questions:", error);
      // Fallback: tạo câu hỏi đơn giản
      const fallbackQuestions = createFallbackQuestions(words);
      setQuestions(fallbackQuestions);
      setAnswers(new Array(fallbackQuestions.length).fill(null));
    } finally {
      setGeneratingQuestions(false);
    }
  };

  const createFallbackQuestions = (words: any[]): Question[] => {
    const questions: Question[] = [];
    const shuffledWords = [...words].sort(() => Math.random() - 0.5);
    const contexts = [
      `Tôi thích ___.`,
      `Mỗi ngày tôi ___.`,
      `Tôi muốn học ___.`,
      `Tôi cảm thấy ___.`,
      `Tôi nói chuyện với ___.`,
      `Tôi có ___.`,
      `Tôi đi đến ___.`,
      `Tôi làm việc ___.`,
    ];

    for (let i = 0; i < Math.min(settings.questionCount, words.length); i++) {
      const word = shuffledWords[i];
      const otherWords = shuffledWords
        .filter((w) => w.id !== word.id)
        .slice(0, 3);

      const options = [word.kanji, ...otherWords.map((w) => w.kanji)].sort(
        () => Math.random() - 0.5
      );

      const correctIndex = options.indexOf(word.kanji);
      const randomContext =
        contexts[Math.floor(Math.random() * contexts.length)];

      questions.push({
        id: `fallback_${i}`,
        type: "fill-in-blank",
        question: `${randomContext} Từ nào phù hợp nhất để điền vào chỗ trống?`,
        options: options.map(
          (opt, idx) => `${String.fromCharCode(65 + idx)}. ${opt}`
        ),
        correctAnswer: correctIndex,
        explanation: `Trong ngữ cảnh này, "${word.kanji}" (${word.meaning}) là từ phù hợp nhất.`,
        wordData: word,
      });
    }

    return questions;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = selectedAnswer;
    setAnswers(newAnswers);
    setShowResult(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(answers[currentQuestionIndex + 1]);
      setShowResult(answers[currentQuestionIndex + 1] !== null);
      setShowExplanation(false);
    } else {
      setCompleted(true);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(answers[currentQuestionIndex - 1]);
      setShowResult(answers[currentQuestionIndex - 1] !== null);
      setShowExplanation(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswers(new Array(questions.length).fill(null));
    setShowExplanation(false);
    setCompleted(false);
  };

  const handleStartPractice = async () => {
    setHasStarted(true);
    setShowSettingsDialog(false);
    await generateQuestions(category.words);
  };

  const calculateScore = () => {
    const correct = answers.filter(
      (answer, index) => answer === questions[index]?.correctAnswer
    ).length;
    return { correct, total: questions.length };
  };

  if (loading || generatingQuestions) {
    return (
      <AppLayout>
        <div className="bg-white min-h-screen">
          <div className="px-6 pt-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="h-12 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (rateLimited) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-yellow-100">
          <div className="px-6 pt-12 pb-6">
            <div className="max-w-2xl mx-auto text-center">
              <div className="text-6xl mb-4">🥵🤖☕️</div>
              <h2 className="text-2xl font-semibold mb-2">
                Ối không — AI đang quá bận!
              </h2>
              <p className="text-gray-700 mb-4">
                {rateLimitMessage ||
                  "Hệ thống nhận quá nhiều yêu cầu cùng lúc."}
              </p>
              {retryAfterSeconds ? (
                <p className="text-sm text-gray-600 mb-4">
                  Bạn có thể thử lại sau khoảng{" "}
                  <strong>{retryAfterSeconds} giây</strong>.
                </p>
              ) : (
                <p className="text-sm text-gray-600 mb-4">
                  Thử nhấn "Thử lại" sau vài giây — hoặc quay lại học từ trước
                  khi AI tỉnh lại.
                </p>
              )}

              <div className="flex items-center justify-center space-x-3">
                <Button
                  onClick={async () => {
                    setRateLimited(false);
                    setRateLimitMessage(null);
                    setRetryAfterSeconds(null);
                    setGeneratingQuestions(true);
                    await generateQuestions(category?.words || []);
                  }}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <RotateCcw className="mr-2 h-4 w-4" /> Thử lại
                </Button>

                <Link href={`/vocabulary/${categoryId}`}>
                  <Button variant="outline">Quay lại danh sách từ</Button>
                </Link>
              </div>

              <p className="mt-6 text-sm text-gray-500">
                Gợi ý: nếu lỗi xảy ra thường xuyên, hãy giảm số câu mỗi lần hoặc
                thử lại sau vài phút.
              </p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!hasStarted) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="px-6 pt-12 pb-6">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Luyện tập từ vựng
                </h1>
                <p className="text-gray-600 mb-4">Chủ đề: {category?.name}</p>
                <p className="text-gray-500">
                  Hãy chọn cài đặt cho bài tập của bạn
                </p>
              </div>

              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Cài đặt bài tập</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label
                      htmlFor="questionCount"
                      className="text-base font-medium"
                    >
                      Số câu hỏi
                    </Label>
                    <Select
                      value={settings.questionCount.toString()}
                      onValueChange={(value) =>
                        setSettings((prev) => ({
                          ...prev,
                          questionCount: parseInt(value),
                        }))
                      }
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 câu</SelectItem>
                        <SelectItem value="10">10 câu</SelectItem>
                        <SelectItem value="15">15 câu</SelectItem>
                        <SelectItem value="20">20 câu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-base font-medium mb-3 block">
                      Loại câu hỏi (chỉ có dạng điền từ vào chỗ trống)
                    </Label>
                    <div className="space-y-3">
                      {[
                        {
                          value: "fill-in-blank",
                          label: "Điền từ vào chỗ trống",
                          desc: "Câu có chỗ trống, chọn từ phù hợp",
                        },
                      ].map((type) => (
                        <div
                          key={type.value}
                          className="flex items-start space-x-3"
                        >
                          <Checkbox
                            id={type.value}
                            checked={true}
                            disabled={true}
                          />
                          <div className="grid gap-1.5 leading-none">
                            <Label
                              htmlFor={type.value}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {type.label}
                            </Label>
                            <p className="text-xs text-gray-500">{type.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-center justify-between">
                <Link href={`/vocabulary/${categoryId}`}>
                  <Button variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại
                  </Button>
                </Link>
                <Button
                  onClick={handleStartPractice}
                  disabled={!category?.words || category.words.length === 0}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Bắt đầu luyện tập
                </Button>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (questions.length === 0 && hasStarted) {
    return (
      <AppLayout>
        <div className="bg-white min-h-screen">
          <div className="px-6 pt-12">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không thể tạo bài tập
              </h3>
              <p className="text-gray-600 mb-4">
                Chủ đề này không có từ vựng hoặc có lỗi khi tạo câu hỏi
              </p>
              <Link href={`/vocabulary/${categoryId}`}>
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (completed) {
    const { correct, total } = calculateScore();
    const percentage = Math.round((correct / total) * 100);

    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
          <div className="px-6 pt-12 pb-6">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Hoàn thành bài tập!
                </h1>
                <p className="text-gray-600">Chủ đề: {category.name}</p>
              </div>

              <Card className="mb-6">
                <CardContent className="p-8 text-center">
                  <div className="text-6xl font-bold text-primary-600 mb-4">
                    {percentage}%
                  </div>
                  <p className="text-xl text-gray-700 mb-2">
                    {correct}/{total} câu đúng
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                    <div
                      className="bg-primary-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${
                      percentage >= 80
                        ? "bg-green-100 text-green-700"
                        : percentage >= 60
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {percentage >= 80
                      ? "Xuất sắc"
                      : percentage >= 60
                      ? "Khá"
                      : "Cần ôn tập"}
                  </Badge>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  onClick={handleRestart}
                  variant="outline"
                  className="w-full"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Làm lại
                </Button>
                <Link href={`/vocabulary/${categoryId}`}>
                  <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Học từ vựng
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
  const { correct, total } = calculateScore();

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 pt-12 pb-6">
          <Link href={`/vocabulary/${categoryId}`}>
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>

          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Luyện tập từ vựng
              </h1>
              <p className="text-gray-600">{category.name}</p>
            </div>
            <Badge variant="secondary" className="text-sm">
              {currentQuestionIndex + 1}/{questions.length}
            </Badge>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  ((currentQuestionIndex + 1) / questions.length) * 100
                }%`,
              }}
            ></div>
          </div>

          <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
            <span>
              Đúng: {correct}/{total}
            </span>
            <span>Điền từ vào chỗ trống</span>
          </div>
        </div>

        {/* Question */}
        <div className="px-6 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl">
                  {currentQuestion.question}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      disabled={showResult}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                        selectedAnswer === index
                          ? showResult
                            ? index === currentQuestion.correctAnswer
                              ? "border-green-500 bg-green-50"
                              : "border-red-500 bg-red-50"
                            : "border-primary-500 bg-primary-50"
                          : showResult &&
                            index === currentQuestion.correctAnswer
                          ? "border-green-500 bg-green-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center">
                        <span
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-sm font-medium mr-3 ${
                            selectedAnswer === index
                              ? showResult
                                ? index === currentQuestion.correctAnswer
                                  ? "border-green-500 bg-green-500 text-white"
                                  : "border-red-500 bg-red-500 text-white"
                                : "border-primary-500 bg-primary-500 text-white"
                              : showResult &&
                                index === currentQuestion.correctAnswer
                              ? "border-green-500 bg-green-500 text-white"
                              : "border-gray-300"
                          }`}
                        >
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="japanese-text">
                          {option.substring(3)}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                {!showResult && (
                  <Button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswer === null}
                    className="w-full mt-6 bg-primary-600 hover:bg-primary-700"
                  >
                    Trả lời
                  </Button>
                )}

                {showResult && (
                  <div className="mt-6">
                    <div
                      className={`flex items-center p-4 rounded-lg ${
                        isCorrect
                          ? "bg-green-50 border border-green-200"
                          : "bg-red-50 border border-red-200"
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mr-3" />
                      )}
                      <span
                        className={`font-medium ${
                          isCorrect ? "text-green-800" : "text-red-800"
                        }`}
                      >
                        {isCorrect ? "Đúng!" : "Sai rồi!"}
                      </span>
                    </div>

                    {!showExplanation && (
                      <Button
                        onClick={() => setShowExplanation(true)}
                        variant="outline"
                        className="w-full mt-4"
                      >
                        Xem giải thích
                      </Button>
                    )}

                    {showExplanation && (
                      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg shadow-sm">
                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Giải thích chi tiết
                        </h4>
                        <div className="space-y-3 text-sm">
                          {currentQuestion.explanation
                            .split(".")
                            .map((part, index) => {
                              if (part.trim() === "") return null;
                              const text = part.trim() + ".";

                              if (text.startsWith("Dịch nghĩa:")) {
                                return (
                                  <div
                                    key={index}
                                    className="bg-white p-3 rounded-md border-l-4 border-green-400"
                                  >
                                    <p className="font-medium text-green-800">
                                      📖 {text}
                                    </p>
                                  </div>
                                );
                              }

                              if (text.startsWith("Đáp án đúng:")) {
                                return (
                                  <div
                                    key={index}
                                    className="bg-white p-3 rounded-md border-l-4 border-blue-400"
                                  >
                                    <p className="font-medium text-blue-800">
                                      ✅ {text}
                                    </p>
                                  </div>
                                );
                              }

                              if (text.startsWith("Các đáp án sai:")) {
                                return (
                                  <div
                                    key={index}
                                    className="bg-white p-3 rounded-md border-l-4 border-red-400"
                                  >
                                    <p className="font-medium text-red-800">
                                      ❌ {text}
                                    </p>
                                  </div>
                                );
                              }

                              if (text.startsWith("Lý do")) {
                                return (
                                  <div
                                    key={index}
                                    className="bg-white p-3 rounded-md border-l-4 border-yellow-400"
                                  >
                                    <p className="font-medium text-yellow-800">
                                      💡 {text}
                                    </p>
                                  </div>
                                );
                              }

                              return (
                                <div
                                  key={index}
                                  className="bg-white p-2 rounded-md"
                                >
                                  <p className="text-gray-700">{text}</p>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                onClick={handlePreviousQuestion}
                disabled={currentQuestionIndex === 0}
                variant="outline"
              >
                Câu trước
              </Button>

              <span className="text-sm text-gray-500">
                {currentQuestionIndex + 1} / {questions.length}
              </span>

              <Button onClick={handleNextQuestion} disabled={!showResult}>
                {currentQuestionIndex === questions.length - 1
                  ? "Hoàn thành"
                  : "Câu tiếp"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
