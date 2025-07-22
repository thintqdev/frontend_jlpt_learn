"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Trash2 } from "lucide-react";

type Kaiwa = {
  id: number;
  title: string;
  level: string;
  conversation: {
    speaker: string;
    jp: string;
    romaji: string;
    vi: string;
  }[];
};

const mockKaiwaList: Kaiwa[] = [
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
        vi: "Chào. Khỏe không?",
      },
    ],
  },
  {
    id: 2,
    title: "Đi học",
    level: "N5",
    conversation: [
      {
        speaker: "A",
        jp: "今日、学校に行きますか？",
        romaji: "Kyou, gakkou ni ikimasu ka?",
        vi: "Hôm nay bạn đi học không?",
      },
      {
        speaker: "B",
        jp: "はい、行きます！",
        romaji: "Hai, ikimasu!",
        vi: "Có, mình đi!",
      },
    ],
  },
];

export default function KaiwaAdminPage() {
  const [kaiwaList, setKaiwaList] = useState<Kaiwa[]>([]);

  useEffect(() => {
    // Giả lập fetch
    setKaiwaList(mockKaiwaList);
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quản lý Kaiwa</h1>
        <Button className="flex gap-2">
          <Plus className="w-4 h-4" /> Thêm đoạn hội thoại
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kaiwaList.map((kaiwa) => (
          <Card key={kaiwa.id} className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">{kaiwa.title}</CardTitle>
                <Badge variant="outline">{kaiwa.level}</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="icon" variant="outline">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="icon" variant="destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {kaiwa.conversation.map((item, index) => (
                  <div key={index} className="border rounded p-2 bg-muted">
                    <p className="font-semibold">
                      {item.speaker}: {item.jp}
                    </p>
                    <p className="text-sm text-muted-foreground italic">{item.romaji}</p>
                    <p className="text-sm text-muted-foreground">{item.vi}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
