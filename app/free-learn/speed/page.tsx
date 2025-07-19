"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Zap, Clock, RotateCcw, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import AppLayout from "@/components/app-layout"
import { JLPTApi, type JLPTWord } from "@/lib/jlpt-api"

export default function FreeLearnSpeedPage() {
  const searchParams = useSearchParams()
  const level = searchParams.get("level") ? Number.parseInt(searchParams.get("level")!) : undefined

  const [words, setWords] = useState<JLPTWord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(60) // 1 minute
  const [gameStarted, setGameStarted] = useState(false)
  const [gameFinished, setGameFinished] = useState(false)
  const [currentWord, setCurrentWord] = useState<JLPTWord | null>(null)
  const [userInput, setUserInput] = useState("")
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)

  useEffect(() => {
    loadWords()
  }, [level])

  useEffect(() => {
    if (timeLeft > 0 && gameStarted && !gameFinished) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameStarted) {
      setGameFinished(true)
    }
  }, [timeLeft, gameStarted, gameFinished])

  const loadWords = async () => {
    try {
      const fetchedWords = await JLPTApi.getRandomWords(level, 50)
      setWords(fetchedWords)
      if (fetchedWords.length > 0) {
        setCurrentWord(fetchedWords[0])
      }
    } catch (error) {
      console.error("Error loading words:", error)
    }
  }

  const startGame = () => {
    setGameStarted(true)
    setGameFinished(false)
    setScore(0)
    setCurrentIndex(0)
    setStreak(0)
    setMaxStreak(0)
    setTimeLeft(60)
    setUserInput("")
    if (words.length > 0) {
      setCurrentWord(words[0])
    }
  }

  const checkAnswer = () => {
    if (!currentWord || !userInput.trim()) return

    const isCorrect = userInput.toLowerCase().trim() === currentWord.meaning.toLowerCase().trim()

    if (isCorrect) {
      setScore(score + 1)
      setStreak(streak + 1)
      setMaxStreak(Math.max(maxStreak, streak + 1))
      nextWord()
    } else {
      setStreak(0)
      // Show correct answer briefly
      setTimeout(() => {
        nextWord()
      }, 1000)
    }
  }

  const nextWord = () => {
    setUserInput("")
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setCurrentWord(words[currentIndex + 1])
    } else {
      // Reload more words
      loadWords()
      setCurrentIndex(0)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && userInput.trim()) {
      checkAnswer()
    }
  }

  const resetGame = () => {
    setGameStarted(false)
    setGameFinished(false)
    setScore(0)
    setCurrentIndex(0)
    setStreak(0)
    setMaxStreak(0)
    setTimeLeft(60)
    setUserInput("")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (gameFinished) {
    const wordsPerMinute = score
    const accuracy = currentIndex > 0 ? Math.round((score / currentIndex) * 100) : 0

    return (
      <AppLayout>
        <div className="bg-gray-50 min-h-screen">
          <div className="px-6 pt-12 pb-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">⚡</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Kết thúc!</h1>
              <p className="text-gray-600">Bạn đã hoàn thành thử thách tốc độ</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary-600 mb-1">{score}</div>
                  <div className="text-sm text-gray-600">Từ đúng</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">{maxStreak}</div>
                  <div className="text-sm text-gray-600">Streak tối đa</div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-sm mb-8">
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-900 mb-3">Thống kê</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tốc độ:</span>
                    <span className="font-medium text-blue-600">{wordsPerMinute} từ/phút</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Độ chính xác:</span>
                    <span className="font-medium text-green-600">{accuracy}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng từ thử:</span>
                    <span className="font-medium text-gray-900">{currentIndex}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button onClick={startGame} variant="outline" className="flex-1 border-primary-200 text-primary-600">
                <RotateCcw className="mr-2 h-4 w-4" />
                Chơi lại
              </Button>
              <Link href="/free-learn" className="flex-1">
                <Button className="w-full bg-primary-600 hover:bg-primary-700">Về trang chính</Button>
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (!gameStarted) {
    return (
      <AppLayout>
        <div className="bg-gray-50 min-h-screen">
          {/* Header */}
          <div className="bg-gradient-to-br from-pink-500 to-purple-600 text-white px-6 pt-12 pb-8">
            <div className="flex items-center justify-between mb-4">
              <Link href="/free-learn">
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 -ml-2">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Quay lại
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Thử thách tốc độ</h1>
                <p className="text-pink-100">Trả lời nhanh nhất có thể trong 60 giây</p>
              </div>
            </div>

            {level && (
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                Trình độ {JLPTApi.getLevelName(level)}
              </Badge>
            )}
          </div>

          {/* Instructions */}
          <div className="px-6 py-8">
            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Cách chơi:</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-sm font-bold">
                      1
                    </div>
                    <span>Nhìn từ tiếng Nhật và gõ nghĩa tiếng Anh</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-sm font-bold">
                      2
                    </div>
                    <span>Nhấn Enter để xác nhận đáp án</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-sm font-bold">
                      3
                    </div>
                    <span>Trả lời càng nhiều càng tốt trong 60 giây</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 text-sm font-bold">
                      4
                    </div>
                    <span>Streak cao = điểm thưởng cao!</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button onClick={startGame} className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 text-lg">
              <Zap className="mr-2 h-5 w-5" />
              Bắt đầu thử thách
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Button
              onClick={resetGame}
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
                <span className={`font-medium ${timeLeft < 10 ? "text-red-600" : "text-gray-700"}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Target className="h-4 w-4 text-green-500" />
                <span className="font-medium text-gray-700">{score}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="font-medium text-gray-700">{streak}</span>
              </div>
            </div>
          </div>

          <Progress value={((60 - timeLeft) / 60) * 100} className="h-2" />
        </div>

        {/* Game */}
        {currentWord && (
          <div className="px-6 py-8">
            <Card className="border-0 shadow-sm mb-6">
              <CardContent className="p-8 text-center">
                <div className="space-y-4">
                  <div className="text-5xl japanese-text font-bold text-gray-900">{currentWord.word}</div>
                  <div className="text-xl japanese-text text-gray-600">{currentWord.furigana}</div>
                  <Badge variant="secondary" className={JLPTApi.getLevelColor(currentWord.level)}>
                    {JLPTApi.getLevelName(currentWord.level)}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <div className="mb-6">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Gõ nghĩa tiếng Anh..."
                className="w-full p-4 text-xl text-center border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:outline-none"
                autoFocus
              />
            </div>

            <Button
              onClick={checkAnswer}
              disabled={!userInput.trim()}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 text-lg"
            >
              Xác nhận (Enter)
            </Button>

            {/* Streak indicator */}
            {streak > 0 && (
              <div className="mt-4 text-center">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 text-lg px-4 py-2">
                  🔥 Streak: {streak}
                </Badge>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
