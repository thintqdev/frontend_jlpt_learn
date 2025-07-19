"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
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
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import AppLayout from "@/components/app-layout";
import { fetchShortCategories } from "@/lib/category";
import { fetchVocabulariesByCategoryIds } from "@/lib/vocabulary";

interface TypingQuestion {
  id: number;
  kanji: string;
  hiragana: string;
  meaning: string;
}

export default function TypingPage() {
  const [questions, setQuestions] = useState<TypingQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(420); // 7 minutes
  const [gameFinished, setGameFinished] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [mode, setMode] = useState<"hiragana">("hiragana");
  const inputRef = useRef<HTMLInputElement>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
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

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentQuestion]);

  const startGame = async () => {
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
      const allWords = vocabularies || [];
      const selectedWords = allWords
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(20, allWords.length));
      const typingQs: TypingQuestion[] = selectedWords.map((word: any) => ({
        id: word.id,
        kanji: word.kanji,
        hiragana: word.hiragana,
        meaning: word.definition,
      }));
      setQuestions(typingQs);
      setIsGameStarted(true);
      setLoading(false);
    } catch (err: any) {
      setQuestions([]);
      setLoading(false);
      setError("Lỗi khi tải dữ liệu từ vựng!");
    }
  };

  const handleSubmit = () => {
    const question = questions[currentQuestion];
    const correctAnswer = question.hiragana;
    const correct =
      userInput.trim().toLowerCase() === correctAnswer.toLowerCase();

    setIsCorrect(correct);
    setShowResult(true);

    const newAnswers = [...answers, correct];
    setAnswers(newAnswers);

    if (correct) {
      setScore(score + 15);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setUserInput("");
        setShowResult(false);
      } else {
        setGameFinished(true);
      }
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !showResult && userInput.trim()) {
      handleSubmit();
    }
  };

  const resetGame = () => {
    setCurrentQuestion(0);
    setUserInput("");
    setShowResult(false);
    setIsCorrect(false);
    setScore(0);
    setTimeLeft(420);
    setGameFinished(false);
    setAnswers([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress =
    questions.length > 0 ? ((currentQuestion + 1) / questions.length) * 100 : 0;

  if (!isGameStarted) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
            <h1 className="text-2xl font-bold mb-4 text-center">
              Chọn chủ đề để bắt đầu
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
              onClick={startGame}
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

  if (gameFinished) {
    const correctAnswers = answers.filter(Boolean).length;
    const accuracy =
      questions.length > 0
        ? Math.round((correctAnswers / questions.length) * 100)
        : 0;

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
                  ? "Tuyệt vời!"
                  : accuracy >= 60
                  ? "Khá tốt!"
                  : "Cần luyện thêm!"}
              </h1>
              <p className="text-gray-600">Bạn đã hoàn thành bài tập gõ từ</p>
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
                    <span className="text-gray-600">Từ đúng:</span>
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
  const question = questions[currentQuestion];
  const correctAnswer = question.hiragana;

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
              <h1 className="text-xl font-bold text-gray-900">Gõ từ</h1>
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
                <div className="text-lg text-primary-600 font-medium mb-2">
                  {question.meaning}
                </div>
              </div>
              <p className="text-lg font-medium text-gray-900">
                Gõ hiragana của từ này:
              </p>
            </CardContent>
          </Card>

          {/* Input */}
          <div className="mb-6">
            <Input
              ref={inputRef}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Nhập hiragana..."
              className="text-center text-xl py-4 border-2 focus:border-primary-500"
              disabled={showResult}
            />

            {showResult && (
              <div className="mt-4 text-center">
                <div
                  className={`flex items-center justify-center space-x-2 text-lg font-medium ${
                    isCorrect ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {isCorrect ? (
                    <>
                      <CheckCircle className="h-6 w-6" />
                      <span>Chính xác!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-6 w-6" />
                      <span>Sai rồi!</span>
                    </>
                  )}
                </div>
                {!isCorrect && (
                  <div className="mt-2">
                    <p className="text-gray-600">Đáp án đúng: </p>
                    <p className="text-xl japanese-text font-bold text-primary-600">
                      {correctAnswer}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            onClick={handleSubmit}
            disabled={!userInput.trim() || showResult}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 text-lg font-medium"
          >
            {currentQuestion === questions.length - 1
              ? "Hoàn thành"
              : "Kiểm tra"}
          </Button>

          {/* Hint */}
          <div className="mt-4 text-center text-sm text-gray-500">
            Nhấn Enter để kiểm tra đáp án
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
