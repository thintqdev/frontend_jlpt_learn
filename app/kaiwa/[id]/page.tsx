"use client";

import { useState } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/app-layout";
import { MessageCircle, Volume2, User, Play, RotateCcw } from "lucide-react";

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

export default function KaiwaDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Sử dụng useParams để lấy id từ URL
  const params = useParams();
  const id = Number(params?.id);
  const kaiwa: Kaiwa | undefined = kaiwaSamples.find((k) => k.id === id);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [practiceMode, setPracticeMode] = useState<boolean>(false);
  const [showMeanings, setShowMeanings] = useState<{ [key: string]: boolean }>({});

  if (!kaiwa) {
    return (
      <AppLayout>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold mb-2">Không tìm thấy hội thoại</h2>
          <Button onClick={() => router.push("/kaiwa")}>Quay lại danh sách</Button>
        </div>
      </AppLayout>
    );
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

  // Lấy danh sách vai trong hội thoại
  const roles: string[] = Array.from(new Set(kaiwa.conversation.map((line) => line.speaker)));

  // Bắt đầu chế độ luyện tập
  const startPractice = () => {
    if (!selectedRole) return;
    setPracticeMode(true);
    setCurrentStep(0);
  };

  // Reset chế độ luyện tập
  const resetPractice = () => {
    setPracticeMode(false);
    setCurrentStep(0);
    setShowMeanings({});
  };

  // Câu tiếp theo trong hội thoại
  const nextStep = () => {
    if (currentStep < kaiwa.conversation.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Câu trước đó trong hội thoại
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Câu hiện tại
  const currentLine = kaiwa.conversation[currentStep];
  const isMyTurn = currentLine && currentLine.speaker === selectedRole;

  return (
    <AppLayout>
      <div className="bg-white min-h-screen">
        <div className="px-6 pt-10 pb-6 border-b border-gray-100 flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/kaiwa")}>←</Button>
          <h1 className="text-2xl font-bold text-gray-900 flex-1">{kaiwa.title}</h1>
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
        <div className="px-4 sm:px-8 py-6 max-w-2xl mx-auto">
          {!practiceMode ? (
            <>
              {/* Chọn vai */}
              <div className="mb-6">
                <div className="font-semibold mb-2">Chọn vai để luyện nói:</div>
                <div className="flex space-x-3 mb-4">
                  {roles.map((role: string) => (
                    <Button
                      key={role}
                      variant={selectedRole === role ? "default" : "outline"}
                      onClick={() => setSelectedRole(role)}
                      className={
                        selectedRole === role
                          ? "bg-primary-600 hover:bg-primary-700"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }
                    >
                      <User className="w-4 h-4 mr-1" /> Vai {role}
                    </Button>
                  ))}
                </div>
                {selectedRole && (
                  <Button
                    onClick={startPractice}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Bắt đầu luyện tập
                  </Button>
                )}
              </div>

              {/* Hiển thị toàn bộ hội thoại */}
              <div className="mb-4 font-semibold">Toàn bộ hội thoại:</div>
              <div className="space-y-3">
                {kaiwa.conversation.map((line: KaiwaLine, idx: number) => {
                  const isRight = line.speaker !== roles[0];
                  return (
                    <div
                      key={idx}
                      className={`flex ${isRight ? "justify-end" : "justify-start"} flex-col items-stretch`}
                    >
                      <div
                        className={`max-w-[90%] rounded-2xl px-4 py-3 mb-1 shadow-sm text-base flex flex-col relative border border-primary-100
                          ${isRight ? "text-right bg-blue-50 rounded-br-3xl ml-auto" : "text-left bg-primary-50 rounded-bl-3xl"}
                        `}
                      >
                        <div className="flex items-center mb-1">
                          <span
                            className={`font-semibold mr-2 ${isRight ? "text-blue-600" : "text-primary-600"}`}
                          >
                            {line.speaker}:
                          </span>
                          <span className="japanese-text text-base font-medium break-words">{line.jp}</span>
                          <button
                            className="ml-2 p-1 rounded-full hover:bg-primary-100 focus:outline-none"
                            title="Phát âm"
                            type="button"
                            onClick={() => speakJapanese(line.jp)}
                          >
                            <Volume2 className="w-4 h-4 text-primary-500" />
                          </button>
                        </div>
                        {line.romaji && (
                          <div className="text-xs text-gray-500 mb-1">{line.romaji}</div>
                        )}
                        <button
                          className="text-xs text-primary-600 underline self-end mt-1 focus:outline-none font-semibold"
                          onClick={() =>
                            setShowMeanings((prev) => ({
                              ...prev,
                              ["all-" + idx]: !prev["all-" + idx],
                            }))
                          }
                          type="button"
                        >
                          {showMeanings["all-" + idx] ? "Ẩn nghĩa" : "Hiện nghĩa"}
                        </button>
                      </div>
                      {showMeanings["all-" + idx] && (
                        <div
                          className={`text-xs text-gray-800 mt-1 px-3 pt-1 ${isRight ? "text-right" : "text-left"} font-medium rounded-b-xl border border-primary-50`}
                        >
                          {line.vi}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Chế độ luyện tập tương tác */
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Chế độ luyện tập - Vai {selectedRole}</h2>
                  <p className="text-sm text-gray-600">
                    Bước {currentStep + 1}/{kaiwa.conversation.length}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={resetPractice}
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Kết thúc
                </Button>
              </div>

              {/* Câu hiện tại */}
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
                {isMyTurn ? (
                  /* Lượt của tôi */
                  <div className="text-center">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                      <p className="text-green-700 font-semibold mb-2">🎯 Lượt của bạn!</p>
                      <p className="text-sm text-green-600">Hãy nói câu này:</p>
                    </div>
                    
                    <div className="bg-primary-50 rounded-xl p-4">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <span className="japanese-text text-xl font-medium">
                          {currentLine.jp}
                        </span>
                        <button
                          className="p-2 rounded-full hover:bg-primary-100"
                          title="Nghe mẫu"
                          type="button"
                          onClick={() => speakJapanese(currentLine.jp)}
                        >
                          <Volume2 className="w-5 h-5 text-primary-500" />
                        </button>
                      </div>
                      
                      {currentLine.romaji && (
                        <div className="text-sm text-gray-500 mb-2">
                          {currentLine.romaji}
                        </div>
                      )}
                      
                      <button
                        className="text-sm text-primary-600 underline font-semibold"
                        onClick={() =>
                          setShowMeanings((prev) => ({
                            ...prev,
                            ["practice-" + currentStep]: !prev["practice-" + currentStep],
                          }))
                        }
                        type="button"
                      >
                        {showMeanings["practice-" + currentStep] ? "Ẩn nghĩa" : "Hiện nghĩa"}
                      </button>
                      
                      {showMeanings["practice-" + currentStep] && (
                        <div className="text-sm text-gray-700 mt-2 pt-2 border-t border-primary-200">
                          {currentLine.vi}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Lượt của đối phương */
                  <div className="text-center">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                      <p className="text-blue-700 font-semibold mb-2">👥 Vai {currentLine.speaker} nói:</p>
                    </div>
                    
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <span className="japanese-text text-xl font-medium">
                          {currentLine.jp}
                        </span>
                        <button
                          className="p-2 rounded-full hover:bg-blue-100"
                          title="Phát âm"
                          type="button"
                          onClick={() => speakJapanese(currentLine.jp)}
                        >
                          <Volume2 className="w-5 h-5 text-blue-500" />
                        </button>
                      </div>
                      
                      {currentLine.romaji && (
                        <div className="text-sm text-gray-500 mb-2">
                          {currentLine.romaji}
                        </div>
                      )}
                      
                      <div className="text-sm text-gray-700 mt-2 pt-2 border-t border-blue-200">
                        {currentLine.vi}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Điều khiển */}
              <div className="flex justify-center space-x-3">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  ← Trước
                </Button>
                <Button
                  onClick={nextStep}
                  disabled={currentStep === kaiwa.conversation.length - 1}
                  className={isMyTurn ? "bg-green-600 hover:bg-green-700" : "bg-primary-600 hover:bg-primary-700"}
                >
                  {currentStep === kaiwa.conversation.length - 1 ? "Hoàn thành" : "Tiếp →"}
                </Button>
              </div>

              {/* Tiến trình */}
              <div className="mt-6">
                <div className="flex space-x-1">
                  {kaiwa.conversation.map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-2 flex-1 rounded-full ${
                        idx <= currentStep ? "bg-primary-500" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}