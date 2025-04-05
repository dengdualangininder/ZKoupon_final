'use client';

import { ChakraProvider } from "@chakra-ui/react";
import { CacheProvider } from "@chakra-ui/next-js";
import { Web3Provider } from "@/lib/web3/provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CacheProvider>
      <ChakraProvider>
        <Web3Provider>
          {children}
        </Web3Provider>
      </ChakraProvider>
    </CacheProvider>
  );
} 