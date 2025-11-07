// 文件名: app/dex/page.tsx (V10.1 完整修复版)
'use client'; 

// --- 🚀 1. 导入“DEX”工具 ---
import { useState, useEffect } from 'react';
// --- 🚀 V10.1 (终极修复 2!) (我们“不”需要导入 'BigInt'!) ---
import { parseEther, formatEther, type TransactionReceipt, createPublicClient, http, maxUint256 } from 'viem'; 
import { bscTestnet } from 'viem/chains';
import { 
    useAccount, 
    useReadContract,
    useWriteContract,
    useWaitForTransactionReceipt
} from 'wagmi';

// --- 🚀 2. 导入“DEX” ABI ---
import PancakeRouterABI from '../PancakeRouter_ABI.json'; // 👈 (新路径!)
import ERC20_ABI from '../ERC20_ABI.json'; // 👈 (新路径!)

// --- 🚀 3. 填入“DEX”钥匙 ---
const REWARD_TOKEN_ADDRESS = '0x4eac632eA3A16B8e5315e7027ec5dbA62f4D42f6';
const BNB_TESTNET_ID = 97;
const PANCAKE_ROUTER_ADDRESS = '0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3';
const WBNB_ADDRESS = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd'; 

export default function DexPage() {
  
  // --- 🚀 4. “DEX” Hooks (V9.1 完整版) ---
  const { address, isConnected, chain } = useAccount();
  const { writeContract, isPending, error: writeError } = useWriteContract();
  const [recentHash, setRecentHash] = useState<`0x${string}` | undefined>();
  const [isApproving, setIsApproving] = useState(false);
  const [swapAmountIn, setSwapAmountIn] = useState(''); 
  const [swapAmountOut, setSwapAmountOut] = useState(''); 
  const [swapDirection, setSwapDirection] = useState<'BNB_TO_MRT' | 'MRT_TO_BNB'>('BNB_TO_MRT');
  
  const viemPublicClient = createPublicClient({ chain: bscTestnet, transport: http() });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: REWARD_TOKEN_ADDRESS, 
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address!, PANCAKE_ROUTER_ADDRESS], 
    chainId: BNB_TESTNET_ID,
    query: { enabled: isConnected && swapDirection === 'MRT_TO_BNB' }
  });

  // --- 🚀 5. “DEX”逻辑 (V9.1 完整版) ---
  useEffect(() => {
    if (swapAmountIn && parseFloat(swapAmountIn) > 0) {
      const fetchPrice = async () => {
        try {
          const amountInWei = parseEther(swapAmountIn as `${number}`);
          const path = swapDirection === 'BNB_TO_MRT'
            ? [WBNB_ADDRESS, REWARD_TOKEN_ADDRESS] 
            : [REWARD_TOKEN_ADDRESS, WBNB_ADDRESS]; 
          
          const data = await viemPublicClient.readContract({
            address: PANCAKE_ROUTER_ADDRESS, abi: PancakeRouterABI,
            functionName: 'getAmountsOut',
            args: [amountInWei, path]
          });
          const amountOutWei = (data as bigint[])[1];
          setSwapAmountOut(formatEther(amountOutWei));
        } catch (error) {
          console.error("获取价格失败 (你是否已添加 V2 流动性?):", error);
          setSwapAmountOut('0');
        }
      };
      fetchPrice();
    } else {
      setSwapAmountOut('');
    }
  }, [swapAmountIn, swapDirection, viemPublicClient]); 
  
  const handleApprove = () => {
    setIsApproving(true); 
    writeContract({
      address: REWARD_TOKEN_ADDRESS, abi: ERC20_ABI,
      functionName: 'approve',
      args: [PANCAKE_ROUTER_ADDRESS, maxUint256], 
      chainId: BNB_TESTNET_ID,
    }, {
      onSuccess: (hash) => {
        setRecentHash(hash); 
        console.log('授权交易已发送:', hash);
      },
      onError: (error) => {
        alert('授权失败: ' + error.message);
        setIsApproving(false); 
      }
    });
  };

  const handleSwap = () => {
    if (!swapAmountIn || parseFloat(swapAmountIn) <= 0 || !swapAmountOut) {
      alert('请输入一个有效的交换数量'); return;
    }
    const amountOutMin = parseEther((parseFloat(swapAmountOut) * 0.98).toString() as `${number}`);
    const deadline = Math.floor(Date.now() / 1000) + (60 * 5);

    if (swapDirection === 'BNB_TO_MRT') {
      const path = [WBNB_ADDRESS, REWARD_TOKEN_ADDRESS];
      writeContract({
        address: PANCAKE_ROUTER_ADDRESS, abi: PancakeRouterABI,
        functionName: 'swapExactETHForTokens', 
        args: [ amountOutMin, path, address, deadline ],
        value: parseEther(swapAmountIn as `${number}`),
        chainId: BNB_TESTNET_ID,
      }, { onSuccess: setRecentHash, onError: (e) => alert(e.message) });

    } else {
      const amountInWei = parseEther(swapAmountIn as `${number}`);
      const path = [REWARD_TOKEN_ADDRESS, WBNB_ADDRESS];
      writeContract({
        address: PANCAKE_ROUTER_ADDRESS, abi: PancakeRouterABI,
        functionName: 'swapExactTokensForETH', 
        args: [ amountInWei, amountOutMin, path, address, deadline ],
        chainId: BNB_TESTNET_ID,
      }, { onSuccess: setRecentHash, onError: (e) => alert(e.message) });
    }
  };

  // --- 🚀 6. “DEX”反应堆 (V9.1 完整版) ---
  const { data: receipt, isSuccess, isError, error: txError } = useWaitForTransactionReceipt({ 
    hash: recentHash,
  });
  useEffect(() => {
    if (isSuccess) {
      console.log('DEX 交易已上链!', receipt);
      alert('交易成功!');
      refetchAllowance(); // 👈 (只刷新“授权”)
      setRecentHash(undefined); 
      setSwapAmountIn('');
      setIsApproving(false); 
    }
    if (isError) {
      console.error('交易上链失败', txError);
      alert('交易失败: ' + (txError?.message || '未知错误'));
      setRecentHash(undefined); 
      setIsApproving(false); 
    }
  }, [isSuccess, isError, receipt, txError, refetchAllowance]); 


  // --- 🚀 7. “DEX”样式 (V9.1 完整版) ---
  const buttonStyle: React.CSSProperties = {
    fontSize: '16px', padding: '10px 20px', cursor: 'pointer', 
    color: 'white', border: 'none', borderRadius: '8px',
    marginLeft: '10px'
  };
  const swapInputContainerStyle: React.CSSProperties = {
    backgroundColor: '#f9f9f9', border: '1px solid #eee',
    borderRadius: '12px', padding: '12px 18px',
    margin: '15px 0', textAlign: 'left',
  };
  const swapInputRowStyle: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', marginTop: '5px',
  };
  const swapInputStyle: React.CSSProperties = {
    border: 'none', backgroundColor: 'transparent',
    fontSize: '28px', fontWeight: 'bold',
    width: '70%', outline: 'none',
    padding: '0', color: '#000',
  };
  const tokenLabelStyle: React.CSSProperties = {
    fontSize: '18px', fontWeight: 'bold',
    padding: '8px 12px', backgroundColor: '#eee',
    borderRadius: '10px', cursor: 'pointer',
  };
  
  // --- (V8.1 的“大脑” ... 完整版!) ---
  const isBNBToMRT = swapDirection === 'BNB_TO_MRT';
  const needsApproval = !isBNBToMRT && 
                        (typeof allowance !== 'bigint' || 
                         (allowance < parseEther(swapAmountIn || '0')));
  const isSwapLoading = isPending || isApproving;


  // --- 🚀 8. “DEX” UI (V9.1 完整版) ---
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
              {/* --- 🚀 V8.2 “交易所” (完整版!) --- */}
              <div style={{ border: '1.5px solid #0070f3', padding: '20px', borderRadius: '10px' }}>
                <h2 style={{ color: '#0070f3', marginTop: 0 }}>📈 V10 交易所</h2>
                
                <div style={swapInputContainerStyle}>
                  <label style={{ fontSize: '14px', color: '#666' }}>我付:</label>
                  <div style={swapInputRowStyle}>
                    <input 
                      type="text" 
                      value={swapAmountIn}
                      onChange={(e) => setSwapAmountIn(e.target.value)}
                      placeholder="0.0"
                      style={swapInputStyle}
                    />
                    <span style={tokenLabelStyle}>
                      {isBNBToMRT ? 'tBNB' : 'MRT'}
                    </span>
                  </div>
                </div>
                
                <button 
                  onClick={() => {
                    setSwapDirection(isBNBToMRT ? 'MRT_TO_BNB' : 'BNB_TO_MRT');
                    setSwapAmountIn(''); 
                  }}
                  style={{ fontSize: '24px', cursor: 'pointer', border: '1px solid #ccc', borderRadius: '50%', width: '40px', height: '40px', margin: '5px 0' }}
                >
                  ↓
                </button>

                <div style={swapInputContainerStyle}>
                  <label style={{ fontSize: '14px', color: '#666' }}>我得到:</label>
                  <div style={swapInputRowStyle}>
                    <input 
                      type="text" 
                      value={swapAmountOut}
                      disabled 
                      placeholder="0.0"
                      style={{ ...swapInputStyle, backgroundColor: 'transparent' }}
                    />
                    <span style={tokenLabelStyle}>
                      {isBNBToMRT ? 'MRT' : 'tBNB'}
                    </span>
                  </div>
                </div>
                
                <div style={{ width: '100%', marginTop: '10px' }}>
                  {needsApproval ? (
                    <button 
                      onClick={handleApprove}
                      disabled={isSwapLoading || !swapAmountIn}
                      style={{ ...buttonStyle, backgroundColor: '#f59e0b', width: '100%', marginLeft: 0, padding: '15px' }}
                    >
                      {isApproving ? '授权中...' : '批准 (Approve) MRT'}
                    </button>
                  ) : (
                    <button 
                      onClick={handleSwap}
                      disabled={isSwapLoading || !swapAmountIn || !swapAmountOut}
                      style={{ ...buttonStyle, backgroundColor: '#f59e0b', width: '100%', marginLeft: 0, padding: '15px' }}
                    >
                      {isPending ? '交换中...' : '交换 (Swap)'}
                    </button>
                  )}
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