"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/app-layout";
import { getCategoryById, fetchShortCategories } from "@/lib/category";
import { fetchVocabulariesByCategoryIds } from "@/lib/vocabulary";

interface Question {
  id: number;
  kanji: string;
  hiragana: string;
  options: string[];
  correct: number;
  category: string;
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [gameFinished, setGameFinished] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isQuizStarted, setIsQuizStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data: any = await fetchShortCategories();
        setCategories(data.items || []);
      } catch (err) {
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    if (timeLeft > 0 && !gameFinished) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameFinished(true);
    }
  }, [timeLeft, gameFinished]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === questions[currentQuestion].correct;
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);

    if (isCorrect) {
      setScore(score + 10);
    }

    setShowResult(true);

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameFinished(true);
      }
    }, 1500);
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setTimeLeft(300);
    setGameFinished(false);
    setAnswers([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Khi nhấn Bắt đầu quiz
  const startQuiz = async () => {
    if (selectedCategories.length === 0) {
      setError("Vui lòng chọn ít nhất 1 chủ đề!");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const vocabularies = await fetchVocabulariesByCategoryIds(
        selectedCategories.map(Number).filter(Number.isInteger)
      );
      // Sinh câu hỏi quiz từ vocabularies
      const allWords = vocabularies || [];
      const selectedWords = allWords
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(20, allWords.length));
      if (selectedWords.length === 0) {
        setQuestions([]);
        setLoading(false);
        setError("Không có từ vựng nào trong các chủ đề đã chọn!");
        return;
      }
      const generatedQuestions: Question[] = selectedWords.map((word: any) => {
        const otherDefinitions = allWords
          .filter((w: any) => w.id !== word.id)
          .map((w: any) => w.definition)
          .slice(0, 3);
        const options = [word.definition, ...otherDefinitions].sort(
          () => Math.random() - 0.5
        );
        const correctIndex = options.indexOf(word.definition);
        return {
          id: word.id,
          kanji: word.kanji,
          hiragana: word.hiragana,
          options,
          correct: correctIndex,
          category: word.category?.name || "mixed",
        };
      });
      setQuestions(generatedQuestions);
      setIsQuizStarted(true);
      setLoading(false);
    } catch (err: any) {
      setQuestions([]);
      setLoading(false);
      setError("Lỗi khi tải dữ liệu từ vựng!");
    }
  };

  // UI chọn category trước khi bắt đầu quiz
  if (!isQuizStarted) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
            <h1 className="text-2xl font-bold mb-4 text-center">
              Chọn chủ đề để bắt đầu Quiz
            </h1>
            {categories.length === 0 ? (
              <div className="text-center text-gray-500">
                Đang tải chủ đề...
              </div>
            ) : (
              <div className="mb-4 max-h-64 overflow-y-auto">
                {categories.map((cat: any) => (
                  <label
                    key={cat.id}
                    className="flex items-center mb-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="mr-2 accent-primary-600"
                      checked={selectedCategories.includes(Number(cat.id))}
                      onChange={() => {
                        setSelectedCategories((prev) =>
                          prev.includes(Number(cat.id))
                            ? prev.filter((id) => id !== Number(cat.id))
                            : [...prev, Number(cat.id)]
                        );
                      }}
                    />
                    <span className="font-medium">
                      {cat.name}{" "}
                      <span className="text-gray-400 ml-1">({cat.nameJp})</span>
                    </span>
                  </label>
                ))}
              </div>
            )}
            {error && (
              <div className="text-red-500 text-sm mb-2 text-center">
                {error}
              </div>
            )}
            <Button
              onClick={startQuiz}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 text-lg font-medium"
              disabled={loading}
            >
              {loading ? "Đang tải..." : "Bắt đầu"}
            </Button>
            <Link
              href="/practice"
              className="block mt-4 text-center text-primary-600 hover:underline"
            >
              Quay lại
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (questions.length === 0) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              Đang tải...
            </h1>
          </div>
        </div>
      </AppLayout>
    );
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (gameFinished) {
    const correctAnswers = answers.filter(Boolean).length;
    const accuracy = Math.round((correctAnswers / questions.length) * 100);

    return (
      <AppLayout>
        <div className="bg-gray-50 min-h-screen">
          <div className="px-6 pt-12 pb-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">
                {accuracy >= 80 ? "🎉" : accuracy >= 60 ? "👏" : "💪"}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {accuracy >= 80
                  ? "Xuất sắc!"
                  : accuracy >= 60
                  ? "Tốt lắm!"
                  : "Cố gắng thêm!"}
              </h1>
              <p className="text-gray-600">
                Bạn đã hoàn thành quiz trắc nghiệm
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary-600 mb-1">
                    {score}
                  </div>
                  <div className="text-sm text-gray-600">Điểm số</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {accuracy}%
                  </div>
                  <div className="text-sm text-gray-600">Độ chính xác</div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-sm mb-8">
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-900 mb-3">
                  Kết quả chi tiết
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Câu đúng:</span>
                    <span className="font-medium text-green-600">
                      {correctAnswers}/{questions.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian còn lại:</span>
                    <span className="font-medium text-blue-600">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Điểm thưởng:</span>
                    <span className="font-medium text-primary-600">
                      +{score} điểm
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button
                onClick={resetGame}
                variant="outline"
                className="flex-1 border-primary-200 text-primary-600"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Chơi lại
              </Button>
              <Link href="/practice" className="flex-1">
                <Button className="w-full bg-primary-600 hover:bg-primary-700">
                  Trò chơi khác
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  const question = questions[currentQuestion];

  return (
    <AppLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Link href="/practice">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-600 hover:bg-primary-50 -ml-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span
                  className={`font-medium ${
                    timeLeft < 60 ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-medium text-gray-700">{score}</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold text-gray-900">
                Quiz Trắc nghiệm
              </h1>
              <span className="text-sm text-gray-500">
                {currentQuestion + 1}/{questions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question */}
        <div className="px-6 py-8">
          <Card className="border-0 shadow-sm mb-6">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className="text-4xl japanese-text font-bold text-gray-900 mb-2">
                  {question.kanji}
                </div>
                <div className="text-xl japanese-text text-gray-600">
                  {question.hiragana}
                </div>
              </div>
              <p className="text-lg font-medium text-gray-900">
                Nghĩa của từ này là gì?
              </p>
            </CardContent>
          </Card>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => {
              let buttonClass =
                "w-full p-4 text-left border-2 rounded-xl transition-all duration-200 ";

              if (showResult) {
                if (index === question.correct) {
                  buttonClass += "border-green-500 bg-green-50 text-green-700";
                } else if (index === selectedAnswer) {
                  buttonClass += "border-red-500 bg-red-50 text-red-700";
                } else {
                  buttonClass += "border-gray-200 bg-gray-50 text-gray-500";
                }
              } else if (selectedAnswer === index) {
                buttonClass +=
                  "border-primary-500 bg-primary-50 text-primary-700";
              } else {
                buttonClass +=
                  "border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={buttonClass}
                  disabled={showResult}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {showResult && index === question.correct && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {showResult &&
                      index === selectedAnswer &&
                      index !== question.correct && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <Button
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null || showResult}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 text-lg font-medium"
          >
            {currentQuestion === questions.length - 1
              ? "Hoàn thành"
              : "Câu tiếp theo"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
