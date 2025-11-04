"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";
import AppLayout from "@/components/app-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getCategoryById } from "@/lib/category";

interface Blank {
  id: number;
  original: string;
  options: string[];
  correctAnswer: number;
}

interface ReadingData {
  passage: string;
  blanks: Blank[];
  translation: string;
  explanations: string[];
  highlightedWords: string[];
}

export default function ReadingPracticePage() {
  const params = useParams();
  const categoryId = params.category;

  const [category, setCategory] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [readingData, setReadingData] = useState<ReadingData | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<(number | null)[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [level, setLevel] = useState("N3");
  const [questionCount, setQuestionCount] = useState(5);
  const [rateLimited, setRateLimited] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);
  const [retryAfterSeconds, setRetryAfterSeconds] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (!categoryId) {
      setLoading(false);
      return;
    }

    async function fetchCategory() {
      try {
        const data = await getCategoryById(Number(categoryId));
        setCategory(data);
      } catch (err) {
        console.error("Error fetching category:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchCategory();
  }, [categoryId]);

  const handleGenerate = async () => {
    if (!category?.words || category.words.length === 0) return;

    setGenerating(true);
    setReadingData(null);
    setSelectedAnswers([]);
    setShowResults(false);
    setRateLimited(false);
    setRateLimitMessage(null);
    setRetryAfterSeconds(null);

    try {
      const res = await fetch("/api/generate-vocabulary-reading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          words: category.words,
          level,
          questionCount,
        }),
      });

      // Handle 429 Too Many Requests
      if (res.status === 429) {
        const retryHeader = res.headers.get("Retry-After");
        const retrySeconds = retryHeader ? parseInt(retryHeader, 10) : null;
        setRetryAfterSeconds(
          retrySeconds && !isNaN(retrySeconds) ? retrySeconds : null
        );
        setRateLimitMessage(
          "Máy AI đang quá bận luyện đọc — nó vừa uống quá nhiều trà xanh. Hãy đợi một chút nhé!"
        );
        setRateLimited(true);
        setGenerating(false);
        return;
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(err.error || "Failed to generate reading");
      }

      const data: ReadingData = await res.json();
      setReadingData(data);
      setSelectedAnswers(new Array(data.blanks.length).fill(null));
    } catch (error) {
      console.error("Error generating reading:", error);
      alert("Lỗi: " + (error instanceof Error ? error.message : "Unknown"));
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectAnswer = (blankId: number, optionIndex: number) => {
    if (showResults) return;
    const newAnswers = [...selectedAnswers];
    newAnswers[blankId] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    if (!readingData) return { correct: 0, total: 0 };
    let correct = 0;
    readingData.blanks.forEach((blank, idx) => {
      if (selectedAnswers[idx] === blank.correctAnswer) {
        correct++;
      }
    });
    return { correct, total: readingData.blanks.length };
  };

  const renderPassageWithHighlight = () => {
    if (!readingData) return null;

    let text = readingData.passage;
    const highlightedWords = readingData.highlightedWords || [];

    // Highlight words in the passage
    let highlighted = text;
    highlightedWords.forEach((word: string) => {
      const regex = new RegExp(
        `(${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "g"
      );
      highlighted = highlighted.replace(
        regex,
        `<mark style="background-color: #fff3cd; font-weight: bold;">$1</mark>`
      );
    });

    return (
      <div
        className="text-lg leading-relaxed"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    );
  };
  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen px-6 pt-12">
          <div className="max-w-3xl mx-auto">Đang tải...</div>
        </div>
      </AppLayout>
    );
  }

  if (rateLimited) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 px-6 pt-12 pb-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-4">🤖☕️📚</div>
            <h2 className="text-2xl font-semibold mb-2">
              Ối không — AI đang quá bận đọc sách!
            </h2>
            <p className="text-gray-700 mb-4">
              {rateLimitMessage || "Hệ thống nhận quá nhiều yêu cầu cùng lúc."}
            </p>
            {retryAfterSeconds ? (
              <p className="text-sm text-gray-600 mb-6">
                Bạn có thể thử lại sau khoảng{" "}
                <strong>{retryAfterSeconds} giây</strong>.
              </p>
            ) : (
              <p className="text-sm text-gray-600 mb-6">
                Thử nhấn "Thử lại" sau vài giây — hoặc quay lại và chọn bài học
                khác khi AI tỉnh lại.
              </p>
            )}

            <div className="flex items-center justify-center space-x-3 mb-6">
              <Button
                onClick={async () => {
                  setRateLimited(false);
                  setRateLimitMessage(null);
                  setRetryAfterSeconds(null);
                  setGenerating(true);
                  await handleGenerate();
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Thử lại
              </Button>

              <Link href={`/vocabulary/${categoryId}`}>
                <Button variant="outline">Quay lại danh sách</Button>
              </Link>
            </div>

            <p className="text-sm text-gray-500">
              💡 Gợi ý: Nếu lỗi xảy ra thường xuyên, hãy giảm số câu hỏi hoặc
              thử lại sau vài phút.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50 px-6 pt-12 pb-12">
        <div className="max-w-4xl mx-auto">
          <Link href={`/vocabulary/${categoryId}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </Link>

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Luyện tập đọc hiểu</h1>
              <p className="text-gray-600">Chủ đề: {category?.name}</p>
            </div>
            <Badge variant="secondary">{category?.words?.length || 0} từ</Badge>
          </div>

          {!readingData ? (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Cài đặt bài luyện tập</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Trình độ
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="N5">N5</option>
                    <option value="N4">N4</option>
                    <option value="N3">N3</option>
                    <option value="N2">N2</option>
                    <option value="N1">N1</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Số câu hỏi
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) =>
                      setQuestionCount(parseInt(e.target.value, 10))
                    }
                    className="w-full border rounded px-3 py-2"
                  >
                    <option value="3">3 câu</option>
                    <option value="5">5 câu</option>
                    <option value="8">8 câu</option>
                    <option value="10">10 câu</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={handleGenerate}
                    disabled={generating}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    {generating ? "Đang tạo..." : "Tạo bài luyện tập"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Đoạn văn đọc hiểu</CardTitle>
                  <p className="text-sm text-gray-500 mt-2">
                    ✏️ Các từ vựng được{" "}
                    <mark style={{ backgroundColor: "#fff3cd" }}>tô đậm</mark>{" "}
                    là những từ bạn đã học
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="bg-white p-6 rounded border border-gray-200 text-lg leading-relaxed japanese-text mb-6">
                    {renderPassageWithHighlight()}
                  </div>

                  {/* Answer Options Section */}
                  <div className="bg-gray-50 p-6 rounded border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-4">
                      Chọn đáp án cho các chỗ trống:
                    </h3>
                    <div className="space-y-3">
                      {readingData.blanks.map((blank, blankId) => {
                        const selected = selectedAnswers[blankId];
                        return (
                          <div
                            key={blankId}
                            className="bg-white p-3 rounded border border-gray-200"
                          >
                            <div className="text-sm font-medium text-gray-700 mb-2">
                              Chỗ trống {blankId + 1}:
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {blank.options.map((opt, oi) => {
                                const isSelected = selected === oi;
                                const isCorrect = oi === blank.correctAnswer;

                                return (
                                  <button
                                    key={oi}
                                    onClick={() =>
                                      handleSelectAnswer(blankId, oi)
                                    }
                                    disabled={showResults}
                                    className={`px-3 py-2 rounded border-2 text-sm font-medium transition-all ${
                                      isSelected
                                        ? showResults
                                          ? isCorrect
                                            ? "border-green-500 bg-green-50 text-green-700"
                                            : "border-red-500 bg-red-50 text-red-700"
                                          : "border-primary-500 bg-primary-50 text-primary-700"
                                        : showResults && isCorrect
                                        ? "border-green-500 bg-green-50 text-green-700"
                                        : "border-gray-300 hover:border-gray-400 text-gray-700 hover:bg-gray-50"
                                    }`}
                                  >
                                    <span className="font-bold mr-1">
                                      {String.fromCharCode(65 + oi)}.
                                    </span>
                                    {opt}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {showResults && readingData.translation && (
                    <div className="bg-blue-50 p-4 rounded border border-blue-200 mb-6">
                      <h3 className="font-semibold text-blue-800 mb-2">
                        Bản dịch tiếng Việt:
                      </h3>
                      <p className="text-gray-700">{readingData.translation}</p>
                    </div>
                  )}

                  {showResults &&
                    readingData.explanations &&
                    readingData.explanations.length > 0 && (
                      <div className="bg-green-50 p-4 rounded border border-green-200">
                        <h3 className="font-semibold text-green-800 mb-3">
                          Giải thích đáp án:
                        </h3>
                        <div className="space-y-2">
                          {readingData.explanations.map((explanation, idx) => (
                            <div key={idx} className="text-sm text-gray-700">
                              <span className="font-medium">
                                Câu hỏi {idx + 1}:
                              </span>{" "}
                              {explanation}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </CardContent>
              </Card>

              {showResults && (
                <Card className="mb-6 border-blue-300 bg-blue-50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary-600 mb-2">
                        {calculateScore().correct}/{calculateScore().total}
                      </div>
                      <p className="text-gray-700">
                        {Math.round(
                          (calculateScore().correct / calculateScore().total) *
                            100
                        )}
                        % câu trả lời chính xác
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Lựa chọn: {selectedAnswers.filter((a) => a !== null).length}/
                  {readingData.blanks.length}
                </div>

                <div className="flex gap-2">
                  {!showResults ? (
                    <Button
                      onClick={handleSubmit}
                      disabled={selectedAnswers.some((a) => a === null)}
                      className="bg-primary-600 hover:bg-primary-700"
                    >
                      Kiểm tra đáp án
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setReadingData(null);
                        setSelectedAnswers([]);
                        setShowResults(false);
                      }}
                      variant="outline"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Làm lại
                    </Button>
                  )}

                  <Link href={`/vocabulary/${categoryId}`}>
                    <Button variant="outline">Quay lại</Button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
