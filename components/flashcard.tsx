"use client";

import type React from "react";

import { Volume2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Word {
  id: number;
  kanji: string;
  hiragana: string;
  meaning: string;
  example: string;
  exampleMeaning: string;
}

interface FlashCardProps {
  word: Word;
  isFlipped: boolean;
  onFlip: () => void;
}

export default function FlashCard({ word, isFlipped, onFlip }: FlashCardProps) {
  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word.hiragana);
      utterance.lang = "ja-JP";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="perspective-1000">
      <Card
        className={`relative w-full h-96 cursor-pointer transition-transform duration-700 transform-style-preserve-3d ${
          isFlipped ? "rotate-y-180" : ""
        } hover:shadow-xl`}
        onClick={onFlip}
      >
        {/* Front Side */}
        <div
          className={`absolute inset-0 backface-hidden ${
            isFlipped ? "opacity-0" : "opacity-100"
          }`}
        >
          <CardContent className="h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-lg">
            <div className="text-center space-y-6">
              <div className="space-y-3">
                <div className="text-6xl japanese-text font-bold">
                  {word.kanji}
                </div>
                <div className="text-2xl japanese-text opacity-90">
                  {word.hiragana}
                </div>
              </div>
              <Button
                onClick={handleSpeak}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 mt-4"
              >
                <Volume2 className="h-6 w-6" />
              </Button>
            </div>
            <div className="absolute bottom-4 text-sm opacity-75">
              Nhấn để xem nghĩa
            </div>
          </CardContent>
        </div>

        {/* Back Side */}
        <div
          className={`absolute inset-0 backface-hidden rotate-y-180 ${
            isFlipped ? "opacity-100" : "opacity-0"
          }`}
        >
          <CardContent className="h-full flex flex-col justify-center p-8 bg-white border-2 border-primary-200 rounded-lg">
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-2xl japanese-text text-primary-600 font-bold mb-2">
                  {word.kanji}
                </div>
                <div className="text-3xl font-bold text-primary-800 mb-4">
                  {word.meaning}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 text-center">
                  Ví dụ:
                </h4>
                <div className="bg-primary-50 p-4 rounded-lg space-y-2">
                  <div className="japanese-text text-lg text-gray-800 text-center">
                    {word.example}
                  </div>
                  <div className="text-gray-600 text-center">
                    {word.exampleMeaning}
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-gray-500">
              Nhấn để quay lại
            </div>
          </CardContent>
        </div>
      </Card>
    </div>
  );
}
