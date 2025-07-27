import { useState } from 'react';
import { useWallet } from '@/components/WalletProvider';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';

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