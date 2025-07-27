import { useState, useCallback } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';
import Web3 from 'web3';

// InjectiveAiHub 合约地址和配置
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '0x1';

// InjectiveAiHub 合约 ABI
const INJECTIVE_AI_HUB_ABI = [
  {
    "inputs": [
      { "internalType": "string", "name": "name", "type": "string" },
      { "internalType": "uint256", "name": "rewardAmount", "type": "uint256" },
      { "internalType": "uint256", "name": "maxParticipants", "type": "uint256" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "uint256", "name": "duration", "type": "uint256" }
    ],
    "name": "createTrainingSession",
    "outputs": [{ "internalType": "uint256", "name": "sessionId", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "sessionId", "type": "uint256" }
    ],
    "name": "registerForSession",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "sessionId", "type": "uint256" },
      { "internalType": "uint256", "name": "score", "type": "uint256" },
      { "internalType": "string", "name": "contributionHash", "type": "string" },
      { "internalType": "string", "name": "metadata", "type": "string" }
    ],
    "name": "submitContribution",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "sessionId", "type": "uint256" }
    ],
    "name": "completeSession",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "sessionId", "type": "uint256" }
    ],
    "name": "getSessionDetails",
    "outputs": [
      {
        "components": [
          { "internalType": "string", "name": "name", "type": "string" },
          { "internalType": "string", "name": "description", "type": "string" },
          { "internalType": "uint256", "name": "rewardAmount", "type": "uint256" },
          { "internalType": "uint256", "name": "maxParticipants", "type": "uint256" },
          { "internalType": "uint256", "name": "currentParticipants", "type": "uint256" },
          { "internalType": "uint256", "name": "duration", "type": "uint256" },
          { "internalType": "uint8", "name": "status", "type": "uint8" },
          { "internalType": "uint256", "name": "createdAt", "type": "uint256" },
          { "internalType": "uint256", "name": "completedAt", "type": "uint256" },
          { "internalType": "address", "name": "creator", "type": "address" },
          { "internalType": "address[]", "name": "participants", "type": "address[]" }
        ],
        "internalType": "struct InjectiveAiHub.SessionDetails",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

interface CreateSessionParams {
  name: string;
  rewardAmount: number;
  maxParticipants: number;
  description?: string;
  duration?: number;
}

interface SessionDetails {
  id: string;
  name: string;
  description: string;
  rewardAmount: number;
  maxParticipants: number;
  currentParticipants: number;
  duration: number;
  status: string;
  createdAt: Date;
  completedAt?: Date;
  creator: string;
  participants: string[];
}

interface TransactionResult {
  success: boolean;
  hash?: string;
  message: string;
  error?: string;
}

export const useInjectiveContract = () => {
  const { web3, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get contract instance
  const getContract = useCallback(() => {
    if (!web3) {
      throw new Error('Web3 not initialized');
    }
    return new web3.eth.Contract(INJECTIVE_AI_HUB_ABI, CONTRACT_ADDRESS);
  }, [web3]);

  // Create training session
  const createTrainingSession = useCallback(async (
    params: CreateSessionParams
  ): Promise<TransactionResult> => {
    if (!isConnected || !account) {
      const errorMsg = '钱包未连接';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = getContract();
      const rewardAmountWei = Web3.utils.toWei(params.rewardAmount.toString(), 'ether');
      
      const tx = await contract.methods.createTrainingSession(
        params.name,
        rewardAmountWei,
        params.maxParticipants,
        params.description || '',
        params.duration || 0
      ).send({
        from: account,
        value: rewardAmountWei, // 质押INJ作为奖励
        gas: 500000
      });

      toast.success('训练会话创建成功!');
      return {
        success: true,
        hash: tx.transactionHash,
        message: '训练会话创建成功',
      };
    } catch (err: any) {
      const errorMsg = err.message || '创建训练会话失败';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, message: errorMsg, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, getContract]);

  // Register for session
  const registerForSession = useCallback(async (
    sessionId: string
  ): Promise<TransactionResult> => {
    if (!isConnected || !account) {
      const errorMsg = '钱包未连接';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = getContract();
      const stakeAmount = Web3.utils.toWei('0.1', 'ether'); // 0.1 INJ 质押
      
      const tx = await contract.methods.registerForSession(sessionId).send({
        from: account,
        value: stakeAmount,
        gas: 300000
      });

      toast.success('成功注册训练会话!');
      return {
        success: true,
        hash: tx.transactionHash,
        message: '成功注册训练会话',
      };
    } catch (err: any) {
      const errorMsg = err.message || '注册训练会话失败';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, message: errorMsg, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, getContract]);

  // Submit contribution
  const submitContribution = useCallback(async (
    sessionId: string,
    score: number,
    contributionHash?: string,
    metadata?: string
  ): Promise<TransactionResult> => {
    if (!isConnected || !account) {
      const errorMsg = '钱包未连接';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = getContract();
      
      const tx = await contract.methods.submitContribution(
        sessionId,
        score,
        contributionHash || '',
        metadata || ''
      ).send({
        from: account,
        gas: 300000
      });

      toast.success('贡献提交成功!');
      return {
        success: true,
        hash: tx.transactionHash,
        message: '贡献提交成功',
      };
    } catch (err: any) {
      const errorMsg = err.message || '提交贡献失败';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, message: errorMsg, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, getContract]);

  // Complete session
  const completeSession = useCallback(async (
    sessionId: string
  ): Promise<TransactionResult> => {
    if (!isConnected || !account) {
      const errorMsg = '钱包未连接';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = getContract();
      
      const tx = await contract.methods.completeSession(sessionId).send({
        from: account,
        gas: 400000
      });

      toast.success('训练会话完成!');
      return {
        success: true,
        hash: tx.transactionHash,
        message: '训练会话完成',
      };
    } catch (err: any) {
      const errorMsg = err.message || '完成训练会话失败';
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, message: errorMsg, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [isConnected, account, getContract]);

  // Get session details
  const getSessionDetails = useCallback(async (
    sessionId: string
  ): Promise<SessionDetails | null> => {
    try {
      const contract = getContract();
      const sessionData = await contract.methods.getSessionDetails(sessionId).call();
      
      if (!sessionData) {
        return null;
      }

      const statusMap = ['Active', 'Completed', 'Cancelled'];
      
      return {
        id: sessionId,
        name: sessionData.name,
        description: sessionData.description || '',
        rewardAmount: parseFloat(Web3.utils.fromWei(sessionData.rewardAmount, 'ether')),
        maxParticipants: parseInt(sessionData.maxParticipants),
        currentParticipants: parseInt(sessionData.currentParticipants),
        duration: parseInt(sessionData.duration) || 0,
        status: statusMap[sessionData.status] || 'Unknown',
        createdAt: new Date(parseInt(sessionData.createdAt) * 1000),
        completedAt: sessionData.completedAt > 0 ? new Date(parseInt(sessionData.completedAt) * 1000) : undefined,
        creator: sessionData.creator,
        participants: sessionData.participants || [],
      };
    } catch (err: any) {
      console.error('获取会话详情失败:', err);
      setError(`获取会话详情失败: ${err.message}`);
      return null;
    }
  }, [getContract]);

  // Get account balance
  const getAccountBalance = useCallback(async (
    address?: string
  ): Promise<number> => {
    try {
      if (!web3) {
        throw new Error('Web3 not initialized');
      }
      
      const targetAddress = address || account;
      if (!targetAddress) {
        throw new Error('No address provided');
      }

      const balanceWei = await web3.eth.getBalance(targetAddress);
      const balance = parseFloat(Web3.utils.fromWei(balanceWei, 'ether'));
      return balance;
    } catch (err: any) {
      console.error('获取账户余额失败:', err);
      setError(`获取账户余额失败: ${err.message}`);
      return 0;
    }
  }, [web3, account]);

  // Get participant score
  const getParticipantScore = useCallback(async (
    sessionId: string,
    participantAddress?: string
  ): Promise<number> => {
    try {
      const targetAddress = participantAddress || account;
      if (!targetAddress) {
        throw new Error('No address provided');
      }

      // 这里需要根据实际合约实现来获取参与者分数
      // 暂时返回0，需要在合约中添加相应的查询方法
      return 0;
    } catch (err: any) {
      console.error('获取参与者分数失败:', err);
      setError(`获取参与者分数失败: ${err.message}`);
      return 0;
    }
  }, [account]);

  // Get my rewards (claimable rewards)
  const getMyRewards = useCallback(async (): Promise<number> => {
    if (!isConnected || !account) {
      return 0;
    }

    try {
      // 这里需要根据实际合约实现来获取可领取奖励
      // 暂时返回账户余额
      const balance = await getAccountBalance();
      return balance;
    } catch (err: any) {
      console.error('获取奖励失败:', err);
      setError(`获取奖励失败: ${err.message}`);
      return 0;
    }
  }, [isConnected, account, getAccountBalance]);

  return {
    // Transaction methods
    createTrainingSession,
    registerForSession,
    submitContribution,
    completeSession,
    
    // Query methods
    getSessionDetails,
    getAccountBalance,
    getParticipantScore,
    getMyRewards,
    
    // State
    isLoading,
    error,
    clearError,
    
    // Wallet state
    connected: isConnected,
    account,
  };
};

export default useInjectiveContract;