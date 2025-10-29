"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/app-layout";
import { Volume2, User, Play, RotateCcw, Eye, EyeOff } from "lucide-react";
import { getConversationById, Conversation } from "@/lib/conversation";
import { useTTS } from "@/hooks/use-tts";

// Nếu muốn dùng Framer Motion cho animation
import { AnimatePresence, motion } from "framer-motion";

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

const LEVEL_COLOR: Record<string, string> = {
  N5: "bg-green-100 text-green-700 border-green-200",
  N4: "bg-blue-100 text-blue-700 border-blue-200",
  N3: "bg-yellow-100 text-yellow-700 border-yellow-200",
  N2: "bg-orange-100 text-orange-700 border-orange-200",
  N1: "bg-red-100 text-red-700 border-red-200",
};

const speakerColors: Record<string, string> = {
  A: "from-indigo-200 to-sky-100",
  B: "from-pink-200 to-rose-100",
  C: "from-yellow-200 to-orange-100",
  D: "from-green-200 to-lime-100",
};

export default function KaiwaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = Number(params?.id);
  const { speak } = useTTS();

  const [kaiwa, setKaiwa] = useState<Kaiwa | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [practiceMode, setPracticeMode] = useState<boolean>(false);
  const [showMeanings, setShowMeanings] = useState<{ [key: string]: boolean }>(
    {}
  );
  const [showRomaji, setShowRomaji] = useState<boolean>(true);
  const [animateKey, setAnimateKey] = useState<number>(0);

  useEffect(() => {
    async function fetchKaiwa() {
      setLoading(true);
      try {
        const conv: Conversation = await getConversationById(id);
        setKaiwa({
          id: conv.id,
          title: conv.title,
          level: conv.level,
          category: conv.category,
          duration: conv.duration ?? "5 phút",
          conversation: Array.isArray(conv.conversation)
            ? conv.conversation
            : [],
        });
      } catch (err) {
        setKaiwa(null);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchKaiwa();
  }, [id]);

  const speakJapanese = (text: string) => {
    speak(text);
  };

  const roles: string[] =
    kaiwa && kaiwa.conversation
      ? Array.from(new Set(kaiwa.conversation.map((line) => line.speaker)))
      : [];

  const startPractice = () => {
    if (!selectedRole) return;
    setPracticeMode(true);
    setCurrentStep(0);
    setAnimateKey(0);
  };
  const resetPractice = () => {
    setPracticeMode(false);
    setCurrentStep(0);
    setShowMeanings({});
    setAnimateKey(0);
  };

  const nextStep = () => {
    if (currentStep < (kaiwa?.conversation.length ?? 0) - 1) {
      setCurrentStep((step) => {
        setAnimateKey(step + 1);
        return step + 1;
      });
    }
  };
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((step) => {
        setAnimateKey(step - 1);
        return step - 1;
      });
    }
  };

  const currentLine =
    kaiwa && kaiwa.conversation ? kaiwa.conversation[currentStep] : undefined;
  const isMyTurn = currentLine && currentLine.speaker === selectedRole;

  // Animation variants
  const bubbleVariants = {
    initial: { opacity: 0, y: 40, scale: 0.97 },
    enter: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -40, scale: 0.97, transition: { duration: 0.2 } },
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-rose-500 mb-4"></div>
          <h2 className="text-xl font-bold mb-2">Đang tải hội thoại...</h2>
        </div>
      </AppLayout>
    );
  }

  if (!kaiwa) {
    return (
      <AppLayout>
        <div className="min-h-screen flex flex-col items-center justify-center ">
          <h2 className="text-xl font-bold mb-2">Không tìm thấy hội thoại</h2>
          <Button onClick={() => router.push("/kaiwa")}>
            Quay lại danh sách
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-6 pt-10 pb-6 border-b border-gray-100 flex items-center space-x-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/kaiwa")}
          className="hover:bg-indigo-100 transition"
        >
          ←
        </Button>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">
          {kaiwa.title}
        </h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRomaji(!showRomaji)}
            className="flex items-center gap-2"
          >
            {showRomaji ? (
              <>
                <EyeOff className="w-4 h-4" />
                Ẩn Romaji
              </>
            ) : (
              <>
                <Eye className="w-4 h-4" />
                Hiện Romaji
              </>
            )}
          </Button>
          <Badge
            variant="secondary"
            className={
              LEVEL_COLOR[kaiwa.level] ||
              "bg-gray-100 text-gray-700 border-gray-200"
            }
          >
            {kaiwa.level}
          </Badge>
        </div>
      </div>
      <div className="px-4 sm:px-8 py-6 max-w-4xl mx-auto min-h-screen">
        {!practiceMode ? (
          <>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-6">
                <div className="font-semibold mb-2 text-lg text-gray-900">
                  Chọn vai để luyện nói:
                </div>
                <div className="flex space-x-3 mb-4">
                  {roles.map((role: string) => (
                    <Button
                      key={role}
                      variant={selectedRole === role ? "default" : "outline"}
                      onClick={() => setSelectedRole(role)}
                      className={`rounded-full shadow-sm px-5 py-2 text-base ${
                        selectedRole === role
                          ? "bg-rose-600 hover:bg-rose-700"
                          : "border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <User className="w-4 h-4 mr-1" /> Vai {role}
                    </Button>
                  ))}
                </div>
                {selectedRole && (
                  <Button
                    onClick={startPractice}
                    className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2 text-base shadow rounded-full"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Bắt đầu luyện tập
                  </Button>
                )}
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="mb-4 font-semibold text-lg text-gray-900">
                Toàn bộ hội thoại:
              </div>
              <div className="p-4  space-y-4">
                <AnimatePresence>
                  {kaiwa.conversation.map((line: KaiwaLine, idx: number) => {
                    const isRight = line.speaker !== roles[0];
                    const key = "all-" + idx;
                    return (
                      <motion.div
                        key={idx}
                        initial="initial"
                        animate="enter"
                        exit="exit"
                        variants={bubbleVariants}
                        className={`flex ${
                          isRight ? "justify-end" : "justify-start"
                        } mb-3`}
                      >
                        <div
                          className={`flex items-start space-x-2 max-w-[80%] ${
                            isRight ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          {/* Avatar */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                              line.speaker === "A"
                                ? "bg-blue-500"
                                : "bg-pink-500"
                            }`}
                          >
                            {line.speaker}
                          </div>

                          {/* Message bubble */}
                          <motion.div
                            layout
                            className={`px-4 py-3 rounded-2xl shadow-sm relative ${
                              isRight
                                ? "bg-blue-500 text-white rounded-br-md"
                                : "bg-white border border-gray-200 rounded-bl-md"
                            }`}
                          >
                            {/* Message tail */}
                            <div
                              className={`absolute top-4 w-3 h-3 transform rotate-45 ${
                                isRight
                                  ? "bg-blue-500 -right-1.5"
                                  : "bg-white border-l border-b border-gray-200 -left-1.5"
                              }`}
                            ></div>

                            <div className="relative z-10">
                              <div className="flex items-center gap-2 mb-1">
                                <span
                                  className={`japanese-text text-lg font-medium ${
                                    isRight ? "text-white" : "text-gray-900"
                                  }`}
                                >
                                  {line.jp}
                                </span>
                                <button
                                  className={`p-1 rounded-full transition ${
                                    isRight
                                      ? "hover:bg-blue-400 text-white"
                                      : "hover:bg-gray-100 text-gray-600"
                                  }`}
                                  title="Nghe tiếng Nhật"
                                  type="button"
                                  onClick={() => speakJapanese(line.jp)}
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>
                              </div>

                              {line.romaji && showRomaji && (
                                <div
                                  className={`text-sm italic mb-2 ${
                                    isRight ? "text-blue-100" : "text-gray-500"
                                  }`}
                                >
                                  {line.romaji}
                                </div>
                              )}

                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                className={`text-xs underline font-medium ${
                                  isRight ? "text-blue-100" : "text-blue-600"
                                }`}
                                onClick={() =>
                                  setShowMeanings((prev) => ({
                                    ...prev,
                                    [key]: !prev[key],
                                  }))
                                }
                                type="button"
                              >
                                {showMeanings[key] ? "Ẩn nghĩa" : "Xem nghĩa"}
                              </motion.button>

                              <AnimatePresence>
                                {showMeanings[key] && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className={`mt-2 text-sm p-2 rounded ${
                                      isRight
                                        ? "bg-blue-400 text-white"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {line.vi}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        ) : (
          <motion.div
            key={animateKey}
            initial={{ opacity: 0, scale: 0.98, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -40 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-rose-700">
                  Chế độ luyện tập - Vai {selectedRole}
                </h2>
                <p className="text-sm text-gray-600">
                  Bước {currentStep + 1}/{kaiwa.conversation.length}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={resetPractice}
                className="text-red-600 border-red-200 hover:bg-red-50 rounded-full shadow-sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Kết thúc
              </Button>
            </div>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, scale: 0.97, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: -30 }}
              transition={{ duration: 0.25 }}
              className="bg-gray-50 rounded-lg p-6 shadow-lg relative overflow-hidden"
            >
              {/* Chat container */}
              <div className="flex justify-center mb-6">
                <div
                  className={`flex items-start space-x-3 max-w-md ${
                    isMyTurn ? "" : "flex-row-reverse space-x-reverse"
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold ${
                      currentLine?.speaker === "A"
                        ? "bg-blue-500"
                        : "bg-pink-500"
                    }`}
                  >
                    {currentLine?.speaker}
                  </div>

                  {/* Message bubble */}
                  <div
                    className={`px-6 py-4 rounded-2xl shadow-md relative max-w-xs ${
                      isMyTurn
                        ? "bg-green-500 text-white rounded-bl-md"
                        : "bg-white border-2 border-gray-200 rounded-br-md"
                    }`}
                  >
                    {/* Message tail */}
                    <div
                      className={`absolute top-5 w-4 h-4 transform rotate-45 ${
                        isMyTurn
                          ? "bg-green-500 -left-2"
                          : "bg-white border-l border-b border-gray-200 -right-2"
                      }`}
                    ></div>

                    {/* Status indicator */}
                    <div
                      className={`text-xs font-semibold mb-2 ${
                        isMyTurn ? "text-green-100" : "text-gray-500"
                      }`}
                    >
                      {isMyTurn
                        ? "🎯 Lượt của bạn!"
                        : `👥 Vai ${currentLine?.speaker} nói:`}
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`japanese-text text-xl font-bold ${
                            isMyTurn ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {currentLine?.jp}
                        </span>
                        <button
                          className={`p-1.5 rounded-full transition ${
                            isMyTurn
                              ? "hover:bg-green-400 text-white"
                              : "hover:bg-gray-100 text-gray-600"
                          }`}
                          title={isMyTurn ? "Nghe mẫu" : "Phát âm"}
                          type="button"
                          onClick={() => speakJapanese(currentLine?.jp || "")}
                        >
                          <Volume2 className="w-5 h-5" />
                        </button>
                      </div>

                      {currentLine?.romaji && showRomaji && (
                        <div
                          className={`text-sm italic mb-2 ${
                            isMyTurn ? "text-green-100" : "text-gray-500"
                          }`}
                        >
                          {currentLine?.romaji}
                        </div>
                      )}

                      {isMyTurn ? (
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          className="text-sm text-green-100 underline font-medium"
                          onClick={() =>
                            setShowMeanings((prev) => ({
                              ...prev,
                              ["practice-" + currentStep]:
                                !prev["practice-" + currentStep],
                            }))
                          }
                          type="button"
                        >
                          {showMeanings["practice-" + currentStep]
                            ? "Ẩn nghĩa"
                            : "Hiện nghĩa"}
                        </motion.button>
                      ) : (
                        <div className="text-sm text-gray-700 mt-2 pt-2 border-t border-gray-200">
                          {currentLine?.vi}
                        </div>
                      )}

                      {isMyTurn && (
                        <AnimatePresence>
                          {showMeanings["practice-" + currentStep] && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              className="mt-2 text-sm p-2 rounded bg-green-400 text-white"
                            >
                              {currentLine?.vi}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Practice instruction */}
              {isMyTurn && (
                <div className="text-center bg-white rounded-lg p-3 border border-green-200">
                  <p className="text-sm text-green-700">
                    💬 Hãy thực hành nói câu này theo giọng tiếng Nhật tự nhiên
                  </p>
                </div>
              )}
            </motion.div>
            <div className="flex justify-center space-x-3 mt-4">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="rounded-full shadow"
              >
                ← Trước
              </Button>
              <Button
                onClick={nextStep}
                disabled={currentStep === kaiwa.conversation.length - 1}
                className={`rounded-full px-6 py-2 shadow text-white text-lg font-bold ${
                  isMyTurn
                    ? "bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800"
                    : "bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600"
                }`}
              >
                {currentStep === kaiwa.conversation.length - 1
                  ? "Hoàn thành"
                  : "Tiếp →"}
              </Button>
            </div>
            <div className="mt-6">
              <div className="flex space-x-1">
                {kaiwa.conversation.map((_, idx) => (
                  <motion.div
                    key={idx}
                    layout
                    className={`h-2 flex-1 rounded-full transition-all duration-200 ${
                      idx <= currentStep ? "bg-rose-500" : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
