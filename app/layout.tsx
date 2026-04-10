import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Paper Tracker — AI 论文追踪",
  description:
    "实时追踪字节、阿里、百度、DeepSeek、OpenAI、Anthropic 等 AI 团队的最新论文",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={`${inter.className} bg-gray-50 min-h-screen`}>
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔬</span>
              <span className="font-bold text-gray-900 text-lg">
                AI Paper Tracker
              </span>
              <span className="hidden sm:inline text-xs text-gray-400 ml-1">
                AI 论文追踪
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>每小时自动更新</span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                在线
              </span>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
