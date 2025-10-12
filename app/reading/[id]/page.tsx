"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Clock,
  Target,
  CheckCircle,
  XCircle,
  ArrowLeft,
  RotateCcw,
  Lightbulb,
  Book,
  Lock,
  Volume2,
  Plus,
} from "lucide-react";
import AppLayout from "@/components/app-layout";
import JapaneseTextTooltip from "@/components/japanese-text-tooltip";
import { getReading } from "@/lib/reading";

interface ReadingPassage {
  id: number;
  title: string;
  textType: "short" | "medium" | "long";
  content: string;
  translation?: string;
  readingQuestions: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
  questionExplanations?: string[];
  level: "N5" | "N4" | "N3" | "N2" | "N1";
  explanation?: string;
  vocabulary?: {
    word: string;
    reading: string;
    meaning: string;
    example?: string;
  }[];
  grammar?: {
    pattern: string;
    meaning: string;
    example: string;
  }[];
}

export default function ReadingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [reading, setReading] = useState<ReadingPassage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<{ [key: number]: number }>({});
  const [submitted, setSubmitted] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState("content");
  const [userVocabulary, setUserVocabulary] = useState<any[]>([]);

  useEffect(() => {
    const loadReading = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const readingData = await getReading(parseInt(id));
        if (readingData) {
          setReading(readingData);
          setStartTime(new Date());
        } else {
          setError("Không tìm thấy bài đọc này");
        }
      } catch (err) {
        console.error("Failed to load reading:", err);
        setError("Không thể tải bài đọc. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    loadReading();
  }, [id]);

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: answerIndex,
    }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
    setEndTime(new Date());
    setShowExplanation(true);
  };

  const handleRestart = () => {
    setAnswers({});
    setSubmitted(false);
    setShowExplanation(false);
    setStartTime(new Date());
    setEndTime(null);
    setActiveTab("content");
  };

  const handleAddVocabulary = (vocab: any) => {
    setUserVocabulary((prev) => [...prev, vocab]);
  };

  const getScore = () => {
    if (!reading) return 0;
    let correct = 0;
    reading.readingQuestions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return (correct / reading.readingQuestions.length) * 100;
  };

  const getReadingTime = () => {
    if (!startTime || !endTime) return 0;
    return Math.floor((endTime.getTime() - startTime.getTime()) / 1000);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const getLevelColor = (level: string) => {
    const colors = {
      N5: "bg-rose-100 text-rose-800",
      N4: "bg-green-100 text-green-800",
      N3: "bg-yellow-100 text-yellow-800",
      N2: "bg-orange-100 text-orange-800",
      N1: "bg-red-100 text-red-800",
    };
    return colors[level as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getTextTypeLabel = (type: string) => {
    switch (type) {
      case "short":
        return "Ngắn";
      case "medium":
        return "Trung";
      case "long":
        return "Dài";
      default:
        return type;
    }
  };

  const getTextTypeColor = (type: string) => {
    switch (type) {
      case "short":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "long":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen ">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Đang tải bài đọc...</p>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (error || !reading) {
    return (
      <AppLayout>
        <div className="min-h-screen ">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-600 mb-4">
                {error || "Không tìm thấy bài đọc"}
              </p>
              <Button onClick={() => router.push("/reading")} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Quay lại danh sách
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen ">
        <div className="bg-gradient-to-br from-rose-500 to-rose-700 text-white px-6 py-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
          </div>
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="h-6 w-6" />
            <h1 className="text-xl font-bold">{reading.title}</h1>
          </div>
          <p className="text-sm text-rose-100 mb-4">{reading.explanation}</p>
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div>
              <div className="text-lg font-bold">
                {reading.readingQuestions.length}
              </div>
              <div className="text-rose-100">Câu hỏi</div>
            </div>
            <div>
              <div className="text-lg font-bold">{reading.level}</div>
              <div className="text-rose-100">Trình độ</div>
            </div>
            <div>
              <div className="text-lg font-bold">
                {startTime && endTime ? formatTime(getReadingTime()) : "--:--"}
              </div>
              <div className="text-rose-100">Thời gian</div>
            </div>
          </div>
        </div>

        <div className="px-6 mt-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="space-y-6"
          >
            {/* Tab Navigation */}
            <TabsList className="grid w-full grid-cols-1 md:grid-cols-3 h-auto p-2 bg-white shadow-sm border-none">
              <TabsTrigger
                value="content"
                className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-rose-600 data-[state=active]:text-white"
              >
                <BookOpen className="h-4 w-4" />
                {submitted ? "Nội dung & Kết quả" : "Làm bài"}
              </TabsTrigger>
              {submitted && (
                <>
                  <TabsTrigger
                    value="vocabulary"
                    className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-rose-600 data-[state=active]:text-white"
                  >
                    <Book className="h-4 w-4" />
                    Từ vựng
                  </TabsTrigger>
                  <TabsTrigger
                    value="grammar"
                    className="flex items-center gap-2 py-3 data-[state=active]:bg-gradient-to-r data-[state=active]:from-rose-500 data-[state=active]:to-rose-600 data-[state=active]:text-white"
                  >
                    <Lightbulb className="h-4 w-4" />
                    Ngữ pháp
                  </TabsTrigger>
                </>
              )}
            </TabsList>

            {/* Reading Content & Questions Tab */}
            <TabsContent value="content" className="mt-6">
              <div className="space-y-6">
                {/* Reading Content Card - design tương tự trang list */}
                <Card className="hover:shadow-xl transition-all duration-300 border-none shadow-md bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="h-5 w-5" />
                      Nội dung bài đọc
                    </CardTitle>
                    <CardDescription>
                      Đọc kỹ đoạn văn sau và trả lời câu hỏi
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <JapaneseTextTooltip
                      vocabulary={
                        reading.vocabulary?.map((v) => ({
                          word: v.word,
                          hiragana: v.reading,
                          definition: v.meaning,
                          example: v.example,
                        })) || []
                      }
                      onAddVocabulary={handleAddVocabulary}
                      className="cursor-text select-text"
                    >
                      <div
                        className="text-lg leading-relaxed p-6 bg-gray-50 rounded-lg border"
                        style={{
                          fontFamily:
                            "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif",
                          lineHeight: "1.8",
                        }}
                      >
                        {reading.content.split("\n").map((line, index) => (
                          <span key={index}>
                            {line}
                            {index < reading.content.split("\n").length - 1 && (
                              <br />
                            )}
                          </span>
                        ))}
                      </div>
                    </JapaneseTextTooltip>

                    {/* Translation - show below content after submit */}
                    {submitted && reading.translation && (
                      <div className="mt-4 p-6 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-start gap-2 mb-2">
                          <BookOpen className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <h4 className="text-lg font-semibold text-blue-800">
                            Bản dịch tiếng Việt
                          </h4>
                        </div>
                        <div className="text-gray-700 leading-relaxed">
                          {reading.translation
                            ?.split("\n")
                            .map((line, index) => (
                              <span key={index}>
                                {line}
                                {index <
                                  (reading.translation?.split("\n").length ||
                                    0) -
                                    1 && <br />}
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Questions Card */}
                <Card className="hover:shadow-xl transition-all duration-300 border-none shadow-md bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Câu hỏi ({reading.readingQuestions.length})
                    </CardTitle>
                    <CardDescription>
                      Chọn đáp án đúng nhất cho mỗi câu hỏi
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {reading.readingQuestions.map((question, qIndex) => (
                        <div key={qIndex} className="p-4 border rounded-lg">
                          <h3
                            className="font-medium mb-4 text-gray-900"
                            style={{
                              fontFamily:
                                "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif",
                            }}
                          >
                            {qIndex + 1}. {question.question}
                          </h3>
                          <RadioGroup
                            value={answers[qIndex]?.toString() || ""}
                            onValueChange={(value) =>
                              handleAnswerChange(qIndex, parseInt(value))
                            }
                            disabled={submitted}
                            className="space-y-2"
                          >
                            {question.options.map((option, oIndex) => (
                              <div
                                key={oIndex}
                                className="flex items-center space-x-2"
                              >
                                <RadioGroupItem
                                  value={oIndex.toString()}
                                  id={`q${qIndex}-o${oIndex}`}
                                />
                                <Label
                                  htmlFor={`q${qIndex}-o${oIndex}`}
                                  className={`flex-1 p-3 rounded-lg border cursor-pointer transition-colors ${
                                    submitted
                                      ? oIndex === question.correctAnswer
                                        ? "bg-green-50 border-green-200 text-green-800"
                                        : answers[qIndex] === oIndex &&
                                          oIndex !== question.correctAnswer
                                        ? "bg-red-50 border-red-200 text-red-800"
                                        : "bg-gray-50"
                                      : "hover:bg-gray-50"
                                  }`}
                                  style={{
                                    fontFamily:
                                      "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif",
                                  }}
                                >
                                  {oIndex === question.correctAnswer &&
                                    submitted && (
                                      <CheckCircle className="h-4 w-4 text-green-600 mr-2 inline" />
                                    )}
                                  {answers[qIndex] === oIndex &&
                                    oIndex !== question.correctAnswer &&
                                    submitted && (
                                      <XCircle className="h-4 w-4 text-red-600 mr-2 inline" />
                                    )}
                                  {option}
                                </Label>
                              </div>
                            ))}
                          </RadioGroup>

                          {/* Show explanation after submit */}
                          {submitted &&
                            reading.questionExplanations &&
                            reading.questionExplanations[qIndex] && (
                              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <p className="text-sm font-medium text-blue-800 mb-1">
                                      Giải thích:
                                    </p>
                                    <p className="text-sm text-blue-700">
                                      {reading.questionExplanations[qIndex]}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                        </div>
                      ))}
                    </div>

                    {!submitted ? (
                      <div className="mt-6 text-center">
                        <Button
                          onClick={handleSubmit}
                          className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white px-8 py-2"
                          disabled={
                            Object.keys(answers).length !==
                            reading.readingQuestions.length
                          }
                        >
                          <Target className="mr-2 h-4 w-4" />
                          Nộp bài
                        </Button>
                      </div>
                    ) : (
                      <div className="mt-6 text-center space-y-4">
                        <div className="bg-gray-50 p-6 rounded-lg">
                          <div className="grid grid-cols-2 gap-6 text-center">
                            <div>
                              <p className="text-2xl font-bold text-rose-600">
                                {getScore().toFixed(0)}%
                              </p>
                              <p className="text-sm text-gray-600">Điểm số</p>
                            </div>
                            <div>
                              <p className="text-2xl font-bold text-green-600">
                                {formatTime(getReadingTime())}
                              </p>
                              <p className="text-sm text-gray-600">Thời gian</p>
                            </div>
                          </div>
                        </div>
                        <Button onClick={handleRestart} variant="outline">
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Làm lại
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Vocabulary Tab */}
            <TabsContent value="vocabulary" className="mt-6">
              <Card className="hover:shadow-xl transition-all duration-300 border-none shadow-md bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Book className="h-5 w-5" />
                    Từ vựng quan trọng
                  </CardTitle>
                  <CardDescription>
                    Các từ vựng xuất hiện trong bài đọc
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!submitted ? (
                    <div className="text-center py-12">
                      <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Hoàn thành bài tập để mở khóa từ vựng
                      </p>
                    </div>
                  ) : (reading.vocabulary && reading.vocabulary.length > 0) ||
                    userVocabulary.length > 0 ? (
                    <div className="space-y-4">
                      {/* Original vocabulary */}
                      {reading.vocabulary?.map((vocab, index) => (
                        <div
                          key={index}
                          className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className="text-xl font-bold text-gray-900"
                                  style={{
                                    fontFamily:
                                      "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif",
                                  }}
                                >
                                  {vocab.word}
                                </span>
                              </div>
                              <div
                                className="text-sm text-rose-600 bg-rose-50 px-2 py-1 rounded inline-block"
                                style={{
                                  fontFamily:
                                    "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif",
                                }}
                              >
                                {vocab.reading}
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              <Volume2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="space-y-2">
                            <p className="text-gray-700">
                              <span className="font-medium">Nghĩa:</span>{" "}
                              {vocab.meaning}
                            </p>
                            {vocab.example && (
                              <div className="bg-gray-50 p-3 rounded border-l-4 border-rose-200">
                                <p className="text-sm font-medium text-gray-700 mb-1">
                                  Ví dụ:
                                </p>
                                <p
                                  className="text-gray-800"
                                  style={{
                                    fontFamily:
                                      "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif",
                                  }}
                                >
                                  {vocab.example}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* User added vocabulary */}
                      {userVocabulary.length > 0 && (
                        <>
                          <div className="border-t pt-4 mt-6">
                            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                              <Plus className="h-4 w-4" />
                              Từ vựng bạn đã thêm
                            </h4>
                          </div>
                          {userVocabulary.map((vocab, index) => (
                            <div
                              key={`user-${index}`}
                              className="p-4 border rounded-lg hover:bg-gray-50 transition-colors border-l-4 border-l-green-500"
                            >
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span
                                      className="text-xl font-bold text-gray-900"
                                      style={{
                                        fontFamily:
                                          "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif",
                                      }}
                                    >
                                      {vocab.word}
                                    </span>
                                    <Badge
                                      className="bg-green-100 text-green-800"
                                      variant="secondary"
                                    >
                                      Mới thêm
                                    </Badge>
                                  </div>
                                  <div
                                    className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded inline-block"
                                    style={{
                                      fontFamily:
                                        "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif",
                                    }}
                                  >
                                    {vocab.reading}
                                  </div>
                                </div>
                                <Button variant="ghost" size="sm">
                                  <Volume2 className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="space-y-2">
                                <p className="text-gray-700">
                                  <span className="font-medium">Nghĩa:</span>{" "}
                                  {vocab.meaning}
                                </p>
                                {vocab.partOfSpeech && (
                                  <p className="text-sm text-gray-600">
                                    <span className="font-medium">
                                      Từ loại:
                                    </span>{" "}
                                    {vocab.partOfSpeech}
                                  </p>
                                )}
                                {vocab.example && (
                                  <div className="bg-gray-50 p-3 rounded border-l-4 border-green-200">
                                    <p className="text-sm font-medium text-gray-700 mb-1">
                                      Ví dụ:
                                    </p>
                                    <p
                                      className="text-gray-800"
                                      style={{
                                        fontFamily:
                                          "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif",
                                      }}
                                    >
                                      {vocab.example}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Chưa có từ vựng nào được thêm cho bài đọc này
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Grammar Tab */}
            <TabsContent value="grammar" className="mt-6">
              <Card className="hover:shadow-xl transition-all duration-300 border-none shadow-md bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Ngữ pháp quan trọng
                  </CardTitle>
                  <CardDescription>
                    Các cấu trúc ngữ pháp xuất hiện trong bài đọc
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!submitted ? (
                    <div className="text-center py-12">
                      <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        Hoàn thành bài tập để mở khóa ngữ pháp
                      </p>
                    </div>
                  ) : reading.grammar && reading.grammar.length > 0 ? (
                    <div className="space-y-4">
                      {reading.grammar.map((grammar, index) => (
                        <div
                          key={index}
                          className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="mb-3">
                            <div
                              className="text-xl font-bold text-gray-900 bg-yellow-50 px-3 py-2 rounded inline-block"
                              style={{
                                fontFamily:
                                  "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif",
                              }}
                            >
                              {grammar.pattern}
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-gray-700">
                              <span className="font-medium">Nghĩa:</span>{" "}
                              {grammar.meaning}
                            </p>
                            <div className="bg-gray-50 p-3 rounded border-l-4 border-yellow-200">
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                Ví dụ:
                              </p>
                              <p
                                className="text-gray-800"
                                style={{
                                  fontFamily:
                                    "'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', 'Meiryo', sans-serif",
                                }}
                              >
                                {grammar.example}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">
                      Chưa có ngữ pháp nào được thêm cho bài đọc này
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="h-20" />
      </div>
    </AppLayout>
  );
}
