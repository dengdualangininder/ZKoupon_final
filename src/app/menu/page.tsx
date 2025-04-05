'use client';

import { Box, Button, Flex, Text, VStack, Image } from "@chakra-ui/react";
import Link from "next/link";
import { WalletConnect } from "@/components/WalletConnect";

export default function MenuPage() {
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

      <Text fontSize="4xl" mb={8}>I am a...</Text>

      <VStack spacing={8} align="stretch">
        <Flex align="center" justify="space-between" gap={4}>
          <Box boxSize="100px" bg="whiteAlpha.200" borderRadius="md">
            <Image
              src="/merchant.png"
              alt="Merchant"
              boxSize="100px"
              objectFit="cover"
              borderRadius="md"
              fallback={<Box boxSize="100px" bg="whiteAlpha.200" borderRadius="md" />}
            />
          </Box>
          <Link href="/merchant" style={{ flex: 1 }}>
            <Button
              width="100%"
              size="lg"
              variant="outline"
              color="white"
              borderRadius="full"
              _hover={{ bg: "whiteAlpha.200" }}
            >
              Merchant
            </Button>
          </Link>
        </Flex>

        <Flex align="center" justify="space-between" gap={4}>
          <Box boxSize="100px" bg="whiteAlpha.200" borderRadius="md">
            <Image
              src="/Customer.png"
              alt="Customer"
              boxSize="100px"
              objectFit="cover"
              borderRadius="md"
              fallback={<Box boxSize="100px" bg="whiteAlpha.200" borderRadius="md" />}
            />
          </Box>
          <Link href="/customer" style={{ flex: 1 }}>
            <Button
              width="100%"
              size="lg"
              variant="outline"
              color="white"
              borderRadius="full"
              _hover={{ bg: "whiteAlpha.200" }}
            >
              Customer
            </Button>
          </Link>
        </Flex>
      </VStack>

      <Box mt={12}>
        <Text fontSize="2xl" mb={4}>Terms of Services</Text>
        <VStack align="start" spacing={3} fontSize="sm">
          <Text>By accessing and using ZKoupon, you agree to the following:</Text>
          <Text>• You are solely responsible for your wallet, private keys, and transactions.</Text>
          <Text>• This DApp does not hold custody of your assets.</Text>
          <Text>• All actions are executed via smart contracts on the blockchain and are irreversible.</Text>
          <Text>• You agree to comply with applicable laws and regulations in your region.</Text>
        </VStack>
      </Box>

      <Button
        leftIcon={<Text fontSize="2xl">★</Text>}
        variant="link"
        color="white"
        size="lg"
        mt={8}
      >
        GET SUPPORT
      </Button>
    </Box>
  );
} 