'use client';

import { Button, useToast } from "@chakra-ui/react";
import { useWallet } from "@/lib/web3/hooks";

export function WalletConnect() {
  const { account, connect, disconnect } = useWallet();
  const toast = useToast();

  const handleConnect = async () => {
    try {
      await connect();
      toast({
        title: "Connected",
        description: "Wallet connected successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Connection error:", error);
      toast({
        title: "Connection Error",
        description: "Failed to connect wallet. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      toast({
        title: "Disconnected",
        description: "Wallet disconnected successfully",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Disconnection error:", error);
      toast({
        title: "Disconnection Error",
        description: "Failed to disconnect wallet. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <Button
      onClick={account ? handleDisconnect : handleConnect}
      variant="outline"
      borderRadius="full"
      size="sm"
      color="black"
      bg="gray.200"
      _hover={{ bg: "gray.300" }}
    >
      {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : "connect wallet"}
    </Button>
  );
} 