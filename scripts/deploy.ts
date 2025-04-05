import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const zkoupon = await ethers.deployContract("ZKoupon");
  await zkoupon.waitForDeployment();

  console.log("ZKoupon deployed to:", await zkoupon.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 