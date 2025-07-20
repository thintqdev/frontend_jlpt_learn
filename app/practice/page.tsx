import Link from "next/link";
import {
  Target,
  Zap,
  Shuffle,
  Headphones,
  Type,
  Brain,
  Trophy,
  Clock,
  Star,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/app-layout";

const practiceGames = [
  {
    id: "quiz",
    title: "Quiz Trắc nghiệm",
    description: "Chọn đáp án đúng cho từ vựng",
    icon: Target,
    color: "from-blue-500 to-blue-600",
    difficulty: "Dễ",
    time: "5 phút",
    points: "10-50 điểm",
  },
  {
    id: "matching",
    title: "Ghép từ",
    description: "Ghép kanji với nghĩa tiếng Việt",
    icon: Shuffle,
    color: "from-green-500 to-green-600",
    difficulty: "Trung bình",
    time: "3 phút",
    points: "20-60 điểm",
  },
  {
    id: "typing",
    title: "Gõ từ",
    description: "Gõ hiragana cho kanji",
    icon: Type,
    color: "from-purple-500 to-purple-600",
    difficulty: "Khó",
    time: "7 phút",
    points: "30-80 điểm",
  },
  {
    id: "memory",
    title: "Trí nhớ",
    description: "Ghi nhớ và tìm cặp từ giống nhau",
    icon: Brain,
    color: "from-pink-500 to-pink-600",
    difficulty: "Dễ",
    time: "6 phút",
    points: "15-45 điểm",
  },
  {
    id: "listen",
    title: "Nghe - chọn",
    description: "Nghe câu ví dụ và chọn từ vựng",
    icon: Headphones,
    color: "from-yellow-500 to-yellow-600",
    difficulty: "Trung bình",
    time: "10 phút",
    points: "15-45 điểm",
  },
];

export default function PracticePage() {
  return (
    <AppLayout>
      <div className="bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white px-6 pt-12 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">Luyện tập 🎮</h1>
              <p className="text-primary-100">
                Chọn trò chơi yêu thích để luyện từ vựng
              </p>
            </div>
          </div>
        </div>

        {/* Practice Games */}
        <div className="px-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Trò chơi luyện tập
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {practiceGames.map((game) => {
              const Icon = game.icon;
              return (
                <Card
                  key={game.id}
                  className="border-0 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-14 h-14 bg-gradient-to-br ${game.color} rounded-2xl flex items-center justify-center shadow-lg`}
                        >
                          <Icon className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-1">
                            {game.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {game.description}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="secondary"
                              className={`text-xs ${
                                game.difficulty === "Dễ"
                                  ? "bg-green-100 text-green-700"
                                  : game.difficulty === "Trung bình"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {game.difficulty}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              • {game.time}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Link href={`/practice/${game.id}`}>
                        <Button className="bg-primary-600 hover:bg-primary-700 text-white px-6">
                          <Play className="mr-2 h-4 w-4" />
                          Chơi
                        </Button>
                      </Link>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        Điểm thưởng: {game.points}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="text-gray-600">4.8</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Leaderboard Preview */}
        {/* <div className="px-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Bảng xếp hạng</h3>
            <Button variant="ghost" size="sm" className="text-primary-600">
              Xem tất cả
            </Button>
          </div>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="space-y-3">
                {[
                  { rank: 1, name: "Bạn", score: 1250, avatar: "🏆" },
                  { rank: 2, name: "Minh Anh", score: 1180, avatar: "🥈" },
                  { rank: 3, name: "Hoàng Nam", score: 1050, avatar: "🥉" },
                ].map((user) => (
                  <div
                    key={user.rank}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{user.avatar}</span>
                      <div>
                        <p className="font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">#{user.rank}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary-600">{user.score}</p>
                      <p className="text-xs text-gray-500">điểm</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div> */}
      </div>
    </AppLayout>
  );
}
