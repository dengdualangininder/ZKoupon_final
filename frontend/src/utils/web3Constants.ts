export const rpcUrls = {
  eth: "https://rpc.ankr.com/eth",
  Polygon: "https://polygon-rpc.com/",
  BNB: "https://bsc-dataseed.binance.org",
  Optimism: "https://mainnet.optimism.io",
  Avalanche: "https://api.avax.network/ext/bc/C/rpc",
  Arbitrum: "https://arb1.arbitrum.io/rpc",
  Gnosis: "https://rpc.gnosischain.com",
  Thunder: "https://mainnet-rpc.thundercore.com",
  Base: "https://mainnet.base.org",
};

type TokenAddresses = {
  [key: string]: { [key: string]: { address: string; decimals: number } };
};
export const tokenAddresses: TokenAddresses = {
  Polygon: {
    USDC: { address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", decimals: 6 },
    USDT: { address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6 },
    EURT: { address: "0x7BDF330f423Ea880FF95fC41A280fD5eCFD3D09f", decimals: 6 },
  },
  BNB: {
    USDC: { address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18 },
    USDT: { address: "0x55d398326f99059ff775485246999027b3197955", decimals: 18 },
  },
  Optimism: {
    USDC: { address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", decimals: 6 },
    USDT: { address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", decimals: 6 },
  },
  Avalanche: {
    USDC: { address: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", decimals: 6 },
    USDT: { address: "0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7", decimals: 6 },
    EURC: { address: "0xC891EB4cbdEFf6e073e859e987815Ed1505c2ACD", decimals: 6 },
  },
  Arbitrum: {
    USDC: { address: "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", decimals: 6 },
    USDT: { address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", decimals: 6 },
  },
  Thunder: {
    USDC: { address: "0x22e89898A04eaf43379BeB70bf4E38b1faf8A31e", decimals: 6 },
    USDT: { address: "0x4f3C8E20942461e2c3Bdd8311AC57B0c222f2b82", decimals: 6 },
  },
  Gnosis: {
    USDC: { address: "0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83", decimals: 6 },
    USDT: { address: "0x4ECaBa5870353805a9F068101A40E0f32ed605C6", decimals: 6 },
  },
  Base: {
    USDC: { address: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", decimals: 6 },
  },
};

export type NetworkToInfo = { [key: string]: { name: string; usdcAddress: `0x${string}`; nullaAddress: `0x${string}` } };
export const networkToInfo: NetworkToInfo = {
  "137": {
    name: "Polgyon",
    usdcAddress: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    nullaAddress: "0xb064c9EBB4dbf5955055Df1F6bC153957484B343",
  },
  "10": { name: "Optimism", usdcAddress: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", nullaAddress: "0x0" },
  "8453": { name: "Base", usdcAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", nullaAddress: "0x0" },
};

type ChainIds = {
  [key: string]: string;
};
export const chainIds: ChainIds = {
  Gnosis: "0x64",
  Polygon: "0x89",
  Thunder: "0x6c",
  Arbitrum: "0xA4B1",
  Optimism: "0xA",
  Avalanche: "0xA86A",
  BNB: "0x38",
  Base: "0x2105",
};

type AddChainParams = {
  [key: string]: { chainId: string; chainName: string; rpcUrls: string[]; nativeCurrency: { name: string; symbol: string; decimals: number }; blockExplorerUrls: string[] };
};
export const addChainParams: AddChainParams = {
  Polygon: {
    chainId: "0x89",
    chainName: "Polygon",
    rpcUrls: ["https://polygon-rpc.com/"],
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18,
    },
    blockExplorerUrls: ["https://polygonscan.com/"],
  },
  Gnosis: {
    chainId: "0x64",
    chainName: "Gnosis Chain",
    rpcUrls: ["https://rpc.gnosischain.com"],
    nativeCurrency: {
      name: "xDAI",
      symbol: "xDAI",
      decimals: 18,
    },
    blockExplorerUrls: ["https://blockscout.com/xdai/mainnet/"],
  },
  Optimism: {
    chainId: "0xA",
    chainName: "OΞ",
    rpcUrls: ["https://mainnet.optimism.io"],
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://optimistic.etherscan.io/"],
  },
  Arbitrum: {
    chainId: "0xA4B1",
    chainName: "Arbitrum One",
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    nativeCurrency: {
      name: "AETH",
      symbol: "AETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://arbiscan.io"],
  },
  Thunder: {
    chainId: "0x6c",
    chainName: "Thundercore Mainnet",
    rpcUrls: ["https://mainnet-rpc.thundercore.com"],
    nativeCurrency: {
      name: "TT",
      symbol: "TT",
      decimals: 18,
    },
    blockExplorerUrls: ["https://viewblock.io/thundercore"],
  },
  Avalanche: {
    chainId: "0xA86A",
    chainName: "Avalanche Network C-Chain",
    rpcUrls: ["https://api.avax.network/ext/bc/C/rpc"],
    nativeCurrency: {
      name: "AVAX",
      symbol: "AVAX",
      decimals: 18,
    },
    blockExplorerUrls: ["https://snowtrace.io/"],
  },
  BNB: {
    chainId: "0x38",
    chainName: "BNB Chain",
    rpcUrls: ["https://bsc-dataseed.binance.org/"],
    nativeCurrency: {
      name: "BNB",
      symbol: "BNB",
      decimals: 18,
    },
    blockExplorerUrls: ["https://bscscan.com/"],
  },
  Base: {
    chainId: "0x2105",
    chainName: "Base",
    rpcUrls: ["https://mainnet.base.org"],
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://basescan.org"],
  },
};

export const blockExplorer = {
  Polygon: "https://polygonscan.com/tx/",
  Optimism: "https://optimistic.etherscan.io/tx/",
  Arbitrum: "https://arbiscan.io/tx/",
  Avalanche: "https://snowtrace.io/block/",
  BNB: "https://bscscan.com/tx/",
  Base: "https://basescan.org/tx/",
};
