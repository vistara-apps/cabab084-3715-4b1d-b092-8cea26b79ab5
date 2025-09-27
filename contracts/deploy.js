const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying FairPlay Nexus contracts...");

  // Get the deployer account
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);

  // Deploy ReputationSystem first
  console.log("Deploying ReputationSystem...");
  const ReputationSystem = await ethers.getContractFactory("ReputationSystem");
  const reputationSystem = await ReputationSystem.deploy();
  await reputationSystem.deployed();
  console.log("ReputationSystem deployed to:", reputationSystem.address);

  // Deploy TicketNFT
  console.log("Deploying TicketNFT...");
  const TicketNFT = await ethers.getContractFactory("TicketNFT");
  const ticketNFT = await TicketNFT.deploy();
  await ticketNFT.deployed();
  console.log("TicketNFT deployed to:", ticketNFT.address);

  // Deploy LendingMarketplace
  console.log("Deploying LendingMarketplace...");
  const LendingMarketplace = await ethers.getContractFactory("LendingMarketplace");
  // Using a mock price oracle address for now
  const mockPriceOracle = "0x0000000000000000000000000000000000000000";
  const lendingMarketplace = await LendingMarketplace.deploy(mockPriceOracle);
  await lendingMarketplace.deployed();
  console.log("LendingMarketplace deployed to:", lendingMarketplace.address);

  // Deploy GameDraw (this requires VRF configuration)
  console.log("Deploying GameDraw...");
  const GameDraw = await ethers.getContractFactory("GameDraw");

  // Base network VRF configuration (these are placeholder values - update with real ones)
  const vrfCoordinator = "0x271682DEB8C4E0901D1a1550aD2e64D568E69909"; // Base VRF Coordinator
  const subscriptionId = 1; // Update with your subscription ID
  const gasLane = "0x9fe0eebf5e446e3c998ec9bb19951541aee00bb90f2372e34a1f5834f9941a0b69"; // 500 gwei key hash
  const callbackGasLimit = 100000;

  const gameDraw = await GameDraw.deploy(
    vrfCoordinator,
    subscriptionId,
    gasLane,
    callbackGasLimit
  );
  await gameDraw.deployed();
  console.log("GameDraw deployed to:", gameDraw.address);

  // Authorize contracts
  console.log("Setting up contract authorizations...");

  // Authorize GameDraw in ReputationSystem
  await reputationSystem.authorizeContract(gameDraw.address);
  console.log("GameDraw authorized in ReputationSystem");

  // Authorize GameDraw in TicketNFT for game 0 (will be set per game)
  await ticketNFT.authorizeGameContract(0, gameDraw.address);
  console.log("GameDraw authorized in TicketNFT");

  // Save deployment addresses
  const deploymentInfo = {
    network: "base",
    reputationSystem: reputationSystem.address,
    ticketNFT: ticketNFT.address,
    lendingMarketplace: lendingMarketplace.address,
    gameDraw: gameDraw.address,
    deployedAt: new Date().toISOString(),
  };

  console.log("Deployment completed!");
  console.log("Contract addresses:", deploymentInfo);

  // Save to file
  const fs = require("fs");
  fs.writeFileSync(
    "./contracts/deployment.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("Deployment info saved to contracts/deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

