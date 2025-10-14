"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Volume2,
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
import { highlightGrammarInSentence } from "@/common/utils";
import { useTTS } from "@/hooks/use-tts";

interface Word {
  id: number;
  kanji: string;
  hiragana: string;
  definition: string;
  example: string;
  translation: string;
}

interface Category {
  id: string;
  name: string;
  nameJp: string;
  level: string;
  description: string;
  words: Word[];
}

export default function ListenChoosePage({ params }: { params?: any }) {
  // 1. TẤT CẢ HOOK Ở ĐẦU FILE
  const { speak } = useTTS();
  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [gameFinished, setGameFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [showSentence, setShowSentence] = useState(false);
  const [autoNextTimeout, setAutoNextTimeout] = useState<NodeJS.Timeout | null>(
    null
  );

  // 2. TẤT CẢ useEffect Ở ĐÂY
  useEffect(() => {
    async function fetchCategories() {
      try {
        const data: any = await fetchShortCategories();
        setCategories(data || []);
      } catch (err) {
        setCategories([]);
      }
    }
    fetchCategories();
  }, []);

  useEffect(() => {
    // clear timeout...
    return () => {
      if (autoNextTimeout) clearTimeout(autoNextTimeout);
    };
  }, [current]);

  // 3. TẤT CẢ HANDLER Ở ĐÂY

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
      if (selectedWords.length === 0) {
        setQuestions([]);
        setLoading(false);
        setError("Không có từ vựng nào trong các chủ đề đã chọn!");
        return;
      }
      // Sinh câu hỏi: mỗi câu là 1 ví dụ, đáp án là 4 từ (1 đúng, 3 sai)
      const questions = selectedWords.map((word: Word) => {
        const wrongs = allWords
          .filter((w: Word) => w.id !== word.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3);
        const options = [word, ...wrongs].sort(() => Math.random() - 0.5);
        return {
          example: word.example,
          translation: word.translation,
          answer: word,
          options,
        };
      });
      setQuestions(questions);
      setIsStarted(true);
      setLoading(false);
    } catch (err) {
      setQuestions([]);
      setLoading(false);
      setError("Lỗi khi tải dữ liệu từ vựng!");
    }
  };

  const handleSpeak = async (text: string) => {
    speak(text);
  };

  const handleSelect = (idx: number) => {
    if (showResult) return;
    setSelected(idx);
    setShowResult(true);
    setShowSentence(true);
    const isCorrect =
      questions[current].options[idx].id === questions[current].answer.id;
    setAnswers((prev) => [...prev, isCorrect]);
    if (isCorrect) setScore((s) => s + 10);
    // Tự động sang câu sau sau 10s
    const timeout = setTimeout(() => {
      handleNext();
    }, 10000);
    setAutoNextTimeout(timeout);
  };

  const handleNext = () => {
    if (autoNextTimeout) clearTimeout(autoNextTimeout);
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
      setSelected(null);
      setShowResult(false);
      setShowSentence(false);
    } else {
      setGameFinished(true);
    }
  };

  const resetGame = () => {
    setCurrent(0);
    setSelected(null);
    setShowResult(false);
    setScore(0);
    setGameFinished(false);
    setAnswers([]);
    setIsStarted(false);
    setShowSentence(false);
  };

  // 4. TẤT CẢ RETURN Ở CUỐI FILE, KHÔNG ĐƯỢC RETURN TRƯỚC HOOK
  // UI chọn category trước khi bắt đầu
  if (!isStarted) {
    // UI chọn category
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-screen  px-4">
          <div className="w-full max-w-md bg-white  shadow p-6">
            <h1 className="text-2xl font-bold mb-4 text-center">
              Chọn chủ đề để bắt đầu nghe chọn đáp án
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

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen text-gray-500">
          Đang tải dữ liệu...
        </div>
      </AppLayout>
    );
  }

  if (error || questions.length === 0) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              Không có dữ liệu
            </h1>
            <Link href="/practice">
              <Button className="bg-primary-600 hover:bg-primary-700">
                Quay lại
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (gameFinished) {
    const correctAnswers = answers.filter(Boolean).length;
    const accuracy = Math.round((correctAnswers / questions.length) * 100);
    return (
      <AppLayout>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="w-full max-w-md bg-white  shadow p-8 mt-12">
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">
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
                Bạn đã hoàn thành phần nghe chọn đáp án
              </p>
            </div>
            <div className="flex justify-between mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {score}
                </div>
                <div className="text-sm text-gray-600">Điểm số</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {accuracy}%
                </div>
                <div className="text-sm text-gray-600">Độ chính xác</div>
              </div>
            </div>
            <Button
              onClick={resetGame}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white mb-3"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Chơi lại
            </Button>
            <Link href="/practice" className="block w-full">
              <Button
                variant="outline"
                className="w-full border-primary-200 text-primary-600"
              >
                Trò chơi khác
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const q = questions[current];
  const progress = ((current + 1) / questions.length) * 100;

  return (
    <AppLayout>
      <div className=" min-h-screen">
        <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Link href="/practice">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-600 hover:bg-primary-50 -ml-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại
              </Button>
            </Link>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Điểm:{" "}
                <span className="font-bold text-primary-600">{score}</span>
              </div>
              <Button
                onClick={resetGame}
                variant="outline"
                size="sm"
                className="border-primary-200 text-primary-600 hover:bg-primary-50"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Làm lại
              </Button>
            </div>
          </div>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold text-gray-900">
                Nghe và chọn đáp án
              </h1>
              <span className="text-sm text-gray-500">
                {current + 1}/{questions.length}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
        <div className="px-6 py-8">
          <Card className="border-0 shadow-sm mb-6">
            <CardContent className="p-6 text-center">
              <div className="mb-4 flex flex-col items-center gap-2">
                <Button
                  onClick={() => handleSpeak(q.example)}
                  variant="ghost"
                  size="icon"
                  className="bg-primary-100 text-primary-700 hover:bg-primary-200"
                >
                  <Volume2 className="h-7 w-7" />
                </Button>
                <div className="text-lg text-gray-700 font-medium">
                  Nghe câu ví dụ và chọn từ đúng
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="space-y-3 mb-8">
            {q.options.map((opt: Word, idx: number) => {
              let buttonClass =
                "w-full p-4 text-left border-2  transition-all duration-200 ";
              if (showResult) {
                if (opt.id === q.answer.id) {
                  buttonClass += "border-green-500 bg-green-50 text-green-700";
                } else if (idx === selected) {
                  buttonClass += "border-red-500 bg-red-50 text-red-700";
                } else {
                  buttonClass += "border-gray-200 bg-gray-50 text-gray-500";
                }
              } else if (selected === idx) {
                buttonClass +=
                  "border-primary-500 bg-primary-50 text-primary-700";
              } else {
                buttonClass +=
                  "border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50";
              }
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(idx)}
                  className={buttonClass}
                  disabled={showResult}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-lg japanese-text">
                      {opt.kanji}
                    </span>
                    {showResult && opt.id === q.answer.id && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {showResult &&
                      idx === selected &&
                      opt.id !== q.answer.id && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                  </div>
                </button>
              );
            })}
          </div>
          {/* Hiển thị lại câu ví dụ với highlight đáp án đúng */}
          {showResult && showSentence && (
            <div className="mt-8 p-6 bg-white  shadow text-center border border-primary-100">
              <div className="text-lg font-semibold text-primary-700 mb-2">
                Câu ví dụ:
              </div>
              <div className="text-xl font-bold text-gray-900 mb-2 japanese-text">
                {highlightGrammarInSentence(
                  q.example.replace(q.answer.kanji, `*${q.answer.kanji}*`)
                )}
              </div>
              <div className="text-base text-primary-600 font-semibold mb-2 japanese-text">
                {q.answer.kanji} - {q.answer.hiragana} - {q.answer.definition}
              </div>
              <div className="text-base text-gray-500 italic mb-2">
                {q.translation}
              </div>
              <div className="mt-4">
                <Button
                  onClick={handleNext}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold"
                >
                  Câu tiếp theo
                </Button>
                <div className="text-xs text-gray-400 mt-2">
                  Tự động chuyển sau 10 giây
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
