"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Shuffle, Volume2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "@/components/app-layout";
import { JLPTApi, type JLPTWord } from "@/lib/jlpt-api";

export default function FreeLearnRandomPage() {
  const searchParams = useSearchParams();
  const level = searchParams.get("level")
    ? Number.parseInt(searchParams.get("level")!)
    : undefined;

  const [currentWord, setCurrentWord] = useState<JLPTWord | null>(null);
  const [loading, setLoading] = useState(true);
  const [wordHistory, setWordHistory] = useState<JLPTWord[]>([]);

  useEffect(() => {
    loadRandomWord();
  }, [level]);

  const loadRandomWord = async () => {
    setLoading(true);
    try {
      const words = await JLPTApi.getRandomWords(level, 1);
      if (words.length > 0) {
        const newWord = words[0];
        setCurrentWord(newWord);
        setWordHistory((prev) => [newWord, ...prev.slice(0, 9)]); // Keep last 10 words
      }
    } catch (error) {
      console.error("Error loading random word:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSpeak = () => {
    if (currentWord && "speechSynthesis" in window) {
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

  if (loading && !currentWord) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Đang tải từ ngẫu nhiên...
            </h1>
            <p className="text-gray-600">Lấy dữ liệu từ JLPT API</p>
          </div>
        </div>
      </AppLayout>
    );
  }

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
              onClick={loadRandomWord}
              disabled={loading}
              className="bg-primary-600 hover:bg-primary-700"
            >
              {loading ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Shuffle className="mr-2 h-4 w-4" />
              )}
              Từ mới
            </Button>
          </div>

          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600  flex items-center justify-center">
              <Shuffle className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-gray-900">
                  Từ ngẫu nhiên
                </h1>
                {level && (
                  <Badge variant="secondary" className={getLevelColor(level)}>
                    {getLevelName(level)}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">
                Khám phá từ vựng bất ngờ từ JLPT
              </p>
            </div>
          </div>
        </div>

        {/* Current Word */}
        {currentWord && (
          <div className="px-6 py-8">
            <Card className="border-0 shadow-lg mb-6">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  <div className="space-y-3">
                    <div className="text-6xl japanese-text font-bold text-gray-900">
                      {currentWord.word}
                    </div>
                    <div className="text-2xl japanese-text text-gray-600">
                      {currentWord.furigana}
                    </div>
                  </div>

                  <div className="flex items-center justify-center space-x-3">
                    <Button
                      onClick={handleSpeak}
                      variant="outline"
                      size="lg"
                      className="border-primary-200 text-primary-600 hover:bg-primary-50"
                    >
                      <Volume2 className="mr-2 h-5 w-5" />
                      Phát âm
                    </Button>
                    <Badge
                      variant="secondary"
                      className={`${getLevelColor(
                        currentWord.level
                      )} text-base px-3 py-1`}
                    >
                      {getLevelName(currentWord.level)}
                    </Badge>
                  </div>

                  <div className="bg-primary-50 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Nghĩa:
                    </h3>
                    <p className="text-2xl font-bold text-primary-800">
                      {currentWord.meaning}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-8">
              <Button
                onClick={loadRandomWord}
                disabled={loading}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-3"
              >
                {loading ? (
                  <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <Shuffle className="mr-2 h-5 w-5" />
                )}
                Từ tiếp theo
              </Button>
              <Link href="/free-learn/flashcard" className="flex-1">
                <Button
                  variant="outline"
                  className="w-full border-primary-200 text-primary-600 hover:bg-primary-50 py-3"
                >
                  Chế độ Flashcard
                </Button>
              </Link>
            </div>

            {/* Word History */}
            {wordHistory.length > 1 && (
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  Từ đã xem ({wordHistory.length - 1})
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {wordHistory.slice(1).map((word, index) => (
                    <Card key={index} className="border-0 shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div>
                              <div className="text-lg japanese-text font-bold text-gray-900">
                                {word.word}
                              </div>
                              <div className="text-sm text-gray-600">
                                {word.furigana}
                              </div>
                            </div>
                            <Badge
                              variant="secondary"
                              className={getLevelColor(word.level)}
                            >
                              {getLevelName(word.level)}
                            </Badge>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              {word.meaning}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
