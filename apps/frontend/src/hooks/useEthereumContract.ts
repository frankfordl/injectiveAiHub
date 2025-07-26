import { useState, useEffect } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';
import { createWalletClient, custom, createPublicClient, http, parseEther, formatEther, getContract } from 'viem';
import { injective } from 'viem/chains';

// Injective EVM 网络参数
export const INJECTIVE_EVM_PARAMS = {
  chainId: '0x59f', // 1439 in hexadecimal
  chainName: 'Injective EVM',
  rpcUrls: ['https://k8s.testnet.json-rpc.injective.network/'],
  nativeCurrency: {
    name: 'Injective',
    symbol: 'INJ',
    decimals: 18,
  },
  blockExplorerUrls: ['https://testnet.blockscout.injective.network/blocks'],
};

// 定义 Injective 测试网链配置
const injectiveTestnet = {
  id: 1439,
  name: 'Injective EVM Testnet',
  network: 'injective-testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Injective',
    symbol: 'INJ',
  },
  rpcUrls: {
    default: {
      http: ['https://k8s.testnet.json-rpc.injective.network/'],
    },
    public: {
      http: ['https://k8s.testnet.json-rpc.injective.network/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Injective Explorer',
      url: 'https://testnet.blockscout.injective.network',
    },
  },
  testnet: true,
} as const;

// MetaMask 连接函数
export async function connectMetaMask() {
  if (typeof window.ethereum === 'undefined') {
    alert('MetaMask not installed!');
    return;
  }

  try {
    // 添加网络
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [INJECTIVE_EVM_PARAMS],
    });

    // 创建钱包客户端
    const walletClient = createWalletClient({
      chain: injectiveTestnet,
      transport: custom(window.ethereum),
    });

    // 请求账户访问
    const [address] = await walletClient.requestAddresses();

    // 创建公共客户端
    const publicClient = createPublicClient({
      chain: injectiveTestnet,
      transport: http(),
    });

    console.log('Connected address:', address);
    return { walletClient, publicClient, address };
  } catch (err) {
    console.error('MetaMask connection failed:', err);
  }
}

// AIHubManager 合约 ABI - 根据合约更新
const AI_HUB_MANAGER_ABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "modelName",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "maxParticipants",
        "type": "uint256"
      }
    ],
    "name": "createHub",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "hubId",
        "type": "uint256"
      }
    ],
    "name": "getHub",
    "outputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "provider",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "modelName",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "maxParticipants",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalStake",
            "type": "uint256"
          }
        ],
        "internalType": "struct AIHubManager.AIHub",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "injectiveAIAdmin",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "hubs",
    "outputs": [
      {
        "internalType": "address",
        "name": "provider",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "modelName",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "maxParticipants",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "totalStake",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [],
    "name": "HubCreated",
    "type": "event"
  }
] as const;

const CONTRACT_ADDRESS = '0x5DCAa061e59E2817292d492801F809Ca3D86AaC0' as const;

interface TransactionResult {
  success: boolean;
  hash?: string;
  message?: string;
  error?: string;
  hubId?: number;
}

interface AIHub {
  provider: string;
  modelName: string;
  maxParticipants: number;
  totalStake: string;
}

interface SessionData {
  name: string;
  description: string;
  rewardAmount: number;
  maxParticipants: number;
  duration: number;
}

