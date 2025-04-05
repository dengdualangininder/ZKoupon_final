import { ethers } from 'ethers';
import { useWallet } from '@/lib/web3/hooks';

const ZKOUPON_ADDRESS = process.env.NEXT_PUBLIC_ZKOUPON_ADDRESS;
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS;

const ZKOUPON_ABI = [
  "function mintCoupon(address customer, uint256 amount, uint256 eligibleValue) public returns (uint256)",
  "function useCoupon(uint256 tokenId) public",
  "function getCouponData(uint256 tokenId) public view returns (address customer, uint256 amount, uint256 eligibleValue, bool used)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function transferFrom(address from, address to, uint256 tokenId) public",
  "event CouponMinted(uint256 indexed tokenId, address indexed customer, uint256 amount, uint256 eligibleValue)",
  "event CouponUsed(uint256 indexed tokenId)"
];

const USDC_ABI = [
  "function balanceOf(address account) public view returns (uint256)",
  "function transfer(address recipient, uint256 amount) public returns (bool)",
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)"
];

export function useZKouponContract() {
  const { provider, account } = useWallet();

  const getContract = async () => {
    if (!provider || !account) {
      throw new Error('Wallet not connected');
    }

    const signer = provider.getSigner();
    return new ethers.Contract(ZKOUPON_ADDRESS!, ZKOUPON_ABI, signer);
  };

  const getUSDCContract = async () => {
    if (!provider || !account) {
      throw new Error('Wallet not connected');
    }

    const signer = provider.getSigner();
    return new ethers.Contract(USDC_ADDRESS!, USDC_ABI, signer);
  };

  const mintCoupon = async (customerAddress: string, amount: number, eligibleValue: number) => {
    const contract = await getContract();
    const usdcContract = await getUSDCContract();
    
    // Convert amount to USDC units (6 decimals)
    const amountInUSDC = ethers.utils.parseUnits(amount.toString(), 6);
    const eligibleValueInUSDC = ethers.utils.parseUnits(eligibleValue.toString(), 6);

    // Check USDC balance
    const balance = await usdcContract.balanceOf(account);
    if (balance.lt(amountInUSDC)) {
      throw new Error('Insufficient USDC balance');
    }

    // Approve USDC spending
    const allowance = await usdcContract.allowance(account, ZKOUPON_ADDRESS);
    if (allowance.lt(amountInUSDC)) {
      const approveTx = await usdcContract.approve(ZKOUPON_ADDRESS, amountInUSDC);
      await approveTx.wait();
    }

    const tx = await contract.mintCoupon(customerAddress, amountInUSDC, eligibleValueInUSDC);
    const receipt = await tx.wait();

    // Get the tokenId from the CouponMinted event
    const event = receipt.events?.find(e => e.event === 'CouponMinted');
    return event?.args?.tokenId.toString();
  };

  const sendCoupon = async (tokenId: number, toAddress: string) => {
    const contract = await getContract();
    const tx = await contract.transferFrom(account, toAddress, tokenId);
    await tx.wait();
  };

  const getCouponData = async (tokenId: number) => {
    const contract = await getContract();
    const data = await contract.getCouponData(tokenId);
    
    // Convert amounts back from USDC units
    return {
      customer: data.customer,
      amount: ethers.utils.formatUnits(data.amount, 6),
      eligibleValue: ethers.utils.formatUnits(data.eligibleValue, 6),
      used: data.used
    };
  };

  return {
    mintCoupon,
    sendCoupon,
    getCouponData
  };
} 