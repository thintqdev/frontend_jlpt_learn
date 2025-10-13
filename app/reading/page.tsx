"use client";

import { useState, useEffect, lazy, Suspense } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Search,
  Clock,
  Target,
  ChevronRight,
  Filter,
  Star,
  Award,
} from "lucide-react";
import AppLayout from "@/components/app-layout";
import PageHeader from "@/components/page-header";
import Link from "next/link";
import { getReadings, searchReadings } from "@/lib/reading";

const SmartPagination = lazy(() => import("@/components/smart-pagination"));

interface ReadingPassage {
  id: number;
  title: string;
  textType: "short" | "medium" | "long";
  content: string;
  readingQuestions: {
    question: string;
    options: string[];
    correctAnswer: number;
  }[];
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

// Fake data (same as admin page)
const fakeReadingData: ReadingPassage[] = [
  {
    id: 1,
    title: "Chuyến đi đến Tokyo",
    textType: "short",
    content:
      "昨日、友達と一緒に東京に行きました。朝早く電車に乗って、渋谷に着きました。渋谷はとても賑やかでした。たくさんの人がいて、大きなビルがありました。お昼に美味しいラーメンを食べました。午後は原宿に行って、買い物をしました。とても楽しい一日でした。",
    readingQuestions: [
      {
        question: "筆者は誰と東京に行きましたか？",
        options: ["一人で", "友達と", "家族と", "同僚と"],
        correctAnswer: 1,
      },
      {
        question: "お昼に何を食べましたか？",
        options: ["寿司", "ラーメン", "うどん", "そば"],
        correctAnswer: 1,
      },
    ],
    level: "N4",
    explanation:
      "Đây là bài đọc hiểu về chuyến đi đến Tokyo, tập trung vào từ vựng về giao thông và hoạt động hàng ngày.",
    vocabulary: [
      {
        word: "友達",
        reading: "ともだち",
        meaning: "bạn bè",
        example: "友達と一緒に行きます。",
      },
      {
        word: "電車",
        reading: "でんしゃ",
        meaning: "tàu điện",
        example: "毎日電車で会社に行きます。",
      },
    ],
    grammar: [
      {
        pattern: "と一緒に",
        meaning: "cùng với...",
        example: "友達と一緒に東京に行きました。",
      },
    ],
  },
  {
    id: 2,
    title: "Môi trường và ô nhiễm",
    textType: "long",
    content:
      "近年、環境問題が深刻になっています。特に大気汚染は世界中で大きな問題となっており、多くの国が対策を講じています。工場からの排気ガスや自動車の排出ガスが主な原因とされています。この問題を解決するために、各国政府は新しい法律を制定し、企業に対してより厳しい規制を設けています。また、個人レベルでも環境保護に取り組む必要があります。例えば、公共交通機関を利用したり、リサイクルを心がけたりすることが重要です。",
    readingQuestions: [
      {
        question: "大気汚染の主な原因は何ですか？",
        options: ["森林伐採", "工場と自動車の排気ガス", "海洋汚染", "騒音"],
        correctAnswer: 1,
      },
      {
        question:
          "個人レベルでできる環境保護の例として挙げられていないものは？",
        options: ["公共交通機関の利用", "リサイクル", "工場の建設", "なし"],
        correctAnswer: 2,
      },
    ],
    level: "N2",
    explanation:
      "Bài đọc về vấn đề môi trường và ô nhiễm, yêu cầu hiểu biết về từ vựng chuyên ngành và cấu trúc câu phức tạp.",
    vocabulary: [
      {
        word: "環境",
        reading: "かんきょう",
        meaning: "môi trường",
        example: "環境問題は深刻です。",
      },
      {
        word: "汚染",
        reading: "おせん",
        meaning: "ô nhiễm",
        example: "大気汚染が問題になっています。",
      },
      {
        word: "排気ガス",
        reading: "はいきガス",
        meaning: "khí thải",
        example: "車の排気ガスが空気を汚します。",
      },
    ],
    grammar: [
      {
        pattern: "～によって",
        meaning: "do/vì/bởi",
        example: "工場によって空気が汚染されています。",
      },
      {
        pattern: "～べきだ",
        meaning: "nên/phải",
        example: "環境を守るべきです。",
      },
    ],
  },
  {
    id: 3,
    title: "Thời tiết hôm nay",
    textType: "short",
    content:
      "今日はとても暑いです。気温は35度です。空は青くて、雲が少しあります。風はありません。こんな日は、冷たい飲み物が欲しいです。アイスクリームも食べたいです。",
    readingQuestions: [
      {
        question: "今日の気温は何度ですか？",
        options: ["30度", "35度", "40度", "25度"],
        correctAnswer: 1,
      },
    ],
    level: "N5",
    explanation:
      "Bài đọc đơn giản về thời tiết, phù hợp cho người mới bắt đầu học tiếng Nhật.",
    vocabulary: [
      {
        word: "暑い",
        reading: "あつい",
        meaning: "nóng",
        example: "今日はとても暑いです。",
      },
      {
        word: "気温",
        reading: "きおん",
        meaning: "nhiệt độ",
        example: "気温は35度です。",
      },
      {
        word: "飲み物",
        reading: "のみもの",
        meaning: "đồ uống",
        example: "冷たい飲み物が欲しいです。",
      },
    ],
    grammar: [
      {
        pattern: "とても",
        meaning: "rất",
        example: "今日はとても暑いです。",
      },
      {
        pattern: "～が欲しい",
        meaning: "muốn có...",
        example: "冷たい飲み物が欲しいです。",
      },
    ],
  },
  {
    id: 4,
    title: "Mua sắm tại siêu thị",
    textType: "short",
    content:
      "毎週土曜日に、母と一緒にスーパーマーケットに行きます。野菜や肉、魚などを買います。今日は特に新鮮なトマトと美味しそうなりんごを見つけました。レジで支払いをする時、ポイントカードを忘れてしまいました。",
    readingQuestions: [
      {
        question: "誰と一緒にスーパーマーケットに行きますか？",
        options: ["父", "母", "友達", "兄弟"],
        correctAnswer: 1,
      },
      {
        question: "何を忘れましたか？",
        options: ["財布", "買い物リスト", "ポイントカード", "携帯電話"],
        correctAnswer: 2,
      },
    ],
    level: "N4",
    explanation: "Bài đọc về mua sắm hàng ngày, từ vựng cơ bản về thực phẩm.",
    vocabulary: [
      {
        word: "スーパーマーケット",
        reading: "スーパーマーケット",
        meaning: "siêu thị",
        example: "スーパーマーケットで買い物をします。",
      },
      {
        word: "新鮮",
        reading: "しんせん",
        meaning: "tươi sống",
        example: "新鮮な野菜を買いました。",
      },
      {
        word: "支払い",
        reading: "しはらい",
        meaning: "thanh toán",
        example: "レジで支払いをします。",
      },
    ],
    grammar: [
      {
        pattern: "～と一緒に",
        meaning: "cùng với...",
        example: "母と一緒に買い物に行きます。",
      },
      {
        pattern: "～てしまう",
        meaning: "đã làm/xảy ra (hoàn toàn)",
        example: "ポイントカードを忘れてしまいました。",
      },
    ],
  },
  {
    id: 5,
    title: "Công nghệ thông tin trong giáo dục",
    textType: "long",
    content:
      "近年、教育分野においてもIT技術の導入が進んでいます。多くの学校では、タブレットやコンピューターを使った授業が行われるようになりました。これにより、学生たちはより効果的に学習することができるようになりました。しかし、一方で、IT機器に依存しすぎることによる問題も指摘されています。例えば、手書きの能力が低下したり、集中力が散漫になったりすることがあります。教育現場では、IT技術の利点を活かしつつ、従来の教育方法とのバランスを取ることが重要とされています。",
    readingQuestions: [
      {
        question: "IT技術導入の利点は何ですか？",
        options: [
          "コストが安い",
          "効果的な学習ができる",
          "先生が楽になる",
          "時間が短縮される",
        ],
        correctAnswer: 1,
      },
      {
        question: "IT機器に依存することの問題として挙げられていないものは？",
        options: ["手書き能力の低下", "集中力の散漫", "視力の悪化", "なし"],
        correctAnswer: 2,
      },
    ],
    level: "N2",
    explanation:
      "Bài đọc về công nghệ thông tin trong giáo dục, yêu cầu hiểu biết về từ vựng chuyên ngành.",
    vocabulary: [
      {
        word: "教育",
        reading: "きょういく",
        meaning: "giáo dục",
        example: "IT技術が教育に導入されています。",
      },
      {
        word: "技術",
        reading: "ぎじゅつ",
        meaning: "kỹ thuật",
        example: "新しい技術を学びます。",
      },
      {
        word: "効果的",
        reading: "こうかてき",
        meaning: "hiệu quả",
        example: "効果的な学習方法です。",
      },
      {
        word: "依存",
        reading: "いそん",
        meaning: "phụ thuộc",
        example: "コンピューターに依存しすぎる。",
      },
    ],
    grammar: [
      {
        pattern: "～において",
        meaning: "trong/về mặt",
        example: "教育分野においてIT技術が導入されています。",
      },
      {
        pattern: "～つつ",
        meaning: "vừa...vừa",
        example: "利点を活かしつつ、問題も考える。",
      },
    ],
  },
  {
    id: 6,
    title: "Lễ hội mùa xuân",
    textType: "medium",
    content:
      "日本では、春になると桜の花が咲きます。この時期になると、多くの人々が公園や川沿いに集まって、花見を楽しみます。家族や友人と一緒にお弁当を食べたり、写真を撮ったりします。桜の花は約一週間から十日間しか咲かないので、この短い期間を大切にします。また、桜が散る様子も美しく、「桜吹雪」と呼ばれています。",
    readingQuestions: [
      {
        question: "桜の花はどのくらいの期間咲きますか？",
        options: ["約1週間から10日間", "約1ヶ月", "約2週間", "約3日間"],
        correctAnswer: 0,
      },
      {
        question: "桜が散る様子を何と呼びますか？",
        options: ["桜雨", "桜吹雪", "桜風", "桜雲"],
        correctAnswer: 1,
      },
    ],
    level: "N3",
    explanation:
      "Bài đọc về lễ hội ngắm hoa anh đào ở Nhật Bản, giúp hiểu về văn hóa truyền thống và từ vựng về thiên nhiên.",
    vocabulary: [
      {
        word: "桜",
        reading: "さくら",
        meaning: "hoa anh đào",
        example: "春になると桜が咲きます。",
      },
      {
        word: "花見",
        reading: "はなみ",
        meaning: "ngắm hoa",
        example: "家族と花見を楽しみます。",
      },
      {
        word: "散る",
        reading: "ちる",
        meaning: "rơi (hoa)",
        example: "桜の花が散ります。",
      },
    ],
    grammar: [
      {
        pattern: "～と一緒に",
        meaning: "cùng với...",
        example: "友人と一緒にお弁当を食べます。",
      },
      {
        pattern: "～しか～ない",
        meaning: "chỉ có...thôi",
        example: "一週間しか咲かない。",
      },
    ],
  },
];

const ITEMS_PER_PAGE = 4;

export default function ReadingPage() {
  const [readings, setReadings] = useState<ReadingPassage[]>([]);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [textTypeFilter, setTextTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Since filtering is done server-side for non-search, but client-side for search
  const totalPages = searchTerm.trim()
    ? Math.ceil(readings.length / ITEMS_PER_PAGE) || 1
    : Math.ceil(total / ITEMS_PER_PAGE) || 1;
  const paginatedReadings = searchTerm.trim()
    ? readings.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      )
    : readings;

  useEffect(() => {
    setCurrentPage(1);
  }, [levelFilter, textTypeFilter, searchTerm]);

  // Load readings from API
  useEffect(() => {
    const loadReadings = async () => {
      try {
        setLoading(true);
        let result;

        if (searchTerm.trim()) {
          // Use search API when there's a search term
          result = await searchReadings(searchTerm.trim());
          setReadings(result);
          setTotal(result.length);
        } else {
          // Use regular getReadings API for filtering
          const level = levelFilter === "all" ? undefined : levelFilter;
          const textType =
            textTypeFilter === "all" ? undefined : textTypeFilter;
          result = await getReadings(
            currentPage,
            ITEMS_PER_PAGE,
            level,
            textType
          );
          setReadings(result.items);
          setTotal(result.count);
        }
      } catch (error) {
        console.error("Failed to load readings:", error);
        // Fallback to fake data if API fails
        setReadings(fakeReadingData);
        setTotal(fakeReadingData.length);
      } finally {
        setLoading(false);
      }
    };

    loadReadings();
  }, [currentPage, levelFilter, textTypeFilter, searchTerm]);

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

  const getLevelColor = (level: string) => {
    switch (level) {
      case "N5":
        return "bg-rose-100 text-rose-800";
      case "N4":
        return "bg-green-100 text-green-800";
      case "N3":
        return "bg-yellow-100 text-yellow-800";
      case "N2":
        return "bg-orange-100 text-orange-800";
      case "N1":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getEstimatedTime = (type: string, questionCount: number) => {
    const baseTime = type === "short" ? 5 : type === "medium" ? 10 : 15;
    const questionTime = questionCount * 2;
    return baseTime + questionTime;
  };

  const getReadingDescription = (level: string, textType: string) => {
    const levelDesc = {
      N5: "Cơ bản - dành cho người mới bắt đầu",
      N4: "Sơ cấp - từ vựng và cấu trúc đơn giản",
      N3: "Trung cấp - yêu cầu hiểu biết tổng quát",
      N2: "Trung cao - chủ đề chuyên sâu hơn",
      N1: "Nâng cao - văn bản phức tạp và học thuật",
    };

    const typeDesc = {
      short: "văn bản ngắn, dễ hiểu",
      medium: "văn bản trung bình, chi tiết vừa phải",
      long: "văn bản dài, nội dung phong phú",
    };

    return `Bài đọc ${levelDesc[level as keyof typeof levelDesc]} với ${
      typeDesc[textType as keyof typeof typeDesc]
    }.`;
  };

  return (
    <AppLayout>
      <PageHeader
        title="Bài đọc hiểu JLPT"
        subtitle="Luyện tập đọc hiểu theo từng trình độ"
        icon={<BookOpen className="h-8 w-8" />}
        variant="gradient"
        stats={[
          { value: total, label: "Bài đọc" },
          {
            value: readings.reduce(
              (sum: number, r: ReadingPassage) =>
                sum + r.readingQuestions.length,
              0
            ),
            label: "Câu hỏi",
          },
          { value: "N1-N5", label: "Các cấp độ" },
        ]}
        filters={
          <Card className="shadow-sm border-none">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-800">Lọc và tìm kiếm</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Tìm kiếm bài đọc..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn trình độ" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trình độ</SelectItem>
                    <SelectItem value="N5">N5 (Cơ bản)</SelectItem>
                    <SelectItem value="N4">N4 (Sơ cấp)</SelectItem>
                    <SelectItem value="N3">N3 (Trung cấp)</SelectItem>
                    <SelectItem value="N2">N2 (Trung cao)</SelectItem>
                    <SelectItem value="N1">N1 (Nâng cao)</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={textTypeFilter}
                  onValueChange={setTextTypeFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Loại văn bản" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả loại</SelectItem>
                    <SelectItem value="short">Văn bản ngắn</SelectItem>
                    <SelectItem value="medium">Văn bản trung</SelectItem>
                    <SelectItem value="long">Văn bản dài</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        }
      />

      {/* Reading List */}
      <section className="px-6 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {paginatedReadings.map((reading) => (
            <Card
              key={reading.id}
              className="hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-none shadow-md bg-white"
            >
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3">
                  <CardTitle className="text-lg line-clamp-2 flex-1 pr-2">
                    {reading.title}
                  </CardTitle>
                  <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0 mt-1" />
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={getLevelColor(reading.level)}
                    variant="secondary"
                  >
                    {reading.level}
                  </Badge>
                  <Badge
                    className={getTextTypeColor(reading.textType)}
                    variant="outline"
                  >
                    {getTextTypeLabel(reading.textType)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="mb-4">
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {getReadingDescription(reading.level, reading.textType)}
                  </p>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Target className="h-4 w-4 text-rose-500" />
                      <span className="font-medium">
                        {reading.readingQuestions.length}
                      </span>
                      <span className="text-gray-500">câu hỏi</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <Clock className="h-4 w-4 text-green-500" />
                      <span className="font-medium">
                        {getEstimatedTime(
                          reading.textType,
                          reading.readingQuestions.length
                        )}
                      </span>
                      <span className="text-gray-500">phút</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <Award className="h-4 w-4 text-orange-500" />
                      <span className="text-gray-500">Trình độ:</span>
                      <span className="font-medium">{reading.level}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <BookOpen className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">
                        {getTextTypeLabel(reading.textType)}
                      </span>
                    </div>
                  </div>
                </div>
                <Link href={`/reading/${reading.id}`} className="w-full">
                  <Button
                    className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-medium"
                    size="sm"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Bắt đầu luyện tập
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {readings.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Không tìm thấy bài đọc
            </h3>
            <p className="text-gray-500">
              Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm khác
            </p>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-center mt-8">
          <Suspense
            fallback={
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
            }
          >
            <SmartPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              disabled={loading}
            />
          </Suspense>
        </div>
      </section>

      <div className="h-20" />
    </AppLayout>
  );
}
