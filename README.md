# ZKoupon

ZKoupon is a blockchain-based coupon system that implements NFT coupons using the ERC721 standard.

ZKoupon 是一個基於區塊鏈的優惠券系統，使用 ERC721 標準實現 NFT 優惠券。

## Features / 功能特點

- NFT Coupons using ERC721 Standard / 使用 ERC721 標準實現 NFT 優惠券
- Coupon Minting and Usage Support / 支持優惠券的鑄造和使用
- Complete Metadata Support / 完整的元數據支持
- Sepolia Testnet Support / 支持 Sepolia 測試網絡

## Installation / 安裝

1. Clone the repository / 克隆倉庫：
```bash
git clone https://github.com/hweng99/ETHGlobal_Taipei_Zkoupon.git
cd ETHGlobal_Taipei_Zkoupon
```

2. Install dependencies / 安裝依賴：
```bash
npm install
```

3. Configure environment variables / 配置環境變量：
   - Copy `.env.example` to `.env` and fill in your sensitive information / 複製 `.env.example` 到 `.env` 並填寫您的敏感信息
   - Copy `.env.local.example` to `.env.local` and fill in your configuration / 複製 `.env.local.example` 到 `.env.local` 並填寫您的配置

4. Compile contracts / 編譯合約：
```bash
npx hardhat compile
```

## Deployment / 部署

1. Deploy smart contracts / 部署智能合約：
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

2. Update contract address / 更新合約地址：
   - Update the deployed contract address in `.env.local` file / 將部署後獲得的合約地址更新到 `.env.local` 文件中的 `NEXT_PUBLIC_ZKOUPON_ADDRESS`

3. Run frontend / 運行前端：
```bash
npm run dev
```

## Usage Instructions / 使用說明

1. Visit `http://localhost:3000/merchant/mint` / 訪問 `http://localhost:3000/merchant/mint`
2. Connect your wallet / 連接您的錢包
3. Fill in coupon information / 填寫優惠券信息
4. Click "Mint NFT" button to mint coupon / 點擊 "Mint NFT" 按鈕鑄造優惠券

## Notes / 注意事項

- Make sure you have enough ETH in your wallet for gas fees / 請確保您的錢包中有足夠的 ETH 用於支付 gas 費用
- All sensitive information (private keys, API Keys, etc.) should be kept secure / 所有敏感信息（私鑰、API Key 等）都應該妥善保管
- Recommended to test on testnet / 建議在測試網絡上進行測試

## Tech Stack / 技術棧

- Next.js
- Hardhat
- Ethers.js
- OpenZeppelin
- Chakra UI

## License / 許可證

MIT
