// 文件名: app/invite/page.tsx (V10.1 完整修复版)
'use client'; 

// --- 🚀 1. 导入“邀请”工具 ---
import { useState, useEffect } from 'react';
import { isAddress, zeroAddress, type TransactionReceipt } from 'viem'; // 👈 (V10.1 修复!)
import { 
    useAccount, 
    useReadContract,
    useWriteContract,
    useWaitForTransactionReceipt
} from 'wagmi';

// --- 🚀 2. 导入“挖矿” ABI ---
import MiningPoolABI from '../MiningPool_ABI.json'; // 👈 (新路径!)

// --- 🚀 3. 填入“邀请”钥匙 ---
const MINING_POOL_ADDRESS = '0xdaFc4c422124A74987917c486d9f1258ab96d7A1'; // 👈 ❗ 填入
const BNB_TESTNET_ID = 97;
const MY_DAPP_URL = 'https://miningpoolv3.vercel.app'; // 👈 ❗ 填入

export default function InvitePage() {
  
  // --- 🚀 4. “邀请” Hooks (V9.1 完整版) ---
  const { address, isConnected, chain } = useAccount();
  const { writeContract, isPending, error: writeError } = useWriteContract();
  const [recentHash, setRecentHash] = useState<`0x${string}` | undefined>();
  const [referrerInput, setReferrerInput] = useState(''); 
  
  const { data: userReferrer, refetch: refetchReferrer } = useReadContract({
    address: MINING_POOL_ADDRESS,
    abi: MiningPoolABI, 
    functionName: 'referrerOf', 
    args: [address],
    chainId: BNB_TESTNET_ID,
    query: { enabled: !!address }
  });
  
  const isUserRegistered = typeof userReferrer === 'string' && userReferrer !== zeroAddress;
  
  // --- 🚀 5. “邀请”逻辑 (V9.1 完整版) ---
  const handleRegister = () => {
    if (!isAddress(referrerInput)) {
      alert('你输入的“邀请人地址”无效！'); return;
    }
    if (referrerInput.toLowerCase() === address?.toLowerCase()) {
      alert('你不能邀请你自己！'); return;
    }

    writeContract({
      address: MINING_POOL_ADDRESS,
      abi: MiningPoolABI, 
      functionName: 'register', 
      args: [referrerInput as `0x${string}`], 
      chainId: BNB_TESTNET_ID,
    }, {
      onSuccess: (hash) => {
        setRecentHash(hash); 
        console.log('绑定邀请人交易已发送:', hash);
      },
      onError: (error) => { alert('绑定失败: ' + error.message); }
    });
  };

  // --- 🚀 6. “邀请”反应堆 (V9.1 完整版) ---
  const { data: receipt, isSuccess, isError, error: txError } = useWaitForTransactionReceipt({ 
    hash: recentHash,
  });
  useEffect(() => {
    if (isSuccess) {
      console.log('邀请交易已上链!', receipt);
      alert('交易成功!');
      refetchReferrer(); // 👈 (只刷新“邀请”!)
      setRecentHash(undefined); 
      setReferrerInput(''); 
    }
    if (isError) {
      console.error('交易上链失败', txError);
      alert('交易失败: ' + (txError?.message || '未知错误'));
      setRecentHash(undefined); 
    }
  }, [isSuccess, isError, receipt, txError, refetchReferrer]); 
  
  // --- 🚀 7. “邀请”样式 (V9.1 完整版) ---
  const buttonStyle: React.CSSProperties = {
    fontSize: '16px', padding: '10px 20px', cursor: 'pointer', 
    color: 'white', border: 'none', borderRadius: '8px',
    marginLeft: '10px'
  };
  
  // --- 🚀 8. “邀请” UI (V9.1 完整版) ---
  return (
    <main style={{ padding: '50px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      
      {!isConnected ? (
        <h2 style={{color: '#666'}}>请先连接钱包 (Connect Wallet)...</h2>
      ) : (
        <div>
          {chain?.id !== BNB_TESTNET_ID ? (
            <div style={{ padding: '20px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '10px' }}>
                <h2 style={{ color: '#D97706' }}>❌ 网络错误！</h2>
                <p>这个DApp只在 **BNB 测试网** 上运行。</p>
                <p>请在你的钱包（或点击顶部按钮）**切换到 'BNB Smart Chain Testnet'**！</p>
            </div>
          ) : (
            <div>
              {/* --- 🚀 V9.0 (新!) “邀请”控制台 --- */}
              <div style={{ border: '1.5px solid #8B5CF6', padding: '20px', borderRadius: '10px', marginBottom: '30px', textAlign: 'left' }}>
                <h2 style={{ color: '#8B5CF6', marginTop: 0, textAlign: 'center' }}>💜 V10 邀请系统</h2>
                
                {isUserRegistered ? (
                  // (情况 A: “已”绑定！)
                  <div>
                    <p style={{textAlign: 'center'}}>✅ 你已成功绑定邀请人！</p>
                    <p style={{fontSize: '0.9em', color: '#666', textAlign: 'center', wordBreak: 'break-all'}}>你的邀请人: {userReferrer}</p>
                    
                    <hr style={{margin: '20px 0', border: 'none', borderTop: '1px dashed #ccc'}} />

                    <p style={{textAlign: 'center'}}><strong>🔥 你的专属邀请链接:</strong></p>
                    <input 
                      type="text"
                      value={`${MY_DAPP_URL}/invite/${address}`} 
                      readOnly
                      style={{ padding: '10px', fontSize: '14px', width: '100%', boxSizing: 'border-box', backgroundColor: '#f4f4f4', textAlign: 'center' }}
                    />
                    <button 
                      onClick={() => navigator.clipboard.writeText(`${MY_DAPP_URL}/invite/${address}`)}
                      style={{ ...buttonStyle, backgroundColor: '#8B5CF6', marginLeft: 0, marginTop: '10px', width: '100%' }}
                    >
                      复制链接
                    </button>
                  </div>
                ) : (
                  // (情况 B: “未”绑定！)
                  <div style={{textAlign: 'center'}}>
                    <p>❌ 你尚未绑定“邀请人”！</p>
                    <p style={{fontSize: '0.9em', color: '#666'}}>绑定“上级”地址，他将在你“领取”时获得 10% 奖励！</p>
                    <input 
                      type="text"
                      value={referrerInput}
                      onChange={(e) => setReferrerInput(e.target.value)}
                      placeholder="粘贴你“上级”的钱包地址 (0x...)"
                      style={{ padding: '10px', fontSize: '14px', width: '100%', boxSizing: 'border-box', margin: '10px 0' }}
                    />
                    <button 
                      onClick={handleRegister}
                      disabled={isPending || !referrerInput}
                      style={{ ...buttonStyle, backgroundColor: '#8B5CF6', marginLeft: 0, width: '100%' }}
                    >
                      {isPending ? '绑定中...' : '永久绑定'}
                    </button>
                  </div>
                )}
              </div>

              {/* --- (公共) 交易状态 (完整版!) --- */}
              <div style={{marginTop: '20px'}}>
                {recentHash && <p>交易已发送: <a href={`https://testnet.bscscan.com/tx/${recentHash}`} target="_blank" rel="noreferrer" style={{color: '#0070f3', wordBreak: 'break-all'}}>在 BscScan 上查看</a></p>}
                {writeError && <p style={{color: 'red', wordBreak: 'break-all'}}>错误: {writeError.message.slice(0, 100)}...</p>}
              </div>

            </div>
          )}
        </div>
      )}
    </main>
  );
}