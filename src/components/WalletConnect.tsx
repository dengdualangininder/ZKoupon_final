'use client';

import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import { Button, useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

const injected = new InjectedConnector({
  supportedChainIds: [11155111], // Sepolia testnet
});

export const WalletConnect = () => {
  const { active, account, activate, deactivate } = useWeb3React();
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const connect = async () => {
    try {
      setLoading(true);
      await activate(injected);
      toast({
        title: 'Wallet Connected',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: 'Error connecting wallet',
        description: (error as Error).message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    try {
      deactivate();
      toast({
        title: 'Wallet Disconnected',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
    }
  };

  return (
    <Button
      onClick={active ? disconnect : connect}
      isLoading={loading}
      colorScheme={active ? 'red' : 'blue'}
      size="md"
    >
      {active
        ? `Disconnect ${account?.slice(0, 6)}...${account?.slice(-4)}`
        : 'Connect Wallet'}
    </Button>
  );
}; 