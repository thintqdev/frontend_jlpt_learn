import type React from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Học từ vựng tiếng Nhật cùng Mr Xìn",
  description:
    "Học từ vựng tiếng Nhật hiệu quả với Mr Xìn - Nơi cung cấp các từ vựng tiếng Nhật theo chủ đề, kèm định nghĩa và ví dụ minh họa.",
  generator: "v0.dev && ThinTQ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="description" content="Học vui" />
        <meta
          name="keywords"
          content="tiếng Nhật, từ vựng, học tiếng Nhật, Mr Xìn"
        />
        <meta name="author" content="ThinTQ" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="font-sans">{children}</body>
    </html>
  );
}
