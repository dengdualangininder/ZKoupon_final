'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import {
  Box,
  Button,
  Text,
  VStack,
  Image,
  useToast,
  Container,
} from "@chakra-ui/react";
import { WalletConnect } from "@/components/WalletConnect";

// NFT contract ABI (only including necessary functions)
const NFT_ABI = [
  "function burn(uint256 tokenId) returns (bool)",
  "function ownerOf(uint256 tokenId) view returns (address)"
];

const NFT_ADDRESS = "0x8B1c80Da76BF663803b502416e5b759572f80603";

interface NFTMetadata {
  tokenId: number;
  value: number;
  from: string;
  to: string;
  cashRewards: number;
  eligibleValue: number;
  burned: boolean;
  imageUrl?: string;
}

export default function MerchantMint() {
  const router = useRouter();
  const toast = useToast();
  const [nft, setNft] = useState<NFTMetadata | null>(null);
  const [loading, setLoading] = useState(false);
  const [burned, setBurned] = useState(false);

  useEffect(() => {
    // Get NFT data from localStorage
    const storedNFT = localStorage.getItem('selectedNFT');
    if (storedNFT) {
      try {
        const parsedNFT = JSON.parse(storedNFT);
        console.log('Loaded NFT data:', parsedNFT);
        setNft(parsedNFT);
      } catch (err) {
        console.error('Error parsing NFT data:', err);
        toast({
          title: "Error",
          description: "Failed to load NFT data",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        router.push('/customer/collection');
      }
    } else {
      console.log('No NFT data found in localStorage');
      router.push('/customer/collection');
    }
  }, [router, toast]);

  const handleBurn = async () => {
    try {
      setLoading(true);

      if (!nft) {
        throw new Error('No NFT selected');
      }

      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, signer);

      console.log('Burning token ID:', nft.tokenId);

      // Verify ownership before burning
      const owner = await contract.ownerOf(nft.tokenId);
      const currentAddress = await signer.getAddress();

      console.log('Token owner:', owner);
      console.log('Current address:', currentAddress);

      if (owner.toLowerCase() !== currentAddress.toLowerCase()) {
        throw new Error('You are not the owner of this NFT');
      }

      // Burn the NFT
      console.log('Initiating burn transaction...');
      const tx = await contract.burn(nft.tokenId);
      console.log('Burn transaction sent:', tx.hash);
      
      console.log('Waiting for transaction confirmation...');
      await tx.wait();
      console.log('Burn transaction confirmed');

      setBurned(true);
      toast({
        title: "Success",
        description: "NFT has been burned successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Update the NFT data in localStorage
      const updatedNFT = { ...nft, burned: true };
      localStorage.setItem('selectedNFT', JSON.stringify(updatedNFT));
      setNft(updatedNFT);

    } catch (err) {
      console.error('Error burning NFT:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to burn NFT',
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push('/customer');
  };

  if (!nft) {
    return null;
  }

  return (
    <Box 
      minH="100vh" 
      bg="black" 
      color="white"
      p={4}
    >
      <Container maxW="container.md">
        <VStack spacing={6}>
          {/* Header */}
          <Box display="flex" justifyContent="space-between" alignItems="center" w="100%" mb={4}>
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
            Transaction detail
          </Text>

          {/* Transaction Details */}
          <Box
            bg="gray.800"
            p={6}
            borderRadius="lg"
            w="100%"
          >
            <VStack spacing={4} align="stretch">
              <Box>
                <Text color="gray.400">From:</Text>
                <Text>{nft.from}</Text>
              </Box>
              <Box>
                <Text color="gray.400">To:</Text>
                <Text>{nft.to}</Text>
              </Box>
              <Box>
                <Text color="gray.400">Amount:</Text>
                <Text>{nft.value} USDC</Text>
              </Box>
              <Box>
                <Text color="gray.400">Cash rewards:</Text>
                <Text>{nft.cashRewards}%</Text>
              </Box>
              <Box>
                <Text color="gray.400">Eligible Value:</Text>
                <Text>{nft.eligibleValue} USDC</Text>
              </Box>
            </VStack>
          </Box>

          {/* NFT Display */}
          <Box
            bg="gray.900"
            p={6}
            borderRadius="lg"
            w="100%"
            position="relative"
          >
            <Image
              src={nft.imageUrl || "/usdc-logo.png"}
              alt={`NFT #${nft.tokenId}`}
              width="200px"
              height="auto"
              mx="auto"
              className={burned ? 'burned' : ''}
              style={{
                filter: burned ? 'grayscale(100%)' : 'none',
                opacity: burned ? 0.7 : 1,
              }}
            />
            <Text mt={4} textAlign="center">Value: {nft.value} USDC</Text>
            {burned && (
              <Text
                position="absolute"
                top="50%"
                left="50%"
                transform="translate(-50%, -50%) rotate(-45deg)"
                fontSize="4xl"
                fontWeight="bold"
                color="red.500"
                textTransform="uppercase"
                letterSpacing="wider"
              >
                Burned
              </Text>
            )}
          </Box>

          {/* Action Button */}
          {!burned ? (
            <Button
              onClick={handleBurn}
              isLoading={loading}
              loadingText="Burning..."
              size="lg"
              colorScheme="red"
              width="200px"
              borderRadius="full"
            >
              Burn!
            </Button>
          ) : (
            <Text
              color="gray.400"
              fontSize="lg"
              fontWeight="bold"
            >
              Burned
            </Text>
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
            Dashboard
          </Button>
        </VStack>
      </Container>

      <style jsx global>{`
        .burned {
          position: relative;
        }
        .burned::after {
          content: 'BURNED';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 2em;
          font-weight: bold;
          color: red;
          border: 2px solid red;
          padding: 0.5em;
          white-space: nowrap;
        }
      `}</style>
    </Box>
  );
} 