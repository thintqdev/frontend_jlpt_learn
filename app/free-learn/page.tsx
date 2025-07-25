"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Shuffle,
  Target,
  Search,
  TrendingUp,
  Clock,
  Star,
  Play,
  Zap,
  Trophy,
  Calendar,
  Flame,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/app-layout";
import { JLPTApi, type JLPTWord } from "@/lib/jlpt-api";

const learningModes = [
  {
    id: "flashcard",
    title: "Flashcard",
    description: "Học từ vựng với thẻ ghi nhớ",
    icon: BookOpen,
    color: "from-blue-500 to-blue-600",
    difficulty: "Dễ",
    href: "/free-learn/flashcard",
  },
  {
    id: "random",
    title: "Từ ngẫu nhiên",
    description: "Khám phá từ vựng bất ngờ",
    icon: Shuffle,
    color: "from-purple-500 to-purple-600",
    difficulty: "Trung bình",
    href: "/free-learn/random",
  },
  {
    id: "practice",
    title: "Luyện tập",
    description: "Quiz và bài tập tương tác",
    icon: Target,
    color: "from-green-500 to-green-600",
    difficulty: "Khó",
    href: "/free-learn/practice",
  },
  {
    id: "search",
    title: "Tìm kiếm",
    description: "Tra cứu từ vựng cụ thể",
    icon: Search,
    color: "from-orange-500 to-orange-600",
    difficulty: "Dễ",
    href: "/free-learn/search",
  },
  {
    id: "challenge",
    title: "Thử thách",
    description: "Thử thách hàng ngày",
    icon: Trophy,
    color: "from-yellow-500 to-yellow-600",
    difficulty: "Khó",
    href: "/free-learn/challenge",
  },
  {
    id: "speed",
    title: "Tốc độ",
    description: "Học nhanh trong thời gian ngắn",
    icon: Zap,
    color: "from-pink-500 to-pink-600",
    difficulty: "Khó",
    href: "/free-learn/speed",
  },
];

const levels = [
  {
    level: 5,
    name: "N5",
    description: "Cơ bản",
    color: "bg-green-100 text-green-700",
  },
  {
    level: 4,
    name: "N4",
    description: "Sơ cấp",
    color: "bg-blue-100 text-blue-700",
  },
  {
    level: 3,
    name: "N3",
    description: "Trung cấp",
    color: "bg-yellow-100 text-yellow-700",
  },
  {
    level: 2,
    name: "N2",
    description: "Trung cao",
    color: "bg-orange-100 text-orange-700",
  },
  {
    level: 1,
    name: "N1",
    description: "Cao cấp",
    color: "bg-red-100 text-red-700",
  },
];

export default function FreeLearnPage() {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [wordOfTheDay, setWordOfTheDay] = useState<JLPTWord | null>(null);
  const [streak, setStreak] = useState(7);

  useEffect(() => {
    loadWordOfTheDay();
  }, []);

  const loadWordOfTheDay = async () => {
    try {
      const words = await JLPTApi.getRandomWords(undefined, 1);
      if (words.length > 0) {
        setWordOfTheDay(words[0]);
      }
    } catch (error) {
      console.error("Error loading word of the day:", error);
    }
  };

  return (
    <AppLayout>
      {/* Header */}
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white px-6 pt-12 pb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-1">Free Learn 🆓</h1>
            <p className="text-primary-100">
              Học từ vựng JLPT miễn phí với API
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold mb-1">∞</div>
            <div className="text-xs text-primary-100">Từ vựng</div>
          </div>
        </div>

        {/* Streak & API Info */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="bg-white/10 backdrop-blur-sm border-0">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <Flame className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{streak} ngày</h3>
                  <p className="text-xs text-primary-100">Streak học tập</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border-0">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Live API</h3>
                  <p className="text-xs text-primary-100">JLPT Official</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Word of the Day */}
      {wordOfTheDay && (
        <div className="px-6 -mt-4 mb-6">
          <Card className="border-0 shadow-lg bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1">Từ trong ngày</h3>
                    <div className="text-2xl japanese-text font-bold">
                      {wordOfTheDay.word}
                    </div>
                    <div className="text-sm opacity-90">
                      {wordOfTheDay.meaning}
                    </div>
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white border-0"
                >
                  {JLPTApi.getLevelName(wordOfTheDay.level)}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Level Selection */}
      <div className="px-6 mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-bold text-gray-900 mb-3">
              Chọn trình độ (tùy chọn)
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {levels.map((level) => (
                <button
                  key={level.level}
                  onClick={() =>
                    setSelectedLevel(
                      selectedLevel === level.level ? null : level.level
                    )
                  }
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    selectedLevel === level.level
                      ? "border-primary-500 bg-primary-50"
                      : "border-gray-200 bg-white hover:border-primary-300"
                  }`}
                >
                  <div className="text-center">
                    <Badge
                      variant="secondary"
                      className={`${level.color} mb-1`}
                    >
                      {level.name}
                    </Badge>
                    <div className="text-xs text-gray-600">
                      {level.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {selectedLevel && (
              <div className="mt-3 p-2 bg-primary-50 rounded-lg">
                <p className="text-sm text-primary-700">
                  Đã chọn trình độ{" "}
                  <span className="font-semibold">
                    {JLPTApi.getLevelName(selectedLevel)}
                  </span>
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <TrendingUp className="h-6 w-6 text-blue-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900">5000+</div>
              <div className="text-xs text-gray-600">Từ vựng</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <Clock className="h-6 w-6 text-green-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900">24/7</div>
              <div className="text-xs text-gray-600">Truy cập</div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 text-center">
              <Star className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
              <div className="text-lg font-bold text-gray-900">Free</div>
              <div className="text-xs text-gray-600">Miễn phí</div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Learning Modes */}
      <div className="px-6 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Chế độ học tập</h3>
        <div className="grid grid-cols-1 gap-4">
          {learningModes.map((mode) => {
            const Icon = mode.icon;
            const href = selectedLevel
              ? `${mode.href}?level=${selectedLevel}`
              : mode.href;

            return (
              <Card
                key={mode.id}
                className="border-0 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div
                        className={`w-14 h-14 bg-gradient-to-br ${mode.color} rounded-2xl flex items-center justify-center shadow-lg`}
                      >
                        <Icon className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-gray-900 mb-1">
                          {mode.title}
                        </h4>
                        <p className="text-sm text-gray-600 mb-2">
                          {mode.description}
                        </p>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            mode.difficulty === "Dễ"
                              ? "bg-green-100 text-green-700"
                              : mode.difficulty === "Trung bình"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {mode.difficulty}
                        </Badge>
                      </div>
                    </div>
                    <Link href={href}>
                      <Button className="bg-primary-600 hover:bg-primary-700 text-white px-6">
                        <Play className="mr-2 h-4 w-4" />
                        Bắt đầu
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* API Endpoints Info */}
      <div className="px-6 mb-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-bold text-gray-900 mb-3">API Endpoints</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Tất cả từ vựng:</span>
                <code className="text-primary-600 bg-primary-50 px-2 py-1 rounded">
                  /api/words/all
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Theo trình độ:</span>
                <code className="text-primary-600 bg-primary-50 px-2 py-1 rounded">
                  /api/words/all?level=5
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ngẫu nhiên:</span>
                <code className="text-primary-600 bg-primary-50 px-2 py-1 rounded">
                  /api/words/random
                </code>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tìm kiếm:</span>
                <code className="text-primary-600 bg-primary-50 px-2 py-1 rounded">
                  /api/words?word=夜更かし
                </code>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
