'use client';

import { Box, Button, Text, VStack, Table, Thead, Tbody, Tr, Th, Td, Link } from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { WalletConnect } from "@/components/WalletConnect";

// 固定的交易記錄
const TRANSACTION = {
  txId: "0xba581bfebe5e23771c2a60352e711e89eb75d54e34d26fd9a7ca5505236364f7",
  from: "0xA206df5844dA81470C82d07AE1b797d139bE58C2",
  to: "0x4bAd2C7a8DF21B1356390786dbE9c58fD0a709dC",
  amount: "11"
};

export default function MerchantDashboard() {
  const router = useRouter();

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
                    <Link 
                      href={`https://sepolia.etherscan.io/tx/${TRANSACTION.txId}`}
                      isExternal
                      color="gray.300"
                    >
                      {TRANSACTION.txId.slice(0, 6)}...{TRANSACTION.txId.slice(-4)}
                    </Link>
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