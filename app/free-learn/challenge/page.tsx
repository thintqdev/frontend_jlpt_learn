"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Trophy,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  RotateCcw,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import AppLayout from "@/components/app-layout";
import { JLPTApi, type JLPTWord } from "@/lib/jlpt-api";

interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  timeLimit: number; // in seconds
  difficulty: "Dễ" | "Trung bình" | "Khó";
  points: number;
}

const dailyChallenges: Challenge[] = [
  {
    id: "speed-5",
    title: "Tốc độ 5 từ",
    description: "Trả lời đúng 5 từ trong 60 giây",
    target: 5,
    timeLimit: 60,
    difficulty: "Dễ",
    points: 50,
  },
  {
    id: "accuracy-10",
    title: "Độ chính xác cao",
    description: "Trả lời đúng 8/10 từ",
    target: 8,
    timeLimit: 120,
    difficulty: "Trung bình",
    points: 100,
  },
  {
    id: "master-15",
    title: "Thử thách Master",
    description: "Trả lời đúng 12/15 từ khó",
    target: 12,
    timeLimit: 180,
    difficulty: "Khó",
    points: 200,
  },
];

export default function FreeLearnChallengePage() {
  const searchParams = useSearchParams();
  const level = searchParams.get("level")
    ? Number.parseInt(searchParams.get("level")!)
    : undefined;

  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(
    null
  );
  const [words, setWords] = useState<JLPTWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameFinished, setGameFinished] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    if (timeLeft > 0 && gameStarted && !gameFinished) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted) {
      setGameFinished(true);
    }
  }, [timeLeft, gameStarted, gameFinished]);

  const startChallenge = async (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setGameStarted(false);
    setGameFinished(false);
    setCurrentIndex(0);
    setScore(0);
    setAnswers([]);
    setTimeLeft(challenge.timeLimit);

    try {
      const challengeLevel =
        challenge.difficulty === "Khó" ? level || 1 : undefined;
      const fetchedWords = await JLPTApi.getRandomWords(
        challengeLevel,
        challenge.target + 5
      );
      setWords(fetchedWords.slice(0, challenge.target + 5));
      generateOptions(fetchedWords[0], fetchedWords);
      setGameStarted(true);
    } catch (error) {
      console.error("Error loading challenge words:", error);
    }
  };

  const generateOptions = (currentWord: JLPTWord, allWords: JLPTWord[]) => {
    const wrongOptions = allWords
      .filter((w) => w.word !== currentWord.word)
      .map((w) => w.meaning)
      .slice(0, 3);

    const options = [currentWord.meaning, ...wrongOptions].sort(
      () => Math.random() - 0.5
    );
    setOptions(options);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const currentWord = words[currentIndex];
    const isCorrect = options[selectedAnswer] === currentWord.meaning;
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);

    if (isCorrect) {
      setScore(score + 1);
    }

    setShowResult(true);

    setTimeout(() => {
      if (
        currentIndex < words.length - 1 &&
        newAnswers.length < selectedChallenge!.target
      ) {
        setCurrentIndex(currentIndex + 1);
        setSelectedAnswer(null);
        setShowResult(false);
        generateOptions(words[currentIndex + 1], words);
      } else {
        setGameFinished(true);
      }
    }, 1500);
  };

  const resetChallenge = () => {
    setSelectedChallenge(null);
    setGameStarted(false);
    setGameFinished(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!selectedChallenge) {
    return (
      <AppLayout>
        <div className="bg-gray-50 min-h-screen">
          {/* Header */}
          <div className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white px-6 pt-12 pb-8">
            <div className="flex items-center justify-between mb-4">
              <Link href="/free-learn">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 -ml-2"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20  flex items-center justify-center">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">
                  Thử thách hàng ngày
                </h1>
                <p className="text-yellow-100">Kiểm tra khả năng của bạn</p>
              </div>
            </div>

            {level && (
              <Badge
                variant="secondary"
                className="bg-white/20 text-white border-0"
              >
                Trình độ {JLPTApi.getLevelName(level)}
              </Badge>
            )}
          </div>

          {/* Challenges */}
          <div className="px-6 py-6">
            <div className="space-y-4">
              {dailyChallenges.map((challenge) => (
                <Card
                  key={challenge.id}
                  className="border-0 shadow-sm hover:shadow-md transition-all duration-200"
                >
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg ${
                            challenge.difficulty === "Dễ"
                              ? "bg-gradient-to-br from-green-400 to-green-600"
                              : challenge.difficulty === "Trung bình"
                              ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                              : "bg-gradient-to-br from-red-400 to-red-600"
                          }`}
                        >
                          <Target className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-gray-900 mb-1">
                            {challenge.title}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {challenge.description}
                          </p>
                          <div className="flex items-center space-x-2">
                            <Badge
                              variant="secondary"
                              className={`text-xs ${
                                challenge.difficulty === "Dễ"
                                  ? "bg-green-100 text-green-700"
                                  : challenge.difficulty === "Trung bình"
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-red-100 text-red-700"
                              }`}
                            >
                              {challenge.difficulty}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              • {formatTime(challenge.timeLimit)}
                            </span>
                            <span className="text-xs text-primary-600 font-medium">
                              +{challenge.points} điểm
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => startChallenge(challenge)}
                        className="bg-primary-600 hover:bg-primary-700 text-white px-6"
                      >
                        Thử thách
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (gameFinished) {
    const accuracy = Math.round((score / selectedChallenge.target) * 100);
    const isSuccess = score >= selectedChallenge.target * 0.8;
    const earnedPoints = isSuccess
      ? selectedChallenge.points
      : Math.floor(selectedChallenge.points * 0.5);

    return (
      <AppLayout>
        <div className="bg-gray-50 min-h-screen">
          <div className="px-6 pt-12 pb-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{isSuccess ? "🏆" : "💪"}</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {isSuccess ? "Thành công!" : "Cố gắng thêm!"}
              </h1>
              <p className="text-gray-600">
                Bạn đã trả lời đúng {score}/{selectedChallenge.target} câu
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary-600 mb-1">
                    {earnedPoints}
                  </div>
                  <div className="text-sm text-gray-600">Điểm thưởng</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {accuracy}%
                  </div>
                  <div className="text-sm text-gray-600">Độ chính xác</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={resetChallenge}
                variant="outline"
                className="flex-1 border-primary-200 text-primary-600"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Thử thách khác
              </Button>
              <Link href="/free-learn" className="flex-1">
                <Button className="w-full bg-primary-600 hover:bg-primary-700">
                  Về trang chính
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!gameStarted || words.length === 0) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-4">
              Đang chuẩn bị thử thách...
            </h1>
          </div>
        </div>
      </AppLayout>
    );
  }

  const currentWord = words[currentIndex];
  const progress = ((currentIndex + 1) / selectedChallenge.target) * 100;

  return (
    <AppLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={resetChallenge}
              variant="ghost"
              size="sm"
              className="text-primary-600 hover:bg-primary-50 -ml-2"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Thoát
            </Button>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <Clock className="h-4 w-4 text-gray-500" />
                <span
                  className={`font-medium ${
                    timeLeft < 30 ? "text-red-600" : "text-gray-700"
                  }`}
                >
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="font-medium text-gray-700">{score}</span>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold text-gray-900">
                {selectedChallenge.title}
              </h1>
              <span className="text-sm text-gray-500">
                {currentIndex + 1}/{selectedChallenge.target}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Question */}
        <div className="px-6 py-8">
          <Card className="border-0 shadow-sm mb-6">
            <CardContent className="p-6 text-center">
              <div className="mb-4">
                <div className="text-4xl japanese-text font-bold text-gray-900 mb-2">
                  {currentWord.word}
                </div>
                <div className="text-xl japanese-text text-gray-600">
                  {currentWord.furigana}
                </div>
                <Badge
                  variant="secondary"
                  className={JLPTApi.getLevelColor(currentWord.level)}
                >
                  {JLPTApi.getLevelName(currentWord.level)}
                </Badge>
              </div>
              <p className="text-lg font-medium text-gray-900">
                Nghĩa của từ này là gì?
              </p>
            </CardContent>
          </Card>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {options.map((option, index) => {
              let buttonClass =
                "w-full p-4 text-left border-2  transition-all duration-200 ";

              if (showResult) {
                if (option === currentWord.meaning) {
                  buttonClass += "border-green-500 bg-green-50 text-green-700";
                } else if (index === selectedAnswer) {
                  buttonClass += "border-red-500 bg-red-50 text-red-700";
                } else {
                  buttonClass += "border-gray-200 bg-gray-50 text-gray-500";
                }
              } else if (selectedAnswer === index) {
                buttonClass +=
                  "border-primary-500 bg-primary-50 text-primary-700";
              } else {
                buttonClass +=
                  "border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50";
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={buttonClass}
                  disabled={showResult}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{option}</span>
                    {showResult && option === currentWord.meaning && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {showResult &&
                      index === selectedAnswer &&
                      option !== currentWord.meaning && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          <Button
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null || showResult}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 text-lg font-medium"
          >
            {currentIndex === selectedChallenge.target - 1
              ? "Hoàn thành"
              : "Câu tiếp theo"}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
