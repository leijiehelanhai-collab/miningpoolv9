// 文件名: app/components/Header.tsx (V10.2 终极修复版)
'use client'; 

import Link from 'next/link'; 
import { usePathname } from 'next/navigation'; 
import { useAccount } from 'wagmi'; 
import { useWeb3Modal } from '@web3modal/wagmi/react';
// --- 🚀 V10.2 (新!) 导入“大神”的 Hydration 修复工具！ ---
import { useState, useEffect } from 'react';

export function Header() {
  
  // --- 🚀 V10.2 (新!) “大神”的 Hydration 解决方案 ---
  // 1. 创建一个状态，用来追踪我们是否在客户端上 "安全" 了
  const [isMounted, setIsMounted] = useState(false);

  // 2. 这个函数只会在客户端上、Hydration 完成后运行
  useEffect(() => {
    setIsMounted(true);
  }, []); // 空依赖数组确保它只运行一次
  // --- 🚀 方案结束 ---

  // --- “连接”逻辑 ---
  const { address, isConnected, chain } = useAccount();
  const { open } = useWeb3Modal();
  
  // --- “导航”逻辑 ---
  const pathname = usePathname(); 
  const getLinkClass = (path: string) => {
    return pathname.startsWith(path)
      ? 'text-white bg-blue-600' 
      : 'text-gray-500 hover:text-blue-600'; 
  };

  return (
    <header style={{ 
      width: '100%', 
      padding: '20px 40px', 
      borderBottom: '1px solid #eee',
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      backgroundColor: 'white'
    }}>
      
      {/* --- 1. “左侧”：Logo --- */}
      <div style={{ fontWeight: 'bold', fontSize: '24px' }}>
        <Link href="/">MyDApp</Link>
      </div>

      {/* --- 2. “中间”：你的“三个按钮” --- */}
      <nav style={{ display: 'flex', gap: '20px' }}>
        <Link href="/mining" style={navLinkStyle} className={getLinkClass('/mining')}>
          挖矿 (Mining)
        </Link>
        <Link href="/dex" style={navLinkStyle} className={getLinkClass('/dex')}>
          交易所 (DEX)
        </Link>
        <Link href="/invite" style={navLinkStyle} className={getLinkClass('/invite')}>
          邀请 (Invite)
        </Link>
      </nav>

      {/* --- 3. “右侧”：你的“连接”按钮 --- */}
      <div>
        
        {/* --- 🚀 V10.2 (终极!) “Hydration 安全”按钮！ --- */}
        {/* (关键!) 
          1. 在 'isMounted' 为 'false' 时 (服务器上, 或客户端“激活”前), 
             我们“什么都不渲染” (返回 null)！
          2. 这 100% 保证了“服务器” (渲染 null) 和“客户端首次渲染” (渲染 null) 
             是“一致”的！
          3. Hydration 成功！
          4. 'isMounted' 变为 'true' (激活后), 
             我们“安全”地渲染“真实”的按钮！
        */}
        {isMounted ? (
          <button 
            onClick={() => open()}
            style={{ 
              fontSize: '16px', 
              padding: '10px 20px', 
              cursor: 'pointer', 
              backgroundColor: '#0070f3', 
              color: 'white', 
              border: 'none', 
              borderRadius: '10px'
            }}
          >
            {/* (这段逻辑现在 100% 安全了!) */}
            {isConnected ? `已连接 (${chain?.name})` : "连接我的钱包"}
          </button>
        ) : (
          // (Hydration 激活前, 我们渲染一个“占位符”或“什么都不渲染”)
          <div style={{ height: '44px', width: '150px' }}></div> // (一个“隐形”的占位符)
        )}

      </div>
    </header>
  );
}

// (按钮的“通用”样式)
const navLinkStyle: React.CSSProperties = {
  fontSize: '18px',
  fontWeight: '500',
  padding: '8px 15px',
  borderRadius: '8px',
  textDecoration: 'none',
  transition: 'all 0.2s ease-in-out',
};