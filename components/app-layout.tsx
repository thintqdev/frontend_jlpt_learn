import type React from "react";
import BottomNavigation from "./bottom-navigation";

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 pb-20 relative overflow-hidden">
      {/* Background image layer */}
      <div
        className="absolute inset-0 w-full h-full z-0 pointer-events-none"
        style={{
          backgroundImage: `url('https://en.idei.club/uploads/posts/2023-06/1686541388_en-idei-club-p-japanese-style-background-dizain-krasivo-1.jpg')`, // Đổi thành đường dẫn thật nếu upload ảnh
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          opacity: 0.14,
          filter: "blur(1px)",
        }}
        aria-hidden
      />
      {/* Nội dung */}
      <main className="relative z-10">{children}</main>
      <BottomNavigation />
    </div>
  );
}
