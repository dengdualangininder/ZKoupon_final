import { useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 137, 80001, 11155111], // 添加 Sepolia 測試網的鏈 ID
});

export function useWallet() {
  const { active, account, library, connector, activate, deactivate, error } = useWeb3React();

  const connect = async () => {
    try {
      console.log('Attempting to connect wallet...');
      await activate(injected, undefined, true);
      console.log('Wallet connected successfully');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      throw error;
    }
  };

  const disconnect = async () => {
    try {
      console.log('Attempting to disconnect wallet...');
      await deactivate();
      console.log('Wallet disconnected successfully');
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
      throw error;
    }
  };

  return {
    isConnected: active,
    account,
    library,
    connector,
    connect,
    disconnect,
    error,
  };
} 