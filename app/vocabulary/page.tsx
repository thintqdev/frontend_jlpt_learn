"use client";

import { useState, useMemo, useEffect, lazy, Suspense } from "react";
import Link from "next/link";
import { Search, Filter, BookOpen, Users, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import AppLayout from "@/components/app-layout";
import PageHeader from "@/components/page-header";
import { fetchShortCategories } from "@/lib/category";

const SmartPagination = lazy(() => import("@/components/smart-pagination"));

export default function VocabularyListPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("id"); // id, name, level, wordCount
  const [page, setPage] = useState(1);

  const pageSize = 8;

  useEffect(() => {
    async function fetchCategories() {
      setLoading(true);
      try {
        const data = await fetchShortCategories();
        setCategories(data || []);
      } catch (error) {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  // Filter and sort categories
  const filteredCategories = useMemo(() => {
    const filtered = categories.filter((category: any) => {
      const matchesSearch =
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.nameJp.includes(searchQuery) ||
        (category.description || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      const matchesLevel =
        selectedLevel === "Tất cả" || category.level === selectedLevel;

      return matchesSearch && matchesLevel;
    });

    // Sort categories
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case "id":
          return parseInt(a.id) - parseInt(b.id);
        case "level":
          const levelOrder = ["N5", "N4", "N3", "N2", "N1"];
          return levelOrder.indexOf(a.level) - levelOrder.indexOf(b.level);
        case "wordCount":
          return (b.wordCount || 0) - (a.wordCount || 0);
        case "name":
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [categories, searchQuery, selectedLevel, sortBy]);

  const totalPage = Math.ceil(filteredCategories.length / pageSize) || 1;
  const pagedCategories = filteredCategories.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const levels = ["Tất cả", "N5", "N4", "N3", "N2", "N1"];
  const sortOptions = [
    { value: "id", label: "ID tăng dần" },
    { value: "name", label: "Tên A-Z" },
    { value: "level", label: "Trình độ" },
    { value: "wordCount", label: "Số từ" },
  ];

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLevel("Tất cả");
    setSortBy("id");
  };

  function handleFilterChange(fn: any) {
    return (...args: any) => {
      fn(...args);
      setPage(1);
    };
  }

  const hasActiveFilters =
    searchQuery !== "" || selectedLevel !== "Tất cả" || sortBy !== "id";

  if (loading) {
    return (
      <AppLayout>
        <div className="px-6 pt-12 pb-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Từ vựng"
        badge={{
          text: `${filteredCategories.length} chủ đề`,
          className: "bg-primary-100 text-primary-700",
        }}
        search={{
          placeholder: "Tìm kiếm chủ đề, từ khóa...",
          value: searchQuery,
          onChange: handleFilterChange(setSearchQuery),
        }}
        levelFilters={{
          levels: levels,
          selectedLevel: selectedLevel,
          onLevelChange: handleFilterChange(setSelectedLevel),
        }}
        actions={
          hasActiveFilters ? (
            <Button
              onClick={clearFilters}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Xóa bộ lọc
            </Button>
          ) : undefined
        }
      />

      {/* Results Summary */}
      {(searchQuery || selectedLevel !== "Tất cả") && (
        <div className="px-6 py-3 bg-primary-50 border-b border-primary-100">
          <p className="text-sm text-primary-700">
            Tìm thấy{" "}
            <span className="font-semibold">{filteredCategories.length}</span>{" "}
            chủ đề
            {searchQuery && (
              <span>
                {" "}
                cho từ khóa "
                <span className="font-semibold">{searchQuery}</span>"
              </span>
            )}
            {selectedLevel !== "Tất cả" && (
              <span>
                {" "}
                ở trình độ{" "}
                <span className="font-semibold">{selectedLevel}</span>
              </span>
            )}
          </p>
        </div>
      )}

      {/* Categories Grid */}
      <div className="px-6 py-6">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Không tìm thấy kết quả
            </h3>
            <p className="text-gray-600 mb-4">
              Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
            </p>
            <Button onClick={clearFilters} variant="outline">
              Xóa tất cả bộ lọc
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pagedCategories.map((category: any) => (
              <Card
                key={category.id}
                className="border-0 shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-2xl japanese-text font-bold">
                          {category.nameJp.charAt(0)}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {category.name}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={`$${
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
                        <p className="text-2xl japanese-text text-primary-600 font-medium mb-1">
                          {category.nameJp}
                        </p>
                        <p className="text-sm text-gray-600">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <BookOpen className="mr-1 h-4 w-4" />
                        {category.wordCount || 20}+ từ vựng
                      </div>
                      <div className="flex items-center">
                        <Star className="mr-1 h-4 w-4 text-yellow-500 fill-current" />
                        {(4.5 + Math.random() * 0.4).toFixed(1)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Link
                      href={`/vocabulary/${category.id}`}
                      className="w-full"
                      prefetch={true}
                    >
                      <Button
                        variant="outline"
                        className="w-full border-primary-200 text-primary-600 hover:bg-primary-50"
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Học từ vựng
                      </Button>
                    </Link>
                    <Link
                      href={`/flashcard/${category.id}`}
                      className="w-full"
                      prefetch={true}
                    >
                      <Button className="w-full bg-primary-600 hover:bg-primary-700 text-white">
                        Flash Card
                      </Button>
                    </Link>
                    <Link
                      href={`/vocabulary/${category.id}/practice`}
                      className="w-full"
                      prefetch={true}
                    >
                      <Button
                        variant="outline"
                        className="w-full bg-green-600 text-white hover:bg-green-500 hover:text-white"
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Kiểm tra
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-center mt-8">
        <Suspense
          fallback={
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          }
        >
          <SmartPagination
            currentPage={page}
            totalPages={totalPage}
            onPageChange={setPage}
            disabled={loading}
          />
        </Suspense>
      </div>
    </AppLayout>
  );
}