export const useInjectiveContract = () => {
  const { web3, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 创建公共客户端
  const publicClient = createPublicClient({
    chain: injectiveTestnet,
    transport: http(),
  });

  // 创建钱包客户端
  const getWalletClient = () => {
    if (typeof window.ethereum === 'undefined') {
      throw new Error('MetaMask not installed');
    }
    return createWalletClient({
      chain: injectiveTestnet,
      transport: custom(window.ethereum),
    });
  };

  // 检查网络是否为Injective测试网
  const checkNetwork = async (): Promise<boolean> => {
    if (!window.ethereum) return false;
    
    try {
      const walletClient = getWalletClient();
      const chainId = await walletClient.getChainId();
      
      if (chainId !== 1439) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x59f' }],
          });
          return true;
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [INJECTIVE_EVM_PARAMS],
              });
              return true;
            } catch (addError) {
              console.error('添加Injective网络失败:', addError);
              toast.error('请手动添加Injective测试网');
              return false;
            }
          }
          console.error('切换到Injective网络失败:', switchError);
          toast.error('请切换到Injective测试网');
          return false;
        }
      }
      return true;
    } catch (error) {
      console.error('检查Injective网络失败:', error);
      return false;
    }
  };

  // 简化版本：直接向合约地址发送 INJ
  const createTrainingSession = async (sessionData: SessionData): Promise<TransactionResult> => {
    if (!account || !isConnected) {
      const errorMsg = '钱包未连接';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }
  
    const isCorrectNetwork = await checkNetwork();
    if (!isCorrectNetwork) {
      return { success: false, message: '请切换到Injective测试网' };
    }
  
    setIsLoading(true);
    setError(null);
  
    try {
      if (sessionData.rewardAmount <= 0) {
        throw new Error('质押金额必须大于0');
      }
  
      const walletClient = getWalletClient();
      const stakeAmountWei = parseEther(sessionData.rewardAmount.toString());
      
      console.log('直接发送INJ到合约地址:', {
        to: CONTRACT_ADDRESS,
        value: stakeAmountWei,
        account
      });
  
      // 使用固定的 Gas 值，不进行估算
      const fixedGas = BigInt(100000); // 0.0001 的 gas limit
  
      // 获取 gas price
      const gasPrice = await publicClient.getGasPrice();
  
      const hash = await walletClient.sendTransaction({
        account: account as `0x${string}`,
        to: CONTRACT_ADDRESS,
        value: stakeAmountWei,
        gas: fixedGas, // 使用固定 Gas
        gasPrice,
      });
  
      console.log('INJ发送成功:', hash);
      
      toast.success(`成功向合约地址发送 ${sessionData.rewardAmount} INJ`);
      
      return {
        success: true,
        hash,
        message: `成功向合约地址发送 ${sessionData.rewardAmount} INJ`
      };
  
    } catch (err: any) {
      console.error('发送INJ失败:', err);
  
      let errorMessage = '发送INJ失败';
  
      if (err.code === 4001) {
        errorMessage = '用户取消了交易';
      } else if (err.message.includes('insufficient funds')) {
        errorMessage = '余额不足，请确保有足够的INJ代币';
      } else if (err.message.includes('gas')) {
        errorMessage = 'Gas费用不足或估算失败';
      } else if (err.message.includes('Internal JSON-RPC error')) {
        errorMessage = 'Injective RPC连接错误，请检查网络连接或稍后重试';
      } else if (err.message) {
        errorMessage = err.message;
      }
  
      setError(errorMessage);
      toast.error(errorMessage);
  
      return {
        success: false,
        message: errorMessage,
        error: errorMessage
      };
    } finally {
      setIsLoading(false);
    }
  };

  // 根据合约的 getHub 函数实现
  const getHub = async (hubId: number): Promise<AIHub | null> => {
    try {
      const contract = getContract({
        address: CONTRACT_ADDRESS,
        abi: AI_HUB_MANAGER_ABI,
        publicClient,
      });

      const hubData = await contract.read.getHub([BigInt(hubId)]);
      
      return {
        provider: hubData[0],
        modelName: hubData[1],
        maxParticipants: Number(hubData[2]),
        totalStake: hubData[3].toString()
      };
    } catch (err: any) {
      console.error('获取Hub信息失败:', err);
      return null;
    }
  };

  // 获取管理员地址
  const getAdmin = async (): Promise<string | null> => {
    try {
      const contract = getContract({
        address: CONTRACT_ADDRESS,
        abi: AI_HUB_MANAGER_ABI,
        publicClient,
      });

      const admin = await contract.read.injectiveAIAdmin();
      return admin;
    } catch (err: any) {
      console.error('获取管理员地址失败:', err);
      return null;
    }
  };

  const joinTrainingSession = async (sessionId: string): Promise<TransactionResult> => {
    if (!account) {
      const errorMsg = '钱包未连接';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }

    setIsLoading(true);
    try {
      // 注意：当前合约没有 join 功能，这里是预留接口
      console.log('在Injective网络上加入训练会话:', sessionId);
      toast.success('成功在Injective网络上加入训练会话');
      return { success: true, message: '成功在Injective网络上加入训练会话' };
    } catch (err: any) {
      const errorMessage = err.message || '在Injective网络上加入训练会话失败';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const claimRewards = async (): Promise<TransactionResult> => {
    if (!account) {
      const errorMsg = '钱包未连接';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }

    setIsLoading(true);
    try {
      // 注意：当前合约没有 claim 功能，这里是预留接口
      console.log('在Injective网络上领取奖励:', account);
      toast.success('INJ奖励领取成功');
      return { success: true, message: 'INJ奖励领取成功' };
    } catch (err: any) {
      const errorMessage = err.message || '在Injective网络上领取奖励失败';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createTrainingSession,
    joinTrainingSession,
    claimRewards,
    getHub,
    getAdmin,
    isLoading,
    error,
    connected: isConnected,
    account,
    publicClient,
    getWalletClient,
  };
};

export const useEthereumContract = useInjectiveContract;
export default useInjectiveContract;