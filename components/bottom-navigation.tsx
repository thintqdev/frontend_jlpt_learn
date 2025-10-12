"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Home,
  BookOpen,
  Brain,
  Gamepad2,
  User,
  BookAIcon,
  TrendingUp,
  BookAudio,
  MessageCircle,
  BookCheck,
} from "lucide-react";

export default function BottomNavigation() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/",
      icon: Home,
      label: "Trang chủ",
      active: pathname === "/",
    },
    {
      href: "/vocabulary",
      icon: BookAIcon,
      label: "Từ vựng",
      active: pathname.startsWith("/vocabulary"),
    },
    {
      href: "/practice",
      icon: Gamepad2,
      label: "Luyện tập",
      active: pathname.startsWith("/practice"),
    },
    // {
    //   href: "/free-learn",
    //   icon: Brain,
    //   label: "Free Learn",
    //   active: pathname.startsWith("/free-learn"),
    // },
    {
      href: "/grammar",
      icon: BookOpen,
      label: "Ngữ pháp",
      active: pathname.startsWith("/grammar"),
    },
    {
      href: "/exercise",
      icon: BookAudio,
      label: "Bài tập",
      active: pathname.startsWith("/exercise"),
    },
    {
      href: "/kaiwa",
      icon: MessageCircle,
      label: "Kaiwa",
      active: pathname.startsWith("/kaiwa"),
    },
    {
      href: "/reading",
      icon: BookCheck,
      label: "Đọc hiểu",
      active: pathname.startsWith("/reading"),
    },
    // {
    //   href: "/profile",
    //   icon: User,
    //   label: "Cá nhân",
    //   active: pathname === "/profile",
    // },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-2 z-50">
      <div className="flex items-center justify-around max-w-full mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 ${
                item.active
                  ? "text-primary-600 bg-primary-50"
                  : "text-gray-500 hover:text-primary-600 hover:bg-gray-50"
              }`}
            >
              <Icon
                className={`h-5 w-5 mb-1 ${
                  item.active ? "text-primary-600" : "text-gray-500"
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  item.active ? "text-primary-600" : "text-gray-500"
                } hidden sm:inline`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
