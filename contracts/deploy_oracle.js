const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting DreamSentinelOracle Deployment on Somnia Shannon Testnet...");

  const [deployer] = await hre.ethers.getSigners();
  console.log(`📍 Deployer Address: ${deployer.address}`);

  const DreamSentinelOracle = await hre.ethers.getContractFactory("DreamSentinelOracle");
  const oracle = await DreamSentinelOracle.deploy();
  await oracle.waitForDeployment();
  const oracleAddress = await oracle.getAddress();
  console.log(`✅ DreamSentinelOracle Deployed on Somnia at: ${oracleAddress}`);

  // Seed on-chain predictions to demonstrate Somnia sub-second batch anchoring
  console.log("⚡ Anchoring initial Bayesian predictions onto Somnia L1...");
  const tx1 = await oracle.publishPrediction(
    "somnia-btc-100k-5m",
    "BTC >= $100K (5M)",
    6420, // 64.20% Bayesian prob
    5100, // 51.00% Market implied
    1320, // 13.20% Edge
    1,    // YES
    8850  // 88.50% Confidence
  );
  await tx1.wait();
  console.log("✅ Prediction 1 Anchored: BTC >= $100K");

  const tx2 = await oracle.publishPrediction(
    "somnia-eth-3k-15m",
    "ETH >= $3.2K (15M)",
    4300, // 43.00% Bayesian prob
    5500, // 55.00% Market implied
    1200, // 12.00% Edge
    0,    // NO
    8200  // 82.00% Confidence
  );
  await tx2.wait();
  console.log("✅ Prediction 2 Anchored: ETH >= $3.2K");

  // Resolve one prediction on-chain to demonstrate verifiable accuracy scoring
  console.log("📊 Resolving prediction on-chain to verify algorithmic score...");
  const tx3 = await oracle.resolvePrediction("somnia-btc-100k-5m", 1);
  await tx3.wait();
  console.log("✅ Prediction Resolved on-chain! Accuracy updated.");

  const [accuracy, resolved, published] = await oracle.getOnChainAccuracyScore();
  console.log(`\n🏆 Verified On-Chain Accuracy: ${(Number(accuracy) / 100).toFixed(1)}% (${resolved}/${published} resolved)`);

  console.log("\n================ Deployment Summary ================");
  console.log(`Network: Somnia Shannon Testnet (ChainID: 50312)`);
  console.log(`DreamSentinelOracle: ${oracleAddress}`);
  console.log(`Shannon Explorer: https://shannon-explorer.somnia.network/address/${oracleAddress}`);
  console.log("===================================================\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
