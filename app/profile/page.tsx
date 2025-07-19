import {
  User,
  Settings,
  Award,
  TrendingUp,
  BookOpen,
  Brain,
  Calendar,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/app-layout";

export default function ProfilePage() {
  return (
    <AppLayout>
      <div className="bg-gray-50">
        {/* Profile Header */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white px-6 pt-12 pb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <User className="h-10 w-10 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold mb-1">Trần Quang Thìn</h1>
              <p className="text-primary-100 mb-2">Nhà phát triển, học viên</p>
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-0"
              >
                Trình độ N3
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">127</div>
              <div className="text-xs text-primary-100">Từ đã học</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">15</div>
              <div className="text-xs text-primary-100">Ngày streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold mb-1">8</div>
              <div className="text-xs text-primary-100">Chủ đề</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="px-6 -mt-4 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <BookOpen className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 mb-1">45</div>
                <div className="text-xs text-gray-600">Từ tuần này</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <Brain className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-gray-900 mb-1">23</div>
                <div className="text-xs text-gray-600">Flashcard hôm nay</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Achievements */}
        <div className="px-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Thành tích</h3>
          <div className="grid grid-cols-3 gap-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="text-xs font-medium text-gray-900">
                  Streak Master
                </div>
                <div className="text-xs text-gray-500">15 ngày</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-xs font-medium text-gray-900">
                  Fast Learner
                </div>
                <div className="text-xs text-gray-500">100+ từ</div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Star className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-xs font-medium text-gray-900">
                  Perfect Score
                </div>
                <div className="text-xs text-gray-500">5 chủ đề</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Learning Progress */}
        <div className="px-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Tiến trình học tập
          </h3>
          <Card className="border-0 shadow-sm">
            <CardContent className="p-5">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      Gia đình
                    </span>
                    <span className="text-sm text-gray-500">5/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      Đồ ăn
                    </span>
                    <span className="text-sm text-gray-500">3/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary-500 h-2 rounded-full"
                      style={{ width: "60%" }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      Trường học
                    </span>
                    <span className="text-sm text-gray-500">1/5</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: "20%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings */}
        <div className="px-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Cài đặt</h3>
          <div className="space-y-3">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Settings className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">
                      Cài đặt chung
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400">
                    →
                  </Button>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-600" />
                    <span className="font-medium text-gray-900">
                      Nhắc nhở học tập
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-400">
                    →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
