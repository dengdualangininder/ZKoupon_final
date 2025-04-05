import { ethers } from 'ethers';
import axios from 'axios';

const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY;
const USDC_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_USDC_CONTRACT_ADDRESS;
const MERCHANT_ADDRESS = process.env.NEXT_PUBLIC_MERCHANT_ADDRESS;

interface Transaction {
  txId: string;
  amount: string;
}

export async function getUSDCTransactions(address: string): Promise<Transaction[]> {
  console.log('Fetching transactions for address:', address);
  console.log('Using USDC contract address:', USDC_CONTRACT_ADDRESS);
  console.log('Using Etherscan API key:', ETHERSCAN_API_KEY?.substring(0, 6) + '...');
  console.log('Merchant address:', MERCHANT_ADDRESS);

  if (!address) {
    console.error('No address provided');
    return [];
  }

  if (!USDC_CONTRACT_ADDRESS) {
    console.error('USDC contract address not configured');
    return [];
  }

  if (!ETHERSCAN_API_KEY) {
    console.error('Etherscan API key not configured');
    return [];
  }

  try {
    const apiUrl = 'https://api-sepolia.etherscan.io/api';
    const params = {
      module: 'account',
      action: 'tokentx',
      contractaddress: USDC_CONTRACT_ADDRESS,
      address: MERCHANT_ADDRESS, // 使用商家地址而不是連接的錢包地址
      sort: 'desc',
      apikey: ETHERSCAN_API_KEY
    };

    console.log('Making API request to:', apiUrl);
    console.log('With params:', { ...params, apikey: '******' });

    const response = await axios.get(apiUrl, { params });

    console.log('API Response:', {
      status: response.data.status,
      message: response.data.message,
      resultCount: response.data.result?.length || 0
    });

    if (response.data.status === '1' && Array.isArray(response.data.result)) {
      // 只處理接收到的交易（to address 是商家地址）
      const transactions = response.data.result
        .filter((tx: any) => {
          const isReceived = tx.to.toLowerCase() === MERCHANT_ADDRESS?.toLowerCase();
          console.log(`Transaction ${tx.hash}: from=${tx.from}, to=${tx.to}, isReceived=${isReceived}`);
          return isReceived;
        })
        .map((tx: any) => {
          const amount = ethers.utils.formatUnits(tx.value, 6); // USDC has 6 decimals
          console.log(`Processing transaction ${tx.hash}: amount=${amount} USDC`);
          return {
            txId: tx.hash,
            amount
          };
        });
      
      console.log('Processed transactions:', transactions);
      return transactions;
    }
    
    console.log('No transactions found or invalid response');
    return [];
  } catch (error) {
    console.error('Error fetching USDC transactions:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }
    return [];
  }
} 