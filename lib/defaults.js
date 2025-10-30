/**
 * Default RPC endpoints for different chains and environments
 */

const DEFAULT_RPCS = {
  mainnet: {
    ethereum: 'https://eth.llamarpc.com',
    arbitrum: 'https://arbitrum-one-rpc.publicnode.com',
    optimism: 'https://mainnet.optimism.io',
    base: 'https://mainnet.base.org',
    solana: 'https://api.mainnet-beta.solana.com'
  },
  testnet: {
    ethereum: 'https://ethereum-sepolia-rpc.publicnode.com',
    arbitrum: 'https://arbitrum-sepolia-rpc.publicnode.com',
    optimism: 'https://sepolia.optimism.io',
    base: 'https://sepolia.base.org',
    solana: 'https://api.testnet.solana.com'
  },
  devnet: {
    ethereum: 'http://localhost:8545',
    arbitrum: 'http://localhost:8546',
    optimism: 'http://localhost:8547',
    base: 'http://localhost:8548',
    solana: 'http://localhost:8899'
  }
};

/**
 * Get default RPC endpoint for a chain and environment
 * @param {string} chain - Chain name
 * @param {string} environment - Environment name
 * @returns {string|null} Default RPC endpoint or null if not found
 */
function getDefaultRpc(chain, environment) {
  return DEFAULT_RPCS[environment]?.[chain] || null;
}

module.exports = {
  DEFAULT_RPCS,
  getDefaultRpc
};
