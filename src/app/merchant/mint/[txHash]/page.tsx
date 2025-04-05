'use client';

import { Box, Button, Flex, Text, VStack, Image, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { WalletConnect } from "@/components/WalletConnect";
import { getTransactionDetails, Transaction } from "@/lib/services/etherscan";
import { useWallet } from "@/lib/web3/hooks";
import { useZKouponContract } from "@/lib/services/contract";

export default function MintPage() {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [status, setStatus] = useState<'mint' | 'minted' | 'sent'>('mint');
  const [isLoading, setIsLoading] = useState(false);
  const [tokenId, setTokenId] = useState<string | null>(null);
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const { account } = useWallet();
  const { mintCoupon, sendCoupon } = useZKouponContract();

  const txHash = params.txHash as string;

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!txHash) return;
      
      try {
        const tx = await getTransactionDetails(txHash);
        setTransaction(tx);
      } catch (error) {
        toast({
          title: "Error fetching transaction",
          description: "Failed to load transaction details",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    };

    fetchTransaction();
  }, [txHash, toast]);

  const handleMint = async () => {
    if (!transaction) return;

    setIsLoading(true);
    try {
      const amount = parseFloat(formatAmount(transaction.value));
      const eligibleValue = amount * 0.1; // 10% rewards
      
      const newTokenId = await mintCoupon(
        transaction.from,
        amount,
        eligibleValue
      );
      
      setTokenId(newTokenId);
      setStatus('minted');
      toast({
        title: "Success",
        description: "NFT minted successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Mint error:', error);
      toast({
        title: "Error",
        description: "Failed to mint NFT",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!transaction || !tokenId) return;

    setIsLoading(true);
    try {
      await sendCoupon(parseInt(tokenId), transaction.from);
      setStatus('sent');
      toast({
        title: "Success",
        description: "NFT sent successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Send error:', error);
      toast({
        title: "Error",
        description: "Failed to send NFT",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (value: string) => {
    return (parseInt(value) / 1e6).toFixed(2);
  };

  return (
    <Box bg="black" minH="100vh" color="white" p={6}>
      <Flex justify="space-between" align="center" mb={8}>
        <Text
          fontSize="3xl"
          fontWeight="light"
          fontFamily="serif"
          letterSpacing="wider"
        >
          ZKoupon
        </Text>
        <WalletConnect />
      </Flex>

      <VStack spacing={8} align="stretch">
        <Box>
          <Text fontSize="2xl" mb={4}>Transaction detail</Text>
          {transaction && (
            <VStack align="start" spacing={3}>
              <Text>From: {transaction.from}</Text>
              <Text>To: {transaction.to}</Text>
              <Text>Amount: {formatAmount(transaction.value)} USDC</Text>
              <Text>Cash rewards: 10%</Text>
              <Text>Eligible Value: {(parseFloat(formatAmount(transaction.value)) * 0.1).toFixed(2)} USDC</Text>
            </VStack>
          )}
        </Box>

        <VStack spacing={4} align="center">
          <Text fontSize="2xl">Mint ZKoupon!</Text>
          <Box
            position="relative"
            width="200px"
            height="250px"
          >
            <Image
              src="/nft-image.png"
              alt="USDC Coupon"
              width="100%"
              height="100%"
              objectFit="contain"
            />
            {transaction && (
              <Text
                position="absolute"
                bottom="20px"
                left="50%"
                transform="translateX(-50%)"
                color="black"
                fontWeight="bold"
                fontSize="lg"
              >
                {(parseFloat(formatAmount(transaction.value)) * 0.1).toFixed(2)} USDC
              </Text>
            )}
          </Box>

          {status === 'mint' && (
            <Button
              onClick={handleMint}
              isLoading={isLoading}
              variant="outline"
              color="white"
              borderRadius="full"
              size="lg"
              width="150px"
            >
              Mint
            </Button>
          )}

          {status === 'minted' && (
            <Button
              onClick={handleSend}
              isLoading={isLoading}
              variant="outline"
              color="white"
              borderRadius="full"
              size="lg"
              width="150px"
            >
              Send
            </Button>
          )}

          {status === 'sent' && (
            <Text color="green.300">Sent</Text>
          )}
        </VStack>

        <Button
          onClick={() => router.push('/merchant/dashboard')}
          variant="outline"
          color="white"
          borderRadius="full"
        >
          Dashboard
        </Button>
      </VStack>
    </Box>
  );
} 