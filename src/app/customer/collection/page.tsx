'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import { Box, Button, Text, VStack, SimpleGrid, Image, useToast } from "@chakra-ui/react";
import { WalletConnect } from "@/components/WalletConnect";
import { GoogleGenerativeAI } from "@google/generative-ai";

// NFT contract ABI
const NFT_ABI = [
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId)",
  "event ApprovalForAll(address indexed owner, address indexed operator, bool approved)",
  "function balanceOf(address owner) view returns (uint256 balance)",
  "function ownerOf(uint256 tokenId) view returns (address owner)",
  "function safeTransferFrom(address from, address to, uint256 tokenId, bytes data)",
  "function safeTransferFrom(address from, address to, uint256 tokenId)",
  "function transferFrom(address from, address to, uint256 tokenId)",
  "function approve(address to, uint256 tokenId)",
  "function setApprovalForAll(address operator, bool _approved)",
  "function getApproved(uint256 tokenId) view returns (address operator)",
  "function isApprovedForAll(address owner, address operator) view returns (bool)",
  "function name() view returns (string memory)",
  "function symbol() view returns (string memory)",
  "function tokenURI(uint256 tokenId) view returns (string memory)",
  "function totalSupply() view returns (uint256)",
  "function tokenByIndex(uint256 index) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)"
];

const NFT_ADDRESS = "0x8B1c80Da76BF663803b502416e5b759572f80603";

// Gemini API configuration
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

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

export default function CustomerCollection() {
  const router = useRouter();
  const toast = useToast();
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingImage, setGeneratingImage] = useState(false);

  const generateNFTImage = async (nft: NFTMetadata) => {
    try {
      setGeneratingImage(true);
      
      // Initialize the Gemini API
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');
      const model = genAI.getGenerativeModel({ model: "gemini-pro-vision" });

      const prompt = `Create a digital art coupon design with a value of ${nft.value} USDC. Include modern cryptocurrency elements, a blue color scheme representing USDC, and make it look like a high-value digital voucher. Style: modern, professional, digital art. The image should be clean and minimalist with a focus on the value amount.`;

      // Generate the image
      const result = await model.generateContent([prompt]);
      const response = await result.response;
      const imageData = response.text();
      
      // Convert the base64 image to a URL
      const imageUrl = `data:image/png;base64,${imageData}`;
      return imageUrl;

    } catch (err) {
      console.error('Error generating image:', err);
      return null;
    } finally {
      setGeneratingImage(false);
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, []);

  const fetchNFTs = async () => {
    try {
      setLoading(true);
      setError(null);

      if (typeof window.ethereum === 'undefined') {
        throw new Error('Please install MetaMask');
      }

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const network = await provider.getNetwork();
      
      console.log('Current network:', network);
      
      if (network.chainId !== 11155111) {
        throw new Error('Please connect to Sepolia network');
      }

      const accounts = await provider.listAccounts();
      
      if (accounts.length === 0) {
        throw new Error('Please connect your wallet');
      }

      const userAddress = accounts[0];
      console.log('Connected wallet:', userAddress);
      console.log('NFT Contract address:', NFT_ADDRESS);

      const contract = new ethers.Contract(NFT_ADDRESS, NFT_ABI, provider);

      try {
        const tokenId = 4; // 指定的 Token ID
        console.log('Checking ownership for token ID:', tokenId);
        
        const owner = await contract.ownerOf(tokenId);
        console.log('Token owner:', owner);
        console.log('Current user:', userAddress);
        
        if (owner.toLowerCase() === userAddress.toLowerCase()) {
          console.log('User owns this token');
          const nftMetadata = {
            tokenId: tokenId,
            value: 30,
            from: userAddress,
            to: "0x7777777777777777",
            cashRewards: 10,
            eligibleValue: 30,
            burned: false
          };

          // Generate AI image for the NFT
          const imageUrl = await generateNFTImage(nftMetadata);
          if (imageUrl) {
            nftMetadata.imageUrl = imageUrl;
          }
          
          setNfts([nftMetadata]);
        } else {
          console.log('User does not own this token');
          setError('No NFTs found in your wallet');
        }
      } catch (err) {
        console.error('Error checking token ownership:', err);
        throw new Error('Failed to verify NFT ownership. Please try again.');
      }

    } catch (err) {
      console.error('Error in fetchNFTs:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to fetch NFTs',
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNFTClick = (nft: NFTMetadata) => {
    // Store NFT data in localStorage for the mint page
    localStorage.setItem('selectedNFT', JSON.stringify(nft));
    router.push('/merchant/mint');
  };

  const handleBackToDashboard = () => {
    router.push('/customer');
  };

  const handleRetry = () => {
    fetchNFTs();
  };

  return (
    <Box 
      minH="100vh" 
      bg="black" 
      color="white"
      p={4}
    >
      <VStack spacing={6} align="stretch" maxW="container.lg" mx="auto">
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
          Collections
        </Text>

        {/* NFT Grid */}
        {loading || generatingImage ? (
          <Text textAlign="center">
            {generatingImage ? 'Generating NFT image...' : 'Loading your NFTs...'}
          </Text>
        ) : error ? (
          <Box textAlign="center">
            <Text color="red.500" mb={4}>{error}</Text>
            <Button
              onClick={handleRetry}
              colorScheme="blue"
              size="sm"
            >
              Retry
            </Button>
          </Box>
        ) : nfts.length === 0 ? (
          <Box textAlign="center" p={6} bg="gray.900" borderRadius="lg">
            <Text mb={4}>You don't have any NFTs from this collection yet.</Text>
            <Text fontSize="sm" color="gray.400">
              Connect your wallet and make sure you're on the Sepolia network.
            </Text>
          </Box>
        ) : (
          <SimpleGrid columns={[1, 2, 3]} spacing={6}>
            {nfts.map((nft) => (
              <Box
                key={nft.tokenId}
                bg="gray.900"
                borderRadius="lg"
                overflow="hidden"
                p={4}
                position="relative"
                cursor="pointer"
                onClick={() => handleNFTClick(nft)}
                _hover={{
                  transform: "scale(1.02)",
                  transition: "transform 0.2s"
                }}
              >
                <Image
                  src={nft.imageUrl || "/usdc-logo.png"}
                  alt={`NFT #${nft.tokenId}`}
                  width="100%"
                  height="auto"
                  objectFit="contain"
                />
                <Text mt={2} textAlign="center">Value: {nft.value} USDC</Text>
              </Box>
            ))}
          </SimpleGrid>
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
    </Box>
  );
} 