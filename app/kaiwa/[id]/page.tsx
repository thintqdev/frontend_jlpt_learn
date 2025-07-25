"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/app-layout";
import { Volume2, User, Play, RotateCcw } from "lucide-react";
import { getConversationById, Conversation } from "@/lib/conversation";

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

  const [kaiwa, setKaiwa] = useState<Kaiwa | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [practiceMode, setPracticeMode] = useState<boolean>(false);
  const [showMeanings, setShowMeanings] = useState<{ [key: string]: boolean }>(
    {}
  );
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
          <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-primary-500 mb-4"></div>
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
      <div className="px-4 sm:px-8 py-6 max-w-2xl mx-auto">
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
                          ? "bg-primary-600 hover:bg-primary-700"
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
                    className="bg-gradient-to-r from-primary-500 to-green-600 hover:from-primary-600 hover:to-green-700 text-white px-6 py-2 text-base shadow rounded-full"
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
              <div className="space-y-3">
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
                        } flex-col items-stretch`}
                      >
                        <motion.div
                          layout
                          className={`max-w-[95%] rounded-2xl px-6 py-4 mb-1 shadow-lg transition-all duration-200 border-2 
                            bg-gradient-to-tr ${
                              speakerColors[line.speaker] ||
                              "from-gray-100 to-gray-50"
                            }`}
                        >
                          <div className="flex items-center mb-1 gap-2">
                            <Badge
                              className={`text-xs px-2 py-1 font-medium rounded-full shadow-sm ${
                                isRight
                                  ? "bg-pink-200 text-pink-800"
                                  : "bg-indigo-200 text-indigo-800"
                              }`}
                            >
                              {line.speaker}
                            </Badge>
                            <span className="japanese-text text-lg font-bold tracking-wide">
                              {line.jp}
                            </span>
                            <button
                              className="ml-2 p-2 rounded-full hover:bg-gray-200 transition"
                              title="Nghe tiếng Nhật"
                              type="button"
                              onClick={() => speakJapanese(line.jp)}
                            >
                              <Volume2 className="w-5 h-5 text-indigo-500" />
                            </button>
                          </div>
                          {line.romaji && (
                            <div className="text-sm text-gray-600 italic mb-1">
                              {line.romaji}
                            </div>
                          )}
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            className={`text-sm underline font-semibold mt-2 ${
                              isRight ? "text-pink-600" : "text-indigo-600"
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
                                className="mt-2 text-sm text-gray-700 bg-white rounded p-2 shadow-inner border border-gray-200"
                              >
                                {line.vi}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
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
                <h2 className="text-lg font-bold text-primary-700">
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
              className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg relative overflow-hidden"
            >
              {isMyTurn ? (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.98, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4"
                  >
                    <p className="text-green-700 font-bold mb-2">
                      🎯 Lượt của bạn!
                    </p>
                    <p className="text-sm text-green-600">Hãy nói câu này:</p>
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0.98, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="bg-primary-50 rounded-xl p-4 shadow"
                  >
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="japanese-text text-2xl font-bold tracking-wider">
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
                      <div className="text-base text-gray-500 mb-2 italic">
                        {currentLine.romaji}
                      </div>
                    )}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="text-base text-primary-600 underline font-semibold"
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
                    <AnimatePresence>
                      {showMeanings["practice-" + currentStep] && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="text-base text-gray-700 mt-2 pt-2 border-t border-primary-200 bg-white rounded shadow-inner"
                        >
                          {currentLine.vi}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              ) : (
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.98, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4"
                  >
                    <p className="text-blue-700 font-bold mb-2">
                      👥 Vai {currentLine?.speaker} nói:
                    </p>
                  </motion.div>
                  <motion.div
                    initial={{ scale: 0.98, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                    className="bg-blue-50 rounded-xl p-4 shadow"
                  >
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="japanese-text text-2xl font-bold tracking-wider">
                        {currentLine?.jp}
                      </span>
                      <button
                        className="p-2 rounded-full hover:bg-blue-100"
                        title="Phát âm"
                        type="button"
                        onClick={() => speakJapanese(currentLine?.jp || "")}
                      >
                        <Volume2 className="w-5 h-5 text-blue-500" />
                      </button>
                    </div>
                    {currentLine?.romaji && (
                      <div className="text-base text-gray-500 mb-2 italic">
                        {currentLine?.romaji}
                      </div>
                    )}
                    <div className="text-base text-gray-700 mt-2 pt-2 border-t border-blue-200 bg-white rounded shadow-inner">
                      {currentLine?.vi}
                    </div>
                  </motion.div>
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
                      idx <= currentStep ? "bg-primary-500" : "bg-gray-200"
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
