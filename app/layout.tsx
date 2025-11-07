// 文件名: app/layout.tsx (V10.1 完整版)
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ContextProvider } from './providers'; 
import { Header } from './components/Header'; // 👈 (确保路径正确!)

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "V10.1 - 全栈 DApp 架构", // (新标题!)
  description: "我的终极 DeFi DApp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* “总电源” (Wagmi) */}
        <ContextProvider>
          
          {/* 我们的“导航栏”！ */}
          <Header /> 
          
          {/* 我们的“房间” (pages) 会被“自动”塞到这里！ */}
          {children}

        </ContextProvider>
      </body>
    </html>
  );
}