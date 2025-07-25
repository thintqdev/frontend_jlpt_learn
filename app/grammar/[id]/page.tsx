"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getGrammar } from "@/lib/grammar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/app-layout";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { renderExample } from "@/common/utils";

// Màu cấp độ pastel, badge nhỏ
function levelColor(level: string) {
  switch (level) {
    case "N5":
      return "bg-green-50 text-green-700 border border-green-200";
    case "N4":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    case "N3":
      return "bg-yellow-50 text-yellow-700 border border-yellow-200";
    case "N2":
      return "bg-orange-50 text-orange-700 border border-orange-200";
    default:
      return "bg-red-50 text-red-700 border border-red-200";
  }
}

export default function GrammarDetailPage() {
  const params = useParams();
  const id = params?.id;
  const [grammar, setGrammar] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function fetchGrammar() {
      setLoading(true);
      try {
        const data = await getGrammar(Number(id));
        setGrammar(data);
      } catch {
        setGrammar(null);
      } finally {
        setLoading(false);
      }
    }
    fetchGrammar();
  }, [id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="animate-pulse w-full max-w-lg">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!grammar) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <div className="text-6xl mb-4">😢</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Không tìm thấy ngữ pháp
          </h3>
          <Link href="/grammar">
            <Button variant="outline" className="mt-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Quay lại danh sách
            </Button>
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="relative min-h-screen flex justify-center items-center">
        {/* Japanese background image (ảnh số 1) */}
        <div
          className="absolute inset-0 w-full h-full z-0 pointer-events-none"
          aria-hidden
        />

        {/* Nội dung trang */}
        <div className="relative z-10 w-full max-w-2xl mx-auto py-8 px-4 sm:px-6">
          {/* Nút quay lại */}
          <div className="mb-8">
            <Link href="/grammar">
              <Button variant="ghost" className="rounded-full">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại danh sách
              </Button>
            </Link>
          </div>

          {/* Card ngữ pháp */}
          <div className="rounded-2xl shadow-lg bg-white/85 border px-8 py-6 mb-10 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <BookOpen className="h-9 w-9 text-primary" />
                <h1 className="text-3xl font-bold text-gray-900">
                  {grammar.title}
                </h1>
              </div>
              <Badge
                className={`text-base px-3 py-1 font-semibold rounded-full ${levelColor(
                  grammar.level
                )}`}
              >
                {grammar.level}
              </Badge>
            </div>
            <div className="text-lg text-primary-700 font-medium mb-2">
              {grammar.definition}
            </div>
            {grammar.description && (
              <div className="text-gray-600 text-base">
                {grammar.description}
              </div>
            )}
          </div>

          {/* Usage list */}
          <div className="space-y-8">
            {grammar.usages?.map((usage: any, idx: number) => (
              <div
                key={usage.id}
                className="border rounded-xl bg-white/80 shadow-sm p-6 backdrop-blur-sm"
              >
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl font-bold text-primary-700">
                      {idx + 1}.
                    </span>
                    <span className="font-mono text-lg text-gray-800">
                      {usage.structure}
                    </span>
                  </div>
                  {usage.note && (
                    <span className="inline-block mt-1 px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium border border-gray-300">
                      {usage.note}
                    </span>
                  )}
                  <div className="mt-2 text-gray-700">
                    <span className="font-semibold text-primary-700">
                      Ý nghĩa:
                    </span>{" "}
                    {usage.meaning}
                  </div>
                </div>
                {usage.examples?.length > 0 ? (
                  <div>
                    <div className="text-sm text-gray-500 font-semibold mb-2">
                      Ví dụ:
                    </div>
                    <ul className="space-y-3">
                      {usage.examples.map((ex: any) => (
                        <li
                          key={ex.id}
                          className="p-4 rounded-lg bg-white border border-gray-200"
                        >
                          <div className="text-gray-900 font-medium mb-1 text-base leading-relaxed">
                            {renderExample(ex.sentence)}
                          </div>
                          <div className="text-sm text-gray-500 italic">
                            {ex.translation}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-sm text-gray-400 italic mt-2">
                    Chưa có ví dụ minh họa
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
