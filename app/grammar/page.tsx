"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import Link from "next/link";
import { Search, Filter, BookOpen, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import AppLayout from "@/components/app-layout";
import PageHeader from "@/components/page-header";
import { getGrammars } from "@/lib/grammar";

const SmartPagination = lazy(() => import("@/components/smart-pagination"));

const LEVELS = ["Tất cả", "N5", "N4", "N3", "N2", "N1"];
const SORT_OPTIONS = [
  { value: "title", label: "Tên A-Z" },
  { value: "level", label: "Trình độ" },
];

export default function GrammarListPage() {
  const [grammars, setGrammars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("Tất cả");
  const [sortBy, setSortBy] = useState("title");
  const [showFilters, setShowFilters] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch data when filter/search/sort/page changes
  useEffect(() => {
    async function fetchGrammars() {
      setLoading(true);
      try {
        const levelQuery = selectedLevel === "Tất cả" ? "" : selectedLevel;
        const data = await getGrammars(
          page,
          pageSize,
          searchQuery,
          sortBy,
          "asc"
        );
        setGrammars(data.items || []);
        setTotalCount(data.count || 0);
      } catch {
        setGrammars([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    }
    fetchGrammars();
  }, [page, pageSize, searchQuery, sortBy, selectedLevel]);

  // Reset page when filter/search/sort changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };
  const handleLevelChange = (level: string) => {
    setSelectedLevel(level);
    setPage(1);
  };
  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLevel("Tất cả");
    setSortBy("title");
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const hasActiveFilters =
    searchQuery !== "" || selectedLevel !== "Tất cả" || sortBy !== "title";

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
        title="Ngữ pháp"
        badge={{
          text: `${totalCount} mẫu ngữ pháp`,
          className: "bg-primary-100 text-primary-700",
        }}
        search={{
          placeholder: "Tìm kiếm ngữ pháp, định nghĩa...",
          value: searchQuery,
          onChange: (value) => handleSearchChange({ target: { value } } as any),
        }}
        levelFilters={{
          levels: LEVELS,
          selectedLevel: selectedLevel,
          onLevelChange: handleLevelChange,
        }}
        actions={
          hasActiveFilters && (
            <Button
              onClick={clearFilters}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4 mr-1" />
              Xóa bộ lọc
            </Button>
          )
        }
        filters={
          showFilters && (
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg mb-4">
              {/* Level Filter */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Trình độ
                </label>
                <div className="flex flex-wrap gap-2">
                  {LEVELS.map((level) => (
                    <Button
                      key={level}
                      variant={selectedLevel === level ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleLevelChange(level)}
                      className={
                        selectedLevel === level
                          ? "bg-primary-600 hover:bg-primary-700"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
              {/* Sort Options */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Sắp xếp theo
                </label>
                <div className="flex flex-wrap gap-2">
                  {SORT_OPTIONS.map((option) => (
                    <Button
                      key={option.value}
                      variant={sortBy === option.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleSortChange(option.value)}
                      className={
                        sortBy === option.value
                          ? "bg-primary-600 hover:bg-primary-700"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )
        }
      />

      {/* Results Summary */}
      {(searchQuery || selectedLevel !== "Tất cả") && (
        <div className="px-6 py-3 bg-primary-50 border-b border-primary-100">
          <p className="text-sm text-primary-700">
            Tìm thấy <span className="font-semibold">{totalCount}</span> mẫu ngữ
            pháp
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

      {/* Grammars Grid */}
      <div className="px-6 py-6">
        {grammars.length === 0 ? (
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
            {grammars.map((grammar: any, index) => (
              <Card
                key={grammar.id}
                className="border-0 shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4 flex-1 min-w-0">
                      <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-white text-2xl font-bold">
                          {(page - 1) * pageSize + index + 1}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {grammar.title}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={`$${
                              grammar.level === "N5"
                                ? "bg-green-100 text-green-700"
                                : grammar.level === "N4"
                                ? "bg-blue-100 text-blue-700"
                                : grammar.level === "N3"
                                ? "bg-yellow-100 text-yellow-700"
                                : grammar.level === "N2"
                                ? "bg-orange-100 text-orange-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {grammar.level}
                          </Badge>
                        </div>
                        <p className="text-base text-primary-600 font-medium mb-1">
                          {grammar.definition}
                        </p>
                        <p className="text-sm text-gray-600">
                          {grammar.description}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Link href={`/grammar/${grammar.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full border-primary-200 text-primary-600 hover:bg-primary-50"
                      >
                        <BookOpen className="mr-2 h-4 w-4" />
                        Xem chi tiết
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex justify-center mb-8">
        <Suspense
          fallback={
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          }
        >
          <SmartPagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            disabled={loading}
          />
        </Suspense>
      </div>
    </AppLayout>
  );
}
