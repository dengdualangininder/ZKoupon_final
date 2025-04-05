const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const ZKoupon = await ethers.getContractFactory("ZKoupon");
  const zkoupon = await ZKoupon.deploy();

  console.log("Deploying...");
  await zkoupon.deployed();
  console.log("ZKoupon deployed to:", zkoupon.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 