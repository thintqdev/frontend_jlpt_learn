"use client";

import { useState } from "react";
import { Volume2, Eye, EyeOff } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Word {
  id: number;
  kanji: string;
  hiragana: string;
  meaning: string;
  example: string;
  exampleMeaning: string;
}

interface VocabularyCardProps {
  word: Word;
}

export default function VocabularyCard({ word }: VocabularyCardProps) {
  const [showMeaning, setShowMeaning] = useState(false);

  const handleSpeak = () => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word.hiragana);
      utterance.lang = "ja-JP";
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary-200 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="text-3xl japanese-text text-primary-800 font-bold">
              {word.kanji}
            </div>
            <div className="text-lg text-gray-600 japanese-text">
              {word.hiragana}
            </div>
          </div>
          <Button
            onClick={handleSpeak}
            variant="ghost"
            size="sm"
            className="text-primary-600 hover:bg-primary-50 p-2"
          >
            <Volume2 className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">Nghĩa:</h4>
            <Button
              onClick={() => setShowMeaning(!showMeaning)}
              variant="ghost"
              size="sm"
              className="text-primary-600 hover:bg-primary-50 p-1"
            >
              {showMeaning ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {showMeaning && (
            <div className="text-primary-700 font-medium bg-primary-50 p-2 rounded">
              {word.meaning}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h4 className="font-semibold text-gray-900">Ví dụ:</h4>
          <div className="bg-gray-50 p-3 rounded space-y-1">
            <div className="japanese-text text-gray-800">{word.example}</div>
            <div className="text-sm text-gray-600">{word.exampleMeaning}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
