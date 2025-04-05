import axios from 'axios';

const ETHERSCAN_API_KEY = process.env.NEXT_PUBLIC_ETHERSCAN_API_KEY || '';
const ETHERSCAN_API_URL = 'https://api.etherscan.io/api';
const USDC_CONTRACT = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'; // USDC contract on Ethereum mainnet

export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  isError: string;
}

export async function getUSDCTransactions(address: string): Promise<Transaction[]> {
  try {
    const response = await axios.get(ETHERSCAN_API_URL, {
      params: {
        module: 'account',
        action: 'tokentx',
        contractaddress: USDC_CONTRACT,
        address: address,
        sort: 'desc',
        apikey: ETHERSCAN_API_KEY,
      },
    });

    if (response.data.status === '1' && response.data.result) {
      return response.data.result;
    }
    return [];
  } catch (error) {
    console.error('Error fetching USDC transactions:', error);
    return [];
  }
}

export async function getTransactionDetails(txHash: string): Promise<Transaction | null> {
  try {
    const response = await axios.get(ETHERSCAN_API_URL, {
      params: {
        module: 'account',
        action: 'tokentx',
        contractaddress: USDC_CONTRACT,
        txhash: txHash,
        apikey: ETHERSCAN_API_KEY,
      },
    });

    if (response.data.status === '1' && response.data.result && response.data.result.length > 0) {
      const tx = response.data.result[0];
      return {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: (Number(tx.value) / 1e6).toString(), // Convert from wei to USDC (6 decimals)
        timeStamp: tx.timeStamp,
        isError: tx.isError,
      };
    }
    return null;
  } catch (error) {
    console.error('Error fetching transaction details:', error);
    return null;
  }
} 