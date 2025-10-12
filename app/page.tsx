"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { BookOpen, Mic, FileText, Brain } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import AppLayout from "@/components/app-layout";

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const query = `query {
        categories {
          items {
            id
            name
            nameJp
            level
          }
        }
      }`;
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BASE_URL;
      try {
        const response = await fetch(`${apiUrl}/graphql`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query }),
        });
        const result = await response.json();
        setCategories(result.data.categories.items || []);
      } catch {
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <AppLayout>
      {/* Header */}
      <div className="bg-gradient-to-br from-rose-500 to-rose-700 text-white px-6 py-10 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Xin chào bạn! 👋</h1>
            <p className="text-sm text-primary-100">Hôm nay bạn học gì?</p>
          </div>
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            🇯🇵
          </div>
        </div>
      </div>

      {/* Tính năng chính */}
      <section className="px-6 mt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          Tính năng nổi bật
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <FeatureCard
            icon={BookOpen}
            title="Từ vựng"
            description="Chủ đề đa dạng"
            link="/vocabulary"
            color="primary"
          />
          <FeatureCard
            icon={Mic}
            title="Luyện giao tiếp"
            description="Kaiwa, shadowing"
            link="/kaiwa"
            color="orange"
          />
          <FeatureCard
            icon={FileText}
            title="Ngữ pháp"
            description="Theo trình độ"
            link="/grammar"
            color="green"
          />
          <FeatureCard
            icon={Brain}
            title="Quiz & Game"
            description="Trắc nghiệm vui"
            link="/quiz"
            color="rose"
          />
        </div>
      </section>

      {/* Gợi ý hôm nay */}
      {/* <section className="px-6 mt-6">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Gợi ý hôm nay</h3>
        <Card className="shadow-md border-none">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-gray-800">Chủ đề "Gia đình"</h4>
              <p className="text-sm text-gray-500">Bạn đã học 80%</p>
            </div>
            <Link href="/vocabulary/1">
              <Button variant="outline" size="sm">
                Tiếp tục
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section> */}

      {/* Chủ đề từ vựng */}
      {/* <section className="px-6 mt-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-gray-900">Chủ đề từ vựng</h3>
          <Link href="/vocabulary">
            <Button variant="ghost" size="sm">
              Xem tất cả
            </Button>
          </Link>
        </div>

        {loading ? (
          <p className="text-center text-gray-500 py-6">Đang tải...</p>
        ) : (
          <div className="space-y-2">
            {categories.slice(0, 3).map((cat) => (
              <Card
                key={cat.id}
                className="hover:shadow-md transition active:scale-95"
              >
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <h4 className="font-semibold text-gray-800">{cat.name}</h4>
                    <p className="text-sm text-gray-500">
                      {cat.level} • 20+ từ
                    </p>
                  </div>
                  <Link href={`/vocabulary/${cat.id}`}>
                    <Button variant="outline" size="sm">
                      Học
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section> */}

      {/* Hoạt động gần đây */}
      {/* <section className="px-6 mt-6 mb-10">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          Hoạt động gần đây
        </h3>
        <div className="space-y-3">
          <RecentActivity
            icon={<Award className="text-green-600" />}
            text="Hoàn thành chủ đề Gia đình"
            time="2 giờ trước"
          />
          <RecentActivity
            icon={<Clock className="text-purple-600" />}
            text="Học 20 từ mới"
            time="Hôm qua"
          />
        </div>
      </section> */}

      {/* Ủng hộ */}
      <section className="px-6 mt-6 mb-10">
        <h3 className="text-lg font-bold text-gray-900 mb-3">Ủng hộ</h3>
        <Card className="shadow-sm border-none">
          <CardContent className="p-4 text-center">
            <p className="mb-4">
              Hãy ủng hộ chúng tôi để duy trì và phát triển ứng dụng!
            </p>
            <img src="/qr.jpeg" alt="QR Donate" className="mx-auto w-48 h-64" />
          </CardContent>
        </Card>
      </section>
    </AppLayout>
  );
}

function FeatureCard({ icon: Icon, title, description, link, color }: any) {
  return (
    <Link href={link}>
      <Card
        className={`bg-${color}-500 text-white border-none shadow-md hover:shadow-lg`}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <h4 className="font-semibold">{title}</h4>
            <p className="text-xs">{description}</p>
          </div>
          <Icon className="w-6 h-6 text-white/80" />
        </CardContent>
      </Card>
    </Link>
  );
}

function RecentActivity({
  icon,
  text,
  time,
}: {
  icon: React.ReactNode;
  text: string;
  time: string;
}) {
  return (
    <div className="flex items-center space-x-3 p-3 bg-white  shadow-sm">
      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="font-medium text-sm text-gray-900">{text}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  );
}
