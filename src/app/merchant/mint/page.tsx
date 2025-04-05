'use client';

import { Box, Button, Text, VStack, Image, useToast } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useWallet } from "@/lib/web3/hooks";
import { ethers } from "ethers";
import { WalletConnect } from "@/components/WalletConnect";

// ZKoupon contract ABI
const ZKOUPON_ABI = [
  "function mintCoupon(address customer, uint256 amount, uint256 eligibleValue) public returns (uint256)",
  "function useCoupon(uint256 tokenId) public",
  "function getCouponData(uint256 tokenId) public view returns (address customer, uint256 amount, uint256 eligibleValue, bool used)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string)"
];

// Contract address
const ZKOUPON_ADDRESS = "0x7943d6965D2824BC71d86409f38250415a5b4C94";

interface Transaction {
  from: string;
  to: string;
  value: string;
}

export default function MintPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const { account, library } = useWallet();
  
  const [isLoading, setIsLoading] = useState(false);
  const [transaction, setTransaction] = useState<Transaction>({
    from: "0x4bAd2C7a8DF21B1356390786dbE9c58fD0a709dC",
    to: account || "0xMerchantAddress",
    value: "11",
  });
  
  const txId = searchParams.get('tx');

  useEffect(() => {
    if (account) {
      setTransaction((prev: Transaction) => ({
        ...prev,
        to: account
      }));
    }
  }, [account]);

  const handleMint = async () => {
    if (!account || !library) {
      toast({
        title: 'Error',
        description: 'Please connect your wallet first',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Get the signer
      const signer = library.getSigner();
      
      // Get the contract instance
      const contract = new ethers.Contract(
        ZKOUPON_ADDRESS,
        ZKOUPON_ABI,
        signer
      );

      // Convert USDC amount to wei (6 decimals for USDC)
      const amount = ethers.BigNumber.from(transaction.value).mul(ethers.BigNumber.from(10).pow(6));
      
      console.log('Minting with params:', {
        customer: transaction.from,
        amount: amount.toString(),
        eligibleValue: amount.toString()
      });

      // Call the mintCoupon function
      const tx = await contract.mintCoupon(
        transaction.from, // customer address
        amount, // amount in wei
        amount // eligible value (same as amount for now)
      );

      console.log('Transaction sent:', tx.hash);

      // Wait for the transaction to be mined
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      toast({
        title: 'Success',
        description: 'NFT minted successfully!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Redirect to merchant page after successful mint
      router.push('/merchant');
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to mint NFT. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/merchant');
  };

  return (
    <Box 
      minH="100vh" 
      bg="black" 
      color="white"
      p={4}
    >
      <VStack spacing={6} align="stretch" maxW="container.sm" mx="auto">
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Text fontSize="2xl" fontWeight="bold">ZKoupon</Text>
          <WalletConnect />
        </Box>

        {/* Title */}
        <Text 
          fontSize="3xl"
          fontWeight="bold"
          textAlign="center"
          mb={6}
        >
          Mint NFT Coupon
        </Text>

        {/* NFT Preview */}
        <Box 
          bg="gray.900"
          p={6}
          borderRadius="lg"
          mb={6}
        >
          <Image
            src="/usdc-stamp.png"
            alt="USDC Stamp"
            width={300}
            height={300}
            style={{ margin: '0 auto' }}
          />
        </Box>

        {/* Transaction Details */}
        <Box 
          bg="gray.900"
          p={4}
          borderRadius="lg"
          mb={6}
        >
          <Text fontSize="lg" mb={2}>Transaction Details</Text>
          <Text color="gray.300" fontSize="sm">
            Amount: ${transaction.value} USDC
          </Text>
          <Text color="gray.300" fontSize="sm">
            From: {transaction.from}
          </Text>
          <Text color="gray.300" fontSize="sm">
            To: {transaction.to}
          </Text>
        </Box>

        {/* Mint Button */}
        <Button
          onClick={handleMint}
          size="lg"
          bg="gray.200"
          color="black"
          _hover={{ bg: "gray.300" }}
          isLoading={isLoading}
          loadingText="Minting..."
          mb={4}
        >
          MINT NFT
        </Button>

        {/* Back Button */}
        <Button 
          onClick={handleBack}
          size="lg"
          variant="outline"
          borderRadius="full"
          borderColor="gray.200"
          color="white"
          _hover={{ bg: "whiteAlpha.100" }}
        >
          BACK
        </Button>
      </VStack>
    </Box>
  );
} 