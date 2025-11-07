// 文件名: app/mining/page.tsx (V10.1 完整修复版)
'use client'; 

// --- 🚀 1. 导入“挖矿”工具 ---
import { useState, useEffect } from 'react';
// --- 🚀 V10.1 (终极修复 2!) (我们“不”需要导入 'BigInt'!) ---
import { parseEther, formatEther, type TransactionReceipt } from 'viem'; 
import { 
    useAccount, 
    useBalance,
    useReadContract,
    useWriteContract,
    useWaitForTransactionReceipt
} from 'wagmi';

// --- 🚀 2. 导入“挖矿” ABI ---
import MiningPoolABI from '../MiningPool_ABI.json'; // 👈 (新路径!)

// --- 🚀 3. 填入“挖矿”钥匙 ---
const MINING_POOL_ADDRESS = '0xdaFc4c422124A74987917c486d9f1258ab96d7A1'; // 👈 ❗ 填入
const REWARD_TOKEN_ADDRESS = '0x4eac632eA3A16B8e5315e7027ec5dbA62f4D42f6';
const BNB_TESTNET_ID = 97;

export default function MiningPage() {
  
  // --- 🚀 4. “挖矿” Hooks (V9.1 完整版) ---
  const { address, isConnected, chain } = useAccount();
  const { writeContract, isPending, error: writeError } = useWriteContract();
  const [recentHash, setRecentHash] = useState<`0x${string}` | undefined>();
  const [stakeAmount, setStakeAmount] = useState('');
  
  const { data: stakedBalance, refetch: refetchStakedBalance } = useReadContract({
    address: MINING_POOL_ADDRESS, 
    abi: MiningPoolABI,
    functionName: 'stakingBalance', 
    args: [address], 
    chainId: BNB_TESTNET_ID,
  });
  
  const { data: rewardTokenBalance, refetch: refetchRewardBalance } = useBalance({
    address: address, 
    token: REWARD_TOKEN_ADDRESS, 
    chainId: BNB_TESTNET_ID,
  });
  
  const { data: pendingRewards, refetch: refetchPendingRewards } = useReadContract({
    address: MINING_POOL_ADDRESS, 
    abi: MiningPoolABI,
    functionName: 'getPendingRewards', 
    args: [address], 
    chainId: BNB_TESTNET_ID,
    query: { enabled: !!address, refetchInterval: 5000 }
  });

  // --- 🚀 5. “挖矿”逻辑 (V9.1 完整版) ---
  const handleStake = async () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      alert('请输入一个有效的质押数量'); return;
    }
    const amountInWei = parseEther(stakeAmount as `${number}`);
    writeContract({
      address: MINING_POOL_ADDRESS, abi: MiningPoolABI, functionName: 'stake',
      value: amountInWei, chainId: BNB_TESTNET_ID,
    }, { onSuccess: setRecentHash, onError: (e) => alert(e.message) });
  };
  
  const handleClaim = () => {
    writeContract({
      address: MINING_POOL_ADDRESS, abi: MiningPoolABI, functionName: 'claimReward',
      chainId: BNB_TESTNET_ID,
    }, { onSuccess: setRecentHash, onError: (e) => alert(e.message) });
  };
  
  const handleUnstake = () => {
    // --- 🚀 V10.1 (终极修复 3!) (使用 'BigInt(0)' 修复 V4.4 的 Bug!) ---
    if (typeof stakedBalance !== 'bigint' || stakedBalance === BigInt(0)) {
      alert('你没有已质押的 tBNB 可以赎回！'); return;
    }
    writeContract({
      address: MINING_POOL_ADDRESS, abi: MiningPoolABI, functionName: 'unstake',
      args: [stakedBalance], chainId: BNB_TESTNET_ID,
    }, { onSuccess: setRecentHash, onError: (e) => alert(e.message) });
  };

  // --- 🚀 6. “挖矿”反应堆 (V9.1 完整版) ---
  const { data: receipt, isSuccess, isError, error: txError } = useWaitForTransactionReceipt({ 
    hash: recentHash,
  });
  useEffect(() => {
    if (isSuccess) {
      console.log('挖矿交易已上链!', receipt);
      alert('交易成功!');
      refetchStakedBalance(); 
      refetchRewardBalance();
      refetchPendingRewards(); 
      setRecentHash(undefined); 
      setStakeAmount(''); 
    }
    if (isError) {
      console.error('交易上链失败', txError);
      alert('交易失败: ' + (txError?.message || '未知错误'));
      setRecentHash(undefined); 
    }
  }, [isSuccess, isError, receipt, txError, refetchStakedBalance, refetchRewardBalance, refetchPendingRewards]); 

  
  // --- 🚀 7. “挖矿”样式 (V9.1 完整版) ---
  const buttonStyle: React.CSSProperties = {
    fontSize: '16px', padding: '10px 20px', cursor: 'pointer', 
    color: 'white', border: 'none', borderRadius: '8px',
    marginLeft: '10px'
  };

  // --- 🚀 8. “挖矿” UI (V9.1 完整版) ---
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
              {/* --- 🚀 V6.1 “挖矿控制台” (完整版!) --- */}
              <div style={{ border: '1.5px solid #ccc', padding: '20px', borderRadius: '10px', marginBottom: '30px', textAlign: 'center' }}>
                <h2 style={{marginTop: 0}}>✅ V10 挖矿控制台</h2>
                <p style={{wordBreak: 'break-all'}}><strong>你的钱包:</strong> {address}</p>
                
                <div style={{ backgroundColor: '#f9f9f9', padding: '15px', borderRadius: '8px', border: '1px solid #eee', textAlign: 'left' }}>
                  <p>你已质押: <strong>{typeof stakedBalance === 'bigint' ? formatEther(stakedBalance).slice(0, 8) : '0'} tBNB</strong></p>
                  <p style={{ color: '#10B981', fontWeight: 'bold', fontSize: '1.1em', marginTop: '10px' }}>
                    “实时”未领利息: 
                    <strong>
                      {typeof pendingRewards === 'bigint' ? formatEther(pendingRewards).slice(0, 8) : '0'}
                    </strong> 坤鸡币
                  </p>
                  <p style={{ color: '#666', fontSize: '0.9em', marginTop: '5px' }}>
                    (已领到钱包: {rewardTokenBalance ? rewardTokenBalance.formatted.slice(0, 8) : '0'} 坤鸡币)
                  </p>
                </div>

                {/* --- 质押操作 (完整版!) --- */}
                <div style={{ margin: '20px 0' }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>质押 (Stake)</h3>
                  <input 
                    type="text" value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    placeholder="例如: 0.01 tBNB"
                    style={{ padding: '10px', fontSize: '16px', width: '200px', boxSizing: 'border-box' }}
                  />
                  <button onClick={handleStake} disabled={isPending} style={{ ...buttonStyle, backgroundColor: '#10B981' }}>
                    {isPending ? '处理中...' : '质押 tBNB'}
                  </button>
                </div>
                {/* --- 领取操作 (完整版!) --- */}
                <div style={{ margin: '20px 0' }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>领取 (Claim)</h3>
                  <button onClick={handleClaim} disabled={isPending} style={{ ...buttonStyle, backgroundColor: '#EF4444' }}>
                    {isPending ? '处理中...' : '领取我的 坤鸡币'}
                  </button>
                </div>
                {/* --- 赎回操作 (完整版!) --- */}
                <div style={{ margin: '20px 0', borderTop: '1px dashed #ccc', paddingTop: '20px' }}>
                  <h3 style={{ margin: '0 0 10px 0' }}>赎回 (Unstake)</h3>
                  <button 
                    onClick={handleUnstake}
                    disabled={isPending || typeof stakedBalance !== 'bigint' || stakedBalance === BigInt(0)}
                    style={{ ...buttonStyle, backgroundColor: '#0EA5E9' }}
                  >
                    {isPending ? '处理中...' : '赎回全部 tBNB'}
                  </button>
                </div>
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