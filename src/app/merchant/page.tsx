'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Box, Button, Text, VStack, Table, Thead, Tbody, Tr, Th, Td, Input, Slider, SliderTrack, SliderFilledTrack, SliderThumb, SliderMark } from "@chakra-ui/react";
import { WalletConnect } from "@/components/WalletConnect";

// ZKoupon contract ABI
const ZKOUPON_ABI = [
  "function mintCoupon(address customer, uint256 amount, uint256 eligibleValue, uint256 ageLimit) public returns (uint256)",
  "function useCoupon(uint256 tokenId) public",
  "function getCouponData(uint256 tokenId) public view returns (address customer, uint256 amount, uint256 eligibleValue, bool used)",
  "function setAgeLimit(uint256 tokenId, uint256 ageLimit) public",
  "function ageLimits(uint256 tokenId) public view returns (uint256)"
];

// 固定的交易記錄
const TRANSACTION = {
  txId: "0xba581bfebe5e23771c2a60352e711e89eb75d54e34d26fd9a7ca5505236364f7",
  from: "0xA206df5844dA81470C82d07AE1b797d139bE58C2",
  to: "0x4bAd2C7a8DF21B1356390786dbE9c58fD0a709dC",
  amount: "11"
};

export default function MerchantDashboard() {
  const router = useRouter();
  const [account, setAccount] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ageLimit, setAgeLimit] = useState<number>(18);

  useEffect(() => {
    // 檢查 MetaMask 是否已安裝
    if (typeof window.ethereum !== 'undefined') {
      // 獲取當前帳戶
      window.ethereum.request({ method: 'eth_accounts' })
        .then((accounts: string[]) => {
          if (accounts.length > 0) {
            setAccount(accounts[0]);
          } else {
            router.push('/');
          }
        })
        .catch((err: Error) => {
          console.error("Error getting accounts:", err);
          setError("Failed to get account information");
        });
    } else {
      setError("Please install MetaMask");
    }
  }, [router]);

  const handleSetAgeLimit = async (newAgeLimit: number) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!window.ethereum) {
        throw new Error("Please install MetaMask");
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        process.env.NEXT_PUBLIC_ZKOUPON_ADDRESS!,
        ZKOUPON_ABI,
        signer
      );

      // 這裡需要 tokenId，我們暫時使用 1
      const tokenId = 1;
      const tx = await contract.setAgeLimit(tokenId, newAgeLimit);
      await tx.wait();

      setAgeLimit(newAgeLimit);
    } catch (err: unknown) {
      console.error("Set age limit error:", err);
      setError(err instanceof Error ? err.message : "Failed to update age limit");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowQRCode = () => {
    router.push('/merchant/qrcode');
  };

  const handleBackToMenu = () => {
    router.push('/');
  };

  const handleMint = () => {
    router.push(`/merchant/mint?tx=${TRANSACTION.txId}`);
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
          Merchant's Dashboard
        </Text>

        {/* Age Limit Section */}
        <Box bg="gray.900" p={6} borderRadius="lg">
          <Text fontSize="xl" mb={4}>Age Restriction Settings</Text>
          <VStack spacing={4} align="stretch">
            <Text>Current Age Limit: {ageLimit} years old and above</Text>
            <Slider
              aria-label="age-limit-slider"
              defaultValue={0}
              min={0}
              max={100}
              step={1}
              value={ageLimit}
              onChange={(val) => setAgeLimit(val)}
            >
              <SliderTrack>
                <SliderFilledTrack />
              </SliderTrack>
              <SliderThumb />
              <SliderMark value={0} mt="1" ml="-2.5" fontSize="sm">0</SliderMark>
              <SliderMark value={100} mt="1" ml="-2.5" fontSize="sm">100</SliderMark>
            </Slider>
            <Button
              onClick={() => handleSetAgeLimit(ageLimit)}
              isLoading={isLoading}
              colorScheme="blue"
            >
              Update Age Limit
            </Button>
          </VStack>
        </Box>

        {/* QR Code Button */}
        <Button
          onClick={handleShowQRCode}
          size="lg"
          variant="outline"
          borderRadius="full"
          borderColor="gray.200"
          color="white"
          _hover={{ bg: "whiteAlpha.100" }}
          mb={6}
        >
          Show My QRcode
        </Button>

        {/* Transactions Section */}
        <Box>
          <Text fontSize="xl" mb={4}>My Transaction</Text>
          <Box 
            borderRadius="lg" 
            overflow="hidden"
            bg="gray.900"
            p={4}
          >
            <Table variant="unstyled">
              <Thead>
                <Tr>
                  <Th color="gray.400" px={3} py={2}>TxID</Th>
                  <Th color="gray.400" px={3} py={2}>Amount</Th>
                  <Th color="gray.400" px={3} py={2}>Coupon</Th>
                </Tr>
              </Thead>
              <Tbody>
                <Tr>
                  <Td px={3} py={2}>
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${TRANSACTION.txId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'gray.300' }}
                    >
                      {TRANSACTION.txId.slice(0, 6)}...{TRANSACTION.txId.slice(-4)}
                    </a>
                  </Td>
                  <Td px={3} py={2} color="gray.300">${TRANSACTION.amount}</Td>
                  <Td px={3} py={2}>
                    <Button
                      bg="gray.200"
                      color="black"
                      size="sm"
                      borderRadius="md"
                      _hover={{ bg: "gray.300" }}
                      onClick={handleMint}
                    >
                      MINT
                    </Button>
                  </Td>
                </Tr>
              </Tbody>
            </Table>
          </Box>
        </Box>

        {/* Back Button */}
        <Button 
          onClick={handleBackToMenu}
          size="lg"
          variant="outline"
          borderRadius="full"
          borderColor="gray.200"
          color="white"
          _hover={{ bg: "whiteAlpha.100" }}
          mt={4}
        >
          BACK TO MENU
        </Button>
      </VStack>
    </Box>
  );
} 