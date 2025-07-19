"use client";

import Link from "next/link";
import { BookOpen, Brain, TrendingUp, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/app-layout";
// import { vocabularyData } from "@/lib/vocabulary-data"
import { useEffect, useState } from "react";

export default function HomePage() {
  // const categories = vocabularyData.categories
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const query = `
          query {
            categories {
              items {
                id
                name
                nameJp
                level
              }
            }
          }
        `;
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;
        const response = await fetch(`${apiUrl}/graphql`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const result = await response.json();
        setCategories(result.data.categories.items || []);
      } catch (e) {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <AppLayout>
      <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        {/* App Header */}
        <div className="px-6 pt-12 pb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">Xin chào! 👋</h1>
              <p className="text-primary-100">Hôm nay học gì nhỉ?</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl">🇯🇵</span>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold mb-1">15</div>
              <div className="text-xs text-primary-100">Ngày streak</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold mb-1">127</div>
              <div className="text-xs text-primary-100">Từ đã học</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center">
              <div className="text-2xl font-bold mb-1">N3</div>
              <div className="text-xs text-primary-100">Trình độ</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 -mt-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Học từ mới</h3>
                  <p className="text-xs text-blue-100">5 từ chưa học</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-100" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold mb-1">Free Learn</h3>
                  <p className="text-xs text-purple-100">API từ vựng</p>
                </div>
                <Brain className="h-8 w-8 text-purple-100" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Today's Goal */}
      <div className="px-6 mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900">Mục tiêu hôm nay</h3>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-700"
              >
                8/10 từ
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: "80%" }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">Còn 2 từ nữa là hoàn thành!</p>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <div className="px-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">Chủ đề học tập</h3>
          <Button variant="ghost" size="sm" className="text-primary-600">
            Xem tất cả
          </Button>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-8">
            Đang tải chủ đề...
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map((category: any, index: number) => (
              <Card
                key={category.id}
                className="border-0 shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg japanese-text">
                          {category.nameJp?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-1">
                          {category.name}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant="secondary"
                            className="bg-primary-100 text-primary-700 text-xs"
                          >
                            {category.level}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {category.length || "20+"} từ
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link href={`/vocabulary/${category.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-primary-200 text-primary-600 h-8 px-3"
                        >
                          Học
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="px-6 mb-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          Hoạt động gần đây
        </h3>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 p-3 bg-white rounded-xl shadow-sm">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Award className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">
                Hoàn thành chủ đề "Gia đình"
              </p>
              <p className="text-xs text-gray-500">2 giờ trước</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white rounded-xl shadow-sm">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">
                Streak 15 ngày!
              </p>
              <p className="text-xs text-gray-500">Hôm nay</p>
            </div>
          </div>
          <div className="flex items-center space-x-3 p-3 bg-white rounded-xl shadow-sm">
            <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900 text-sm">Học 20 từ mới</p>
              <p className="text-xs text-gray-500">Hôm qua</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
