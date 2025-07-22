"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Volume2, ArrowLeft, Users, Clock, Play } from "lucide-react";
import AppLayout from "@/components/app-layout";


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
  conversation: KaiwaLine[];
}

// Dữ liệu kaiwa mẫu (có thể import từ file riêng nếu cần)
const kaiwaSamples = [
    {
      id: 1,
      title: "Chào buổi sáng",
      level: "N5",
      conversation: [
        {
          speaker: "A",
          jp: "おはようございます。",
          romaji: "Ohayou gozaimasu.",
          vi: "Chào buổi sáng.",
        },
        {
          speaker: "B",
          jp: "おはよう。元気？",
          romaji: "Ohayou. Genki?",
          vi: "Chào buổi sáng. Khỏe không?",
        },
        {
          speaker: "A",
          jp: "はい、元気です。",
          romaji: "Hai, genki desu.",
          vi: "Vâng, tôi khỏe.",
        },
      ],
    },
    {
      id: 2,
      title: "Đi mua sắm",
      level: "N5",
      conversation: [
        {
          speaker: "A",
          jp: "これ、いくらですか。",
          romaji: "Kore, ikura desu ka?",
          vi: "Cái này bao nhiêu tiền vậy?",
        },
        {
          speaker: "B",
          jp: "500円です。",
          romaji: "Go-hyaku en desu.",
          vi: "500 yên ạ.",
        },
        {
          speaker: "A",
          jp: "じゃあ、これをください。",
          romaji: "Jaa, kore o kudasai.",
          vi: "Vậy, cho tôi cái này nhé.",
        },
      ],
    },
    {
      id: 3,
      title: "Hỏi đường",
      level: "N4",
      conversation: [
        {
          speaker: "A",
          jp: "すみません、駅はどこですか。",
          vi: "Xin lỗi, nhà ga ở đâu vậy?",
        },
        {
          speaker: "B",
          jp: "まっすぐ行って、右に曲がってください。",
          vi: "Đi thẳng rồi rẽ phải nhé.",
        },
      ],
    },
    {
      id: 4,
      title: "Gọi món ở nhà hàng",
      level: "N5",
      conversation: [
        {
          speaker: "A",
          jp: "すみません、メニューをください。",
          vi: "Xin lỗi, cho tôi xem thực đơn.",
        },
        { speaker: "B", jp: "はい、どうぞ。", vi: "Vâng, mời bạn." },
        {
          speaker: "A",
          jp: "このラーメンを一つお願いします。",
          vi: "Cho tôi một tô mì ramen này.",
        },
      ],
    },
    {
      id: 5,
      title: "Hẹn gặp bạn",
      level: "N4",
      conversation: [
        {
          speaker: "A",
          jp: "明日、何時に会いましょうか。",
          vi: "Ngày mai, mấy giờ mình gặp nhau?",
        },
        {
          speaker: "B",
          jp: "午後2時はどうですか。",
          vi: "2 giờ chiều được không?",
        },
        { speaker: "A", jp: "いいですね。", vi: "Được đấy." },
      ],
    },
    {
      id: 6,
      title: "Mua vé tàu",
      level: "N4",
      conversation: [
        {
          speaker: "A",
          jp: "新幹線の切符を買いたいです。",
          vi: "Tôi muốn mua vé tàu shinkansen.",
        },
        { speaker: "B", jp: "どこまで行きますか。", vi: "Bạn đi đến đâu?" },
        { speaker: "A", jp: "東京までです。", vi: "Đến Tokyo." },
      ],
    },
    {
      id: 7,
      title: "Đi khám bệnh",
      level: "N3",
      conversation: [
        { speaker: "A", jp: "頭が痛いです。", vi: "Tôi bị đau đầu." },
        { speaker: "B", jp: "熱はありますか。", vi: "Bạn có bị sốt không?" },
        { speaker: "A", jp: "はい、少しあります。", vi: "Vâng, tôi hơi sốt." },
      ],
    },
    {
      id: 8,
      title: "Xin nghỉ phép",
      level: "N3",
      conversation: [
        {
          speaker: "A",
          jp: "来週、休みを取りたいです。",
          vi: "Tuần sau tôi muốn xin nghỉ.",
        },
        { speaker: "B", jp: "何日間ですか。", vi: "Bạn nghỉ mấy ngày?" },
        { speaker: "A", jp: "三日間です。", vi: "Ba ngày." },
      ],
    },
    {
      id: 9,
      title: "Nhận bưu kiện",
      level: "N2",
      conversation: [
        {
          speaker: "A",
          jp: "荷物を受け取りたいです。",
          vi: "Tôi muốn nhận bưu kiện.",
        },
        {
          speaker: "B",
          jp: "お名前を教えてください。",
          vi: "Bạn cho tôi biết tên nhé.",
        },
        { speaker: "A", jp: "グエンです。", vi: "Tôi là Nguyễn." },
      ],
    },
    {
      id: 10,
      title: "Phỏng vấn xin việc",
      level: "N2",
      conversation: [
        {
          speaker: "A",
          jp: "自己紹介をお願いします。",
          vi: "Bạn hãy giới thiệu bản thân.",
        },
        {
          speaker: "B",
          jp: "グエンと申します。ベトナムから来ました。",
          vi: "Tôi tên là Nguyễn, đến từ Việt Nam.",
        },
        {
          speaker: "A",
          jp: "よろしくお願いします。",
          vi: "Rất mong được giúp đỡ.",
        },
      ],
    },
    {
      id: 11,
      title: "Thảo luận dự án",
      level: "N1",
      conversation: [
        {
          speaker: "A",
          jp: "このプロジェクトの進捗はどうですか。",
          vi: "Tiến độ dự án này thế nào rồi?",
        },
        {
          speaker: "B",
          jp: "順調に進んでいます。",
          vi: "Mọi việc tiến triển tốt.",
        },
        { speaker: "A", jp: "何か問題はありますか。", vi: "Có vấn đề gì không?" },
      ],
    },
    {
      id: 12,
      title: "Bàn về thời tiết",
      level: "N5",
      conversation: [
        { speaker: "A", jp: "今日は暑いですね。", vi: "Hôm nay nóng nhỉ." },
        {
          speaker: "B",
          jp: "そうですね。夏が来ました。",
          vi: "Đúng vậy, mùa hè đến rồi.",
        },
      ],
    },
    {
      id: 13,
      title: "Gọi taxi",
      level: "N4",
      conversation: [
        {
          speaker: "A",
          jp: "タクシーを呼んでください。",
          vi: "Làm ơn gọi giúp tôi taxi.",
        },
        { speaker: "B", jp: "どこまで行きますか。", vi: "Bạn đi đến đâu?" },
        { speaker: "A", jp: "駅までお願いします。", vi: "Đến nhà ga giúp tôi." },
      ],
    },
    {
      id: 14,
      title: "Đặt phòng khách sạn",
      level: "N3",
      conversation: [
        { speaker: "A", jp: "部屋を予約したいです。", vi: "Tôi muốn đặt phòng." },
        { speaker: "B", jp: "何名様ですか。", vi: "Quý khách đi mấy người?" },
        { speaker: "A", jp: "二人です。", vi: "Hai người." },
      ],
    },
    {
      id: 15,
      title: "Cuộc hẹn ở quán cà phê",
      level: "N3",
      conversation: [
        {
          speaker: "A",
          jp: "こんにちは、遅れてごめんね。",
          vi: "Xin chào, xin lỗi mình đến muộn.",
        },
        {
          speaker: "B",
          jp: "大丈夫だよ。今来たところ。",
          vi: "Không sao đâu. Mình cũng vừa mới đến.",
        },
        { speaker: "A", jp: "何を飲みたい？", vi: "Bạn muốn uống gì?" },
        {
          speaker: "B",
          jp: "コーヒーにしようかな。",
          vi: "Chắc mình sẽ uống cà phê.",
        },
        {
          speaker: "A",
          jp: "私も同じのを頼むね。",
          vi: "Mình cũng gọi giống bạn nhé.",
        },
        {
          speaker: "B",
          jp: "最近どう？忙しい？",
          vi: "Dạo này bạn thế nào? Bận không?",
        },
        {
          speaker: "A",
          jp: "ちょっと忙しいけど、元気だよ。",
          vi: "Cũng hơi bận nhưng mình vẫn khỏe.",
        },
      ],
    },
    {
      id: 16,
      title: "Thảo luận về du lịch",
      level: "N2",
      conversation: [
        {
          speaker: "A",
          jp: "夏休みにどこか行く予定ある？",
          vi: "Kỳ nghỉ hè này bạn có dự định đi đâu không?",
        },
        {
          speaker: "B",
          jp: "北海道に行きたいと思ってる。",
          vi: "Mình định đi Hokkaido.",
        },
        {
          speaker: "A",
          jp: "いいね！何日ぐらい行くの？",
          vi: "Hay quá! Bạn đi mấy ngày?",
        },
        { speaker: "B", jp: "5日間の予定だよ。", vi: "Dự định đi 5 ngày." },
        {
          speaker: "A",
          jp: "美味しいものたくさん食べてきてね。",
          vi: "Nhớ ăn nhiều món ngon nhé.",
        },
        {
          speaker: "B",
          jp: "もちろん！写真もたくさん撮るよ。",
          vi: "Tất nhiên rồi! Mình sẽ chụp nhiều ảnh nữa.",
        },
      ],
    },
    {
      id: 17,
      title: "Phàn nàn về dịch vụ",
      level: "N1",
      conversation: [
        {
          speaker: "A",
          jp: "すみません、注文した料理がまだ来ていません。",
          vi: "Xin lỗi, món tôi gọi vẫn chưa được mang ra.",
        },
        {
          speaker: "B",
          jp: "申し訳ありません。すぐに確認いたします。",
          vi: "Xin lỗi quý khách. Tôi sẽ kiểm tra ngay.",
        },
        {
          speaker: "A",
          jp: "もう30分も待っています。",
          vi: "Tôi đã đợi 30 phút rồi.",
        },
        {
          speaker: "B",
          jp: "大変ご迷惑をおかけしました。",
          vi: "Thành thật xin lỗi vì đã làm phiền quý khách.",
        },
        {
          speaker: "A",
          jp: "できれば早くお願いします。",
          vi: "Nếu được thì làm ơn mang ra nhanh giúp tôi.",
        },
        {
          speaker: "B",
          jp: "かしこまりました。すぐにお持ちします。",
          vi: "Vâng, tôi sẽ mang ra ngay.",
        },
      ],
    },
];

