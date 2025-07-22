"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/app-layout";
import { MessageCircle, Volume2 } from "lucide-react";

// Dữ liệu mẫu cho các đoạn hội thoại kaiwa hằng ngày
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
  const [showMeanings, setShowMeanings] = useState<{ [key: string]: boolean }>(
    {}
  );
  const pageSize = 5;
  const levels = ["Tất cả", "N5", "N4", "N3", "N2", "N1"];

  // Lọc theo trình độ và tìm kiếm
  const filteredKaiwa = (
    selectedLevel === "Tất cả"
      ? kaiwaSamples
      : kaiwaSamples.filter((k) => k.level === selectedLevel)
  ).filter(
    (k) =>
      k.title.toLowerCase().includes(search.toLowerCase()) ||
      k.conversation.some(
        (line) =>
          line.jp.includes(search) ||
          (line.vi && line.vi.toLowerCase().includes(search.toLowerCase()))
      )
  );

  // Phân trang
  const totalPage = Math.ceil(filteredKaiwa.length / pageSize) || 1;
  const pagedKaiwa = filteredKaiwa.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Khi đổi filter/search thì về trang 1
  function handleFilterChange<T extends any[]>(fn: (...args: T) => void) {
    return (...args: T) => {
      fn(...args);
      setPage(1);
    };
  }

  // Hàm phát âm tiếng Nhật sử dụng API server
  async function speakJapanese(text: string) {
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error("Không thể gọi API server");
      const arrayBuffer = await res.arrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.play();
    } catch (err: any) {
      alert("Không phát được âm thanh: " + err.message);
    }
  }

  return (
    <AppLayout>
      <div className="bg-white min-h-screen">
        <div className="px-6 pt-12 pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Kaiwa hằng ngày
            </h1>
            <Badge
              variant="secondary"
              className="bg-primary-100 text-primary-700"
            >
              {filteredKaiwa.length} đoạn hội thoại
            </Badge>
          </div>
          {/* Tìm kiếm */}
          <div className="mb-3">
            <input
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="Tìm kiếm tiêu đề, tiếng Nhật hoặc nghĩa..."
              value={search}
              onChange={handleFilterChange((e) => setSearch(e.target.value))}
            />
          </div>
          {/* Bộ lọc trình độ */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {levels.map((level) => (
              <Button
                key={level}
                variant={selectedLevel === level ? "default" : "outline"}
                size="sm"
                onClick={handleFilterChange(() => setSelectedLevel(level))}
                className={
                  selectedLevel === level
                    ? "bg-primary-600 hover:bg-primary-700 whitespace-nowrap"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap"
                }
              >
                {level}
              </Button>
            ))}
          </div>
        </div>
        {/* Danh sách hội thoại */}
        <div className="px-2 sm:px-6 py-6">
          {pagedKaiwa.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Không có hội thoại nào
              </h3>
              <p className="text-gray-600 mb-4">
                Thử chọn trình độ khác hoặc từ khóa khác
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {pagedKaiwa.map((kaiwa) => (
                <Card
                  key={kaiwa.id}
                  className="border border-primary-200 rounded-3xl shadow-xl bg-gradient-to-br from-white via-primary-50 to-blue-50/60"
                >
                  <CardContent className="p-0">
                    <div className="flex items-center px-6 pt-5 pb-2 border-b border-primary-100 rounded-t-3xl bg-white/80">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-100 mr-3">
                        <MessageCircle className="text-primary-500 w-6 h-6" />
                      </div>
                      <h3 className="text-lg font-bold text-primary-800 flex-1 truncate">
                        {kaiwa.title}
                      </h3>
                      <Badge
                        variant="secondary"
                        className={
                          kaiwa.level === "N5"
                            ? "bg-green-100 text-green-700"
                            : kaiwa.level === "N4"
                            ? "bg-blue-100 text-blue-700"
                            : kaiwa.level === "N3"
                            ? "bg-yellow-100 text-yellow-700"
                            : kaiwa.level === "N2"
                            ? "bg-orange-100 text-orange-700"
                            : "bg-red-100 text-red-700"
                        }
                      >
                        {kaiwa.level}
                      </Badge>
                    </div>
                    <div className="space-y-3 px-4 py-5">
                      {kaiwa.conversation.map((line, idx) => {
                        const key = `${kaiwa.id}-${idx}`;
                        const isRight = line.speaker !== "A";
                        return (
                          <div
                            key={idx}
                            className={`flex ${
                              isRight ? "justify-end" : "justify-start"
                            } flex-col items-stretch`}
                          >
                            <div
                              className={`max-w-[90%] rounded-2xl px-4 py-3 mb-1 shadow-sm text-base flex flex-col relative border border-primary-100"
                                ${
                                  isRight
                                    ? "text-right bg-blue-50 rounded-br-3xl ml-auto"
                                    : "text-left bg-primary-50 rounded-bl-3xl"
                                }
                              `}
                            >
                              <div className="flex items-center mb-1">
                                <span
                                  className={`font-semibold mr-2 ${
                                    isRight
                                      ? "text-blue-600"
                                      : "text-primary-600"
                                  }`}
                                >
                                  {line.speaker}:
                                </span>
                                <span className="japanese-text text-base font-medium break-words">
                                  {line.jp}
                                </span>
                                <button
                                  className="ml-2 p-1 rounded-full hover:bg-primary-100 focus:outline-none"
                                  title="Phát âm"
                                  type="button"
                                  onClick={() => speakJapanese(line.jp)}
                                >
                                  <Volume2 className="w-4 h-4 text-primary-500" />
                                </button>
                              </div>
                              <button
                                className="text-xs text-primary-600 underline self-end mt-1 focus:outline-none font-semibold"
                                onClick={() =>
                                  setShowMeanings((prev) => ({
                                    ...prev,
                                    [key]: !prev[key],
                                  }))
                                }
                                type="button"
                              >
                                {showMeanings[key] ? "Ẩn nghĩa" : "Hiện nghĩa"}
                              </button>
                            </div>
                            {showMeanings[key] && (
                              <div
                                className={`text-xs text-gray-800 mt-1 px-3 pt-1 ${
                                  isRight ? "text-right" : "text-left"
                                } font-medium  rounded-b-xl border border-primary-50`}
                              >
                                {line.vi}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          {/* Phân trang */}
          {filteredKaiwa.length > pageSize && (
            <div className="flex justify-center items-center mt-6 space-x-2">
              <Button
                size="sm"
                variant="outline"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                Trước
              </Button>
              <span className="text-sm text-gray-600">
                Trang {page}/{totalPage}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page === totalPage}
                onClick={() => setPage(page + 1)}
              >
                Sau
              </Button>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
