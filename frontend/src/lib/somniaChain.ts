/**
 * Somnia Shannon Testnet configuration for Viem / Wagmi
 */
export const somniaShannonTestnet = {
  id: 50312,
  name: 'Somnia Shannon Testnet',
  network: 'somnia-testnet',
  nativeCurrency: {
    name: 'Somnia Test Token',
    symbol: 'STT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://dream-rpc.somnia.network'],
    },
    public: {
      http: ['https://dream-rpc.somnia.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Somnia Explorer',
      url: 'https://shannon-explorer.somnia.network/',
    },
  },
  testnet: true,
} as const;

export const CONTRACT_ADDRESSES = {
  USDso: '0x1234567890123456789012345678901234567890',
  DreamDEXEventContract: '0x2345678901234567890123456789012345678901',
  DreamSentinelVault: '0x3456789012345678901234567890123456789012',
};