export default function KaiwaDailyPage() {
  const [selectedLevel, setSelectedLevel] = useState("Tất cả");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedKaiwa, setSelectedKaiwa] = useState(null);
  const [showMeanings, setShowMeanings] = useState({});
  const pageSize = 8;
  const levels = ["Tất cả", "N5", "N4", "N3", "N2", "N1"];

  const filteredKaiwa = (
    selectedLevel === "Tất cả"
      ? kaiwaSamples
      : kaiwaSamples.filter((k) => k.level === selectedLevel)
  ).filter(
    (k) =>
      k.title.toLowerCase().includes(search.toLowerCase()) ||
      k.category.toLowerCase().includes(search.toLowerCase()) ||
      k.conversation.some(
        (line) =>
          line.jp.includes(search) ||
          (line.vi && line.vi.toLowerCase().includes(search.toLowerCase()))
      )
  );

  const totalPage = Math.ceil(filteredKaiwa.length / pageSize) || 1;
  const pagedKaiwa = filteredKaiwa.slice((page - 1) * pageSize, page * pageSize);

  function handleFilterChange(fn) {
    return (...args) => {
      fn(...args);
      setPage(1);
    };
  }

  async function speakJapanese(text) {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Không thể phát âm:", err);
    }
  }

  if (selectedKaiwa) {
    return (
      <div className="bg-white min-h-screen">
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
                {selectedKaiwa.title}
              </h1>
              <div className="flex items-center space-x-3 text-sm text-gray-600">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {selectedKaiwa.category}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {selectedKaiwa.duration}
                </div>
              </div>
            </div>
            <Badge className="self-start">
              {selectedKaiwa.level}
            </Badge>
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">Nội dung hội thoại</h2>
            <Button
              onClick={() => window.location.href = `/kaiwa/${selectedKaiwa.id}`}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Luyện tập
            </Button>
          </div>
          <Card className="border-2 border-rose-100 shadow">
            <CardContent className="p-4 sm:p-6 space-y-4">
              {selectedKaiwa.conversation.map((line, idx) => {
                const key = `${selectedKaiwa.id}-${idx}`;
                const isRight = line.speaker !== "A";
                return (
                  <div key={idx} className={`flex ${isRight ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-full sm:max-w-[85%] rounded-xl px-4 py-3 shadow-sm border ${
                        isRight ? "bg-rose-50 border-rose-200 ml-auto" : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-sm text-gray-600">
                          {line.speaker === "A" ? "Người A" : "Người B"}
                        </span>
                        <button onClick={() => speakJapanese(line.jp)} type="button">
                          <Volume2 className="w-4 h-4 text-gray-500" />
                        </button>
                      </div>
                      <div className="text-base sm:text-lg font-medium mb-1 japanese-text">
                        {line.jp}
                      </div>
                      {line.romaji && <div className="text-sm text-gray-500 italic mb-1">{line.romaji}</div>}
                      <button
                        className="text-sm text-rose-600 underline font-medium"
                        onClick={() => setShowMeanings((prev) => ({ ...prev, [key]: !prev[key] }))}
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
      <div className="bg-white min-h-screen">
        <div className="px-4 sm:px-6 pt-10 pb-6 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Kaiwa hằng ngày</h1>
            <Badge variant="secondary" className="bg-rose-100 text-rose-700">
              {filteredKaiwa.length} đoạn hội thoại
            </Badge>
          </div>

          <div className="mb-4">
            <input
              className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-400"
              placeholder="Tìm kiếm theo tiêu đề, chủ đề hoặc nội dung..."
              value={search}
              onChange={handleFilterChange((e) => setSearch(e.target.value))}
            />
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-2 snap-x snap-mandatory">
            {levels.map((level) => (
              <Button
                key={level}
                variant={selectedLevel === level ? "default" : "outline"}
                size="sm"
                onClick={handleFilterChange(() => setSelectedLevel(level))}
                className={`snap-start whitespace-nowrap ${
                  selectedLevel === level
                    ? "bg-rose-600 hover:bg-rose-700"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {level}
              </Button>
            ))}
          </div>
        </div>

        <div className="px-4 sm:px-6 py-6">
          {pagedKaiwa.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-3">🔍</div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                Không có hội thoại nào
              </h3>
              <p className="text-gray-600">Thử chọn trình độ khác hoặc từ khóa khác</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pagedKaiwa.map((kaiwa) => (
                <Card
                  key={kaiwa.id}
                  className="border hover:border-rose-300 hover:shadow transition-all duration-200 rounded-xl group"
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
                      <Badge className="mt-1">
                        {kaiwa.level}
                      </Badge>
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

          {filteredKaiwa.length > pageSize && (
            <div className="flex justify-center items-center mt-8 space-x-2">
              <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(page - 1)}>
                Trước
              </Button>
              <span className="text-sm text-gray-600 px-4">
                Trang {page}/{totalPage}
              </span>
              <Button size="sm" variant="outline" disabled={page === totalPage} onClick={() => setPage(page + 1)}>
                Sau
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}