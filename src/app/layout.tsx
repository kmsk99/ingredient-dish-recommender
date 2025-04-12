import type { Metadata } from "next";
import './globals.css';

import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI 냉장고 파먹기 - 재료로 요리 추천받기",
  description: "가지고 있는 식재료를 입력하고 맞춤 레시피를 추천받으세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
