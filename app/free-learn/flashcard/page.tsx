"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Volume2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "@/components/app-layout";
import { JLPTApi, type JLPTWord } from "@/lib/jlpt-api";

export default function FreeLearnFlashcardPage() {
  const searchParams = useSearchParams();
  const level = searchParams.get("level")
    ? Number.parseInt(searchParams.get("level")!)
    : undefined;

  const [words, setWords] = useState<JLPTWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [completedCards, setCompletedCards] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadWords();
  }, [level]);

  const loadWords = async () => {
    setLoading(true);
    try {
      const fetchedWords = await JLPTApi.getRandomWords(level, 20);
      setWords(fetchedWords);
      setCurrentIndex(0);
      setIsFlipped(false);
      setCompletedCards(new Set());
    } catch (error) {
      console.error("Error loading words:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Đang tải từ vựng...
            </h1>
            <p className="text-gray-600">Lấy dữ liệu từ JLPT API</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (words.length === 0) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              Không thể tải từ vựng
            </h1>
            <Button
              onClick={loadWords}
              className="bg-primary-600 hover:bg-primary-700"
            >
              Thử lại
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / words.length) * 100;

  const handleNext = () => {
    if (currentIndex < words.length - 1) {
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
      setCompletedCards((prev) => new Set([...prev, currentWord.word]));
    }
  };

  const handleSpeak = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(currentWord.furigana);
      utterance.lang = "ja-JP";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const getLevelName = (level: number) => {
    return `N${6 - level}`;
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-green-100 text-green-700";
      case 2:
        return "bg-blue-100 text-blue-700";
      case 3:
        return "bg-yellow-100 text-yellow-700";
      case 4:
        return "bg-orange-100 text-orange-700";
      case 5:
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <AppLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Link href="/free-learn">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-600 hover:bg-primary-50 -ml-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
            </Link>
            <Button
              onClick={loadWords}
              variant="outline"
              size="sm"
              className="border-primary-200 text-primary-600 hover:bg-primary-50"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Từ mới
            </Button>
          </div>

          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600  flex items-center justify-center">
              <span className="text-white text-lg font-bold">📚</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-gray-900">
                  Free Learn Flashcard
                </h1>
                {level && (
                  <Badge variant="secondary" className={getLevelColor(level)}>
                    {getLevelName(level)}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">
                {currentIndex + 1} / {words.length} • Đã học:{" "}
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
                  <CardContent className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary-500 to-primary-600 text-white ">
                    <div className="text-center space-y-6">
                      <div className="space-y-3">
                        <div className="text-5xl japanese-text font-bold">
                          {currentWord.word}
                        </div>
                        <div className="text-xl japanese-text opacity-90">
                          {currentWord.furigana}
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
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
                        <Badge
                          variant="secondary"
                          className="bg-white/20 text-white border-0"
                        >
                          {getLevelName(currentWord.level)}
                        </Badge>
                      </div>
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
                  <CardContent className="h-full flex flex-col justify-center p-6 bg-white ">
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="text-3xl japanese-text text-primary-600 font-bold mb-2">
                          {currentWord.word}
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-4">
                          {currentWord.meaning}
                        </div>
                        <Badge
                          variant="secondary"
                          className={getLevelColor(currentWord.level)}
                        >
                          {getLevelName(currentWord.level)}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        <div className="bg-primary-50 p-4 rounded-lg space-y-2">
                          <div className="japanese-text text-base text-gray-800 text-center">
                            {currentWord.furigana}
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

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                onClick={handlePrevious}
                disabled={currentIndex === 0}
                variant="outline"
                size="lg"
                className="border-primary-200 text-primary-600 hover:bg-primary-50 disabled:opacity-50 px-6"
              >
                <ChevronLeft className="mr-2 h-5 w-5" />
                Trước
              </Button>

              <div className="text-center">
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
                disabled={currentIndex === words.length - 1}
                size="lg"
                className="bg-primary-600 hover:bg-primary-700 text-white disabled:opacity-50 px-6"
              >
                Tiếp
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Completion Message */}
            {currentIndex === words.length - 1 && isFlipped && (
              <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm text-center">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Hoàn thành!
                </h3>
                <p className="text-gray-600 mb-4 text-sm">
                  Bạn đã xem hết {words.length} từ vựng từ JLPT API!
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={loadWords}
                    className="bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    Từ mới
                  </Button>
                  <Link href="/free-learn">
                    <Button
                      variant="outline"
                      className="border-primary-200 text-primary-600 hover:bg-primary-50"
                    >
                      Chế độ khác
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
