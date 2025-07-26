import { useState, useEffect } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';

// AIHubManager 合约 ABI（只包含我们需要的部分）
const AI_HUB_MANAGER_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "hubId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "provider",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "modelName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "maxParticipants",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "amountStaked",
        "type": "uint256"
      }
    ],
    "name": "HubCreated",
    "type": "event"
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
  }
];

const CONTRACT_ADDRESS = '0x5DCAa061e59E2817292d492801F809Ca3D86AaC0';

interface ContractEvent {
  hubId: string;
  provider: string;
  modelName: string;
  maxParticipants: number;
  amountStaked: string;
  blockNumber: number;
  transactionHash: string;
  timestamp: Date;
}

export const useContractEvents = () => {
  const { web3, isConnected } = useWallet();
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async () => {
    if (!web3 || !isConnected) {
      setError('钱包未连接');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const contract = new web3.eth.Contract(AI_HUB_MANAGER_ABI, CONTRACT_ADDRESS);
      
      // 减少查询范围到最近 1000 个区块
      const latestBlock = await web3.eth.getBlockNumber();
      const fromBlock = Math.max(0, Number(latestBlock) - 1000); // 从 10000 减少到 1000
      
      console.log(`查询区块范围: ${fromBlock} - ${latestBlock}`);
      
      const hubCreatedEvents = await contract.getPastEvents('HubCreated', {
        fromBlock: fromBlock,
        toBlock: 'latest'
      });

      const processedEvents: ContractEvent[] = [];
      
      for (const event of hubCreatedEvents) {
        try {
          const block = await web3.eth.getBlock(event.blockNumber);
          const timestamp = new Date(Number(block.timestamp) * 1000);
          
          processedEvents.push({
            hubId: event.returnValues.hubId,
            provider: event.returnValues.provider,
            modelName: event.returnValues.modelName,
            maxParticipants: Number(event.returnValues.maxParticipants),
            amountStaked: event.returnValues.amountStaked,
            blockNumber: event.blockNumber,
            transactionHash: event.transactionHash,
            timestamp
          });
        } catch (blockError) {
          console.warn('获取区块信息失败:', blockError);
        }
      }
      
      // 按时间倒序排列（最新的在前）
      processedEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setEvents(processedEvents);
      console.log(`成功获取 ${processedEvents.length} 个合约事件`);
      
    } catch (err: any) {
      const errorMessage = err.message || '获取合约事件失败';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('获取合约事件失败:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getHubDetails = async (hubId: string) => {
    if (!web3 || !isConnected) {
      throw new Error('钱包未连接');
    }

    try {
      const contract = new web3.eth.Contract(AI_HUB_MANAGER_ABI, CONTRACT_ADDRESS);
      const hubDetails = await contract.methods.getHub(hubId).call();
      
      return {
        provider: hubDetails.provider,
        modelName: hubDetails.modelName,
        maxParticipants: Number(hubDetails.maxParticipants),
        totalStake: hubDetails.totalStake
      };
    } catch (err: any) {
      console.error('获取Hub详情失败:', err);
      throw err;
    }
  };

  useEffect(() => {
    if (isConnected && web3) {
      fetchEvents();
    }
  }, [isConnected, web3]);

  return {
    events,
    isLoading,
    error,
    fetchEvents,
    getHubDetails,
    contractAddress: CONTRACT_ADDRESS
  };
};

const fetchEventsWithRetry = async (retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await fetchEvents();
      return; // 成功则退出
    } catch (error) {
      console.log(`尝试 ${i + 1}/${retries} 失败:`, error);
      if (i === retries - 1) {
        throw error; // 最后一次尝试失败则抛出错误
      }
      // 等待 2 秒后重试
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};