"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MessageCircle,
  Volume2,
  ArrowLeft,
  Users,
  Clock,
  Play,
} from "lucide-react";
import AppLayout from "@/components/app-layout";
import PageHeader from "@/components/page-header";
import { fetchConversations, Conversation } from "@/lib/conversation";

const SmartPagination = lazy(() => import("@/components/smart-pagination"));

// Định nghĩa type cho hội thoại
interface KaiwaLine {
  speaker: string;
  jp: string;
  romaji?: string;
  vi: string;
}
interface Kaiwa {
  id: number;
  title: string;
  level: string;
  category?: string;
  duration?: string;
  conversation: KaiwaLine[];
}

export default function KaiwaDailyPage() {
  const [selectedLevel, setSelectedLevel] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedKaiwa, setSelectedKaiwa] = useState<Kaiwa | null>(null);
  const [showMeanings, setShowMeanings] = useState<Record<string, boolean>>({});
  const [kaiwaList, setKaiwaList] = useState<Kaiwa[]>([]);
  const [loading, setLoading] = useState(true);

  const pageSize = 8;
  const levels = ["Tất cả", "N5", "N4", "N3", "N2", "N1"];

  useEffect(() => {
    async function loadKaiwa() {
      setLoading(true);
      try {
        // Gọi API lấy toàn bộ hội thoại, có thể truyền search & sort nếu muốn
        const conversations: Conversation[] = await fetchConversations();
        setKaiwaList(
          conversations.map((conv) => ({
            id: conv.id,
            title: conv.title,
            level: conv.level,
            category: conv.category,
            duration: conv.duration ?? "5 phút",
            conversation: Array.isArray(conv.conversation)
              ? conv.conversation
              : [],
          }))
        );
      } catch (err) {
        console.error("Lỗi khi lấy hội thoại:", err);
        setKaiwaList([]);
      } finally {
        setLoading(false);
      }
    }
    loadKaiwa();
  }, []);

  const filteredKaiwa = (
    selectedLevel === "Tất cả"
      ? kaiwaList
      : kaiwaList.filter((k) => k.level === selectedLevel)
  ).filter(
    (k) =>
      k.title.toLowerCase().includes(search.toLowerCase()) ||
      (k.category || "").toLowerCase().includes(search.toLowerCase()) ||
      k.conversation.some(
        (line) =>
          line.jp.includes(search) ||
          (line.vi && line.vi.toLowerCase().includes(search.toLowerCase()))
      )
  );

  const totalPage = Math.ceil(filteredKaiwa.length / pageSize) || 1;
  const pagedKaiwa = filteredKaiwa.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  function handleFilterChange(fn: any) {
    return (...args: any) => {
      fn(...args);
      setPage(1);
    };
  }

  async function speakJapanese(text: string) {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ja-JP";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Không thể phát âm:", err);
    }
  }

  if (selectedKaiwa) {
    return (
      <div className="min-h-screen">
        <div className="px-4 sm:px-6 pt-6 pb-4 border-b border-gray-100 bg-gradient-to-r from-rose-50 to-indigo-50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedKaiwa(null)}
            className="mb-4 hover:bg-white/80"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between">
            <div className="mb-3 sm:mb-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                {selectedKaiwa?.title}
              </h1>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {selectedKaiwa?.category}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {selectedKaiwa?.duration}
                </div>
              </div>
            </div>
            <Badge className="self-start">{selectedKaiwa?.level}</Badge>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              Nội dung hội thoại
            </h2>
            <Button
              onClick={() =>
                (window.location.href = `/kaiwa/${selectedKaiwa?.id}`)
              }
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Luyện tập
            </Button>
          </div>
          <Card className="border-2 border-rose-100 shadow">
            <CardContent className="p-4 sm:p-6 space-y-4">
              {selectedKaiwa?.conversation.map((line, idx) => {
                const key = `${selectedKaiwa?.id}-${idx}`;
                const isRight = line.speaker !== "A";
                return (
                  <div
                    key={idx}
                    className={`flex ${
                      isRight ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-full sm:max-w-[85%]  px-4 py-3 shadow-sm border ${
                        isRight
                          ? "bg-rose-50 border-rose-200 ml-auto"
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm text-gray-600">
                          {line.speaker === "A" ? "Người A" : "Người B"}
                        </span>
                        <button
                          onClick={() => speakJapanese(line.jp)}
                          type="button"
                        >
                          <Volume2 className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      <div className="text-base sm:text-lg font-medium mb-1 japanese-text">
                        {line.jp}
                      </div>
                      {line.romaji && (
                        <div className="text-sm text-gray-500 italic mb-1">
                          {line.romaji}
                        </div>
                      )}
                      <button
                        className="text-sm text-rose-600 underline font-medium"
                        onClick={() =>
                          setShowMeanings((prev: any) => ({
                            ...prev,
                            [key]: !prev[key],
                          }))
                        }
                        type="button"
                      >
                        {showMeanings[key] ? "Ẩn nghĩa" : "Xem nghĩa"}
                      </button>
                      {showMeanings[key] && (
                        <div className="mt-2 text-sm text-gray-700">
                          {line.vi}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <PageHeader
        title="Kaiwa hằng ngày"
        badge={{
          text: `${filteredKaiwa.length} đoạn hội thoại`,
          className: "bg-rose-100 text-rose-700",
        }}
        search={{
          placeholder: "Tìm kiếm theo tiêu đề, chủ đề hoặc nội dung...",
          value: search,
          onChange: (value) => handleFilterChange(() => setSearch(value))(),
        }}
        levelFilters={{
          levels: levels,
          selectedLevel: selectedLevel,
          onLevelChange: (level) =>
            handleFilterChange(() => setSelectedLevel(level))(),
        }}
      />

      <div className="px-4 sm:px-6 py-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🔄</div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
              Đang tải hội thoại...
            </h3>
          </div>
        ) : pagedKaiwa.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">🔍</div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
              Không có hội thoại nào
            </h3>
            <p className="text-gray-600">
              Thử chọn trình độ khác hoặc từ khóa khác
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pagedKaiwa.map((kaiwa) => (
              <Card
                key={kaiwa.id}
                className="border hover:border-rose-300 hover:shadow transition-all duration-200  group"
                onClick={() => setSelectedKaiwa(kaiwa)}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 group-hover:text-rose-600">
                        {kaiwa.title}
                      </h3>
                      <p className="text-sm text-gray-600">{kaiwa.category}</p>
                    </div>
                    <Badge className="mt-1">{kaiwa.level}</Badge>
                  </div>
                  <div className="text-sm text-gray-500 flex flex-wrap justify-between items-center">
                    <div className="flex space-x-3 mb-2">
                      <div className="flex items-center">
                        <MessageCircle className="w-4 h-4 mr-1" />
                        {kaiwa.conversation.length} câu
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {kaiwa.duration}
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-1 sm:space-y-0">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          window.location.href = `/kaiwa/${kaiwa.id}`;
                        }}
                        className="text-green-600 border-green-300 hover:bg-green-50"
                      >
                        <Play className="w-3 h-3 mr-1" />
                        Luyện tập
                      </Button>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-700 japanese-text">
                      {kaiwa.conversation[0]?.jp}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {kaiwa.conversation[0]?.vi}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

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
      </div>
    </AppLayout>
  );
}
