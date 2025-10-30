/**
 * Constants for the Wormhole CLI tool
 */

const ENVIRONMENTS = ['mainnet', 'testnet', 'devnet'];

const CHAINS = ['ethereum', 'arbitrum', 'optimism', 'base', 'solana'];

const MODES = ['BURNING', 'LOCKING'];

// Chain types for Wormhole SDK
const CHAIN_TYPES = {
  ethereum: 'evm',
  arbitrum: 'evm',
  optimism: 'evm',
  base: 'evm',
  solana: 'solana'
};

// Wormhole chain names as used in the SDK
const WORMHOLE_CHAIN_NAMES = {
  ethereum: 'Ethereum',
  arbitrum: 'Arbitrum',
  optimism: 'Optimism',
  base: 'Base',
  solana: 'Solana'
};

module.exports = {
  ENVIRONMENTS,
  CHAINS,
  MODES,
  CHAIN_TYPES,
  WORMHOLE_CHAIN_NAMES
};
