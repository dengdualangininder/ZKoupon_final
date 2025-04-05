'use client';

import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import { ReactNode } from 'react';

function getLibrary(provider: any) {
  const library = new ethers.providers.Web3Provider(provider);
  library.pollingInterval = 12000;
  return library;
}

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      {children}
    </Web3ReactProvider>
  );
} 