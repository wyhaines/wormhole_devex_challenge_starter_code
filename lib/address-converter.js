/**
 * Address conversion utilities using Wormhole SDK
 */

const { WORMHOLE_CHAIN_NAMES } = require('./constants');

/**
 * Convert a native chain address to Wormhole 32-byte format
 * @param {string} address - Native address to convert
 * @param {string} chain - Chain name (ethereum, solana, etc.)
 * @returns {Promise<string>} Wormhole 32-byte address format (hex string with 0x prefix)
 */
async function convertToWormholeAddress(address, chain) {
  try {
    const wormholeChainName = WORMHOLE_CHAIN_NAMES[chain];

    if (!wormholeChainName) {
      throw new Error(`Unsupported chain: ${chain}`);
    }

    const { toNative } = await import('@wormhole-foundation/sdk');

    // Convert to native address format, then to universal (32-byte) format
    const nativeAddress = toNative(wormholeChainName, address);
    const universalAddress = nativeAddress.toUniversalAddress();

    // toString() already includes 0x prefix
    return universalAddress.toString();
  } catch (error) {
    throw new Error(`Failed to convert address: ${error.message}`);
  }
}

/**
 * @param {string} address - Address to validate
 * @param {string} chain - Chain name
 * @returns {boolean} True if address appears valid
 */
function isValidAddressFormat(address, chain) {
  if (!address || typeof address !== 'string') {
    return false;
  }

  // Basic validation based on chain type
  if (chain === 'solana') {
    // Solana addresses are base58 encoded, typically 32-44 characters
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  } else {
    // EVM addresses are 0x followed by 40 hex characters
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
}

module.exports = {
  convertToWormholeAddress,
  isValidAddressFormat
};
