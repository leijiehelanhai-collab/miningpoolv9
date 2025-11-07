// 文件名: app/providers.tsx
'use client'; // 必须是客户端组件

import { WagmiProvider } from 'wagmi';
import { wagmiConfig } from './wagmi-config'; // 导入我们刚创建的配置
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

// 创建一个查询客户端 (Wagmi 需要它)
const queryClient = new QueryClient();

export function ContextProvider({ children }: { children: React.ReactNode }) {
  return (
    // 把 WagmiProvider 包在最外层
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}