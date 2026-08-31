const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting DreamSentinel Contracts Deployment on Somnia Testnet...");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`📍 Deployer Address: ${deployer.address}`);

  // 1. Deploy Mock USDso
  const MockUSDso = await hre.ethers.getContractFactory("MockUSDso");
  const usdso = await MockUSDso.deploy();
  await usdso.waitForDeployment();
  const usdsoAddress = await usdso.getAddress();
  console.log(`✅ Mock USDso Deployed at: ${usdsoAddress}`);

  // 2. Deploy Mock DreamDEX Event Contract
  const MockDreamDEX = await hre.ethers.getContractFactory("MockDreamDEXEventContract");
  const dreamdex = await MockDreamDEX.deploy();
  await dreamdex.waitForDeployment();
  const dreamdexAddress = await dreamdex.getAddress();
  console.log(`✅ Mock DreamDEX Event Contract Deployed at: ${dreamdexAddress}`);

  // 3. Deploy DreamSentinelVault
  const DreamSentinelVault = await hre.ethers.getContractFactory("DreamSentinelVault");
  const vault = await DreamSentinelVault.deploy(
    "DreamSentinel Alpha Vault",
    "dsALPHA",
    usdsoAddress,
    deployer.address // Fee recipient
  );
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();
  console.log(`✅ DreamSentinelVault Deployed at: ${vaultAddress}`);

  // 4. Deploy PvPDuelEscrow
  const PvPDuelEscrow = await hre.ethers.getContractFactory("PvPDuelEscrow");
  const pvpEscrow = await PvPDuelEscrow.deploy(usdsoAddress);
  await pvpEscrow.waitForDeployment();
  const pvpEscrowAddress = await pvpEscrow.getAddress();
  console.log(`✅ PvPDuelEscrow Deployed at: ${pvpEscrowAddress}`);

  // 5. Register initial AI Agent Strategies
  const strategyAlphaId = hre.ethers.id("STRATEGY_ALPHA_SCALPER");
  const strategyArbId = hre.ethers.id("STRATEGY_BAYESIAN_ARB");

  await vault.registerStrategy(strategyAlphaId, "Sentinel Alpha Scalper", deployer.address, 1500); // 15% max DD
  await vault.registerStrategy(strategyArbId, "Sentinel Bayesian Arbitrage", deployer.address, 1000); // 10% max DD
  console.log("✅ Initial AI Strategies Registered in Vault");

  console.log("\n================ Deployment Summary ================");
  console.log(`Network: Somnia Shannon Testnet (ChainID: 50312)`);
  console.log(`USDso Token: ${usdsoAddress}`);
  console.log(`DreamDEX Contract: ${dreamdexAddress}`);
  console.log(`DreamSentinelVault: ${vaultAddress}`);
  console.log(`PvPDuelEscrow: ${pvpEscrowAddress}`);
  console.log("===================================================\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
