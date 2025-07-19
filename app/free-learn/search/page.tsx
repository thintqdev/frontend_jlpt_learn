"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Volume2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import AppLayout from "@/components/app-layout";
import { JLPTApi, type JLPTWord } from "@/lib/jlpt-api";

export default function FreeLearnSearchPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<JLPTWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const results = await JLPTApi.searchWord(searchQuery.trim());
      setSearchResults(results);
      setHasSearched(true);
    } catch (error) {
      console.error("Error searching:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSpeak = (word: JLPTWord) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word.furigana);
      utterance.lang = "ja-JP";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const getLevelName = (level: number) => {
    return `N${6 - level}`;
  };

  const getLevelColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-green-100 text-green-700";
      case 2:
        return "bg-blue-100 text-blue-700";
      case 3:
        return "bg-yellow-100 text-yellow-700";
      case 4:
        return "bg-orange-100 text-orange-700";
      case 5:
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <AppLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Link href="/free-learn">
              <Button
                variant="ghost"
                size="sm"
                className="text-primary-600 hover:bg-primary-50 -ml-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
            </Link>
          </div>

          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
              <Search className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Tìm kiếm từ vựng
              </h1>
              <p className="text-sm text-gray-600">Tra cứu từ vựng JLPT</p>
            </div>
          </div>

          {/* Search Input */}
          <div className="flex space-x-3">
            <div className="flex-1 relative">
              <Input
                placeholder="Nhập từ tiếng Nhật (kanji, hiragana, katakana)..."
                className="border-gray-200 focus:border-primary-300"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="bg-primary-600 hover:bg-primary-700"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Search Results */}
        <div className="px-6 py-6">
          {loading && (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Đang tìm kiếm...</p>
            </div>
          )}

          {!loading && hasSearched && searchResults.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không tìm thấy kết quả
              </h3>
              <p className="text-gray-600 mb-4">
                Thử tìm kiếm với từ khóa khác
              </p>
            </div>
          )}

          {!loading && !hasSearched && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tìm kiếm từ vựng JLPT
              </h3>
              <p className="text-gray-600 mb-4">
                Nhập từ tiếng Nhật để bắt đầu tìm kiếm
              </p>
              <div className="space-y-2 text-sm text-gray-500">
                <p>Ví dụ: 夜更かし, あいず, 合図</p>
                <p>Hỗ trợ: Kanji, Hiragana, Katakana</p>
              </div>
            </div>
          )}

          {!loading && searchResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">
                  Kết quả tìm kiếm ({searchResults.length})
                </h3>
                <Badge
                  variant="secondary"
                  className="bg-primary-100 text-primary-700"
                >
                  "{searchQuery}"
                </Badge>
              </div>

              {searchResults.map((word, index) => (
                <Card
                  key={index}
                  className="border-0 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div>
                            <div className="text-2xl japanese-text text-gray-900 font-bold">
                              {word.word}
                            </div>
                            <div className="text-lg japanese-text text-gray-600">
                              {word.furigana}
                            </div>
                          </div>
                          <Badge
                            variant="secondary"
                            className={getLevelColor(word.level)}
                          >
                            {getLevelName(word.level)}
                          </Badge>
                        </div>
                        <div className="ml-0">
                          <div className="bg-primary-50 rounded-lg p-3">
                            <p className="text-primary-800 font-medium">
                              {word.meaning}
                            </p>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleSpeak(word)}
                        variant="ghost"
                        size="sm"
                        className="text-primary-600 hover:bg-primary-50 ml-2"
                      >
                        <Volume2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
