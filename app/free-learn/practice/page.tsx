"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Star, CheckCircle, XCircle, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import AppLayout from "@/components/app-layout"
import { JLPTApi, type JLPTWord } from "@/lib/jlpt-api"

export default function FreeLearnPracticePage() {
  const searchParams = useSearchParams()
  const level = searchParams.get("level") ? Number.parseInt(searchParams.get("level")!) : undefined

  const [words, setWords] = useState<JLPTWord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [gameFinished, setGameFinished] = useState(false)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [options, setOptions] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWords()
  }, [level])

  const loadWords = async () => {
    setLoading(true)
    try {
      const fetchedWords = await JLPTApi.getRandomWords(level, 10)
      setWords(fetchedWords)
      if (fetchedWords.length > 0) {
        generateOptions(fetchedWords[0], fetchedWords)
      }
    } catch (error) {
      console.error("Error loading words:", error)
    } finally {
      setLoading(false)
    }
  }

  const generateOptions = (currentWord: JLPTWord, allWords: JLPTWord[]) => {
    const wrongOptions = allWords
      .filter((w) => w.word !== currentWord.word)
      .map((w) => w.meaning)
      .slice(0, 3)

    const options = [currentWord.meaning, ...wrongOptions].sort(() => Math.random() - 0.5)
    setOptions(options)
  }

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return
    setSelectedAnswer(answerIndex)
  }

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return

    const currentWord = words[currentIndex]
    const isCorrect = options[selectedAnswer] === currentWord.meaning
    const newAnswers = [...answers, isCorrect]
    setAnswers(newAnswers)

    if (isCorrect) {
      setScore(score + 10)
    }

    setShowResult(true)

    setTimeout(() => {
      if (currentIndex < words.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setSelectedAnswer(null)
        setShowResult(false)
        generateOptions(words[currentIndex + 1], words)
      } else {
        setGameFinished(true)
      }
    }, 1500)
  }

  const resetGame = () => {
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setShowResult(false)
    setScore(0)
    setGameFinished(false)
    setAnswers([])
    loadWords()
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-4">Đang tải bài tập...</h1>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (gameFinished) {
    const correctAnswers = answers.filter(Boolean).length
    const accuracy = Math.round((correctAnswers / words.length) * 100)

    return (
      <AppLayout>
        <div className="bg-gray-50 min-h-screen">
          <div className="px-6 pt-12 pb-8">
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">{accuracy >= 80 ? "🎉" : accuracy >= 60 ? "👏" : "💪"}</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {accuracy >= 80 ? "Xuất sắc!" : accuracy >= 60 ? "Tốt lắm!" : "Cố gắng thêm!"}
              </h1>
              <p className="text-gray-600">Bạn đã hoàn thành bài luyện tập</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-primary-600 mb-1">{score}</div>
                  <div className="text-sm text-gray-600">Điểm số</div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">{accuracy}%</div>
                  <div className="text-sm text-gray-600">Độ chính xác</div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-sm mb-8">
              <CardContent className="p-4">
                <h3 className="font-bold text-gray-900 mb-3">Kết quả chi tiết</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Câu đúng:</span>
                    <span className="font-medium text-green-600">
                      {correctAnswers}/{words.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Trình độ:</span>
                    <span className="font-medium text-primary-600">
                      {level ? JLPTApi.getLevelName(level) : "Tất cả"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Điểm thưởng:</span>
                    <span className="font-medium text-primary-600">+{score} điểm</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button onClick={resetGame} variant="outline" className="flex-1 border-primary-200 text-primary-600">
                <RotateCcw className="mr-2 h-4 w-4" />
                Luyện tập mới
              </Button>
              <Link href="/free-learn" className="flex-1">
                <Button className="w-full bg-primary-600 hover:bg-primary-700">Chế độ khác</Button>
              </Link>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (words.length === 0) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-4">Không thể tải từ vựng</h1>
            <Button onClick={loadWords} className="bg-primary-600 hover:bg-primary-700">
              Thử lại
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  const currentWord = words[currentIndex]
  const progress = ((currentIndex + 1) / words.length) * 100

  return (
    <AppLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Header */}
        <div className="bg-white px-6 pt-12 pb-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <Link href="/free-learn">
              <Button variant="ghost" size="sm" className="text-primary-600 hover:bg-primary-50 -ml-2">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
            </Link>
            <div className="flex items-center space-x-2 text-sm">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-medium text-gray-700">{score}</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-xl font-bold text-gray-900">Luyện tập từ vựng</h1>
              <span className="text-sm text-gray-500">
                {currentIndex + 1}/{words.length}
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
                <div className="text-4xl japanese-text font-bold text-gray-900 mb-2">{currentWord.word}</div>
                <div className="text-xl japanese-text text-gray-600">{currentWord.furigana}</div>
                <Badge variant="secondary" className={JLPTApi.getLevelColor(currentWord.level)}>
                  {JLPTApi.getLevelName(currentWord.level)}
                </Badge>
              </div>
              <p className="text-lg font-medium text-gray-900">Nghĩa của từ này là gì?</p>
            </CardContent>
          </Card>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {options.map((option, index) => {
              let buttonClass = "w-full p-4 text-left border-2 rounded-xl transition-all duration-200 "

              if (showResult) {
                if (option === currentWord.meaning) {
                  buttonClass += "border-green-500 bg-green-50 text-green-700"
                } else if (index === selectedAnswer) {
                  buttonClass += "border-red-500 bg-red-50 text-red-700"
                } else {
                  buttonClass += "border-gray-200 bg-gray-50 text-gray-500"
                }
              } else if (selectedAnswer === index) {
                buttonClass += "border-primary-500 bg-primary-50 text-primary-700"
              } else {
                buttonClass += "border-gray-200 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50"
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
                    {showResult && option === currentWord.meaning && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {showResult && index === selectedAnswer && option !== currentWord.meaning && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Next Button */}
          <Button
            onClick={handleNextQuestion}
            disabled={selectedAnswer === null || showResult}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 text-lg font-medium"
          >
            {currentIndex === words.length - 1 ? "Hoàn thành" : "Câu tiếp theo"}
          </Button>
        </div>
      </div>
    </AppLayout>
  )
}
