# ZKoupon

ZKoupon 是一個基於區塊鏈的優惠券系統，使用 ERC721 標準實現 NFT 優惠券。

## 功能特點

- 使用 ERC721 標準實現 NFT 優惠券
- 支持優惠券的鑄造和使用
- 完整的元數據支持
- 支持 Sepolia 測試網絡

## 安裝

1. 克隆倉庫：
```bash
git clone https://github.com/hweng99/ETHGlobal_Taipei_Zkoupon.git
cd ETHGlobal_Taipei_Zkoupon
```

2. 安裝依賴：
```bash
npm install
```

3. 配置環境變量：
   - 複製 `.env.example` 到 `.env` 並填寫您的敏感信息
   - 複製 `.env.local.example` 到 `.env.local` 並填寫您的配置

4. 編譯合約：
```bash
npx hardhat compile
```

## 部署

1. 部署智能合約：
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

2. 更新合約地址：
   - 將部署後獲得的合約地址更新到 `.env.local` 文件中的 `NEXT_PUBLIC_ZKOUPON_ADDRESS`

3. 運行前端：
```bash
npm run dev
```

## 使用說明

1. 訪問 `http://localhost:3000/merchant/mint`
2. 連接您的錢包
3. 填寫優惠券信息
4. 點擊 "Mint NFT" 按鈕鑄造優惠券

## 注意事項

- 請確保您的錢包中有足夠的 ETH 用於支付 gas 費用
- 所有敏感信息（私鑰、API Key 等）都應該妥善保管
- 建議在測試網絡上進行測試

## 技術棧

- Next.js
- Hardhat
- Ethers.js
- OpenZeppelin
- Chakra UI

## 許可證

MIT
