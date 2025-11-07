// 文件名: app/page.tsx (V10.0 重构!)
'use client'; // 👈 (必须是 'use client' 才能用“导航”)

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // 👈 (新!) “大神”的“导航”工具

export default function HomePage() {
  const router = useRouter(); // 👈 (获取“导航器”)

  // (V10.0 终极魔法!)
  // 当“大厅” (/) 页面“加载”时...
  useEffect(() => {
    // ...“立刻”把用户“导航”到“挖矿室” (/mining)！
    router.push('/mining'); 
  }, [router]); // 👈 (依赖“导航器”)

  // (我们什么都不显示, 因为我们会“立刻”跳转)
  return (
    <main style={{ padding: '50px', textAlign: 'center' }}>
      <h1>正在加载 DApp...</h1>
    </main>
  );
}