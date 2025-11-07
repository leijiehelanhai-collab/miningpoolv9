// 文件名: app/wagmi-config.ts
// 这是“五链终极版”配置！

// 1. 导入工具
import { createConfig, http } from 'wagmi';

// 2. 🚀 导入你的“EVM 梦之队”！
// 我们导入 BNB, ETH主网, CORE, Polygon, 和 Avalanche
// ...
// 2. 🚀 导入你的“EVM 梦之队”！
// 我们导入 BNB, ETH主网, CORE, Polygon, 和 Avalanche
import { bsc, mainnet, coreDao, polygon, avalanche, bscTestnet } from 'viem/chains'; // <-- ✅ 直接从 'viem/chains' 导入
// ...

import { createWeb3Modal } from '@web3modal/wagmi/react';

// 3. 你的 Project ID (保持不变)
const projectId = 'd95d2c6bda71cb24fc34cecf90f60f5e'; 

// 4. 你的 DApp 信息 (保持不变)
const metadata = {
  name: 'My Wallet App',
  description: 'My first DApp',
  url: 'https://my-wallet-app-eight.vercel.app', // 你的 Vercel 网址
  icons: ['https://my-wallet-app-eight.vercel.app/favicon.ico']
};

// 5. 🚀 配置“终极版” WagmiConfig
export const wagmiConfig = createConfig({
  
  // 步骤 A: 把所有链加入 'chains' 数组
  chains: [bsc, mainnet, coreDao, polygon, avalanche,bscTestnet], 
  
  // 步骤 B: 为每一条链配置 'transports' (RPC)
  // 这会告诉 Wagmi 如何与每一条链对话
  transports: {
    [bsc.id]: http(),
    [mainnet.id]: http(),
    [coreDao.id]: http(),
    [polygon.id]: http(),
    [avalanche.id]: http(),
    [bscTestnet.id]: http(),
  },
});

// 6. 创建 Web3Modal (它会自动读取上面的多链配置)
createWeb3Modal({
  wagmiConfig: wagmiConfig,
  projectId,
  metadata, // 确保 metadata 在这里 (我们上次修复的)
  enableAnalytics: true,
  enableOnramp: true
});