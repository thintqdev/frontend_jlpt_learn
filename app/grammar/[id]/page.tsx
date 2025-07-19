"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { getGrammar } from "@/lib/grammar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import AppLayout from "@/components/app-layout";
import Link from "next/link";
import { ArrowLeft, BookOpen, ChevronRight } from "lucide-react";
import { renderExample } from "@/common/utils";

// Màu theo cấp độ
function levelColor(level: string) {
  switch (level) {
    case "N5":
      return "bg-green-100 text-green-700 border-green-200";
    case "N4":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "N3":
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    case "N2":
      return "bg-orange-100 text-orange-700 border-orange-200";
    default:
      return "bg-red-100 text-red-700 border-red-200";
  }
}

export default function GrammarDetailPage() {
  const router = useRouter();
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
        <div className="px-6 pt-12 pb-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-32 mb-4"></div>
            <div className="h-12 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!grammar) {
    return (
      <AppLayout>
        <div className="px-6 pt-12 pb-6">
          <div className="text-center py-12">
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
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="bg-white min-h-screen px-4 sm:px-6 lg:px-8 py-8">
        {/* Nút quay lại */}
        <div className="mb-6">
          <Link href="/grammar">
            <Button variant="ghost" className="rounded-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại danh sách
            </Button>
          </Link>
        </div>

        {/* Thông tin ngữ pháp chính */}
        <div className="bg-gradient-to-br from-white via-gray-50 to-gray-100 border rounded-xl p-6 mb-8 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">
                {grammar.title}: {grammar.definition}
              </h1>
            </div>
            <Badge
              className={`text-sm font-medium border ${levelColor(
                grammar.level
              )}`}
            >
              {grammar.level}
            </Badge>
          </div>
          {grammar.description && (
            <p className="mt-4 text-gray-700 text-lg font-medium">
              {grammar.description}
            </p>
          )}
        </div>

        {/* Danh sách cách dùng */}
        {grammar.usages?.length > 0 && (
          <div className="space-y-6">
            {grammar.usages.map((usage: any, idx: number) => (
              <div
                key={usage.id}
                className="border rounded-lg shadow-sm bg-white p-5"
              >
                {/* Tiêu đề usage */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="text-xl font-bold text-primary-700 mb-1">
                      {idx + 1}. {usage.structure}
                    </h2>
                    {usage.note && (
                      <div className="mt-1">
                        <span className="inline-block px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs font-medium">
                          {usage.note}
                        </span>
                      </div>
                    )}
                    <div className="text-gray-700">
                      <span className="font-semibold text-primary-700">
                        Ý nghĩa:
                      </span>{" "}
                      {usage.meaning}
                    </div>
                  </div>
                </div>

                {/* Ví dụ */}
                {usage.examples?.length > 0 ? (
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-gray-500 font-semibold mb-2">
                      <ChevronRight className="w-4 h-4 text-primary-400 mr-1" />
                      Ví dụ minh họa:
                    </div>
                    <ul className="space-y-3">
                      {usage.examples.map((ex: any) => (
                        <li
                          key={ex.id}
                          className="p-3 rounded-md bg-gray-50 border border-gray-200"
                        >
                          <p className="text-black text-base font-semibold mb-1">
                            {renderExample(ex.sentence)}
                          </p>
                          <p className="text-sm text-gray-600 italic">
                            {ex.translation}
                          </p>
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
        )}
      </div>
    </AppLayout>
  );
}
