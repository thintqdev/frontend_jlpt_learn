"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, Star, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "@/components/app-layout";
import { getCategoryById, fetchShortCategories } from "@/lib/category";
import { fetchVocabulariesByCategoryIds } from "@/lib/vocabulary";

interface MemoryCard {
  id: number;
  content: string;
  type: "kanji" | "meaning";
  pairId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryPage() {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(360); // 6 minutes
  const [gameFinished, setGameFinished] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
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
    fetchPairs();
  }, []);

  async function fetchPairs() {
    try {
      const categoryId = 1; // hoặc lấy từ params nếu muốn
      const category = await getCategoryById(categoryId);
      const allWords = category.words || [];
      // Lấy tối đa 6 cặp random (hoặc ít hơn nếu không đủ)
      const selectedWords = allWords
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(6, allWords.length));
      setTotalPairs(selectedWords.length);
      const gameCards: MemoryCard[] = [];
      selectedWords.forEach((word: any, index: number) => {
        gameCards.push({
          id: index * 2,
          content: word.kanji,
          type: "kanji",
          pairId: index,
          isFlipped: false,
          isMatched: false,
        });
        gameCards.push({
          id: index * 2 + 1,
          content: word.definition,
          type: "meaning",
          pairId: index,
          isFlipped: false,
          isMatched: false,
        });
      });
      // Shuffle cards
      const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
      setCards(shuffledCards);
    } catch (err) {
      setCards([]);
      setTotalPairs(0);
    }
  }

  useEffect(() => {
    if (timeLeft > 0 && !gameFinished && gameStarted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0) {
      setGameFinished(true);
    }
  }, [timeLeft, gameFinished, gameStarted]);

  useEffect(() => {
    if (matchedPairs === totalPairs && totalPairs > 0) {
      setGameFinished(true);
      // Bonus points for completing
      setScore((prev) => prev + 50);
    }
  }, [matchedPairs, totalPairs]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      const firstCard = cards.find((card) => card.id === first);
      const secondCard = cards.find((card) => card.id === second);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // Match found
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.pairId === firstCard.pairId
                ? { ...card, isMatched: true, isFlipped: true }
                : card
            )
          );
          setMatchedPairs((prev) => prev + 1);
          setScore((prev) => prev + 20);
          setFlippedCards([]);
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              flippedCards.includes(card.id)
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
      setMoves((prev) => prev + 1);
    }
  }, [flippedCards, cards]);

  const initializeGame = () => {
    setMatchedPairs(0);
    setMoves(0);
    setScore(0);
    setTimeLeft(360);
    setGameFinished(false);
    setGameStarted(false);
    setFlippedCards([]);
    fetchPairs();
  };

  const handleCardClick = (cardId: number) => {
    if (!gameStarted) setGameStarted(true);

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) {
      return;
    }

    setCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isFlipped: true } : c))
    );
    setFlippedCards((prev) => [...prev, cardId]);
  };

  const resetGame = () => {
    setMatchedPairs(0);
    setMoves(0);
    setScore(0);
    setTimeLeft(360);
    setGameFinished(false);
    setGameStarted(false);
    setFlippedCards([]);
    initializeGame();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
        .slice(0, Math.min(6, allWords.length));
      setTotalPairs(selectedWords.length);
      const gameCards: MemoryCard[] = [];
      selectedWords.forEach((word: any, index: number) => {
        gameCards.push({
          id: index * 2,
          content: word.kanji,
          type: "kanji",
          pairId: index,
          isFlipped: false,
          isMatched: false,
        });
        gameCards.push({
          id: index * 2 + 1,
          content: word.definition,
          type: "meaning",
          pairId: index,
          isFlipped: false,
          isMatched: false,
        });
      });
      const shuffledCards = gameCards.sort(() => Math.random() - 0.5);
      setCards(shuffledCards);
      setIsGameStarted(true);
      setLoading(false);
    } catch (err: any) {
      setCards([]);
      setTotalPairs(0);
      setLoading(false);
      setError("Lỗi khi tải dữ liệu từ vựng!");
    }
  };

  if (gameFinished) {
    const isWin = matchedPairs === totalPairs;
    const efficiency =
      moves > 0 ? Math.round(((matchedPairs * 2) / moves) * 100) : 0;

    return (
      <AppLayout>
        <div className="min-h-screen">
          <div className="px-6 pt-12 pb-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">
                {isWin ? "🎉" : timeLeft === 0 ? "⏰" : "💪"}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {isWin
                  ? "Hoàn thành!"
                  : timeLeft === 0
                  ? "Hết giờ!"
                  : "Kết thúc!"}
              </h1>
              <p className="text-gray-600">
                Bạn đã ghép được {matchedPairs}/{totalPairs} cặp
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
                    {efficiency}%
                  </div>
                  <div className="text-sm text-gray-600">Hiệu quả</div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-sm mb-8">
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-900 mb-3">Thống kê</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Số lượt chơi:</span>
                    <span className="font-medium text-gray-900">{moves}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thời gian đã dùng:</span>
                    <span className="font-medium text-blue-600">
                      {formatTime(360 - timeLeft)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cặp đã ghép:</span>
                    <span className="font-medium text-green-600">
                      {matchedPairs}/{totalPairs}
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

  return (
    <AppLayout>
      <div className=" min-h-screen">
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
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Trò chơi trí nhớ
            </h1>
            <p className="text-gray-600 mb-3">
              Tìm và ghép các cặp từ giống nhau
            </p>
            <div className="flex justify-center space-x-4 text-sm">
              <span className="text-primary-600 font-medium">
                Cặp: {matchedPairs}/{totalPairs}
              </span>
              <span className="text-gray-500">Lượt: {moves}</span>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="px-6 py-8">
          <div className="grid grid-cols-3 gap-3 max-w-sm mx-auto">
            {cards.map((card) => (
              <button
                key={card.id}
                onClick={() => handleCardClick(card.id)}
                disabled={
                  card.isFlipped || card.isMatched || flippedCards.length >= 2
                }
                className={`aspect-square  border-2 transition-all duration-300 ${
                  card.isMatched
                    ? "border-green-500 bg-green-50"
                    : card.isFlipped
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-200 bg-white hover:border-primary-300 hover:bg-primary-50"
                }`}
              >
                <div className="h-full flex items-center justify-center p-2">
                  {card.isFlipped || card.isMatched ? (
                    <div className="text-center">
                      {card.type === "kanji" ? (
                        <div className="text-lg japanese-text font-bold text-gray-900">
                          {card.content}
                        </div>
                      ) : (
                        <div className="text-sm font-medium text-gray-900 leading-tight">
                          {card.content}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-primary-200 rounded-lg flex items-center justify-center">
                      <span className="text-primary-600 font-bold">?</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>

          {/* Instructions */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              {!gameStarted
                ? "Nhấn vào thẻ để bắt đầu"
                : "Tìm và ghép các cặp từ giống nhau"}
            </p>
          </div>

          {/* Reset Button */}
          <div className="mt-6 text-center">
            <Button
              onClick={resetGame}
              variant="outline"
              className="border-primary-200 text-primary-600 hover:bg-primary-50"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Chơi lại
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
