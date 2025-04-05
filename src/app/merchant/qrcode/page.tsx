'use client';

import { Box, Button, Text, VStack } from "@chakra-ui/react";
import { QRCodeSVG } from "qrcode.react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWallet } from "@/lib/web3/hooks";
import { WalletConnect } from "@/components/WalletConnect";

export default function QRCodePage() {
  const router = useRouter();
  const { account } = useWallet();
  const [qrValue, setQrValue] = useState("");

  useEffect(() => {
    if (account) {
      setQrValue(account);
    }
  }, [account]);

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
          My QR Code
        </Text>

        {/* QR Code Display */}
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center"
          bg="white"
          p={8}
          borderRadius="lg"
          mb={6}
        >
          {qrValue ? (
            <QRCodeSVG
              value={qrValue}
              size={256}
              level="H"
              includeMargin={true}
            />
          ) : (
            <Text color="black">Please connect your wallet first</Text>
          )}
        </Box>

        {/* Wallet Address Display */}
        {account && (
          <Text 
            textAlign="center" 
            color="gray.300"
            fontSize="sm"
            mb={6}
          >
            {account}
          </Text>
        )}

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