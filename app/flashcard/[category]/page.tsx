"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Volume2,
  CheckCircle,
  Circle,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "@/components/app-layout";
import { getCategoryById } from "@/lib/category";
import { updateVocabularyStatus } from "@/lib/vocabulary";

interface Word {
  id: number;
  kanji: string;
  hiragana: string;
  definition: string;
  example: string;
  translation: string;
  is_learned?: boolean;
}

interface Category {
  id: string;
  name: string;
  nameJp: string;
  level: string;
  description: string;
  words: Word[];
}

export default function FlashcardPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: categoryId } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCards, setCompletedCards] = useState<Set<number>>(new Set());
  const [category, setCategory] = useState<Category | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      setIsLoading(true);
      const category = await getCategoryById(Number(categoryId));

      if (mounted) {
        if (!category) {
          setIsLoading(false);
          return;
        }
        setCategory(category);

        setIsLoading(false);
      }
    }
    fetchData();

    return () => {
      mounted = false;
    };
  }, [categoryId]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-gray-500">Đang tải dữ liệu...</div>
        </div>
      </AppLayout>
    );
  }

  if (!category) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              Không tìm thấy chủ đề
            </h1>
            <Link href="/vocabulary">
              <Button className="bg-primary-600 hover:bg-primary-700">
                Quay lại
              </Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const currentWord = category.words[currentIndex];
  const progress = ((currentIndex + 1) / category.words.length) * 100;

  const handleNext = () => {
    if (currentIndex < category.words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      setCompletedCards((prev) => new Set([...prev, currentWord.id]));
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompletedCards(new Set());
  };

  const handleSpeak = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.hiragana);
      utterance.lang = "ja-JP";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <AppLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Link href="/vocabulary">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-600 hover:bg-primary-50 -ml-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Link href={`/vocabulary/${category.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-primary-200 text-primary-600 hover:bg-primary-50"
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Danh sách
                </Button>
              </Link>
              <Button
                onClick={handleReset}
                variant="outline"
                size="sm"
                className="border-primary-200 text-primary-600 hover:bg-primary-50"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Làm lại
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg japanese-text font-bold">
                {category.nameJp.charAt(0)}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-gray-900">
                  {category.name}
                </h1>
                <Badge
                  variant="secondary"
                  className="bg-primary-100 text-primary-700"
                >
                  {category.level}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">
                {currentIndex + 1} / {category.words.length} • Đã học:{" "}
                {completedCards.size} từ
              </p>
            </div>
          </div>

          <Progress value={progress} className="h-2" />
        </div>

        {/* Flashcard */}
        <div className="px-6 py-8 flex-1 flex flex-col justify-center">
          <div className="max-w-sm mx-auto w-full">
            <div className="perspective-1000 mb-8">
              <Card
                className={`relative w-full h-80 cursor-pointer transition-transform duration-700 transform-style-preserve-3d ${
                  isFlipped ? "rotate-y-180" : ""
                } hover:shadow-xl shadow-lg`}
                onClick={handleFlip}
              >
                {/* Front Side */}
                <div
                  className={`absolute inset-0 backface-hidden ${
                    isFlipped ? "opacity-0" : "opacity-100"
                  }`}
                >
                  <CardContent className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-xl">
                    <div className="text-center space-y-6">
                      <div className="space-y-3">
                        <div className="text-5xl japanese-text font-bold">
                          {currentWord.kanji}
                        </div>
                        <div className="text-xl japanese-text opacity-90">
                          {currentWord.hiragana}
                        </div>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSpeak();
                        }}
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        <Volume2 className="h-5 w-5" />
                      </Button>
                    </div>
                    <div className="absolute bottom-4 text-sm opacity-75">
                      Nhấn để xem nghĩa
                    </div>
                  </CardContent>
                </div>

                {/* Back Side */}
                <div
                  className={`absolute inset-0 backface-hidden rotate-y-180 ${
                    isFlipped ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <CardContent className="h-full flex flex-col justify-center p-6 bg-white rounded-xl">
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-xl japanese-text text-primary-600 font-bold mb-2">
                          {currentWord.kanji}
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-4">
                          {currentWord.definition}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 text-center text-sm">
                          Ví dụ:
                        </h4>
                        <div className="bg-primary-50 p-4 rounded-lg space-y-2">
                          <div className="japanese-text text-base text-gray-800 text-center">
                            {currentWord.example}
                          </div>
                          <div className="text-sm text-gray-600 text-center">
                            {currentWord.translation}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-xs text-gray-500">
                      Nhấn để quay lại
                    </div>
                  </CardContent>
                </div>
              </Card>
            </div>

            {/* Nút đánh dấu đã thuộc/chưa thuộc - Đặt ngoài card */}
            <div className="flex justify-center mb-8">
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  const newStatus = !currentWord.is_learned;
                  try {
                    await updateVocabularyStatus({
                      id: currentWord.id,
                      is_learned: newStatus,
                    });
                    setCategory((prev) => {
                      if (!prev) return prev;
                      return {
                        ...prev,
                        words: prev.words.map((w) =>
                          w.id === currentWord.id
                            ? { ...w, is_learned: newStatus }
                            : w
                        ),
                      };
                    });
                  } catch (err) {
                    alert("Có lỗi khi cập nhật trạng thái!");
                  }
                }}
                className={`flex items-center gap-3 px-8 py-3 rounded-full font-bold shadow-lg text-lg border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-300
                  ${
                    currentWord.is_learned
                      ? "bg-green-50 text-green-700 border-green-400 hover:bg-green-100"
                      : "bg-white text-primary-700 border-primary-400 hover:bg-primary-50"
                  }
                `}
                style={{ minWidth: 220 }}
              >
                {currentWord.is_learned ? (
                  <CheckCircle className="w-7 h-7 text-green-500" />
                ) : (
                  <Circle className="w-7 h-7 text-primary-400" />
                )}
                <span className="tracking-wide">
                  {currentWord.is_learned ? "Đã thuộc" : "Đánh dấu là đã thuộc"}
                </span>
              </button>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-2">
              <Button
                onClick={() => setCurrentIndex(0)}
                disabled={currentIndex === 0}
                variant="outline"
                size="icon"
                className="rounded-full border-primary-200 text-primary-600 hover:bg-primary-50 disabled:opacity-50"
              >
                <ChevronsLeft className="w-5 h-5" />
              </Button>
              <Button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                variant="outline"
                size="icon"
                className="rounded-full border-primary-200 text-primary-600 hover:bg-primary-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="flex-1 text-center">
                <div className="text-sm text-gray-500 mb-1">
                  Nhấn vào thẻ để xem nghĩa
                </div>
                {isFlipped && (
                  <div className="text-xs text-primary-600 font-medium">
                    ✓ Đã xem nghĩa
                  </div>
                )}
              </div>
              <Button
                onClick={handleNext}
                disabled={currentIndex === category.words.length - 1}
                size="icon"
                className="rounded-full bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => setCurrentIndex(category.words.length - 1)}
                disabled={currentIndex === category.words.length - 1}
                variant="outline"
                size="icon"
                className="rounded-full border-primary-200 text-primary-600 hover:bg-primary-50 disabled:opacity-50"
              >
                <ChevronsRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Completion Message */}
            {currentIndex === category.words.length - 1 && isFlipped && (
              <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm text-center">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Chúc mừng!
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Bạn đã hoàn thành tất cả {category.words.length} từ vựng trong
                  chủ đề này!
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={handleReset}
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    Học lại
                  </Button>
                  <Link href="/vocabulary">
                    <Button
                      variant="outline"
                      className="border-primary-200 text-primary-600 hover:bg-primary-50"
                    >
                      Chọn chủ đề khác
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
