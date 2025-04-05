import { ethers } from "hardhat";

async function main() {
  // 這裡需要 Self XYZ 的驗證器合約地址
  const verifierAddress = process.env.VERIFIER_ADDRESS;
  const identityHubAddress = process.env.IDENTITY_HUB_ADDRESS;

  if (!verifierAddress || !identityHubAddress) {
    throw new Error("Please set VERIFIER_ADDRESS and IDENTITY_HUB_ADDRESS in your .env file");
  }

  console.log("Deploying ZKoupon contract...");

  const ZKoupon = await ethers.getContractFactory("ZKoupon");
  const zkoupon = await ZKoupon.deploy(verifierAddress, identityHubAddress);

  await zkoupon.deployed();

  console.log(`ZKoupon deployed to ${zkoupon.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 