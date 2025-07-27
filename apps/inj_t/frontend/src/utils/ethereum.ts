import Web3 from 'web3';

// Injective 测试网配置
export const INJECTIVE_TESTNET_CONFIG = {
  chainId: 1439,
  chainName: 'Injective Testnet',
  nativeCurrency: {
    name: 'Injective',
    symbol: 'INJ',
    decimals: 18,
  },
  rpcUrls: ['https://k8s.testnet.json-rpc.injective.network/'],
  blockExplorerUrls: ['https://testnet.explorer.injective.network/'],
};

// 只允许 Injective 测试网
const ALLOWED_CHAIN_ID = INJECTIVE_TESTNET_CONFIG.chainId;

export const getEthereumClient = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new Web3(window.ethereum);
  }
  return null;
};

export const formatEthereumAddress = (address: string) => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const getNetworkName = (chainId: number) => {
  if (chainId === INJECTIVE_TESTNET_CONFIG.chainId) {
    return 'Injective Testnet';
  }
  return 'Unsupported Network';
};

// 验证是否为允许的网络
export const isAllowedNetwork = (chainId: number): boolean => {
  return chainId === ALLOWED_CHAIN_ID;
};

// 强制切换到 Injective 测试网
export const switchToInjectiveTestnet = async (): Promise<void> => {
  if (typeof window !== 'undefined' && window.ethereum) {
    try {
      // 尝试切换到 Injective 测试网
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${INJECTIVE_TESTNET_CONFIG.chainId.toString(16)}` }],
      });
    } catch (switchError: any) {
      // 如果网络不存在，则添加网络
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: `0x${INJECTIVE_TESTNET_CONFIG.chainId.toString(16)}`,
                chainName: INJECTIVE_TESTNET_CONFIG.chainName,
                nativeCurrency: INJECTIVE_TESTNET_CONFIG.nativeCurrency,
                rpcUrls: INJECTIVE_TESTNET_CONFIG.rpcUrls,
                blockExplorerUrls: INJECTIVE_TESTNET_CONFIG.blockExplorerUrls,
              },
            ],
          });
        } catch (addError) {
          console.error('添加 Injective 测试网失败:', addError);
          throw new Error('无法添加 Injective 测试网，请手动添加');
        }
      } else {
        console.error('切换到 Injective 测试网失败:', switchError);
        throw new Error('无法切换到 Injective 测试网');
      }
    }
  } else {
    throw new Error('请安装 MetaMask 插件');
  }
};

// 验证并强制切换到正确网络
export const validateAndSwitchNetwork = async (): Promise<void> => {
  if (typeof window !== 'undefined' && window.ethereum) {
    const web3 = new Web3(window.ethereum);
    const currentChainId = await web3.eth.getChainId();
    
    if (!isAllowedNetwork(Number(currentChainId))) {
      await switchToInjectiveTestnet();
    }
  }
};