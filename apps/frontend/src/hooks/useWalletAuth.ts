import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';

interface WalletAuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    walletAddress: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

interface UseWalletAuthReturn {
  isLoading: boolean;
  login: () => Promise<WalletAuthResponse | null>;
  logout: () => void;
}

import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';

export const useWalletAuth = () => {
  const { web3, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const signMessage = async (message: string) => {
    if (!web3 || !account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const signature = await web3.eth.personal.sign(message, account, '');
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    if (!account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const message = `请签名以验证您的身份\n\n地址: ${account}\n时间: ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      
      // 这里可以将签名发送到后端进行验证
      // const response = await fetch('/api/auth/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ address: account, signature, message })
      // });
      
      toast.success('身份验证成功');
      return { signature, message };
    } catch (error) {
      toast.error('身份验证失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    account,
    isConnected,
    isLoading,
    signMessage,
    authenticate,
  };
};
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';

export const useWalletAuth = () => {
  const { web3, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const signMessage = async (message: string) => {
    if (!web3 || !account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const signature = await web3.eth.personal.sign(message, account, '');
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    if (!account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const message = `请签名以验证您的身份\n\n地址: ${account}\n时间: ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      
      // 这里可以将签名发送到后端进行验证
      // const response = await fetch('/api/auth/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ address: account, signature, message })
      // });
      
      toast.success('身份验证成功');
      return { signature, message };
    } catch (error) {
      toast.error('身份验证失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    account,
    isConnected,
    isLoading,
    signMessage,
    authenticate,
  };
};
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';

export const useWalletAuth = () => {
  const { web3, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const signMessage = async (message: string) => {
    if (!web3 || !account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const signature = await web3.eth.personal.sign(message, account, '');
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    if (!account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const message = `请签名以验证您的身份\n\n地址: ${account}\n时间: ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      
      // 这里可以将签名发送到后端进行验证
      // const response = await fetch('/api/auth/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ address: account, signature, message })
      // });
      
      toast.success('身份验证成功');
      return { signature, message };
    } catch (error) {
      toast.error('身份验证失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    account,
    isConnected,
    isLoading,
    signMessage,
    authenticate,
  };
};
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';

export const useWalletAuth = () => {
  const { web3, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const signMessage = async (message: string) => {
    if (!web3 || !account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const signature = await web3.eth.personal.sign(message, account, '');
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    if (!account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const message = `请签名以验证您的身份\n\n地址: ${account}\n时间: ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      
      // 这里可以将签名发送到后端进行验证
      // const response = await fetch('/api/auth/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ address: account, signature, message })
      // });
      
      toast.success('身份验证成功');
      return { signature, message };
    } catch (error) {
      toast.error('身份验证失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    account,
    isConnected,
    isLoading,
    signMessage,
    authenticate,
  };
};
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';

export const useWalletAuth = () => {
  const { web3, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const signMessage = async (message: string) => {
    if (!web3 || !account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const signature = await web3.eth.personal.sign(message, account, '');
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    if (!account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const message = `请签名以验证您的身份\n\n地址: ${account}\n时间: ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      
      // 这里可以将签名发送到后端进行验证
      // const response = await fetch('/api/auth/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ address: account, signature, message })
      // });
      
      toast.success('身份验证成功');
      return { signature, message };
    } catch (error) {
      toast.error('身份验证失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    account,
    isConnected,
    isLoading,
    signMessage,
    authenticate,
  };
};
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';

export const useWalletAuth = () => {
  const { web3, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const signMessage = async (message: string) => {
    if (!web3 || !account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const signature = await web3.eth.personal.sign(message, account, '');
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    if (!account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const message = `请签名以验证您的身份\n\n地址: ${account}\n时间: ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      
      // 这里可以将签名发送到后端进行验证
      // const response = await fetch('/api/auth/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ address: account, signature, message })
      // });
      
      toast.success('身份验证成功');
      return { signature, message };
    } catch (error) {
      toast.error('身份验证失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    account,
    isConnected,
    isLoading,
    signMessage,
    authenticate,
  };
};
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';

export const useWalletAuth = () => {
  const { web3, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const signMessage = async (message: string) => {
    if (!web3 || !account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const signature = await web3.eth.personal.sign(message, account, '');
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    if (!account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const message = `请签名以验证您的身份\n\n地址: ${account}\n时间: ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      
      // 这里可以将签名发送到后端进行验证
      // const response = await fetch('/api/auth/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ address: account, signature, message })
      // });
      
      toast.success('身份验证成功');
      return { signature, message };
    } catch (error) {
      toast.error('身份验证失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    account,
    isConnected,
    isLoading,
    signMessage,
    authenticate,
  };
};
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';

export const useWalletAuth = () => {
  const { web3, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const signMessage = async (message: string) => {
    if (!web3 || !account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const signature = await web3.eth.personal.sign(message, account, '');
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    if (!account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const message = `请签名以验证您的身份\n\n地址: ${account}\n时间: ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      
      // 这里可以将签名发送到后端进行验证
      // const response = await fetch('/api/auth/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ address: account, signature, message })
      // });
      
      toast.success('身份验证成功');
      return { signature, message };
    } catch (error) {
      toast.error('身份验证失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    account,
    isConnected,
    isLoading,
    signMessage,
    authenticate,
  };
};
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';

export const useWalletAuth = () => {
  const { web3, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const signMessage = async (message: string) => {
    if (!web3 || !account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const signature = await web3.eth.personal.sign(message, account, '');
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    if (!account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const message = `请签名以验证您的身份\n\n地址: ${account}\n时间: ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      
      // 这里可以将签名发送到后端进行验证
      // const response = await fetch('/api/auth/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ address: account, signature, message })
      // });
      
      toast.success('身份验证成功');
      return { signature, message };
    } catch (error) {
      toast.error('身份验证失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    account,
    isConnected,
    isLoading,
    signMessage,
    authenticate,
  };
};
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';

export const useWalletAuth = () => {
  const { web3, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const signMessage = async (message: string) => {
    if (!web3 || !account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const signature = await web3.eth.personal.sign(message, account, '');
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    if (!account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const message = `请签名以验证您的身份\n\n地址: ${account}\n时间: ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      
      // 这里可以将签名发送到后端进行验证
      // const response = await fetch('/api/auth/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ address: account, signature, message })
      // });
      
      toast.success('身份验证成功');
      return { signature, message };
    } catch (error) {
      toast.error('身份验证失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    account,
    isConnected,
    isLoading,
    signMessage,
    authenticate,
  };
};
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';

export const useWalletAuth = () => {
  const { web3, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const signMessage = async (message: string) => {
    if (!web3 || !account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const signature = await web3.eth.personal.sign(message, account, '');
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    if (!account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const message = `请签名以验证您的身份\n\n地址: ${account}\n时间: ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      
      // 这里可以将签名发送到后端进行验证
      // const response = await fetch('/api/auth/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ address: account, signature, message })
      // });
      
      toast.success('身份验证成功');
      return { signature, message };
    } catch (error) {
      toast.error('身份验证失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    account,
    isConnected,
    isLoading,
    signMessage,
    authenticate,
  };
};
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';

export const useWalletAuth = () => {
  const { web3, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const signMessage = async (message: string) => {
    if (!web3 || !account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const signature = await web3.eth.personal.sign(message, account, '');
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    if (!account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const message = `请签名以验证您的身份\n\n地址: ${account}\n时间: ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      
      // 这里可以将签名发送到后端进行验证
      // const response = await fetch('/api/auth/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ address: account, signature, message })
      // });
      
      toast.success('身份验证成功');
      return { signature, message };
    } catch (error) {
      toast.error('身份验证失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    account,
    isConnected,
    isLoading,
    signMessage,
    authenticate,
  };
};
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';

export const useWalletAuth = () => {
  const { web3, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const signMessage = async (message: string) => {
    if (!web3 || !account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const signature = await web3.eth.personal.sign(message, account, '');
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    if (!account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const message = `请签名以验证您的身份\n\n地址: ${account}\n时间: ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      
      // 这里可以将签名发送到后端进行验证
      // const response = await fetch('/api/auth/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ address: account, signature, message })
      // });
      
      toast.success('身份验证成功');
      return { signature, message };
    } catch (error) {
      toast.error('身份验证失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    account,
    isConnected,
    isLoading,
    signMessage,
    authenticate,
  };
};
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';

export const useWalletAuth = () => {
  const { web3, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const signMessage = async (message: string) => {
    if (!web3 || !account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const signature = await web3.eth.personal.sign(message, account, '');
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    if (!account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const message = `请签名以验证您的身份\n\n地址: ${account}\n时间: ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      
      // 这里可以将签名发送到后端进行验证
      // const response = await fetch('/api/auth/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ address: account, signature, message })
      // });
      
      toast.success('身份验证成功');
      return { signature, message };
    } catch (error) {
      toast.error('身份验证失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    account,
    isConnected,
    isLoading,
    signMessage,
    authenticate,
  };
};
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';

export const useWalletAuth = () => {
  const { web3, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const signMessage = async (message: string) => {
    if (!web3 || !account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const signature = await web3.eth.personal.sign(message, account, '');
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    if (!account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const message = `请签名以验证您的身份\n\n地址: ${account}\n时间: ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      
      // 这里可以将签名发送到后端进行验证
      // const response = await fetch('/api/auth/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ address: account, signature, message })
      // });
      
      toast.success('身份验证成功');
      return { signature, message };
    } catch (error) {
      toast.error('身份验证失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    account,
    isConnected,
    isLoading,
    signMessage,
    authenticate,
  };
};
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';

export const useWalletAuth = () => {
  const { web3, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const signMessage = async (message: string) => {
    if (!web3 || !account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const signature = await web3.eth.personal.sign(message, account, '');
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    if (!account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const message = `请签名以验证您的身份\n\n地址: ${account}\n时间: ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      
      // 这里可以将签名发送到后端进行验证
      // const response = await fetch('/api/auth/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ address: account, signature, message })
      // });
      
      toast.success('身份验证成功');
      return { signature, message };
    } catch (error) {
      toast.error('身份验证失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    account,
    isConnected,
    isLoading,
    signMessage,
    authenticate,
  };
};
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';

export const useWalletAuth = () => {
  const { web3, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const signMessage = async (message: string) => {
    if (!web3 || !account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const signature = await web3.eth.personal.sign(message, account, '');
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    if (!account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const message = `请签名以验证您的身份\n\n地址: ${account}\n时间: ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      
      // 这里可以将签名发送到后端进行验证
      // const response = await fetch('/api/auth/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ address: account, signature, message })
      // });
      
      toast.success('身份验证成功');
      return { signature, message };
    } catch (error) {
      toast.error('身份验证失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    account,
    isConnected,
    isLoading,
    signMessage,
    authenticate,
  };
};
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';

export const useWalletAuth = () => {
  const { web3, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const signMessage = async (message: string) => {
    if (!web3 || !account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const signature = await web3.eth.personal.sign(message, account, '');
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    if (!account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const message = `请签名以验证您的身份\n\n地址: ${account}\n时间: ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      
      // 这里可以将签名发送到后端进行验证
      // const response = await fetch('/api/auth/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ address: account, signature, message })
      // });
      
      toast.success('身份验证成功');
      return { signature, message };
    } catch (error) {
      toast.error('身份验证失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    account,
    isConnected,
    isLoading,
    signMessage,
    authenticate,
  };
};
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';

export const useWalletAuth = () => {
  const { web3, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const signMessage = async (message: string) => {
    if (!web3 || !account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const signature = await web3.eth.personal.sign(message, account, '');
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    if (!account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const message = `请签名以验证您的身份\n\n地址: ${account}\n时间: ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      
      // 这里可以将签名发送到后端进行验证
      // const response = await fetch('/api/auth/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ address: account, signature, message })
      // });
      
      toast.success('身份验证成功');
      return { signature, message };
    } catch (error) {
      toast.error('身份验证失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    account,
    isConnected,
    isLoading,
    signMessage,
    authenticate,
  };
};
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';

export const useWalletAuth = () => {
  const { web3, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const signMessage = async (message: string) => {
    if (!web3 || !account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const signature = await web3.eth.personal.sign(message, account, '');
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    if (!account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const message = `请签名以验证您的身份\n\n地址: ${account}\n时间: ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      
      // 这里可以将签名发送到后端进行验证
      // const response = await fetch('/api/auth/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ address: account, signature, message })
      // });
      
      toast.success('身份验证成功');
      return { signature, message };
    } catch (error) {
      toast.error('身份验证失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    account,
    isConnected,
    isLoading,
    signMessage,
    authenticate,
  };
};
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';

export const useWalletAuth = () => {
  const { web3, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const signMessage = async (message: string) => {
    if (!web3 || !account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const signature = await web3.eth.personal.sign(message, account, '');
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    if (!account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const message = `请签名以验证您的身份\n\n地址: ${account}\n时间: ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      
      // 这里可以将签名发送到后端进行验证
      // const response = await fetch('/api/auth/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ address: account, signature, message })
      // });
      
      toast.success('身份验证成功');
      return { signature, message };
    } catch (error) {
      toast.error('身份验证失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    account,
    isConnected,
    isLoading,
    signMessage,
    authenticate,
  };
};
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';

export const useWalletAuth = () => {
  const { web3, account, isConnected } = useWallet();
  const [isLoading, setIsLoading] = useState(false);

  const signMessage = async (message: string) => {
    if (!web3 || !account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const signature = await web3.eth.personal.sign(message, account, '');
      return signature;
    } catch (error) {
      console.error('签名失败:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const authenticate = async () => {
    if (!account) {
      throw new Error('钱包未连接');
    }

    try {
      setIsLoading(true);
      const message = `请签名以验证您的身份\n\n地址: ${account}\n时间: ${new Date().toISOString()}`;
      const signature = await signMessage(message);
      
      // 这里可以将签名发送到后端进行验证
      // const response = await fetch('/api/auth/verify', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ address: account, signature, message })
      // });
      
      toast.success('身份验证成功');
      return { signature, message };
    } catch (error) {
      toast.error('身份验证失败');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    account,
    isConnected,
    isLoading,
    signMessage,
    authenticate,
  };
};
import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/services/api';

interface WalletAuthResponse {
  user: {
    id: string;
    email: string;
    username: string;
    walletAddress: string;
    role: string;
  };
  accessToken: string;
  refreshToken: string;
}

interface UseWalletAuthReturn {
  isLoading: boolean;
  login: () => Promise<WalletAuthResponse | null>;
  logout: () => void;
}

export const useWalletAuth = (): UseWalletAuthReturn => {
  const { account, signMessage } = useWallet();
  const { setUser, setIsAuthenticated, logout: authLogout } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (): Promise<WalletAuthResponse | null> => {
    if (!account || !signMessage) {
      toast.error('Please connect your wallet first');
      return null;
    }

    setIsLoading(true);

    try {
      // Create a unique message for signing
      const timestamp = Date.now();
      const message = `Sign this message to authenticate with Co-Train Aptos.\n\nWallet: ${account.address}\nTimestamp: ${timestamp}`;

      // Sign the message
      const response = await signMessage({ 
        message,
        nonce: timestamp.toString()
      });
      
      if (!response || !response.signature) {
        throw new Error('Failed to sign message');
      }

      // Send login request to backend using API client
      const authResponse = await apiClient.post('/api/v1/auth/wallet-login', {
        walletAddress: account.address,
        signature: response.signature,
        message: message,
      });

      if (!authResponse.success || !authResponse.data) {
        throw new Error(authResponse.error || 'Authentication failed');
      }

      const authData = authResponse.data as WalletAuthResponse;

      // Store tokens in localStorage
      localStorage.setItem('accessToken', authData.accessToken);
      localStorage.setItem('refreshToken', authData.refreshToken);
      localStorage.setItem('user', JSON.stringify(authData.user));

      // Update auth context
      setUser(authData.user);
      setIsAuthenticated(true);

      toast.success('Successfully logged in with wallet!');
      return authData;
    } catch (error) {
      console.error('Wallet login error:', error);
      toast.error(error instanceof Error ? error.message : 'Login failed');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [account, signMessage]);

  const logout = useCallback(() => {
    // Use auth context logout which handles clearing tokens and user data
    authLogout();
    
    toast.success('Successfully logged out');
  }, [authLogout]);

  return {
    isLoading,
    login,
    logout,
  };
};