// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log(`Deploying contract with account: ${deployer.address}`);
  console.log(`Account balance: ${(await deployer.getBalance()).toString()}`);

  const NAME = "RealWorldAssetNFT";
  const SYMBOL = "RWA";
  const ADMIN = deployer.address; 

  const RWA_NFT = await ethers.getContractFactory("RWA_NFT");
  const rwaNFT = await RWA_NFT.deploy(NAME, SYMBOL, ADMIN);
  await rwaNFT.deployed();

  console.log(`RWA_NFT deployed to: ${rwaNFT.address}`);
}

main()
  .then