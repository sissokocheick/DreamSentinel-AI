require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const SOMNIA_TESTNET_RPC = process.env.SOMNIA_RPC_URL || "https://dream-rpc.somnia.network";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "0x0000000000000000000000000000000000000000000000000000000000000001";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    somniaTestnet: {
      url: SOMNIA_TESTNET_RPC,
      chainId: 50312,
      accounts: PRIVATE_KEY !== "" ? [PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 Gwei
    },
    hardhat: {
      chainId: 31337,
    },
  },
  paths: {
    sources: "./src",
  },
  etherscan: {
    apiKey: {
      somniaTestnet: "empty",
    },
    customChains: [
      {
        network: "somniaTestnet",
        chainId: 50312,
        urls: {
          apiURL: "https://shannon-explorer.somnia.network/api",
          browserURL: "https://shannon-explorer.somnia.network/",
        },
      },
    ],
  },
};
