'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Text, VStack } from "@chakra-ui/react";
import { WalletConnect } from "@/components/WalletConnect";

export default function CustomerDashboard() {
  const router = useRouter();

  const handleScanQR = () => {
    router.push('/customer/scan');
  };

  const handleCollection = () => {
    router.push('/customer/collection');
  };

  const handleBackToMenu = () => {
    router.push('/');
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
          Customer's Dashboard
        </Text>

        {/* Main Buttons */}
        <VStack spacing={4}>
          <Button
            onClick={handleScanQR}
            size="lg"
            w="full"
            bg="gray.200"
            color="black"
            _hover={{ bg: "gray.300" }}
            borderRadius="full"
          >
            Scan the QRcode
          </Button>

          <Button
            onClick={handleCollection}
            size="lg"
            w="full"
            bg="gray.200"
            color="black"
            _hover={{ bg: "gray.300" }}
            borderRadius="full"
          >
            Collection
          </Button>
        </VStack>

        {/* Back Button */}
        <Button 
          onClick={handleBackToMenu}
          size="lg"
          variant="outline"
          borderRadius="full"
          borderColor="gray.200"
          color="white"
          _hover={{ bg: "whiteAlpha.100" }}
          mt="auto"
          w="full"
        >
          BACK TO MENU
        </Button>
      </VStack>
    </Box>
  );
} 