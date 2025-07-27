"use client";

import React, { useState } from 'react';
import { Button } from '@heroui/react';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection
} from '@heroui/react';
import { Copy, ExternalLink, LogOut, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useWallet } from './WalletProvider';

const WalletSelector = () => {
  const { account, isConnected, connectWallet, disconnectWallet, chainId } = useWallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
      toast.success('Wallet connected successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast.success('Wallet disconnected');
  };

  const copyAddress = async () => {
    if (account) {
      try {
        await navigator.clipboard.writeText(account);
        toast.success('Address copied to clipboard');
      } catch (error) {
        toast.error('Copy failed');
      }
    }
  };

  const openEtherscan = () => {
    if (account) {
      const baseUrl = getEtherscanUrl(chainId);
      window.open(`${baseUrl}/address/${account}`, '_blank');
    }
  };

  const getEtherscanUrl = (chainId: number | null) => {
    switch (chainId) {
      case 1:
        return 'https://etherscan.io';
      case 137:
        return 'https://polygonscan.com';
      case 10:
        return 'https://optimistic.etherscan.io';
      case 42161:
        return 'https://arbiscan.io';
      default:
        return 'https://etherscan.io';
    }
  };

  const getChainName = (chainId: number | null) => {
    switch (chainId) {
      case 1:
        return 'Ethereum';
      case 137:
        return 'Polygon';
      case 10:
        return 'Optimism';
      case 42161:
        return 'Arbitrum';
      case 1439:
        return 'Injective';
      default:
        return 'Unknown';
    }
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isConnected) {
    return (
      <Button 
        onPress={handleConnect}
        isDisabled={isConnecting}
        isLoading={isConnecting}
        variant="solid"
        className="bg-black hover:bg-gray-800 text-white"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>
    );
  }

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button 
          variant="bordered" 
          className="flex items-center gap-2 border-black text-black hover:bg-black hover:text-white"
          endContent={<ChevronDown className="h-4 w-4" />}
        >
          <div className="flex flex-col items-start">
            <span className="text-xs text-gray-500">
              {account ? truncateAddress(account) : 'Not Connected'}
            </span>
            {chainId && (
              <span className="text-xs text-gray-500">
                {getChainName(chainId)}
              </span>
            )}
          </div>
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Wallet actions" className="w-56">
        <DropdownItem 
          key="copy"
          startContent={<Copy className="h-4 w-4" />}
          onPress={copyAddress}
        >
          Copy Address
        </DropdownItem>
        <DropdownItem 
          key="explorer"
          startContent={<ExternalLink className="h-4 w-4" />}
          onPress={openEtherscan}
        >
          View on Block Explorer
        </DropdownItem>
        <DropdownItem 
          key="disconnect"
          startContent={<LogOut className="h-4 w-4" />}
          onPress={handleDisconnect}
          className="text-danger"
          color="danger"
        >
          Disconnect
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

// 改为命名导出
export { WalletSelector };
export default WalletSelector;