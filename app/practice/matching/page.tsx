"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Star, Shuffle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "@/components/app-layout";
import { getCategoryById, fetchShortCategories } from "@/lib/category";
import { fetchVocabulariesByCategoryIds } from "@/lib/vocabulary";

interface MatchItem {
  id: number;
  kanji: string;
  meaning: string;
  matched: boolean;
}

export default function MatchingPage() {
  const [kanjiItems, setKanjiItems] = useState<MatchItem[]>([]);
  const [meaningItems, setMeaningItems] = useState<MatchItem[]>([]);
  const [selectedKanji, setSelectedKanji] = useState<number | null>(null);
  const [selectedMeaning, setSelectedMeaning] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [gameFinished, setGameFinished] = useState(false);
  const [matches, setMatches] = useState(0);
  const [totalPairs, setTotalPairs] = useState(0);
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
    if (matches === totalPairs && totalPairs > 0) {
      setGameFinished(true);
    }
  }, [matches, totalPairs]);

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
        .slice(0, Math.min(10, allWords.length));
      setTotalPairs(selectedWords.length);
      const pairs: MatchItem[] = selectedWords.map((word: any) => ({
        id: word.id,
        kanji: word.kanji,
        meaning: word.definition,
        matched: false,
      }));
      const shuffledKanji = [...pairs].sort(() => Math.random() - 0.5);
      const shuffledMeanings = [...pairs].sort(() => Math.random() - 0.5);
      setKanjiItems(shuffledKanji);
      setMeaningItems(shuffledMeanings);
      setIsGameStarted(true);
      setLoading(false);
    } catch (err: any) {
      setKanjiItems([]);
      setMeaningItems([]);
      setTotalPairs(0);
      setLoading(false);
      setError("Lỗi khi tải dữ liệu từ vựng!");
    }
  };

  const handleKanjiSelect = (id: number) => {
    if (kanjiItems.find((item) => item.id === id)?.matched) return;
    setSelectedKanji(id);

    if (selectedMeaning !== null) {
      checkMatch(id, selectedMeaning);
    }
  };

  const handleMeaningSelect = (id: number) => {
    if (meaningItems.find((item) => item.id === id)?.matched) return;
    setSelectedMeaning(id);

    if (selectedKanji !== null) {
      checkMatch(selectedKanji, id);
    }
  };

  const checkMatch = (kanjiId: number, meaningId: number) => {
    if (kanjiId === meaningId) {
      // Correct match
      setKanjiItems((prev) =>
        prev.map((item) =>
          item.id === kanjiId ? { ...item, matched: true } : item
        )
      );
      setMeaningItems((prev) =>
        prev.map((item) =>
          item.id === meaningId ? { ...item, matched: true } : item
        )
      );
      setScore(score + 20);
      setMatches(matches + 1);
    }

    // Reset selections
    setTimeout(() => {
      setSelectedKanji(null);
      setSelectedMeaning(null);
    }, 500);
  };

  const resetGame = () => {
    setScore(0);
    setTimeLeft(180);
    setGameFinished(false);
    setMatches(0);
    setSelectedKanji(null);
    setSelectedMeaning(null);
    startGame();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!isGameStarted) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <div className="w-full max-w-md bg-white  shadow p-6">
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
    const accuracy =
      totalPairs > 0 ? Math.round((matches / totalPairs) * 100) : 0;

    return (
      <AppLayout>
        <div className="min-h-screen">
          <div className="px-6 pt-12 pb-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">
                {matches === totalPairs
                  ? "🎉"
                  : matches >= Math.max(2, totalPairs - 2)
                  ? "👏"
                  : "💪"}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {matches === totalPairs
                  ? "Hoàn hảo!"
                  : matches >= Math.max(2, totalPairs - 2)
                  ? "Tốt lắm!"
                  : "Cố gắng thêm!"}
              </h1>
              <p className="text-gray-600">
                Bạn đã ghép được {matches}/{totalPairs} cặp
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
                  <div className="text-sm text-gray-600">Hoàn thành</div>
                </CardContent>
              </Card>
            </div>

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

  return (
    <AppLayout>
      <div className="min-h-screen">
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

          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-2">Ghép từ</h1>
            <p className="text-gray-600">
              Ghép kanji với nghĩa tiếng Việt tương ứng
            </p>
            <div className="mt-3">
              <span className="text-sm text-primary-600 font-medium">
                Đã ghép: {matches}/{totalPairs}
              </span>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="px-6 py-8">
          <div className="grid grid-cols-2 gap-6">
            {/* Kanji Column */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                Kanji
              </h3>
              <div className="space-y-3">
                {kanjiItems.map((item) => (
                  <button
                    key={`kanji-${item.id}`}
                    onClick={() => handleKanjiSelect(item.id)}
                    disabled={item.matched}
                    className={`w-full p-4 h-16  border-2 transition-all duration-200 ${
                      item.matched
                        ? "border-green-500 bg-green-50 text-green-700"
                        : selectedKanji === item.id
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50"
                    }`}
                  >
                    <div className="text-2xl japanese-text font-bold">
                      {item.kanji}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Meanings Column */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">
                Nghĩa
              </h3>
              <div className="space-y-3">
                {meaningItems.map((item) => (
                  <button
                    key={`meaning-${item.id}`}
                    onClick={() => handleMeaningSelect(item.id)}
                    disabled={item.matched}
                    className={`w-full p-4 h-16  border-2 transition-all duration-200 ${
                      item.matched
                        ? "border-green-500 bg-green-50 text-green-700"
                        : selectedMeaning === item.id
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50"
                    }`}
                  >
                    <div className="text-lg font-medium">{item.meaning}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Shuffle Button */}
          <div className="mt-8 text-center">
            <Button
              onClick={startGame}
              variant="outline"
              className="border-primary-200 text-primary-600 hover:bg-primary-50"
            >
              <Shuffle className="mr-2 h-4 w-4" />
              Xáo trộn
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
