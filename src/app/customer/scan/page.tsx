'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, Text, VStack, useToast } from "@chakra-ui/react";
import { WalletConnect } from "@/components/WalletConnect";
import QrScanner from 'qr-scanner';

export default function ScanQRCode() {
  const router = useRouter();
  const toast = useToast();
  const [isMobile, setIsMobile] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCamera, setHasCamera] = useState(false);
  const scannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    // 檢查是否為移動設備
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));

    // 檢查相機可用性
    QrScanner.hasCamera().then(setHasCamera);

    return () => {
      // 清理掃描器
      if (scannerRef.current) {
        scannerRef.current.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (videoRef.current && hasCamera) {
      // 創建掃描器
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          console.log('Scanned data:', result.data);
          toast({
            title: "QR Code Scanned",
            description: "Successfully scanned the QR code",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          // 這裡可以添加處理掃描結果的邏輯
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );

      // 開始掃描
      scannerRef.current.start().catch((err) => {
        console.error('Failed to start scanner:', err);
        toast({
          title: "Error",
          description: "Failed to access camera",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      });
    }
  }, [hasCamera, toast]);

  const handleBackToDashboard = () => {
    router.push('/customer');
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
          Scan QR Code
        </Text>

        {/* QR Scanner or Message */}
        {!isMobile || !hasCamera ? (
          <Box textAlign="center" p={6} bg="gray.900" borderRadius="lg">
            <Text>
              {!isMobile 
                ? "QR code scanning is only available on mobile devices. Please use your mobile device to scan QR codes."
                : "No camera found. Please make sure you have granted camera permissions."}
            </Text>
          </Box>
        ) : (
          <Box
            width="100%"
            maxWidth="300px"
            mx="auto"
            overflow="hidden"
            borderRadius="lg"
            bg="gray.900"
            position="relative"
            pb="100%"
          >
            <Box
              position="absolute"
              top="0"
              left="0"
              width="100%"
              height="100%"
            >
              <video 
                ref={videoRef}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Box>
          </Box>
        )}

        {/* Back Button */}
        <Button 
          onClick={handleBackToDashboard}
          size="lg"
          variant="outline"
          borderRadius="full"
          borderColor="gray.200"
          color="white"
          _hover={{ bg: "whiteAlpha.100" }}
          mt={6}
        >
          Back to Dashboard
        </Button>
      </VStack>
    </Box>
  );
} 