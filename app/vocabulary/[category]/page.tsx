"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, Play, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/app-layout";
import { getCategoryById } from "@/lib/category";

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.category;
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!categoryId) {
      setLoading(false);
      return;
    }
    setLoading(true);

    async function fetchCategory() {
      try {
        const words = await getCategoryById(Number(categoryId));

        setCategory(words);
      } catch (error) {
        console.error("Error loading category:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCategory();
  }, [categoryId]);

  if (loading) {
    return (
      <AppLayout>
        <div className="bg-white min-h-screen">
          <div className="px-6 pt-12">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
              <div className="h-12 bg-gray-200 rounded mb-6"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!category) {
    return (
      <AppLayout>
        <div className="bg-white min-h-screen">
          <div className="px-6 pt-12">
            <div className="text-center py-12">
              <div className="text-6xl mb-4">😕</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không tìm thấy chủ đề
              </h3>
              <p className="text-gray-600 mb-4">
                Chủ đề này không tồn tại hoặc đã bị xóa
              </p>
              <Link href="/vocabulary">
                <Button variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại danh sách
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
      <div className="bg-white min-h-screen">
        {/* Header */}
        <div className="px-6 pt-12 pb-6 border-b border-gray-100">
          <Link href="/vocabulary">
            <Button
              variant="ghost"
              size="sm"
              className="mb-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>

          <div className="flex items-center space-x-4 mb-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl japanese-text font-bold">
                {category.nameJp?.charAt(0) || "N"}
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {category.name}
                </h1>
                <Badge
                  variant="secondary"
                  className={`${
                    category.level === "N5"
                      ? "bg-green-100 text-green-700"
                      : category.level === "N4"
                      ? "bg-blue-100 text-blue-700"
                      : category.level === "N3"
                      ? "bg-yellow-100 text-yellow-700"
                      : category.level === "N2"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {category.level}
                </Badge>
              </div>
              <p className="text-3xl japanese-text text-primary-600 font-medium mb-2">
                {category.nameJp}
              </p>
              <p className="text-gray-600">{category.description}</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
            <div className="flex items-center">
              <BookOpen className="mr-1 h-4 w-4" />
              {category.words.length} từ vựng
            </div>
          </div>

          <div className="flex space-x-3">
            <Link href={`/flashcard/${category.id}`} className="flex-1">
              <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white">
                <Play className="mr-2 h-4 w-4" />
                Bắt đầu học
              </Button>
            </Link>
          </div>
        </div>

        {/* Vocabulary List */}
        <div className="px-6 py-6">
          <div className="space-y-4">
            {category.words.map((word: any) => (
              <Card
                key={word.id}
                className="border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-2xl japanese-text font-bold text-gray-900">
                          {word.kanji}
                        </h3>
                        <span className="text-lg japanese-text text-primary-600">
                          {word.hiragana}
                        </span>
                      </div>
                      <p className="text-lg font-medium text-gray-800 mb-2">
                        {word.meaning}
                      </p>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="japanese-text text-gray-700 mb-1">
                          {word.example}
                        </p>
                        <p className="text-sm text-gray-600">
                          {word.exampleMeaning}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
